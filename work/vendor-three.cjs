const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.module.js');
const targetDir = path.join(__dirname, '..', 'static', 'core', 'vendor');
const target = path.join(targetDir, 'three.module.js');

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);
console.log(`Vendored Three.js to ${target}`);
