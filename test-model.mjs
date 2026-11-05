import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,response,cutoff,noiseDensity,makeNetlist,validate} from './model.mjs';
const report=JSON.parse(await readFile('report.json','utf8'));
for(const [f,db,phase] of report.ac){assert.ok(Math.abs(response(f).db-db)<1e-6);assert.ok(Math.abs(response(f).phase-phase)<1e-6);}
for(const [f,d] of report.noise)assert.ok(Math.abs(noiseDensity(f)/d-1)<1e-6);
assert.ok(Math.abs(cutoff()/report.nominal.cutoff_hz-1)<.0002);
assert.ok(Math.abs(response(0).gain-1.9999400014)<1e-9);
assert.ok(cutoff({...defaults,r:20000})<cutoff()*.501);
assert.throws(()=>validate({...defaults,r:0}));assert.throws(()=>validate({...defaults,gain:1}));assert.throws(()=>response(-1));
assert.match(makeNetlist(),/noisy=0/);assert.match(makeNetlist(),/noise v\(out\) VIN/);
console.log('PASS browser model: 481 AC and phase points + 481 noise points match actual ngspice, cutoff and RC scaling agree, invalid values rejected.');
