import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=await PresentationFile.importPptx(await FileBlob.load('R:/project/bit/Student-analytics-bit/tmp/edupulse_final_working.pptx'));
const x=await p.inspect({select:"$.slides[7].elements[?search(@.text,'✓')]",include:['id','text','position']}); console.log(x.ndjson);
