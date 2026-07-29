const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const backendPublicDir = path.join(rootDir, 'backend', 'public');
const frontendDistDir = path.join(frontendDir, 'dist');

const getNpmCommand = () => (process.platform === 'win32' ? 'npm.cmd' : 'npm');

const run = (command, cwd) => {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
};

if (!fs.existsSync(frontendDir)) {
  throw new Error('frontend/ nicht gefunden.');
}

if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
  throw new Error('frontend/package.json nicht gefunden.');
}

if (!fs.existsSync(path.join(rootDir, 'backend', 'package.json'))) {
  throw new Error('backend/package.json nicht gefunden.');
}

run(`${getNpmCommand()} run build`, frontendDir);

if (!fs.existsSync(frontendDistDir)) {
  throw new Error('frontend/dist wurde nicht erzeugt.');
}

fs.rmSync(backendPublicDir, { recursive: true, force: true });
fs.mkdirSync(backendPublicDir, { recursive: true });
fs.cpSync(frontendDistDir, backendPublicDir, { recursive: true });

const indexHtmlPath = path.join(backendPublicDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  throw new Error('backend/public/index.html wurde nicht erstellt.');
}

console.log('\nDeploy-Build erfolgreich.');
console.log(`Frontend-Build: ${frontendDistDir}`);
console.log(`Backend-Output: ${backendPublicDir}`);

module.exports = { getNpmCommand };