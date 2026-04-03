import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getCalories, addCalories } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Calories = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [inputConsumed, setInputConsumed] = useState('');
  const [inputBurned, setInputBurned] = useState('');

  useEffect(() => {
    getCats().then(data => {
      setCats(data);
      if (data.length > 0) setSelectedCatId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getCalories(selectedCatId).then(data => setCalorieHistory(data));
    }
  }, [selectedCatId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;
    await addCalories({ catId: selectedCatId, consumed: inputConsumed, burned: inputBurned });
    const newData = await getCalories(selectedCatId);
    setCalorieHistory(newData);
    setInputConsumed('');
    setInputBurned('');
  };

  return (
    <AnimatedPage>
      <h1>Kalorien-Tracker</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Verfolge die Energiezufuhr und den Verbrauch deiner Katze.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        <div className="card" style={{ height: 'max-content' }}>
          <h3>Neuer Eintrag</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Katze</label>
              <select className="input-field" value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} style={{ marginBottom: 0 }}>
                {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aufgenommen (z.B. Futter, Leckerli)</label>
              <input type="number" className="input-field" value={inputConsumed} onChange={e => setInputConsumed(e.target.value)} placeholder="in kcal" style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dazu verbrannt (z.B. Spielen)</label>
              <input type="number" className="input-field" value={inputBurned} onChange={e => setInputBurned(e.target.value)} placeholder="in kcal" style={{ marginBottom: 0 }} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Eintragen</button>
          </form>
        </div>

        <div className="card" style={{ height: '400px' }}>
          <h3>Übersicht (Aufgenommen vs. Verbrannt)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorieHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="consumed" name="Aufgenommen" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="burned" name="Verbrannt" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Calories;
