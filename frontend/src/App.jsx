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

  // -- BERECHNUNGEN (Progress & Gamification) --
  const initialWeight = catData.history.length > 0 ? catData.history[0].weight : catData.cat.currentWeight;
  const currentWeight = catData.history.length > 0 ? catData.history[catData.history.length-1].weight : catData.cat.currentWeight;
  const idealWeight = catData.cat.idealWeight;
  
  let progress = 0;
  if (initialWeight === idealWeight) {
    progress = currentWeight === idealWeight ? 100 : 0; 
  } else {
    const totalChangeNeeded = Math.abs(initialWeight - idealWeight);
    const changeSoFar = initialWeight > idealWeight 
        ? initialWeight - currentWeight 
        : currentWeight - initialWeight;
    progress = (changeSoFar / totalChangeNeeded) * 100;
  }
  progress = Math.max(0, Math.min(100, Math.round(progress)));

  // Badges
  const badges = [];
  if (catData.cat?.name && catData.cat?.photo) {
    badges.push({ icon: '📸', name: 'Profil-Profi', desc: 'Profil vollständig' });
  }
  if (catData.history.length >= 1) {
    badges.push({ icon: '⚖️', name: 'Erster Schritt', desc: '1. Wiegen' });
  }
  if (catData.history.length >= 3) {
    badges.push({ icon: '🔥', name: 'Dranbleiber', desc: '3+ Wiegungen' });
  }
  if (progress >= 100) {
    badges.push({ icon: '🏆', name: 'Ziel erreicht!', desc: 'Idealgewicht!' });
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🐱 Katzen Gewichts-Tracker</h1>
        <div>
          <button className={activePage === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('dashboard')}>Dashboard</button>
          <button className={activePage === 'management' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('management')}>Katzen verwalten</button>
          <button className={activePage === 'recipes' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('recipes')}>Rezepte</button>
          <button className={activePage === 'fitness' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActivePage('fitness')}>Fitness-Tipps</button>
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
              <p>{currentWeight} kg</p>
            </div>
            <div className="card stat-card">
              <h3>Idealgewicht</h3>
              <p>{idealWeight} kg</p>
            </div>
            <div className="card stat-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Fortschritt zum Zielgewicht</h3>
              <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '24px', width: '100%', overflow: 'hidden', marginTop: '10px' }}>
                <div style={{ 
                  background: progress >= 100 ? '#10b981' : '#22c55e', 
                  height: '100%', 
                  width: `${progress}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  transition: 'width 0.5s ease-in-out'
                }}>
                  {progress}%
                </div>
              </div>
              <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                Start: {initialWeight} kg | Ziel: {idealWeight} kg
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Erfolge & Abzeichen</h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
              {badges.map((b, i) => (
                <div key={i} style={{ 
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', 
                  padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: '150px' 
                }}>
                  <span style={{ fontSize: '24px' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#166534' }}>{b.name}</div>
                    <div style={{ fontSize: '12px', color: '#15803d' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
              {badges.length === 0 && <p style={{ color: '#6b7280' }}>Noch keine Abzeichen. Trage erste Gewichte ein!</p>}
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

      {/* SEITE 3: REZEPTE ZUM ABNEHMEN */}
      {activePage === 'recipes' && (
        <div className="main-content">
          <h2>Diät-Rezepte für Katzen</h2>
          <p style={{ marginBottom: '20px', color: '#4b5563' }}>Hier findest du gesunde, kalorienarme und sättigende Rezeptideen, damit deine Katze gesund und ohne Hunger abnehmen kann.</p>
          
          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>🐔</div>
              <h3 style={{ marginTop: '0' }}>Geflügel-Gemüse-Mix</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#4b5563', textAlign: 'left' }}>
                <li>100g gekochtes Hühnerbrustfilet (ohne Haut, ungewürzt)</li>
                <li>20g pürierte Zucchini oder Karotte</li>
                <li>1 TL Lachsöl (für gesunde Fette)</li>
              </ul>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
                Hähnchenbrust liefert viel Protein und wenig Kalorien. Das Gemüse füllt den Magen, ohne dass auf die Rippen geschlagen wird!
              </p>
            </div>

            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>🐟</div>
              <h3 style={{ marginTop: '0' }}>Leichtes Fisch-Menü</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#4b5563', textAlign: 'left' }}>
                <li>70g gedünsteter Weißfisch (z.B. Seelachs)</li>
                <li>1 EL Hüttenkäse (fettarm)</li>
                <li>Ein Schuss warmes Wasser</li>
              </ul>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
                Weißfisch ist besonders mager. Der Hüttenkäse gibt eine schöne Konsistenz und ist gut verdaulich, und das Wasser sorgt für extra Sättigung.
              </p>
            </div>

            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>🥣</div>
              <h3 style={{ marginTop: '0' }}>Trink-Snack "Huhn & Brühe"</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#4b5563', textAlign: 'left' }}>
                <li>150ml ungesalzene Hühnerbrühe (selbstgekocht)</li>
                <li>1 TL sehr fein geschnittenes, mageres Hühnerfleisch</li>
              </ul>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
                Eignet sich perfekt als Snack für zwischendurch, um den kleinen Hunger zu stillen. Die Flüssigkeit füllt den Magen, ohne Kalorien zu liefern.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEITE 4: FITNESS-TIPPS */}
      {activePage === 'fitness' && (
        <div className="main-content">
          <h2>Fitness-Tipps & Spielideen</h2>
          <p style={{ marginBottom: '20px', color: '#4b5563' }}>Katzen brauchen Bewegung, um gesund abzunehmen. Hier sind tolle Ideen, bei denen deine Katze rennen muss!</p>
          
          <style>
            {`
              @keyframes scurry {
                0% { transform: translateX(0); }
                20% { transform: translateX(200px); }
                40% { transform: translateX(50px); }
                60% { transform: translateX(250px); }
                80% { transform: translateX(100px); }
                100% { transform: translateX(0); }
              }
              @keyframes bouncePointer {
                0% { transform: translateY(0); }
                50% { transform: translateY(-30px); }
                100% { transform: translateY(0); }
              }
            `}
          </style>

          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left', overflow: 'hidden', position: 'relative' }}>
              <h3 style={{ marginTop: '0' }}>1. Die schnelle Spielzeugmaus</h3>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>
                Ziehe eine Maus an einer Schnur quer durch den Raum. Ändere abrupt die Richtung, um den Jagdinstinkt zu wecken.
              </p>
              <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '8px', width: '100%', height: '60px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '30px', position: 'absolute', animation: 'scurry 4s infinite ease-in-out' }}>🐁</div>
              </div>
            </div>

            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <h3 style={{ marginTop: '0' }}>2. Treppen-Sprint</h3>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>
                Wirf ein Leckerli (Teil der Tagesration!) oder ein Lieblingsspielzeug die Treppe hinauf oder den Flur entlang.
              </p>
              <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '8px', width: '100%', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '5px' }}>
                <div style={{ width: '20px', height: '10px', background: '#d1d5db', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '20px', height: '20px', background: '#9ca3af', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '20px', height: '30px', background: '#6b7280', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '20px', height: '40px', background: '#4b5563', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ fontSize: '24px', animation: 'bouncePointer 1s infinite alternate', marginLeft: '10px' }}>🐈</div>
              </div>
            </div>

            <div className="card stat-card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <h3 style={{ marginTop: '0' }}>3. Laserpointer-Action</h3>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>
                Lass deine Katze einem Laserpointer an der Wand hinterherjagen. Wichtig: Am Ende immer ein physisches Spielzeug "fangen" lassen!
              </p>
              <div style={{ marginTop: '20px', padding: '10px', background: '#111827', borderRadius: '8px', width: '100%', height: '60px', position: 'relative', overflow: 'hidden' }}>
                 <div style={{
                    width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%',
                    position: 'absolute', top: '25px', left: '10px',
                    boxShadow: '0 0 10px 2px #ef4444',
                    animation: 'scurry 3s infinite alternate cubic-bezier(0.1, 0.7, 1.0, 0.1)'
                 }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
