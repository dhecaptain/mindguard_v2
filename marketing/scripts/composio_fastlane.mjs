// Composio Fast Lane — Demo-to-Close + Crisis Triage (canonical CLI: `composio run`)
// Usage: `composio run marketing/scripts/composio_fastlane.mjs` injects execute/search/proxy.
// Dry-run: `composio execute SLACK_SEND_MESSAGE --dry-run -d '{...}'` before live.

export async function runDemoEngine(payload) {
  const { name, work_email_hash, institution, score, spreadsheetId, channel, work_email } = payload
  const row = [[new Date().toISOString(), name || '', work_email_hash || work_email || '', institution || '', score || 'STANDARD']]
  if (spreadsheetId) {
    await execute('GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND', {
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      values: row,
    })
  }
  if (channel) {
    await execute('SLACK_SEND_MESSAGE', {
      channel,
      text: `🚀 *New Demo Request*\n*Name:* ${name || '—'}\n*Institution:* ${institution || '—'} (${score || 'STANDARD'})\n*Email hash:* \`${work_email_hash || '—'}\``,
    })
  }
  if (work_email && String(process.env.COMPOSIO_AUTO_SEND_GMAIL).toLowerCase() !== 'false') {
    await execute('GMAIL_SEND_EMAIL', {
      recipient_email: work_email,
      subject: 'MindGuard — Demo Request Received',
      body: `Hi ${name || 'there'},\n\nThanks for requesting a demo for ${institution || 'your institution'}. We'll walk you through the consent workflow and dashboard.\n\n— MindGuard (https://www.mindguardai.me)`,
    })
  }
  return { ok: true, score }
}

export async function runCrisisTriage(payload) {
  const { student_id_hash, risk_tier, prob, institution_id, channel } = payload
  if (typeof prob === 'number' && prob < 0.65) return { ok: true, skipped: true }
  if (channel) {
    await execute('SLACK_SEND_MESSAGE', {
      channel,
      text: `⚠️ *CRISIS TRIAGE*\n*Student:* \`${student_id_hash}\`\n*Tier:* \`${risk_tier || 'HIGH'}\` prob ${(prob ?? 0).toFixed(2)} inst \`${institution_id || '—'}\`\n<https://app.mindguardai.me/dashboard|Open dashboard>`,
    })
  }
  try {
    const projectKey = process.env.JIRA_PROJECT_KEY || 'TRIAGE'
    if (projectKey) {
      await execute('JIRA_CREATE_ISSUE', {
        project_key: projectKey,
        summary: `[Triage] ${risk_tier || 'HIGH'} — ${String(student_id_hash).slice(0, 8)}`,
        description: `hash=${student_id_hash} tier=${risk_tier} prob=${prob} inst=${institution_id} dashboard=https://app.mindguardai.me/dashboard`,
        issue_type: 'Task',
      })
    }
  } catch {}
  return { ok: true }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Dry-run: import via `composio run marketing/scripts/composio_fastlane.mjs` with injected execute().')
}
