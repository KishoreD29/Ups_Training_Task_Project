import AdminBooks from '../components/AdminBooks.jsx'
import Brand from '../components/Brand.jsx'

function DashboardPage({
  token,
  user,
  dashboardMessage,
  dashboardPending,
  adminMessage,
  onLogout,
}) {
  const isAdmin = user.role === 'ADMIN'

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand compact />
        <div className="topbar-right">
          <span className="user-avatar" aria-hidden="true">
            {user.name?.charAt(0).toUpperCase()}
          </span>
          <span className="topbar-name">{user.name}</span>
          <button className="button button-quiet signout-button" onClick={onLogout}>
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

        {isAdmin && <AdminBooks token={token} />}

        <p className="security-note">
          <span aria-hidden="true">⌑</span>
          Protected with JWT authentication
        </p>
      </section>
    </main>
  )
}

export default DashboardPage
