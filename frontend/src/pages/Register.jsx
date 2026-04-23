import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Auth.css';

const Register = () => {
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
      await registerUser({ email, password });
      navigate('/login', { replace: true });
    } catch (error) {
      if (error?.response?.status === 409) {
        setErrorMessage('E-Mail ist bereits vergeben.');
      } else {
        setErrorMessage('Registrierung fehlgeschlagen. Bitte erneut versuchen.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell" aria-labelledby="register-heading">
      <h1 id="register-heading" className="auth-title">Neues Konto erstellen</h1>
      <p className="auth-subtitle">Registriere dich mit E-Mail und Passwort.</p>

      {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-email">E-Mail</label>
        <input
          id="register-email"
          className="input-field"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="register-password">Passwort (min. 10 Zeichen, Buchstaben und Zahlen)</label>
        <input
          id="register-password"
          className="input-field"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          pattern="(?=.*[A-Za-z])(?=.*\\d).{10,}"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="auth-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Registrierung...' : 'Registrieren'}
          </button>
        </div>
      </form>

      <p className="auth-link-row">
        Bereits registriert? <Link className="auth-link" to="/login">Zum Login</Link>
      </p>
    </section>
  );
};

export default Register;
