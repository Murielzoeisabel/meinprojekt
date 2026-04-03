import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stats = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    getCats().then(data => {
      setCats(data);
      if (data.length > 0) setSelectedCatId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId).then(data => setWeights(data));
    }
  }, [selectedCatId]);

  const calculateTrend = () => {
    if (weights.length < 2) return { status: 'stabil', diff: 0, direction: '' };
    const first = weights[0].weight;
    const last = weights[weights.length - 1].weight;
    const diff = last - first;
    
    if (diff > 0.1) return { status: 'steigend', diff: diff.toFixed(2), direction: '+' };
    if (diff < -0.1) return { status: 'fallend', diff: Math.abs(diff).toFixed(2), direction: '-' };
    return { status: 'stabil', diff: 0, direction: '' };
  };

  const trend = calculateTrend();

  return (
    <AnimatedPage>
      <h1>Statistiken & Analyse</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Detaillierte Einblicke in die Gewichtsentwicklung.
      </p>

      <select 
        className="input-field" 
        style={{ width: '250px', marginBottom: '2rem' }}
        value={selectedCatId} 
        onChange={(e) => setSelectedCatId(e.target.value)}
      >
        {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)', gap: '2rem' }}>
        <div className="card" style={{ height: '450px' }}>
          <h3>Langzeittrend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weights} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)' }} />
              <Area type="monotone" dataKey="weight" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorWeight)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Allgemeiner Trend</h4>
            <h2 style={{ fontSize: '1.5rem', color: trend.status === 'fallend' ? 'var(--accent-primary)' : (trend.status === 'steigend' ? 'var(--danger)' : 'var(--text-primary)') }}>
              {trend.status.toUpperCase()}
            </h2>
          </div>
          
          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Gesamtveränderung</h4>
            <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0 0' }}>{trend.direction}{trend.diff} kg</h2>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Einträge gesamt</h4>
            <h2 style={{ margin: 0 }}>{weights.length}</h2>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Stats;
