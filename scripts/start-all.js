const { spawn, spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const npmCommand = 'npm';

function killExistingNodeProcesses() {
  if (process.platform !== 'win32') {
    return;
  }

  const cleanupCommand = [
    '$current = ' + process.pid + ';',
    "Get-CimInstance Win32_Process -Filter \"Name = 'node.exe'\" |",
    'Where-Object { $_.ProcessId -ne $current } |',
    'ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }',
  ].join(' ');

  const cleaner = spawnSync('powershell', ['-NoProfile', '-Command', cleanupCommand], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });

  if (cleaner.status && cleaner.status !== 0) {
    console.warn(`[cleanup] exited with code ${cleaner.status}`);
  }
}

killExistingNodeProcesses();

function startService(label, args) {
  const child = spawn(npmCommand, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exitCode = 1;
      return;
    }

    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
}

const children = [
  startService('server', ['--prefix', 'server', 'run', 'dev']),
  startService('client', ['--prefix', 'client', 'run', 'dev']),
];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
