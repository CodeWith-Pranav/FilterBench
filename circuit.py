"""Original generic linear op-amp circuit; no vendor models or physical measurements."""
import math

KB=1.380649e-23
TEMP_K=300.15
DEFAULT={'r1':10000.,'r2':10000.,'c1':10e-9,'c2':10e-9,'rf':10000.,'rg':10000.,'a0':100000.,'gbw':3e6,'en':10e-9}

def transfer(f,p=DEFAULT):
    s=2j*math.pi*f
    a=p['a0']/(1+s*p['a0']/(2*math.pi*p['gbw']))
    b=p['rg']/(p['rg']+p['rf'])
    c1=a/(1+a);c2=a/(1+b*a)
    rc1=1/(1+s*p['r1']*p['c1']);rc2=1/(1+s*p['r2']*p['c2'])
    return rc1*c1*rc2*c2

def noise_density(f,p=DEFAULT):
    s=2j*math.pi*f;a=p['a0']/(1+s*p['a0']/(2*math.pi*p['gbw']))
    b=p['rg']/(p['rg']+p['rf']);c1=a/(1+a);c2=a/(1+b*a)
    rc2=1/(1+s*p['r2']*p['c2']);h=transfer(f,p)
    parallel=p['rf']*p['rg']/(p['rf']+p['rg'])
    psd=4*KB*TEMP_K*(p['r1']*abs(h)**2+p['r2']*abs(rc2*c2)**2+parallel*abs(c2)**2)
    psd+=p['en']**2*(abs(c1*rc2*c2)**2+abs(c2)**2)
    return math.sqrt(psd)

def netlist(p=DEFAULT,analysis='all'):
    # Rdom is a mathematical pole element, explicitly noiseless. Rwhite injects
    # calibrated white voltage noise; Eadd adds it to the noninverting input.
    white=p['en']**2/(4*KB*TEMP_K)
    body=f'''FilterBench: buffered RC low-pass and noninverting gain stage
.temp 27
.options numdgt=12
.param A0={p['a0']:.14g} GBW={p['gbw']:.14g} RN={white:.14g}
.subckt OP plus minus out
Rwhite white 0 {{RN}}
Eadd noisy plus white 0 1
Eopen drive 0 noisy minus {{A0}}
Rdom drive pole 1k noisy=0
Cdom pole 0 {{A0/(6.283185307179586*GBW*1000)}}
Eout out 0 pole 0 1
.ends OP
VIN in 0 DC 0 AC 1 PWL(0 0 0.9999m 0 1m 0.1 5m 0.1)
R1 in n1 {p['r1']:.14g}
C1 n1 0 {p['c1']:.14g}
XU1 n1 b1 b1 OP
R2 b1 n2 {p['r2']:.14g}
C2 n2 0 {p['c2']:.14g}
XU2 n2 fb out OP
RF out fb {p['rf']:.14g}
RG fb 0 {p['rg']:.14g}
.control
set noaskquit
set wr_singlescale
set wr_vecnames
set numdgt=12
ac dec 80 1 1Meg
let re_out = real(v(out))
let im_out = imag(v(out))
wrdata ac.txt re_out im_out
'''
    if analysis=='all':
        body+='''tran 2u 5m 0 2u
wrdata step.txt v(in) v(out)
noise v(out) VIN dec 80 1 1Meg
setplot noise1
wrdata noise.txt onoise_spectrum inoise_spectrum
'''
    return body+'quit\n.endc\n.end\n'
