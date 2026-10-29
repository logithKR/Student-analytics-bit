import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=await PresentationFile.importPptx(await FileBlob.load('R:/project/bit/Student-analytics-bit/tmp/edupulse_final_working.pptx'));
for (const s of [0,7]) {
 const x=await p.inspect({select:`$.slides[${s}].elements`,include:['id','kind','text','position','style']});
 console.log('=== slide '+(s+1)+' ===\n'+x.ndjson);
}
