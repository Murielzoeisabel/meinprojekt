import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      onLoginSuccess?.();
      navigate('/', { replace: true });
    } catch (error) {
      if (error?.response?.status === 401) {
        setErrorMessage('E-Mail oder Passwort ungültig.');
      } else {
        setErrorMessage('Login fehlgeschlagen. Bitte erneut versuchen.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell" aria-labelledby="login-heading">
      <h1 id="login-heading" className="auth-title">Willkommen zurück</h1>
      <p className="auth-subtitle">Melde dich mit E-Mail und Passwort an.</p>

      {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">E-Mail</label>
        <input
          id="login-email"
          className="input-field"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="login-password">Passwort</label>
        <input
          id="login-password"
          className="input-field"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="auth-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Anmeldung...' : 'Login'}
          </button>
        </div>
      </form>

      <p className="auth-link-row">
        Noch kein Konto? <Link className="auth-link" to="/register">Registrieren</Link>
      </p>
    </section>
  );
};

export default Login;
