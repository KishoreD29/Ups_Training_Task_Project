import { useEffect, useState } from 'react'
import { adminStatus, currentUser, login, register } from './api/index.js'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import SessionErrorPage from './pages/SessionErrorPage.jsx'
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

  const handleModeChange = (nextMode) => {
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
      <SessionErrorPage
        error={formError}
        onRetry={() => {
          setFormError('')
          setAuthStatus('checking')
          setRetryAttempt((attempt) => attempt + 1)
        }}
        onLogout={handleLogout}
      />
    )
  }

  if (authStatus === 'authenticated' && user) {
    return (
      <DashboardPage
        token={token}
        user={user}
        dashboardMessage={dashboardMessage}
        dashboardPending={dashboardPending}
        adminMessage={adminMessage}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <AuthPage
      mode={mode}
      onModeChange={handleModeChange}
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={formError}
      isPending={formPending}
    />
  )
}

export default App
