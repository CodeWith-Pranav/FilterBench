#!/usr/bin/env python3
"""Run actual ngspice sweeps and verify against independent transfer/noise equations."""
import argparse,csv,json,math,random,subprocess
from pathlib import Path
from statistics import mean,stdev
from circuit import DEFAULT,transfer,noise_density,netlist
ROOT=Path(__file__).resolve().parent

def rows(path):
    return [[float(x) for x in line.split()] for line in path.read_text().splitlines()[1:] if line.strip()]

def run(binary,p,folder,analysis='ac'):
    folder.mkdir(parents=True,exist_ok=True)
    (folder/'circuit.cir').write_text(netlist(p,analysis))
    result=subprocess.run([binary,'-b','circuit.cir'],cwd=folder,text=True,capture_output=True,timeout=30)
    (folder/'run.log').write_text(result.stdout+result.stderr)
    if result.returncode or not(folder/'ac.txt').is_file():raise RuntimeError(f'ngspice failed in {folder}: {result.stdout} {result.stderr}')
    return rows(folder/'ac.txt')

def metrics(ac):
    gain=math.hypot(ac[0][1],ac[0][2]);target=20*math.log10(gain)-3.010299956639812
    for left,right in zip(ac,ac[1:]):
        yl=20*math.log10(math.hypot(left[1],left[2]));yr=20*math.log10(math.hypot(right[1],right[2]))
        if yl>=target>=yr:
            f=math.exp(math.log(left[0])+(target-yl)/(yr-yl)*math.log(right[0]/left[0]));return gain,f
    raise AssertionError('No -3 dB crossing')

def phase_rows(ac):
    data=[];previous=0
    for f,re,im in ac:
        phase=math.degrees(math.atan2(im,re))
        while phase-previous>180:phase-=360
        while previous-phase>180:phase+=360
        data.append([f,20*math.log10(math.hypot(re,im)),phase]);previous=phase
    return data

def save_csv(name,header,data):
    with (ROOT/name).open('w',newline='') as f:w=csv.writer(f);w.writerow(header);w.writerows(data)

