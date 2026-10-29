import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=await PresentationFile.importPptx(await FileBlob.load('R:/project/bit/Student-analytics-bit/tmp/edupulse_final_working.pptx'));
for (const [label,select] of [['cover',"$.slides[0].elements[?search(@.text,'GUIDE|M. Karthiga|BANNARI') ]"],['method',"$.slides[7].elements[?search(@.text,'Charts/export|Department workbooks|Google Shape')]"]]) {
 const x=await p.inspect({select,include:['id','kind','text','position','style']});
 console.log('=== '+label+' ===\n'+x.ndjson);
}
