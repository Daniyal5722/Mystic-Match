const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<meta name="theme-color" content="#090f2b" />',
  '<meta name="theme-color" content="#090f2b" />\n    <link rel="manifest" href="/manifest.json" />'
);

fs.writeFileSync('index.html', code);
