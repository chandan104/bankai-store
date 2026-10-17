const fs = require('fs');
const js = fs.readFileSync('bankai_bundle.js', 'utf8');

// Find all sections or components rendered in uA
const uAIdx = js.indexOf('uA=()=>');
if (uAIdx !== -1) {
  console.log('uA function definition:');
  console.log(js.substring(uAIdx, uAIdx + 2000));
}
