import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const workspace='R:/project/bit/Student-analytics-bit';
const out=workspace+'/tmp/ppt_build/draft_slides';
await fs.mkdir(out,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(workspace+'/tmp/edupulse_final_working.pptx'));
console.log('imported',p.slides.items.length);
for(let i=0;i<p.slides.items.length;i++){
 const slide=p.slides.items[i];
 const png=await p.export({slide,format:'png',scale:1.5});
 await fs.writeFile(`${out}/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
 console.log('rendered',i+1);
}
const montage=await p.export({format:'webp',montage:true,scale:1});
await fs.writeFile(workspace+'/tmp/ppt_build/draft_montage.webp',new Uint8Array(await montage.arrayBuffer()));
console.log('draft render complete');
