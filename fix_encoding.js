const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The file likely got double UTF-8 encoded or similar. 
// We will fix the specific strings we see in the UI.
content = content.replace(/panader[^ ]+ de/, 'panadería de');
content = content.replace(/Cat[^ ]+logo/g, 'Catálogo');
content = content.replace(/Direcci[^ ]+n/g, 'Dirección');
content = content.replace(/Tel[^ ]+fono/g, 'Teléfono');
content = content.replace(/env[^ ]+an/g, 'envían');

fs.writeFileSync('index.html', content, 'utf8');
