import AnimatedPage from '../components/AnimatedPage';
import { useState, useEffect } from 'react';
import {
  REMINDER_ENABLED_KEY,
  REMINDER_NEXT_AT_KEY,
  REMINDER_FREQUENCY_KEY,
  REMINDER_DAY_KEY,
  REMINDER_TIME_KEY,
  DEFAULT_FREQUENCY,
  DEFAULT_DAY,
  DEFAULT_TIME,
  getNextReminderTime
} from '../utils/reminder';

const Settings = () => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem(REMINDER_ENABLED_KEY) === 'true');
  const [reminderMessage, setReminderMessage] = useState('');

  const [reminderFrequency, setReminderFrequency] = useState(() => localStorage.getItem(REMINDER_FREQUENCY_KEY) || DEFAULT_FREQUENCY);
  const [reminderDay, setReminderDay] = useState(() => localStorage.getItem(REMINDER_DAY_KEY) || DEFAULT_DAY);
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_TIME);

  const updateReminderConfig = (frequency, day, time) => {
    localStorage.setItem(REMINDER_FREQUENCY_KEY, frequency);
    localStorage.setItem(REMINDER_DAY_KEY, day);
    localStorage.setItem(REMINDER_TIME_KEY, time);

    if (reminderEnabled) {
      const nextTime = getNextReminderTime();
      localStorage.setItem(REMINDER_NEXT_AT_KEY, String(nextTime));

      const frequencyText = frequency === 'weekly' ? 'wöchentlich' : 'täglich';
      const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      const dayText = frequency === 'weekly' ? ` am ${dayNames[Number(day)]}` : '';
      setReminderMessage(`Erinnerung aktualisiert: ${frequencyText}${dayText} um ${time} Uhr.`);
    }
  };

  const handleFrequencyChange = (e) => {
    const nextFrequency = e.target.value;
    setReminderFrequency(nextFrequency);
    updateReminderConfig(nextFrequency, reminderDay, reminderTime);
  };

  const handleDayChange = (e) => {
    const nextDay = e.target.value;
    setReminderDay(nextDay);
    updateReminderConfig(reminderFrequency, nextDay, reminderTime);
  };

  const handleTimeChange = (e) => {
    const nextTime = e.target.value;
    setReminderTime(nextTime);
    updateReminderConfig(reminderFrequency, reminderDay, nextTime);
  };

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

  useEffect(() => {
    localStorage.setItem(REMINDER_ENABLED_KEY, reminderEnabled ? 'true' : 'false');
  }, [reminderEnabled]);

  const handleReminderToggle = async () => {
    const nextEnabled = !reminderEnabled;

    if (nextEnabled) {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setReminderMessage('Dein Browser unterstützt keine Benachrichtigungen.');
        return;
      }

      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

      if (permission !== 'granted') {
        setReminderMessage('Benachrichtigungen wurden nicht erlaubt.');
        setReminderEnabled(false);
        return;
      }

      localStorage.setItem(REMINDER_NEXT_AT_KEY, String(getNextReminderTime()));
      setReminderEnabled(true);
      setReminderMessage('Browser-Erinnerung aktiviert.');
      return;
    }

    localStorage.removeItem(REMINDER_NEXT_AT_KEY);
    setReminderEnabled(false);
    setReminderMessage('Browser-Erinnerung deaktiviert.');
  };

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
            <h3>Dunkelmodus</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Wechsel zwischen hellem und dunklem Design.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              aria-label="Dunkelmodus umschalten"
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
          <select aria-label="Gewichtseinheit" className="input-field" style={{ width: '100px', margin: 0 }}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Benachrichtigungen</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Lokale Browser-Erinnerung ans Wiegen, keine E-Mail.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              aria-label="Benachrichtigungen umschalten"
              checked={reminderEnabled}
              onChange={handleReminderToggle}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </label>
        </div>

        {reminderEnabled && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-primary)' }}>
            <h4 style={{ margin: 0 }}>Wiegeerinnerung anpassen</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              💡 <strong>Empfehlung:</strong> Einmal wöchentliches Wiegen wird empfohlen, um natürliche Gewichtsschwankungen auszugleichen und Stress für deine Katze zu minimieren.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Häufigkeit</label>
                <select 
                  value={reminderFrequency} 
                  onChange={handleFrequencyChange}
                  className="input-field" 
                  style={{ margin: 0, width: '100%' }}
                >
                  <option value="weekly">Wöchentlich (empfohlen)</option>
                  <option value="daily">Täglich</option>
                </select>
              </div>

              {reminderFrequency === 'weekly' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 150px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Wochentag</label>
                  <select 
                    value={reminderDay} 
                    onChange={handleDayChange}
                    className="input-field" 
                    style={{ margin: 0, width: '100%' }}
                  >
                    <option value="1">Montag</option>
                    <option value="2">Dienstag</option>
                    <option value="3">Mittwoch</option>
                    <option value="4">Donnerstag</option>
                    <option value="5">Freitag</option>
                    <option value="6">Samstag</option>
                    <option value="0">Sonntag</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 120px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uhrzeit</label>
                <input 
                  type="time" 
                  value={reminderTime} 
                  onChange={handleTimeChange}
                  className="input-field" 
                  style={{ margin: 0, width: '100%', height: '40px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {reminderMessage && (
          <p style={{ margin: '0 0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{reminderMessage}</p>
        )}
      </div>
    </AnimatedPage>
  );
};

export default Settings;
