const fs = require('fs');
const path = 'K:\\flyenv_folder\\eMotionView\\.env';
let content = fs.readFileSync(path, 'utf-8');
const lines = content.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
    const eqIdx = lines[i].indexOf('=');
    let val = lines[i].slice(eqIdx + 1);
    console.log('Before fix, first char:', JSON.stringify(val[0]));
    // Remove leading/trailing quotes that wrap the JSON
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith('"')) {
      val = val.slice(1);
    }
    // Replace double-escaped \\n with \n
    val = val.replace(/\\\\n/g, '\\n');
    lines[i] = 'FIREBASE_SERVICE_ACCOUNT_KEY=' + val;
    console.log('After fix, first char:', JSON.stringify(val[0]));
    break;
  }
}
const newContent = lines.join('\r\n') + '\r\n';
fs.writeFileSync(path, newContent, 'utf-8');
console.log('Done');
