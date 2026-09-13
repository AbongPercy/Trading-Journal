import { useState } from 'react';
import { register } from '../api.js';

/**
 * Sign-up screen. Creates an account with full access to the app.
 */
export default function RegisterPage({ onRegister, onShowLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onRegister(result.accessToken, result.user);
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
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="error-banner">{error}</div>}

        <label className="auth-label" htmlFor="reg-username">
          Username
        </label>
        <input
          id="reg-username"
          className="auth-input"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="auth-label" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          className="auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="auth-label" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          className="auth-input"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="auth-label" htmlFor="reg-confirm">
          Confirm password
        </label>
        <input
          id="reg-confirm"
          className="auth-input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button className="btn primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={onShowLogin}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}