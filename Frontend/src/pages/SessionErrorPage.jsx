function SessionErrorPage({ error, onRetry, onLogout }) {
  return (
    <main className="loading-screen">
      <span className="loading-mark">L</span>
      <h1>Can’t reach your account</h1>
      <p className="session-error">{error}</p>
      <div className="session-actions">
        <button className="button button-primary" onClick={onRetry}>
          Try again
        </button>
        <button className="button button-quiet" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </main>
  )
}

export default SessionErrorPage
