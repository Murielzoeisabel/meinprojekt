import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import './index.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/weight')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading" style={{textAlign: 'center', marginTop: '20vh'}}>Lade Gewichtsdaten...</div>;
  }

  if (!data) {
    return <div style={{color: '#ef4444', textAlign: 'center', marginTop: '20vh'}}>Fehler beim Laden der Daten. Bitte überprüfe, ob das Backend auf Port 3000 läuft.</div>;
  }

  const currentWeight = data.history[data.history.length - 1].weight;

  return (
    <div className="dashboard-container">
      <h1>Gewichtsverlauf: {data.catName}</h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Auf dem Weg zum Idealgewicht
      </p>

      <div className="info-cards">
        <div className="info-card">
          <h3>Aktuelles Gewicht</h3>
          <p>{currentWeight} kg</p>
        </div>
        <div className="info-card">
          <h3>Idealgewicht</h3>
          <p>{data.idealWeight} kg</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.history}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{fill: '#94a3b8'}}
                tickMargin={10}
              />
              <YAxis 
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
                stroke="#94a3b8" 
                tick={{fill: '#94a3b8'}}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#f8fafc'
                }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <ReferenceLine 
                y={data.idealWeight} 
                label={{ position: 'top', value: 'Idealgewicht', fill: '#10b981', fontSize: 12 }} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#38bdf8" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
