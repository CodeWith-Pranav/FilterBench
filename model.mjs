export const defaults={r:10000,c:1e-8,gain:2,gbw:3e6,a0:1e5,en:1e-8};
const multiply=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
const divide=(n,re,im)=>[n*re/(re*re+im*im),-n*im/(re*re+im*im)];
const mag=z=>Math.hypot(...z);
export function validate(p){for(const key of ['r','c','gain','gbw','a0','en'])if(!Number.isFinite(p[key])||p[key]<=0)throw new RangeError('All design values must be positive numbers.');if(p.r<1000||p.r>100000||p.c<1e-9||p.c>100e-9||p.gain<1.1||p.gain>10||p.gbw<1e5||p.gbw>1e7)throw new RangeError('Use R = 1–100 kΩ, C = 1–100 nF, gain = 1.1–10, GBW = 0.1–10 MHz.');}
export function response(f,p=defaults){
 validate(p);if(!Number.isFinite(f)||f<0)throw new RangeError('Frequency must be nonnegative.');
 const pole=divide(1,1,2*Math.PI*f*p.r*p.c),c1=divide(p.a0,1+p.a0,f*p.a0/p.gbw),c2=divide(p.a0,1+p.a0/p.gain,f*p.a0/p.gbw);
 const h=multiply(multiply(pole,pole),multiply(c1,c2));
 const phase=-2*Math.atan(2*Math.PI*f*p.r*p.c)-Math.atan(f*p.a0/p.gbw/(1+p.a0))-Math.atan(f*p.a0/p.gbw/(1+p.a0/p.gain));
 return {complex:h,gain:mag(h),db:20*Math.log10(mag(h)),phase:phase*180/Math.PI};
}
export function cutoff(p=defaults){const target=response(0,p).gain/Math.sqrt(2);let lo=1e-6,hi=1e10;for(let i=0;i<90;i++){const mid=Math.sqrt(lo*hi);if(response(mid,p).gain>target)lo=mid;else hi=mid;}return Math.sqrt(lo*hi);}
export function noiseDensity(f,p=defaults){
 const pole=divide(1,1,2*Math.PI*f*p.r*p.c),c1=divide(p.a0,1+p.a0,f*p.a0/p.gbw),c2=divide(p.a0,1+p.a0/p.gain,f*p.a0/p.gbw),h=response(f,p).gain;
 const rc2c2=mag(multiply(pole,c2)),first=mag(multiply(multiply(c1,pole),c2));
 const rf=(p.gain-1)*10000,rg=10000,parallel=rf*rg/(rf+rg),kT4=4*1.380649e-23*300.15;
 return Math.sqrt(kT4*(p.r*h*h+p.r*rc2c2*rc2c2+parallel*mag(c2)**2)+p.en**2*(first*first+mag(c2)**2));
}
export function makeNetlist(p=defaults){validate(p);const rn=p.en**2/(4*1.380649e-23*300.15);return `FilterBench custom linear active filter\n* Analytic preview design; run this netlist in ngspice to simulate.\n.temp 27\n.options numdgt=12\n.param A0=${p.a0} GBW=${p.gbw} RN=${rn}\n.subckt OP plus minus out\nRwhite white 0 {RN}\nEadd noisy plus white 0 1\nEopen drive 0 noisy minus {A0}\nRdom drive pole 1k noisy=0\nCdom pole 0 {A0/(6.283185307179586*GBW*1000)}\nEout out 0 pole 0 1\n.ends OP\nVIN in 0 DC 0 AC 1 PWL(0 0 0.9999m 0 1m 0.1 5m 0.1)\nR1 in n1 ${p.r}\nC1 n1 0 ${p.c}\nXU1 n1 b1 b1 OP\nR2 b1 n2 ${p.r}\nC2 n2 0 ${p.c}\nXU2 n2 fb out OP\nRF out fb ${(p.gain-1)*10000}\nRG fb 0 10000\n.control\nset wr_singlescale\nset wr_vecnames\nset numdgt=12\nac dec 80 1 1Meg\nlet re_out = real(v(out))\nlet im_out = imag(v(out))\nwrdata ac.txt re_out im_out\ntran 2u 5m 0 2u\nwrdata step.txt v(in) v(out)\nnoise v(out) VIN dec 80 1 1Meg\nsetplot noise1\nwrdata noise.txt onoise_spectrum inoise_spectrum\nquit\n.endc\n.end\n`;}
