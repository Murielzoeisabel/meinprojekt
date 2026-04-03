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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQj-R8J3LzHoOmWBF-_VlRZeRTyaSaDay5fdqQQ-NZp-i-uIML9kVcEkWTisaK0QlaaylweJSDG-huLpkB07w8eUnr_dIoif4WliOkHl7NP_GabcUSbje4MdTUfK8GVlelHlb09Yca3edu0EvrBloTqGpqPLc5w9WuGut9Uan-CUaQeLED1-0hVePmcIfo2-7FJPdhRgbD8Pd1qrK6nOGcfbhVP-jcKVYUGTfziuJPq5ItS0A0sdiZ0Q6Glk786bfao574HAgn49g" 
          alt="Profile Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-primary)' }}
        />
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>Dein Profil</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Verwalte deine persönlichen Daten.</p>
        </div>
      </div>
      
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
