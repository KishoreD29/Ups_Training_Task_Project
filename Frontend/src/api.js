const API_ROOT = import.meta.env.VITE_API_URL || '/api'

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const responseBody = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const result =
    responseBody && contentType.includes('application/json')
      ? JSON.parse(responseBody)
      : null

  if (!response.ok) {
    const error = new Error(
      result?.message || response.statusText || 'The request could not be completed.',
    )
    error.status = response.status
    throw error
  }

  if (!result) {
    throw new Error('The server returned an unexpected response.')
  }

  return result
}

export function login(credentials) {
  return request('/auth/login', { method: 'POST', body: credentials })
}

export function register(details) {
  return request('/auth/register', { method: 'POST', body: details })
}

export function currentUser(token) {
  return request('/users/me', { token })
}

export function adminStatus(token) {
  return request('/admin/status', { token })
}
