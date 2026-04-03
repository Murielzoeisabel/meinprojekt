import { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage';

const Profile = () => {
  const [name, setName] = useState('Katzenfreund');
  const [email, setEmail] = useState('katze@beispiel.de');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profil erfolgreich gespeichert!');
  };

  return (
    <AnimatedPage>
      <h1>Dein Profil</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Verwalte deine persönlichen Daten.</p>
      
      <div className="card" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dein Name</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>E-Mail Adresse</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Speichern</button>
        </form>
      </div>
    </AnimatedPage>
  );
};
export default Profile;
