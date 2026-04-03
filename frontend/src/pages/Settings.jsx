import AnimatedPage from '../components/AnimatedPage';
import { useState, useEffect } from 'react';

const Settings = () => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Watch for changes made from the Navbar while staying on this page
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyItems: 'center' }}>
        <h1>Einstellungen</h1>
        <span className="wink-cat" style={{ fontSize: '2.5rem' }}></span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Passe die App an deine Bedürfnisse an.</p>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Dark Mode</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Wechsel zwischen hellem und dunklem Design.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={theme === 'dark'} 
              onChange={toggleTheme} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} 
            />
          </label>
        </div>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Gewichtseinheit</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Kilogramm (kg) oder Pfund (lbs)</p>
          </div>
          <select className="input-field" style={{ width: '100px', margin: 0 }}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Benachrichtigungen</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Erinnere mich ans Wiegen.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
          </label>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Settings;
