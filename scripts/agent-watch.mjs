#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
const LOG='logs/dev.log'
console.log('👀 vibe watcher: pytest --watch + tsc --watch')
fs.appendFileSync(LOG, `\n[watch ${new Date().toISOString()}] started\n`)
const pytest = spawn('bash',['-c','PYTHONPATH=..:. python3 -m pytest --watch -q 2>&1 | tee -a logs/dev.log'], { stdio:'inherit', cwd: 'backend' })
const tsc = spawn('npx',['tsc','--watch','--noEmit','--project','tsconfig.app.json'], { stdio:'inherit', cwd:'frontend' })
process.on('SIGINT', ()=>{ pytest.kill(); tsc.kill(); process.exit(0) })
