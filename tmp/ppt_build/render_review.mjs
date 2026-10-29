import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const workspace='R:/project/bit/Student-analytics-bit';
const out=workspace+'/tmp/ppt_build';
async function saveBlob(path, blob){ await fs.writeFile(path,new Uint8Array(await blob.arrayBuffer())); }
async function renderDeck(path,label){
  const p=await PresentationFile.importPptx(await FileBlob.load(path));
  const inspection=await p.inspect({kind:'slide,textbox,shape,image,table,chart,layout',maxChars:5000});
  await fs.writeFile(`${out}/${label}_inspection.ndjson`,inspection.ndjson,'utf8');
  await fs.mkdir(`${out}/${label}_slides`,{recursive:true});
  for(let i=0;i<p.slides.items.length;i++){
    const slide=p.slides.items[i];
    const png=await p.export({slide,format:'png',scale:1.5});
    await saveBlob(`${out}/${label}_slides/slide-${String(i+1).padStart(2,'0')}.png`,png);
  }
  const montage=await p.export({format:'webp',montage:true,scale:1});
  await saveBlob(`${out}/${label}_montage.webp`,montage);
  console.log(`${label}: ${p.slides.items.length} slides rendered`);
}
await renderDeck(workspace+'/ppt/Campus_Maintenance_Request_Desk_First_Review (1).pptx','original');
await renderDeck(workspace+'/tmp/edupulse_final_working.pptx','draft');
