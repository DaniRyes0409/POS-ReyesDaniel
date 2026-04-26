const { spawn } = require('child_process');

// Remove the conflicting environment variable
delete process.env.ELECTRON_RUN_AS_NODE;

// Spawn electron
const electron = require('electron');
const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
