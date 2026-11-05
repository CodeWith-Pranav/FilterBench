import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const f of ['index.html','app.mjs','model.mjs','report.json','schematic.svg','evidence.png','bode.csv','noise.csv','step.csv','tolerance.csv','nominal.cir','verification.txt'])await copyFile(f,`public/${f}`);
console.log('Prepared static demo and recorded evidence downloads.');