def main():
    a=argparse.ArgumentParser();a.add_argument('--ngspice',default='ngspice');a.add_argument('--samples',type=int,default=128);a.add_argument('--seed',type=int,default=17);args=a.parse_args()
    if args.samples<2 or args.samples>1000:raise ValueError('samples must be 2..1000')
    version=subprocess.check_output([args.ngspice,'--version'],text=True).strip()
    p=dict(DEFAULT);nom=ROOT/'build'/'nominal';ac=run(args.ngspice,p,nom,'all');gain,cutoff=metrics(ac)
    # Complex AC comparison tests both magnitude and phase, independent of ngspice.
    ac_error=max(abs(complex(re,im)-transfer(f,p))/max(abs(transfer(f,p)),1e-20) for f,re,im in ac)
    assert ac_error<1e-6,ac_error
    noise=rows(nom/'noise.txt');noise_error=max(abs(d-noise_density(f,p))/noise_density(f,p) for f,d,_ in noise)
    assert noise_error<1e-6,noise_error
    integrated=math.sqrt(sum((a[1]**2+b[1]**2)/2*(b[0]-a[0]) for a,b in zip(noise,noise[1:])))
    transient=rows(nom/'step.txt');final=transient[-1][2];dcgain=abs(transfer(0,p))
    assert abs(final-.1*dcgain)<1e-6,(final,dcgain)
    assert max(row[2] for row in transient)<.1*dcgain*1.001,'Unexpected step overshoot'
    analytic_cutoff=math.sqrt(math.sqrt(2)-1)/(2*math.pi*p['r1']*p['c1'])
    assert abs(cutoff/analytic_cutoff-1)<.002,(cutoff,analytic_cutoff)
    # At t=RC after a fast step, ideal repeated-pole normalized response = 1-2/e.
    tcheck=min(transient,key=lambda row:abs(row[0]-.0011))
    assert abs(tcheck[2]/(.1*dcgain)-(1-2/math.e))<.015,tcheck
    rng=random.Random(args.seed);samples=[]
    for i in range(args.samples):
        sample=dict(p)
        for key in ['r1','r2','rf','rg']:sample[key]*=1+rng.uniform(-.01,.01)
        for key in ['c1','c2']:sample[key]*=1+rng.uniform(-.05,.05)
        curve=run(args.ngspice,sample,ROOT/'build'/f'mc-{i:03d}');g,fc=metrics(curve)
        err=max(abs(complex(re,im)-transfer(f,sample))/max(abs(transfer(f,sample)),1e-20) for f,re,im in curve)
        assert err<1e-6,(i,err)
        samples.append({'id':i,'gain':g,'cutoff_hz':fc,**{k:sample[k] for k in ['r1','r2','c1','c2','rf','rg']}})
    cutoff_values=sorted(s['cutoff_hz'] for s in samples)
    def quantile(q):
        x=q*(len(cutoff_values)-1);lo=int(x);hi=min(lo+1,len(cutoff_values)-1);return cutoff_values[lo]*(hi-x)+cutoff_values[hi]*(x-lo) if hi!=lo else cutoff_values[lo]
    settle=next(row[0]-.001 for idx,row in enumerate(transient) if row[0]>=.001 and all(abs(r[2]-final)<=.01*final for r in transient[idx:]))
    summary={'project':'FilterBench','evidence_date':'2026-11-05','engine':version,'parameters':p,'simulation_only':True,
      'nominal':{'gain_v_v':gain,'gain_db':20*math.log10(gain),'cutoff_hz':cutoff,'ideal_cutoff_hz':analytic_cutoff,'output_noise_rms_v_1hz_1mhz':integrated,'step_final_v':final,'settling_1pct_s':settle},
      'verification':{'complex_ac_max_relative_error':ac_error,'noise_density_max_relative_error':noise_error,'monte_carlo_analytic_checks':len(samples),'checks':['complex AC vs equations','noise density vs independent noise budget','final step level','step overshoot bound','ideal repeated-pole cutoff','step at one RC constant','128 actual-SPICE tolerance runs' if args.samples==128 else f'{args.samples} actual-SPICE tolerance runs']},
      'tolerance':{'samples':len(samples),'seed':args.seed,'distribution':'independent uniform','r_percent':1,'c_percent':5,'cutoff_min_hz':min(cutoff_values),'cutoff_max_hz':max(cutoff_values),'cutoff_mean_hz':mean(cutoff_values),'cutoff_stdev_hz':stdev(cutoff_values),'cutoff_p05_hz':quantile(.05),'cutoff_p95_hz':quantile(.95)},
      'ac':phase_rows(ac),
      'noise':noise,'step':transient,'samples':samples}
    (ROOT/'report.json').write_text(json.dumps(summary,separators=(',',':'),allow_nan=False)+'\n')
    (ROOT/'nominal.cir').write_text(netlist(p,'all'))
    save_csv('bode.csv',['frequency_hz','real_v_v','imag_v_v'],ac);save_csv('noise.csv',['frequency_hz','output_v_sqrt_hz','input_referred_v_sqrt_hz'],noise);save_csv('step.csv',['time_s','input_v','output_v'],transient)
    save_csv('tolerance.csv',list(samples[0]),[list(s.values()) for s in samples])
    (ROOT/'ngspice.log').write_text((nom/'run.log').read_text())
    (ROOT/'verification.txt').write_text('PASS: '+ '\nPASS: '.join(summary['verification']['checks'])+'\n'+json.dumps(summary['nominal'],indent=2)+'\n'+json.dumps(summary['tolerance'],indent=2)+'\n')
    print(json.dumps({k:summary[k] for k in ['nominal','tolerance','verification']},indent=2))
if __name__=='__main__':main()
