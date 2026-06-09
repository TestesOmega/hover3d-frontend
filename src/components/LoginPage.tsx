import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('E-mail ou senha incorretos.')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError('Erro ao criar conta: ' + error.message)
      else setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, padding: '40px 32px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 16,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 12px',
          }}>H</div>
          <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, margin: 0 }}>Hover3D</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: 14, outline: 'none',
            }}
          />
          <input
            type="password" placeholder="Senha" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: 14, outline: 'none',
            }}
          />

          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
          {success && <p style={{ color: '#4ade80', fontSize: 13, margin: 0 }}>{success}</p>}

          <button type="submit" disabled={loading} style={{
            padding: '11px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
          >
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </span>
        </p>
      </div>
    </div>
  )
}
