import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights, addWeight } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const TreadmillCat = ({ isHovered }) => (
  <motion.svg
    width="190"
    height="130"
    viewBox="0 0 200 140"
    style={{ display: 'block' }}
    animate={{ y: isHovered ? [-1, 1, -1] : [0, 2, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <ellipse cx="100" cy="112" rx="70" ry="14" fill="rgba(63, 77, 46, 0.18)" />

    {/* Treadmill */}
    <g>
      <rect x="30" y="86" width="140" height="10" rx="5" fill="rgba(92, 118, 60, 0.35)" stroke="var(--border-color)" strokeWidth="1.2" />
      <rect x="40" y="74" width="120" height="14" rx="7" fill="rgba(159, 203, 69, 0.18)" stroke="var(--accent-primary)" strokeWidth="1.2" />
      <line x1="52" y1="88" x2="52" y2="108" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
      <line x1="148" y1="88" x2="148" y2="108" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
      <rect x="152" y="64" width="18" height="28" rx="8" fill="rgba(159, 203, 69, 0.22)" stroke="var(--accent-primary)" strokeWidth="1.2" />
      <circle cx="165" cy="78" r="3.2" fill="var(--accent-primary)" />
      <circle cx="165" cy="78" r="1.2" fill="var(--surface-color)" />
    </g>

    {/* Overweight cat running */}
    <motion.g
      animate={{ x: isHovered ? [0, 6, 0] : [0, 3, 0], y: isHovered ? [0, -1, 0] : [0, 1, 0] }}
      transition={{ duration: isHovered ? 0.6 : 0.9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.g animate={{ rotate: isHovered ? [-6, 8, -6] : [-3, 4, -3] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '84px 58px' }}>
        <ellipse cx="92" cy="90" rx="36" ry="24" fill="#d89b5a" stroke="#2b2b2b" strokeWidth="1.8" />
        <ellipse cx="92" cy="86" rx="27" ry="16" fill="#c9874d" opacity="0.95" />
        <circle cx="84" cy="58" r="21" fill="#d89b5a" stroke="#2b2b2b" strokeWidth="1.8" />
        <polygon points="68,43 64,24 77,38" fill="#d89b5a" stroke="#2b2b2b" strokeWidth="1.3" />
        <polygon points="100,43 104,24 91,38" fill="#d89b5a" stroke="#2b2b2b" strokeWidth="1.3" />
        <polygon points="68,39 66,29 73,35" fill="#f7c8bd" />
        <polygon points="100,39 102,29 95,35" fill="#f7c8bd" />
        <ellipse cx="78" cy="57" rx="2.4" ry="4.4" fill="#2b2b2b" />
        <ellipse cx="90" cy="57" rx="2.4" ry="4.4" fill="#2b2b2b" />
        <polygon points="82,62 84,65 86,62" fill="#f5a3b3" stroke="#2b2b2b" strokeWidth="0.8" />
        <path d="M84 65 L81 68 M84 65 L87 68" stroke="#2b2b2b" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M76 69 Q84 74 92 69" stroke="#2b2b2b" strokeWidth="1.8" fill="none" />
        <path d="M96 65 C103 70, 106 75, 105 82" stroke="#8b5a2b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M64 72 C57 78, 56 87, 60 93" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M59 79 C54 88, 53 98, 58 106" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M103 79 C108 88, 109 98, 104 106" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M92 111 C98 102, 104 99, 110 99" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
      </motion.g>

      <path d="M74 98 C62 102, 56 107, 52 116" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M108 98 C120 102, 126 107, 130 116" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M70 101 C73 91, 72 84, 68 78" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M112 101 C116 91, 117 84, 121 78" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" fill="none" />
    </motion.g>
  </motion.svg>
);

const Dashboard = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [headerHovered, setHeaderHovered] = useState(false);

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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-secondary)' }}>
            Cat Slim Down <span className="floating-comic">👋</span>
          </h1>
          <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Willkommen zurück! Bereit für ein bisschen Training?</p>
        </div>
        <div
          onMouseEnter={() => setHeaderHovered(true)}
          onMouseLeave={() => setHeaderHovered(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '170px' }}
        >
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <TreadmillCat isHovered={headerHovered} />
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
