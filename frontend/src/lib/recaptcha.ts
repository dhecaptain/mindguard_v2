interface GrecaptchaLike {
  execute(siteKey: string, options: { action: string }): Promise<string>
}

const SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || ''

function grecaptchaGlobal(): GrecaptchaLike | undefined {
  const g = (window as Window & { grecaptcha?: GrecaptchaLike }).grecaptcha
  return g
}

function loadGrecaptcha(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && grecaptchaGlobal()) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_KEY
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })
}

export function isRecaptchaEnabled(): boolean {
  return Boolean(SITE_KEY)
}

export async function getRecaptchaToken(action = 'auth'): Promise<string> {
  if (!SITE_KEY) return ''
  try {
    await loadGrecaptcha()
    const g = grecaptchaGlobal()
    if (!g) return ''
    const token = await g.execute(SITE_KEY, { action })
    return typeof token === 'string' ? token : ''
  } catch {
    return ''
  }
}
