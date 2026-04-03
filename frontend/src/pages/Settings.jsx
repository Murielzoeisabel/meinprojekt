import AnimatedPage from '../components/AnimatedPage';

const Settings = () => {
  return (
    <AnimatedPage>
      <h1>Einstellungen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Passe die App an deine Bedürfnisse an.</p>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Dark Mode</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Wechsel zwischen hellem und dunklem Design.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
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
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
          </label>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Settings;
