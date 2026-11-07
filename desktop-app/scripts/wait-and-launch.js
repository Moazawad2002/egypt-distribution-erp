const http = require('http');
const { spawn } = require('child_process');

function checkViteReady() {
  http.get('http://localhost:3000', (res) => {
    console.log('Vite dev server is ready! Spawning Electron...');
    const electronProcess = spawn('npx', ['electron', 'dist-electron/main.js'], {
      stdio: 'inherit',
      shell: true
    });
    electronProcess.on('close', (code) => {
      process.exit(code);
    });
  }).on('error', () => {
    setTimeout(checkViteReady, 1000);
  });
}

checkViteReady();
