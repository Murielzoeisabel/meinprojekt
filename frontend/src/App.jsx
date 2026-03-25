import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' oder 'management'
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(1);
  const [catData, setCatData] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);

  // Lade alle Katzen beim Start
  useEffect(() => {
    fetch('http://localhost:3000/api/cats')
      .then(res => res.json())
      .then(data => {
        setCats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fehler:', err);
        setLoading(false);
      });
  }, []);

  // Lade Gewichtsdaten, wenn sich die Katze ändert
  useEffect(() => {
    if (selectedCatId) {
      fetch(`http://localhost:3000/api/cats/${selectedCatId}/weight`)
        .then(res => res.json())
        .then(data => setCatData(data));
    }
  }, [selectedCatId]);

  const handleGewichtSpeichern = (e) => {
    e.preventDefault();
    if (!newWeight) return;

    fetch(`http://localhost:3000/api/cats/${selectedCatId}/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: newWeight })
    })
      .then(res => res.json())
      .then(data => {
        setCatData({ ...catData, history: data.history });
        setNewWeight('');
        alert('Gewicht gespeichert!');
      });
  };

  if (loading || !catData) return <div className="loading">Lade Daten vom Backend... Bitte warten.</div>;

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🐱 Katzen Gewichts-Tracker</h1>
        <div>
          <button className={activePage === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('dashboard')}>Dashboard</button>
          <button className={activePage === 'management' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('management')}>Katzen verwalten</button>
        </div>
      </nav>

      {/* SEITE 1: DASHBOARD */}
      {activePage === 'dashboard' && (
        <div className="main-content">
          <div className="card picker-card">
            <label>Katze auswählen: </label>
            <select value={selectedCatId} onChange={(e) => setSelectedCatId(parseInt(e.target.value))}>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="card">
            <h2>Heutiges Gewicht eingeben</h2>
            <form onSubmit={handleGewichtSpeichern} className="weight-form">
              <input type="number" step="0.01" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="z.B. 4.5" required />
              <button type="submit" className="primary-btn">Speichern</button>
            </form>
          </div>

          <div className="stats-grid">
            <div className="card stat-card">
              <h3>Aktuelles Gewicht</h3>
              <p>{catData.history.length > 0 ? catData.history[catData.history.length-1].weight : catData.cat.currentWeight} kg</p>
            </div>
            <div className="card stat-card">
              <h3>Idealgewicht</h3>
              <p>{catData.cat.idealWeight} kg</p>
            </div>
          </div>

          <div className="card chart-card">
            <h2>Gewichtsverlauf</h2>
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={catData.history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
                  <XAxis dataKey="date" stroke="#166534" />
                  <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} stroke="#166534" />
                  <Tooltip />
                  <ReferenceLine y={catData.cat.idealWeight} label="Idealgewicht" stroke="#ea580c" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} dot={{r: 5, fill: '#166534'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SEITE 2: VERWALTUNG */}
      {activePage === 'management' && (
        <div className="main-content">
          <h2>Alle Katzen</h2>
          <div className="cat-grid">
            {cats.map(cat => (
              <div key={cat.id} className="card cat-profile">
                <img src={cat.photo} alt={cat.name} />
                <h3>{cat.name}</h3>
                <p>Alter: {cat.age} Jahre</p>
                <p>Gewicht: {cat.currentWeight} kg</p>
                <p>Ziel: {cat.idealWeight} kg</p>
                <button className="primary-btn" onClick={() => alert('Bearbeiten-Funktion folgt!')}>Bearbeiten</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
