// run-server.js - Wrapper para evitar timeout no Claude Code
// Este arquivo é usado pelo claude-startup.js conforme especificado no CLAUDE.md

const { spawn } = require('child_process');
const path = require('path');

// Configure environment to load .env from parent directory
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔧 Iniciando servidor via run-server.js (evita timeout)...');
console.log('🔧 Loading .env from parent directory...');

const serverPath = path.join(__dirname, 'server.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('close', (code) => {
  console.log(`🔧 Server process exited with code ${code}`);
  process.exit(code);
});

// Pass through signals
process.on('SIGINT', () => {
  console.log('🛑 Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Terminating server...');
  serverProcess.kill('SIGTERM');
});