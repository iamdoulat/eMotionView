const fs = require('fs');
const content = fs.readFileSync('K:\\flyenv_folder\\eMotionView\\.env', 'utf-8');
const lines = content.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
    const eqIdx = lines[i].indexOf('=');
    const after = lines[i].slice(eqIdx + 1);
    console.log('First 10 chars:', JSON.stringify(after.slice(0, 10)));
    if (after.startsWith('"{')) {
      console.log('PROBLEM: Value starts with quote then brace');
    } else if (after.startsWith('{"')) {
      console.log('OK: Value starts with JSON object');
    } else {
      console.log('UNKNOWN start');
    }
    break;
  }
}
