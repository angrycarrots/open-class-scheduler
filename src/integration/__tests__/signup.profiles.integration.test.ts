import { describe, it, expect } from 'vitest'
import { AUTH_URL, REST_URL, restHeaders } from '../../utils/supabase'
import { fetch as undiciFetch } from 'undici'

// Utility delay
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

// Helper to decide if we should run this test
const hasRemoteEnv = () => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined
  return !!url && !!anon && /supabase\.co/i.test(url)
}

describe('Signup -> profiles integration (remote Supabase)', () => {
  const run = hasRemoteEnv()

  ;(run ? it : it.skip)('creates a profile row after signup', async () => {
    // Generate unique credentials
    const rand = Math.random().toString(36).slice(2, 10)
    const email = `m+test-${rand}@athanas.org`
    const password = `P@ssw0rd!${rand}`
    const username = `user_${rand}`

    // Perform signup by calling the auth endpoint directly with anon key
    const signupResp = await undiciFetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: {
        ...restHeaders(),
      },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: username },
      }),
    })
    if (!signupResp.ok) {
      const ct = signupResp.headers.get('content-type') || ''
      let body: any = null
      try {
        body = ct.includes('application/json') ? await signupResp.json() : await signupResp.text()
      } catch {
        body = '<unparseable body>'
      }
      throw new Error(`Signup failed: ${signupResp.status} ${signupResp.statusText} Body: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
    }

    // Poll the profiles REST endpoint for the inserted row
    // The DB trigger should insert into public.profiles.
    const maxAttempts = 20
    let found = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const resp = await undiciFetch(
        `${REST_URL}/profiles?email=eq.${encodeURIComponent(email)}&select=id,email,full_name,created_at`,
        { headers: restHeaders() }
      )

      if (resp.ok) {
        const rows = (await resp.json()) as Array<{ id: string; email: string; full_name: string; created_at: string }>
        if (rows.length === 1) {
          expect(rows[0].email).toBe(email)
          // Username is stored in full_name column
          expect(rows[0].full_name).toBe(username)
          found = true
          break
        }
      }

      // Wait and retry
      await sleep(1000)
    }

    expect(found).toBe(true)
  }, 30000)
})
