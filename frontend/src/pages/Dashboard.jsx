import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights, addWeight } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getCats().then(data => {
      setCats(data);
      if (data.length > 0) {
        setSelectedCatId(data[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId).then(data => setWeightHistory(data));
    }
  }, [selectedCatId]);

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight || !selectedCatId) return;
    
    await addWeight({ catId: selectedCatId, weight: newWeight });
    const updatedHistory = await getWeights(selectedCatId);
    setWeightHistory(updatedHistory);
    setNewWeight('');
    
    setCats(cats.map(c => 
      c.id.toString() === selectedCatId 
        ? { ...c, currentWeight: parseFloat(newWeight) } 
        : c
    ));

    setSuccessMsg('Gewicht erfolgreich gespeichert!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const selectedCat = cats.find(c => c.id.toString() === selectedCatId);
  const currentWeight = selectedCat?.currentWeight ? selectedCat.currentWeight.toFixed(2) : '-';
  const targetWeight = selectedCat?.idealWeight ? selectedCat.idealWeight.toFixed(2) : '-';
  
  const avgWeight = weightHistory.length > 0 
    ? (weightHistory.reduce((acc, curr) => acc + curr.weight, 0) / weightHistory.length).toFixed(2)
    : '-';

  return (
    <AnimatedPage>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Cat Slim Down Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Willkommen zurück! Wie geht es deinen Katzen heute?</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Katze auswählen:</h3>
        <select 
          className="input-field" 
          style={{ width: '250px', margin: 0 }}
          value={selectedCatId} 
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          {cats.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {selectedCat && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <motion.div className="card" whileHover={{ scale: 1.02 }}>
            <h4 style={{ color: 'var(--text-secondary)' }}>Aktuelles Gewicht</h4>
            <h2>{currentWeight} kg</h2>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.02 }}>
            <h4 style={{ color: 'var(--text-secondary)' }}>Zielgewicht</h4>
            <h2>{targetWeight} kg</h2>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.02 }}>
            <h4 style={{ color: 'var(--text-secondary)' }}>Durchschnitts-Gewicht</h4>
            <h2>{avgWeight} kg</h2>
          </motion.div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
        <div className="card" style={{ height: '400px' }}>
          <h3>Gewichtsverlauf</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="var(--accent-primary)" 
                strokeWidth={3}
                activeDot={{ r: 8 }} 
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: 'max-content' }}>
          <h3>Neues Gewicht eintragen</h3>
          <form onSubmit={handleWeightSubmit}>
            <input 
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Gewicht in kg, z.B. 4.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Gewicht speichern</button>
          </form>
          {successMsg && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{ color: 'var(--accent-primary)', marginTop: '1rem', fontWeight: 500 }}
            >
              {successMsg}
            </motion.p>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
