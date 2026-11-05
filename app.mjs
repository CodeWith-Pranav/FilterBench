import {defaults,response,cutoff,validate,makeNetlist} from './model.mjs';
const $=id=>document.getElementById(id);let report,p={...defaults},view='magnitude';
const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function svgChart(id,series,{xmin,xmax,ymin,ymax,xlog=false,ylog=false,xlabel='',ylabel='',xticks,yticks,title}){
 const W=700,H=285,L=65,R=16,T=22,B=47;
 const tx=x=>(xlog?Math.log10(x):x),ty=y=>(ylog?Math.log10(y):y);
 const xx=x=>L+(tx(x)-tx(xmin))/(tx(xmax)-tx(xmin))*(W-L-R),yy=y=>H-B-(ty(y)-ty(ymin))/(ty(ymax)-ty(ymin))*(H-T-B);
 let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
 for(const [x,label]of xticks){out+=`<path d="M${xx(x)},${T}V${H-B}" stroke="#e4e9e3"/><text x="${xx(x)}" y="${H-B+20}" fill="#657477" text-anchor="middle" font-size="10">${esc(label)}</text>`;}
 for(const [y,label]of yticks){out+=`<path d="M${L},${yy(y)}H${W-R}" stroke="#e4e9e3"/><text x="${L-10}" y="${yy(y)+4}" fill="#657477" text-anchor="end" font-size="10">${esc(label)}</text>`;}
 out+=`<defs><clipPath id="clip-${id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs><g clip-path="url(#clip-${id})">`;
 for(const s of series){out+=`<path d="${s.data.map(([x,y],i)=>`${i?'L':'M'}${xx(x).toFixed(2)},${yy(y).toFixed(2)}`).join(' ')}" fill="none" stroke="${s.color}" stroke-width="${s.width||2}" ${s.dash?'stroke-dasharray="5 4"':''}/>`;}
 out+=`</g><path d="M${L},${T}V${H-B}H${W-R}" stroke="#9caeaa" fill="none"/><text x="${(W+L-R)/2}" y="${H-7}" text-anchor="middle" fill="#657477" font-size="11">${esc(xlabel)}</text><text x="16" y="${(H+T-B)/2}" transform="rotate(-90 16 ${(H+T-B)/2})" text-anchor="middle" fill="#657477" font-size="11">${esc(ylabel)}</text></svg>`;
 $(id).innerHTML=out;
}
const freqTicks=[[1,'1'],[10,'10'],[100,'100'],[1000,'1k'],[10000,'10k'],[100000,'100k'],[1000000,'1M']];
function drawPreview(){
 if(!report)return;
 const magnitude=view==='magnitude',current=report.ac.map(([f])=>[f,magnitude?response(f,p).db:response(f,p).phase]);
 const values=[...report.ac.map(row=>magnitude?row[1]:row[2]),...current.map(row=>row[1])];
 const ymin=magnitude?Math.floor(Math.min(...values)/20)*20:-360,ymax=magnitude?Math.max(20,Math.ceil(Math.max(...values)/10)*10):0;
 const ticks=magnitude?Array.from({length:(ymax-ymin)/20+1},(_,i)=>[ymin+i*20,String(ymin+i*20)]):[-360,-270,-180,-90,0].map(x=>[x,String(x)]);
 svgChart('bode-chart',[{data:report.ac.map(row=>[row[0],row[magnitude?1:2]]),color:'#b9542d',width:3},{data:current,color:'#196b5b',dash:true}],{xmin:1,xmax:1e6,ymin,ymax,xlog:true,xlabel:'Frequency (Hz)',ylabel:magnitude?'Gain (dB)':'Phase (degrees)',xticks:freqTicks,yticks:ticks,title:`${magnitude?'Gain':'Unwrapped phase'} versus frequency: recorded nominal ngspice and analytic current design`});
 $('preview-metrics').innerHTML=`<div><strong>${fmt(response(0,p).gain,3)}×</strong><span>predicted DC gain</span></div><div><strong>${fmt(cutoff(p),1)} Hz</strong><span>predicted −3 dB cutoff</span></div><div><strong>${fmt((p.gain-1)*10,1)} kΩ</strong><span>feedback Rf · Rg = 10 kΩ</span></div>`;
}
function histogram(){
 const vals=report.samples.map(s=>s.cutoff_hz),min=Math.floor(Math.min(...vals)/10)*10,max=Math.ceil(Math.max(...vals)/10)*10,n=12,bins=Array(n).fill(0);for(const v of vals)bins[Math.min(n-1,Math.floor((v-min)/(max-min)*n))]++;
 const peak=Math.max(...bins),W=700,H=285,L=60,R=20,T=20,B=47;let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram of 128 actual simulated cutoff frequencies"><title>128 ngspice tolerance runs; each bar counts sampled cutoff frequencies</title>`;
 for(let i=0;i<n;i++){const w=(W-L-R)/n,height=bins[i]/peak*(H-T-B);out+=`<rect x="${L+i*w+1}" y="${H-B-height}" width="${w-2}" height="${height}" fill="#196b5b"><title>${bins[i]} samples, ${(min+i*(max-min)/n).toFixed(1)}–${(min+(i+1)*(max-min)/n).toFixed(1)} Hz</title></rect>`;}
 for(let i=0;i<=4;i++){const v=min+(max-min)*i/4;out+=`<text x="${L+(W-L-R)*i/4}" y="${H-B+20}" text-anchor="middle" fill="#657477" font-size="10">${v.toFixed(0)}</text>`;}
 out+=`<path d="M${L},${T}V${H-B}H${W-R}" stroke="#9caeaa" fill="none"/><text x="350" y="278" text-anchor="middle" fill="#657477" font-size="11">−3 dB cutoff (Hz)</text><text x="17" y="130" transform="rotate(-90 17 130)" text-anchor="middle" fill="#657477" font-size="11">Count · peak ${peak}</text></svg>`;$('tolerance-chart').innerHTML=out;
}
function drawEvidence(){
 const n=report.nominal,t=report.tolerance,v=report.verification;
 $('stat-gain').textContent=fmt(n.gain_v_v,3)+'×';$('stat-cutoff').textContent=fmt(n.cutoff_hz/1000,3)+' kHz';$('stat-noise').textContent=fmt(n.output_noise_rms_v_1hz_1mhz*1e6,2)+' µV';
 $('step-metric').textContent=`${fmt(n.step_final_v*1000,2)} mV final · ${fmt(n.settling_1pct_s*1000,3)} ms to 1%`;
 $('noise-metric').textContent=`${fmt(n.output_noise_rms_v_1hz_1mhz*1e6,2)} µV RMS output · 1 Hz–1 MHz`;
 $('tolerance-metric').textContent=`Sampled cutoff range ${fmt(t.cutoff_min_hz,1)}–${fmt(t.cutoff_max_hz,1)} Hz`;
 $('verification-metric').textContent=`${v.monte_carlo_analytic_checks} tolerance curves checked against equations`;
 $('verification-details').innerHTML=`<p class="fine">Maximum relative complex AC error: <strong>${v.complex_ac_max_relative_error.toExponential(2)}</strong></p><p class="fine">Maximum relative noise-density error: <strong>${v.noise_density_max_relative_error.toExponential(2)}</strong></p><p class="fine">Also checked: step final level, overshoot bound, ideal cutoff, and response at one RC time constant.</p><p class="fine">Recorded engine: ngspice-39 · T = 27 °C · original generic linear op-amp model.</p>`;
 svgChart('step-chart',[{data:report.step.map(([ts,input])=>[ts*1000,input*1000]),color:'#9ca6a5'},{data:report.step.map(([ts,,out])=>[ts*1000,out*1000]),color:'#b9542d'}],{xmin:.8,xmax:2.2,ymin:0,ymax:220,xlabel:'Time (ms)',ylabel:'Voltage (mV)',xticks:[[.8,'.8'],[1,'1.0'],[1.4,'1.4'],[1.8,'1.8'],[2.2,'2.2']],yticks:[[0,'0'],[100,'100'],[200,'200']],title:'Actual ngspice input and output voltages during a 100 mV step'});
 svgChart('noise-chart',[{data:report.noise.map(([f,d])=>[f,d*1e9]),color:'#196b5b'}],{xmin:1,xmax:1e6,ymin:10,ymax:100,xlog:true,ylog:true,xlabel:'Frequency (Hz)',ylabel:'Output noise (nV/√Hz)',xticks:freqTicks,yticks:[[10,'10'],[20,'20'],[50,'50'],[100,'100']],title:'Actual ngspice output noise spectral density at 27 degrees Celsius'});
 histogram();
}
function update(e){e?.preventDefault();try{const next={...defaults,r:Number($('r').value)*1000,c:Number($('c').value)*1e-9,gain:Number($('gain').value),gbw:Number($('gbw').value)*1e6};validate(next);p=next;$('design-error').textContent='';drawPreview();}catch(error){$('design-error').textContent=error.message;}}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('design-form').addEventListener('submit',update);
$('reset').addEventListener('click',()=>{for(const [id,value]of Object.entries({r:10,c:10,gain:2,gbw:3}))$(id).value=value;update();});
for(const id of ['magnitude','phase'])$(id).addEventListener('click',()=>{view=id;for(const other of ['magnitude','phase'])$(other).setAttribute('aria-pressed',String(other===id));drawPreview();});
$('export-design').addEventListener('click',()=>download('filterbench-design.json',JSON.stringify({kind:'analytic-preview-not-a-measurement',parameters:p,predicted_gain:response(0,p).gain,predicted_cutoff_hz:cutoff(p),temperature_c:27,assumptions:'Generic single-pole linear op-amps; fixed white voltage noise; no rails or slew limits.'},null,2),'application/json'));
$('export-netlist').addEventListener('click',()=>download('filterbench-custom.cir',makeNetlist(p),'text/plain'));
try{const res=await fetch('report.json');if(!res.ok)throw new Error('Report unavailable');report=await res.json();drawEvidence();drawPreview();for(const id of ['apply','reset','export-design','export-netlist'])$(id).disabled=false;$('load-state').textContent='Recorded evidence loaded · actual ngspice runs · simulation only';}catch(error){$('load-state').className='error';$('load-state').textContent='Could not load simulation evidence. Reload this page to try again.';}
