import { FileBlob, PresentationFile } from 'file:///C:/Users/rames/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=await PresentationFile.importPptx(await FileBlob.load('R:/project/bit/Student-analytics-bit/tmp/edupulse_final_working.pptx'));
const ids=['sh/tczi58j6','sh/698jatkf','sh/rah03y10','sh/gzq1g32h','sh/jy1sje5k','sh/1wnets7y','sh/29sfep8j','sh/xofu9gnu','sh/gjy1gjil','sh/y1cfmpg7'];
for(const id of ids){const x=p.resolve(id); console.log(id,JSON.stringify({kind:x.kind,text:x.text,fill:x.fill,stroke:x.stroke,background:x.background}));}
