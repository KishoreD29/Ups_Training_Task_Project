import { useEffect, useState } from 'react'
import { adminStatus, currentUser, login, register } from './api.js'
import './App.css'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(() =>
    localStorage.getItem('authToken') ? 'checking' : 'anonymous',
  )
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formPending, setFormPending] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [dashboardPending, setDashboardPending] = useState(false)
  const [adminMessage, setAdminMessage] = useState('')
  const [retryAttempt, setRetryAttempt] = useState(0)

  useEffect(() => {
    if (!token) return
    let active = true

    const verifySession = async () => {
      try {
        const authenticatedUser = await currentUser(token)
        if (!active) return

        setUser(authenticatedUser)
        setAuthStatus('authenticated')
        setDashboardMessage('')
        setAdminMessage('')

        if (authenticatedUser.role === 'ADMIN') {
          setDashboardPending(true)
          try {
            const result = await adminStatus(token)
            if (active) setAdminMessage(result.message)
          } catch (error) {
            if (active) {
              if (error.status === 401) {
                localStorage.removeItem('authToken')
                setToken(null)
                setUser(null)
                setAuthStatus('anonymous')
              } else {
                setDashboardMessage(error.message)
              }
            }
          }
        } else {
          setDashboardPending(false)
          setDashboardMessage(`Your profile is up to date, ${authenticatedUser.name}.`)
        }
      } catch (error) {
        if (!active) return

        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
          setAuthStatus('anonymous')
          setFormError('Your session has expired. Please sign in again.')
        } else {
          setAuthStatus('session-error')
          setFormError(error.message)
        }
      } finally {
        if (active) setDashboardPending(false)
      }
    }

    verifySession()
    return () => {
      active = false
    }
  }, [token, retryAttempt])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormPending(true)
    setFormError('')

    try {
      const result =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await register(form)

      localStorage.setItem('authToken', result.token)
      setAuthStatus('checking')
      setToken(result.token)
      setUser(result.user)
      setDashboardMessage('')
      setAdminMessage('')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setFormPending(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    setAuthStatus('anonymous')
    setForm({ name: '', email: '', password: '' })
    setFormError('')
    setDashboardMessage('')
    setAdminMessage('')
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setFormError('')
  }

  if (authStatus === 'checking') {
    return (
      <main className="loading-screen" aria-live="polite">
        <span className="loading-mark">L</span>
        <p>Verifying your session...</p>
      </main>
    )
  }

  if (authStatus === 'session-error') {
    return (
      <main className="loading-screen">
        <span className="loading-mark">L</span>
        <h1>Can’t reach your account</h1>
        <p className="session-error">{formError}</p>
        <div className="session-actions">
          <button
            className="button button-primary"
            onClick={() => {
              setFormError('')
              setAuthStatus('checking')
              setRetryAttempt((attempt) => attempt + 1)
            }}
          >
            Try again
          </button>
          <button className="button button-quiet" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </main>
    )
  }

  if (authStatus === 'authenticated' && user) {
    const isAdmin = user.role === 'ADMIN'

    return (
      <main className="app-shell">
        <header className="topbar">
          <a className="brand brand-compact" href="/" aria-label="Library home">
            <span className="brand-mark">L</span>
            <span>Library<span className="brand-light">Space</span></span>
          </a>
          <div className="topbar-right">
            <span className="user-avatar" aria-hidden="true">
              {user.name?.charAt(0).toUpperCase()}
            </span>
            <span className="topbar-name">{user.name}</span>
            <button className="button button-quiet signout-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <section className="dashboard">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">{isAdmin ? 'ADMIN CONSOLE' : 'MEMBER SPACE'}</p>
              <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
              <p className="welcome-copy">
                {isAdmin
                  ? 'Your library workspace and account tools are ready.'
                  : 'Your account is ready. Here’s your member overview.'}
              </p>
            </div>
            <span className={`role-pill ${isAdmin ? 'role-admin' : ''}`}>
              <span className="status-dot" />
              {isAdmin ? 'Administrator' : 'Member'}
            </span>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-card account-card">
              <div className="card-heading">
                <span className="card-icon account-icon" aria-hidden="true">◎</span>
                <span className="card-label">YOUR ACCOUNT</span>
              </div>
              <h2>Account details</h2>
              <p className="card-description">Your verified profile information.</p>
              <dl className="account-details">
                <div>
                  <dt>Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd><span className="inline-role">{user.role}</span></dd>
                </div>
              </dl>
            </article>

            {isAdmin ? (
              <article className="dashboard-card role-card admin-card">
                <div className="card-heading">
                  <span className="card-icon admin-icon" aria-hidden="true">✦</span>
                  <span className="card-label">ADMIN ACCESS</span>
                </div>
                <h2>Administration</h2>
                <p className="card-description">
                  Your administrator permissions were verified by the server.
                </p>
                <div className="server-result" aria-live="polite">
                  <span className="result-dot" />
                  {dashboardPending ? 'Checking admin access...' : adminMessage || dashboardMessage}
                </div>
              </article>
            ) : (
              <article className="dashboard-card role-card">
                <div className="card-heading">
                  <span className="card-icon member-icon" aria-hidden="true">↗</span>
                  <span className="card-label">MEMBER ACCESS</span>
                </div>
                <h2>Your library account</h2>
                <p className="card-description">
                  You’re signed in with a secure, server-verified member session.
                </p>
                <div className="server-result" aria-live="polite">
                  <span className="result-dot" />
                  {dashboardPending ? 'Checking your account...' : dashboardMessage}
                </div>
              </article>
            )}
          </div>

          <p className="security-note">
            <span aria-hidden="true">⌑</span>
            Protected with JWT authentication
          </p>
        </section>
      </main>
    )
  }

  const isRegister = mode === 'register'

  return (
    <main className="auth-layout">
      <section className="intro-panel">
        <a className="brand" href="/" aria-label="Library home">
          <span className="brand-mark">L</span>
          <span>Library<span className="brand-light">Space</span></span>
        </a>

        <div className="intro-content">
          <span className="intro-kicker"><span /> YOUR LIBRARY, IN ONE PLACE</span>
          <h1>Make room for<br />what moves you.</h1>
          <p>A thoughtful space for your library account, built to keep everything simple and secure.</p>
          <div className="intro-features">
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <span>One secure sign-in for your account</span>
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <span>Access shaped around your role</span>
            </div>
          </div>
        </div>

        <p className="intro-footer">A quieter way to manage your library life.</p>
        <div className="decorative-orb orb-one" />
        <div className="decorative-orb orb-two" />
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <div className="mobile-brand brand">
            <span className="brand-mark">L</span>
            <span>Library<span className="brand-light">Space</span></span>
          </div>
          <div className="form-heading">
            <p className="eyebrow">{isRegister ? 'GET STARTED' : 'WELCOME BACK'}</p>
            <h2>{isRegister ? 'Create your account' : 'Sign in to your space'}</h2>
            <p>
              {isRegister
                ? 'Your personal library space is just a few details away.'
                : 'Enter your details below to continue.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button
              className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
            >
              Sign in
            </button>
            <button
              className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  value={form.name}
                />
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                maxLength={isRegister ? 72 : undefined}
                minLength={isRegister ? 8 : undefined}
                name="password"
                onChange={handleChange}
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                required
                type="password"
                value={form.password}
              />
            </label>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <button className="button button-primary submit-button" disabled={formPending} type="submit">
              {formPending
                ? isRegister ? 'Creating account...' : 'Signing in...'
                : isRegister ? 'Create account' : 'Sign in'}
              {!formPending && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="form-security">
            <span aria-hidden="true">⌑</span>
            Your connection is protected with secure authentication.
          </p>
        </div>
        <p className="copyright">© {new Date().getFullYear()} LibrarySpace</p>
      </section>
    </main>
  )
}

export default App
