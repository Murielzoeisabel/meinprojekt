const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Unsere Datenbank (im Arbeitsspeicher)
let cats = [
  { id: 1, name: 'Luna', age: 3, currentWeight: 5.0, idealWeight: 5.0, photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
 { id: 2, name: 'Milo', age: 2, currentWeight: 4.8, idealWeight: 4.5, photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400' }
];

let weightHistory = {
  1: [
    { date: '2026-03-01', weight: 5.3 },
    { date: '2026-03-10', weight: 5.1 },
    { date: '2026-03-25', weight: 5.0 }
  ],
  2: [
    { date: '2026-03-01', weight: 5.0 },
    { date: '2026-03-25', weight: 4.8 }
  ]
};

// --- API ROUTEN ---
app.get('/api/cats', (req, res) => res.json(cats));

app.get('/api/cats/:id/weight', (req, res) => {
  const catId = parseInt(req.params.id);
  res.json({ cat: cats.find(c => c.id === catId), history: weightHistory[catId] || [] });
});

app.post('/api/cats/:id/weight', (req, res) => {
  const catId = parseInt(req.params.id);
  const { weight } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  if (!weightHistory[catId]) weightHistory[catId] = [];
  weightHistory[catId].push({ date: today, weight: parseFloat(weight) });
  
  const cat = cats.find(c => c.id === catId);
  if (cat) cat.currentWeight = parseFloat(weight);
  
  res.json({ success: true, history: weightHistory[catId] });
});

app.listen(PORT, () => console.log(`✓ Backend läuft auf http://localhost:${PORT}`));