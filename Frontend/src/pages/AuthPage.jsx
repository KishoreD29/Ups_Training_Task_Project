import Brand from '../components/Brand.jsx'

function AuthPage({
  mode,
  onModeChange,
  form,
  onChange,
  onSubmit,
  error,
  isPending,
}) {
  const isRegister = mode === 'register'

  return (
    <main className="auth-layout">
      <section className="intro-panel">
        <Brand />

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
          <div className="mobile-brand">
            <Brand />
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
              onClick={() => onModeChange('login')}
            >
              Sign in
            </button>
            <button
              className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => onModeChange('register')}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            {isRegister && (
              <label className="field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  name="name"
                  onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                required
                type="password"
                value={form.password}
              />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="button button-primary submit-button" disabled={isPending} type="submit">
              {isPending
                ? isRegister ? 'Creating account...' : 'Signing in...'
                : isRegister ? 'Create account' : 'Sign in'}
              {!isPending && <span aria-hidden="true">→</span>}
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

export default AuthPage
