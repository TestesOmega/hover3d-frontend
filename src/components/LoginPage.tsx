import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setError('Verificação de segurança pendente. Aguarde um momento.')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('E-mail ou senha incorretos.')
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError('Erro ao criar conta: ' + error.message)
      else setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) setError('Erro ao enviar e-mail: ' + error.message)
      else setSuccess('Enviamos um link de redefinição para o seu e-mail. Verifique sua caixa de entrada.')
    }

    setLoading(false)
  }

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next)
    setError('')
    setSuccess('')
    setTurnstileToken(null)
  }

  const inputStyle = (name: string): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: 10,
    border: `1px solid ${focusedInput === name ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.08)'}`,
    background: 'rgba(255,255,255,0.04)',
    color: '#f1f0ff',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    boxShadow: focusedInput === name ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none',
  })

  const subtitle = {
    login:    'Entre na sua conta para continuar',
    register: 'Crie sua conta gratuitamente',
    forgot:   'Redefina sua senha',
  }[mode]

  return (
    <div onMouseMove={handleMouseMove} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#09090f', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid de fundo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }} />

      {/* Glow roxo seguindo o mouse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 700px 500px at ${mouse.x}% ${mouse.y}%, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.06) 45%, transparent 70%)`,
        transition: 'background 0.08s ease', pointerEvents: 'none',
      }} />

      {/* Brilho fixo */}
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px', width: 360, height: 360,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420, margin: '0 16px', padding: '44px 40px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 24, backdropFilter: 'blur(24px)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.08)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(124,58,237,0.45)', letterSpacing: -1,
          }}>H</div>
          <h1 style={{ color: '#f1f0ff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.5 }}>
            Hover3D
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{subtitle}</p>
        </div>

        {/* Tela de sucesso — substitui o formulário inteiro */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, margin: '0 auto 20px',
            }}>✅</div>
            <h2 style={{ color: '#f1f0ff', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>
              {mode === 'forgot' ? 'Link enviado!' : 'Conta criada!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
              {mode === 'forgot'
                ? <>Enviamos um link para <strong style={{ color: '#a78bfa' }}>{email}</strong>.<br />Clique nele para redefinir sua senha.</>
                : <>Enviamos um e-mail de confirmação para <strong style={{ color: '#a78bfa' }}>{email}</strong>.<br />Acesse sua caixa de entrada e clique no link para <strong>ativar sua conta</strong>.</>
              }
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 16 }}>
              Não encontrou? Verifique a pasta de spam.
            </p>
            <button onClick={() => switchMode('login')} style={{
              marginTop: 24, padding: '11px 24px', borderRadius: 10, border: 'none',
              background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email" placeholder="E-mail" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                required style={inputStyle('email')}
              />

              {mode !== 'forgot' && (
                <input
                  type="password" placeholder="Senha" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                  required style={inputStyle('password')}
                />
              )}

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: -4 }}>
                  <span onClick={() => switchMode('forgot')}
                    style={{ fontSize: 12.5, color: '#a78bfa', cursor: 'pointer' }}>
                    Esqueci minha senha
                  </span>
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'dark', language: 'pt-BR' }}
              />

              <button type="submit" disabled={loading || !turnstileToken} style={{
                marginTop: 4, padding: '13px', borderRadius: 10, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
              }}>
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar link de redefinição'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login' && (
                <>Não tem conta? <span onClick={() => switchMode('register')} style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>Cadastre-se</span></>
              )}
              {mode === 'register' && (
                <>Já tem conta? <span onClick={() => switchMode('login')} style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>Entrar</span></>
              )}
              {mode === 'forgot' && (
                <span onClick={() => switchMode('login')} style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>← Voltar ao login</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
