#!/usr/bin/env node

/**
 * ============================================================================
 * GridFlowX Unified Multi-Process Development Runner (v3.0.0)
 * ============================================================================
 * Concurrently spawns and manages all core GridFlowX development services:
 * 1. Local Ollama Inference Engine (auto-detected / auto-spawned on port 11434)
 * 2. Python FastAPI AI Microservice (Uvicorn with hot-reload on port 8000)
 * 3. Next.js 15 Web Application (Next dev server on port 3000)
 *
 * Designed for reliable cross-platform execution (Windows 11, macOS, Linux).
 * Provides colored process prefixes, model verification, and atomic process termination.
 */

import { spawn, execSync } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env if present
function loadEnvFile() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvFile();

// Configuration
const OLLAMA_BASE_URL = (
  process.env.OLLAMA_BASE_URL ||
  process.env.OLLAMA_HOST ||
  'http://127.0.0.1:11434'
).replace('localhost', '127.0.0.1').replace(/\/+$/, '');

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b';
const OLLAMA_AUTO_START = process.env.OLLAMA_AUTO_START !== 'false';

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const GRAY = '\x1b[90m';

console.log(`\n${CYAN}${BOLD}========================================================================${RESET}`);
console.log(`${CYAN}${BOLD}  GRIDFLOWX UNIFIED DEVELOPMENT RUNNER (v3.0.0)${RESET}`);
console.log(`${CYAN}  Smart AI-Driven Microgrid Energy Management & Monitoring System${RESET}`);
console.log(`${CYAN}${BOLD}========================================================================${RESET}\n`);

// 1. Detect Python Executable (py vs python vs python3)
function detectPythonCommand() {
  const candidates = process.platform === 'win32'
    ? ['py', 'python', 'python3']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // try next candidate
    }
  }
  return process.platform === 'win32' ? 'py' : 'python3';
}

const pythonCmd = detectPythonCommand();
console.log(`${GRAY}[SYSTEM] Detected Python executable: ${BOLD}${pythonCmd}${RESET}`);

// 2. Detect Ollama Executable Binary
function detectOllamaExecutable() {
  const isWin = process.platform === 'win32';
  try {
    const cmd = isWin ? 'where.exe ollama' : 'which ollama';
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (out) return out.split('\r\n')[0].split('\n')[0];
  } catch {
    // try fallback paths
  }

  if (isWin) {
    const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\default', 'AppData', 'Local');
    const standardPath = path.join(localAppData, 'Programs', 'Ollama', 'ollama.exe');
    if (fs.existsSync(standardPath)) {
      return standardPath;
    }
  }
  return null;
}

const ollamaExe = detectOllamaExecutable();
if (ollamaExe) {
  console.log(`${GREEN}✓ [Ollama Engine] Executable found: ${GRAY}${ollamaExe}${RESET}`);
} else {
  console.log(`${YELLOW}ℹ [Ollama Engine] Binary not found in PATH or standard directory.${RESET}`);
}

// 3. Child Process Tracker & Signal Traps
const activeProcesses = [];
let isShuttingDown = false;

function terminateChild(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-proc.pid, 'SIGTERM');
    }
  } catch {
    try {
      proc.kill('SIGTERM');
    } catch {
      // process already dead
    }
  }
}

function cleanExit(signal = 'SIGINT') {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n\n${YELLOW}${BOLD}[SHUTDOWN] Received ${signal}. Gracefully stopping all GridFlowX processes...${RESET}`);

  for (const proc of activeProcesses) {
    terminateChild(proc);
  }

  setTimeout(() => {
    console.log(`${GREEN}✓ All GridFlowX processes stopped cleanly.${RESET}\n`);
    process.exit(0);
  }, 600);
}

process.on('SIGINT', () => cleanExit('SIGINT'));
process.on('SIGTERM', () => cleanExit('SIGTERM'));
process.on('exit', () => cleanExit('exit'));
process.on('uncaughtException', (err) => {
  console.error(`${RED}[Fatal Error] ${err.message}${RESET}`, err.stack);
  cleanExit('uncaughtException');
});

// 4. Helper: HTTP GET & POST
function httpGet(urlStr, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const req = http.get({
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        timeout: timeoutMs,
      }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function httpPost(urlStr, payload, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const data = JSON.stringify(payload);
      const req = http.request({
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
        timeout: timeoutMs,
      }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Post request timed out'));
      });

      req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

// 5. Pre-flight Ollama Lifecycle & Model Diagnostics
async function ensureOllamaEngine() {
  console.log(`${GRAY}[SYSTEM] Checking Ollama engine status on ${OLLAMA_BASE_URL}...${RESET}`);
  
  let isRunning = false;
  let tagsData = null;

  // 5.1 Initial connectivity probe
  try {
    tagsData = await httpGet(`${OLLAMA_BASE_URL}/api/tags`, 1500);
    isRunning = true;
  } catch {
    isRunning = false;
  }

  // 5.2 If not running but CLI binary is found, auto-launch
  if (!isRunning && ollamaExe && OLLAMA_AUTO_START) {
    console.log(`${CYAN}⚙ [Ollama Engine] Launching local daemon: \`ollama serve\`...${RESET}`);
    try {
      const ollamaProc = spawn(ollamaExe, ['serve'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        detached: false,
        shell: false,
        env: {
          ...process.env,
          OLLAMA_HOST: '127.0.0.1:11434',
          OLLAMA_ORIGINS: '*',
        },
      });

      activeProcesses.push(ollamaProc);

      // Poll up to 10 seconds for Ollama server to become ready
      const startTime = Date.now();
      while (Date.now() - startTime < 10000) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          tagsData = await httpGet(`${OLLAMA_BASE_URL}/api/tags`, 1000);
          isRunning = true;
          break;
        } catch {
          // continue polling
        }
      }
    } catch (launchErr) {
      console.log(`${YELLOW}⚠ [Ollama Engine] Auto-start attempt failed: ${launchErr.message}${RESET}`);
    }
  }

  // 5.3 Diagnostic outcome evaluation
  if (!isRunning) {
    console.log(`${YELLOW}⚠ [Ollama Engine] Offline on ${OLLAMA_BASE_URL}.${RESET}`);
    console.log(`${GRAY}  (AI microservice will automatically use analytical physics fallbacks until Ollama is started with \`ollama serve\`)${RESET}`);
    return false;
  }

  console.log(`${GREEN}✓ [Ollama Engine] Server reachable on ${OLLAMA_BASE_URL}${RESET}`);

  // 5.4 Model verification
  const models = (tagsData?.models || []).map((m) => m.name);
  const matchedModel = models.find((m) => m === OLLAMA_MODEL || m.startsWith(`${OLLAMA_MODEL}:`) || m.includes(OLLAMA_MODEL))
    || models.find((m) => m.toLowerCase().includes('qwen'))
    || models[0];

  if (!matchedModel) {
    console.log(`${YELLOW}⚠ [Ollama Engine] Configured model '${OLLAMA_MODEL}' not found.${RESET}`);
    console.log(`${GRAY}  Available local models: ${models.join(', ') || 'None'}${RESET}`);
    console.log(`${YELLOW}  Run \`ollama pull ${OLLAMA_MODEL}\` to install the local Qwen model.${RESET}`);
    console.log(`${GRAY}  (AI microservice will use analytical physics fallback mode)${RESET}`);
    return false;
  }

  console.log(`${GREEN}✓ [Ollama Engine] Target model '${matchedModel}' confirmed installed${RESET}`);

  // 5.5 Fast inference probe
  try {
    const t0 = Date.now();
    await httpPost(`${OLLAMA_BASE_URL}/api/generate`, {
      model: matchedModel,
      prompt: 'ping',
      stream: false,
      options: { num_predict: 1, temperature: 0.0 },
    }, 8000);
    const latency = Date.now() - t0;
    console.log(`${GREEN}✓ [Ollama Engine] Live inference probe verified (${latency}ms latency)${RESET}`);
    return true;
  } catch (probeErr) {
    console.log(`${YELLOW}ℹ [Ollama Engine] Model '${matchedModel}' ready (initial probe warm-up: ${probeErr.message})${RESET}`);
    return true;
  }
}

