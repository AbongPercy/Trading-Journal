import { useState } from 'react';
import { login } from '../api.js';

/**
 * Sign-in screen. Collects username/email + password and calls the API.
 * On success the parent (App) stores the token and switches to the app.
 */
export default function LoginPage({ onLogin, onShowRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login({ identifier: identifier.trim(), password });
      onLogin(result.accessToken, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Trade Journal</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        {error && <div className="error-banner">{error}</div>}

        <label className="auth-label" htmlFor="login-identifier">
          Username or email
        </label>
        <input
          id="login-identifier"
          className="auth-input"
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <label className="auth-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch">
          No account yet?{' '}
          <button type="button" className="link-btn" onClick={onShowRegister}>
            Create one
          </button>
        </p>
      </form>
    </div>
  );
}