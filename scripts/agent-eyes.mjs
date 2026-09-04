#!/usr/bin/env node
import { chromium } from 'playwright'
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const BASE = process.env.AGENT_EYES_URL || 'http://127.0.0.1:5188'
const LOG = 'logs/dev.log'
const SCREENSHOT = 'logs/agent-eyes.png'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(e.message))
  console.log(`→ agent-eyes: navigating ${BASE}`)
  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: SCREENSHOT, fullPage: true })
    console.log(`📸 screenshot → ${SCREENSHOT}`)
    const flow = ['/auth/callback','/dashboard','/consent','/admin']
    for (const p of flow) {
      try { await page.goto(BASE + p, { timeout: 8000 }); await page.waitForTimeout(500) } catch {}
    }
    if (errors.length) {
      console.log('❌ console errors:', errors.join('\n'))
      fs.appendFileSync(LOG, `\n[agent-eyes ${new Date().toISOString()}] ERRORS:\n${errors.join('\n')}\n`)
      process.exitCode = 1
    } else {
      console.log('✅ agent-eyes: no console errors')
      fs.appendFileSync(LOG, `\n[agent-eyes ${new Date().toISOString()}] OK ${BASE}\n`)
    }
  } catch (e) {
    console.error('agent-eyes failed:', e.message)
    fs.appendFileSync(LOG, `\n[agent-eyes ${new Date().toISOString()}] FAIL: ${e.message}\n`)
    process.exitCode = 1
  } finally { await browser.close() }
}
run()