// 6. Log Piping Helper
function pipeLog(stream, prefix, color) {
  if (!stream) return;
  stream.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      console.log(`${color}${BOLD}${prefix}${RESET} ${line}`);
    }
  });
}

// 7. Launch All Services
ensureOllamaEngine().then(() => {
  console.log(`\n${CYAN}[1/2] Starting GridFlowX Enterprise Backend & Agentic AI Gateway (FastAPI on port 8000)...${RESET}`);
  console.log(`${GREEN}[2/2] Starting GridFlowX Web Application (Next.js on port 3000)...${RESET}\n`);

  // (A) Spawn Enterprise Backend Service (orchestrating backend/ + agentic-ai/)
  const backendArgs = ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend', '--reload', '--port', '8000'];
  const backendProcess = spawn(pythonCmd, backendArgs, {
    cwd: rootDir,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
  });

  activeProcesses.push(backendProcess);
  pipeLog(backendProcess.stdout, '[GridFlowX Backend]', CYAN);
  pipeLog(backendProcess.stderr, '[GridFlowX Backend]', CYAN);

  backendProcess.on('error', (err) => {
    console.error(`${RED}[GridFlowX Backend Error] ${err.message}${RESET}`);
  });

  // (B) Spawn Next.js Web App
  const isWin = process.platform === 'win32';
  const webProcess = isWin
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', 'run', 'dev'], {
        cwd: rootDir,
        env: { ...process.env, FORCE_COLOR: '1' },
        stdio: ['inherit', 'pipe', 'pipe'],
        windowsVerbatimArguments: true,
      })
    : spawn('npm', ['run', 'dev'], {
        cwd: rootDir,
        env: { ...process.env, FORCE_COLOR: '1' },
        stdio: ['inherit', 'pipe', 'pipe'],
      });

  activeProcesses.push(webProcess);
  pipeLog(webProcess.stdout, '[GridFlowX Web]', GREEN);
  pipeLog(webProcess.stderr, '[GridFlowX Web]', GREEN);

  webProcess.on('error', (err) => {
    console.error(`${RED}[GridFlowX Web Error] ${err.message}${RESET}`);
  });

  // (C) Display Unified Summary Banner after brief startup window
  setTimeout(() => {
    if (isShuttingDown) return;
    console.log(`\n${MAGENTA}${BOLD}========================================================================${RESET}`);
    console.log(`${GREEN}${BOLD}✓ GridFlowX Unified System Online & Ready:${RESET}`);
    console.log(`  • Web Application Dashboard:    ${BOLD}http://localhost:3000${RESET}`);
    console.log(`  • AI Microservice Gateway:     ${BOLD}http://localhost:8000${RESET}`);
    console.log(`  • AI OpenAPI Documentation:     ${BOLD}http://localhost:8000/docs${RESET}`);
    console.log(`  • AI Health & Diagnostics:      ${BOLD}http://localhost:8000/api/v1/agent/health${RESET}`);
    console.log(`  • Local Ollama Engine:          ${BOLD}${OLLAMA_BASE_URL}${RESET}`);
    console.log(`${GRAY}  Press Ctrl+C at any time to cleanly stop all services.${RESET}`);
    console.log(`${MAGENTA}${BOLD}========================================================================${RESET}\n`);
  }, 3500);
});
