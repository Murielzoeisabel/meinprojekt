import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights, addWeight } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

void motion;

const DrawnCatAnimation = () => (
  <motion.svg
    width="280"
    height="170"
    viewBox="0 0 280 170"
    role="img"
    aria-label="Gezeichnete, animierte Katze"
    style={{ display: 'block' }}
  >
    <motion.ellipse
      cx="140"
      cy="145"
      rx="88"
      ry="12"
      fill="rgba(63, 77, 46, 0.16)"
      animate={{ rx: [86, 90, 86] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.g
      animate={{ y: [0, -1.2, 0], x: [0, 1.2, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.path
        d="M206 98 C244 83, 250 52, 226 38"
        stroke="#8F683F"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: [-5, 6, -5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '205px 98px' }}
      />

      <ellipse cx="146" cy="102" rx="70" ry="38" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
      <ellipse cx="146" cy="95" rx="52" ry="24" fill="#B77A41" opacity="0.88" />

      <motion.g
        animate={{ y: [0, -0.8, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '88px 78px' }}
      >
        <circle cx="88" cy="78" r="28" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="69,60 62,35 80,52" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="104,60 111,35 93,52" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="70,56 66,43 76,51" fill="#F6C7B8" />
        <polygon points="103,56 107,43 97,51" fill="#F6C7B8" />
        <ellipse cx="80" cy="77" rx="3" ry="5" fill="#2F2B28" />
        <ellipse cx="95" cy="77" rx="3" ry="5" fill="#2F2B28" />
        <path d="M84 86 Q88 89 92 86" stroke="#2F2B28" strokeWidth="2" fill="none" strokeLinecap="round" />
        <polygon points="86,82 88,85 90,82" fill="#F5A4B6" stroke="#2F2B28" strokeWidth="0.8" />
      </motion.g>

      <motion.g
        animate={{ rotate: [-9, 9, -9] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '110px 126px' }}
      >
        <path d="M110 126 C106 136, 106 144, 112 152" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [9, -9, 9] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '136px 127px' }}
      >
        <path d="M136 127 C132 137, 132 145, 138 153" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [8, -8, 8] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        style={{ transformOrigin: '160px 127px' }}
      >
        <path d="M160 127 C156 137, 156 145, 162 153" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        style={{ transformOrigin: '184px 126px' }}
      >
        <path d="M184 126 C180 136, 180 144, 186 152" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
    </motion.g>
  </motion.svg>
);

const Dashboard = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getCats()
      .then(data => {
        setCats(data);
        if (data.length > 0) {
          setSelectedCatId(data[0].id.toString());
        }
      })
      .catch(() => setErrorMsg('Katzen konnten nicht geladen werden.'));
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId)
        .then(data => setWeightHistory(data))
        .catch(() => setErrorMsg('Gewichtsdaten konnten nicht geladen werden.'));
    }
  }, [selectedCatId]);

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight || !selectedCatId) return;

    try {
      setErrorMsg('');
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
    } catch {
      setErrorMsg('Gewicht konnte nicht gespeichert werden.');
    }
  };

  const selectedCat = cats.find(c => c.id.toString() === selectedCatId);
  const currentWeight = selectedCat?.currentWeight ? selectedCat.currentWeight.toFixed(2) : '-';
  const targetWeight = selectedCat?.idealWeight ? selectedCat.idealWeight.toFixed(2) : '-';
  
  const avgWeight = weightHistory.length > 0 
    ? (weightHistory.reduce((acc, curr) => acc + curr.weight, 0) / weightHistory.length).toFixed(2)
    : '-';

  return (
    <AnimatedPage>
      {errorMsg && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239, 68, 68, 0.45)', color: 'var(--danger)' }}>
          {errorMsg}
        </div>
      )}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-secondary)' }}>
            Cat Slim Down <span className="floating-comic">👋</span>
          </h1>
          <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Willkommen zurück! Bereit für ein bisschen Training?</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '280px' }}>
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <DrawnCatAnimation />
          </motion.div>
        </div>
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
