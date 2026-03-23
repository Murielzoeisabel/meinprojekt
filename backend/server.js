const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock weight data for the cat (aiming for 5.0 kg)
const weightData = [
  { date: '2025-10-01', weight: 6.5 },
  { date: '2025-10-15', weight: 6.3 },
  { date: '2025-11-01', weight: 6.1 },
  { date: '2025-11-15', weight: 5.9 },
  { date: '2025-12-01', weight: 5.8 },
  { date: '2025-12-15', weight: 5.6 },
  { date: '2026-01-01', weight: 5.5 },
  { date: '2026-01-15', weight: 5.4 },
  { date: '2026-02-01', weight: 5.3 },
  { date: '2026-02-15', weight: 5.2 },
  { date: '2026-03-01', weight: 5.1 },
  { date: '2026-03-15', weight: 5.05 },
];

app.get('/api/weight', (req, res) => {
  res.json({
    catName: 'Luna',
    idealWeight: 5.0,
    history: weightData
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
