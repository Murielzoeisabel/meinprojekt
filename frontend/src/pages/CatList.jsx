import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, addCat, deleteCat } from '../services/api';
import { motion } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

const CatList = () => {
  const [cats, setCats] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', age: '', idealWeight: '' });

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = () => {
    getCats().then(data => setCats(data));
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    await addCat(newCat);
    setNewCat({ name: '', age: '', idealWeight: '' });
    setShowAddForm(false);
    loadCats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Möchtest du diese Katze wirklich löschen?')) {
      await deleteCat(id);
      loadCats();
    }
  };

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Deine Katzen</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Verwalte die Profile deiner Lieblinge.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> {showAddForm ? 'Abbrechen' : 'Katze hinzufügen'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="card" 
          style={{ marginBottom: '2rem', overflow: 'hidden' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Neue Katze anlegen</h3>
          <form onSubmit={handleAddCat} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Name</label>
              <input type="text" className="input-field" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} required style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Alter (Jahre)</label>
              <input type="number" className="input-field" value={newCat.age} onChange={e => setNewCat({...newCat, age: e.target.value})} required style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zielgewicht (kg)</label>
              <input type="number" step="0.1" className="input-field" value={newCat.idealWeight} onChange={e => setNewCat({...newCat, idealWeight: e.target.value})} required style={{ marginBottom: 0 }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 0' }}>Speichern</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {cats.map((cat, index) => (
          <motion.div 
            key={cat.id} 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <img src={cat.photo} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              <button onClick={() => handleDelete(cat.id)} style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                <Trash2 size={18} />
              </button>
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{cat.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{cat.age} Jahre • Ziel: {cat.idealWeight} kg</p>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Letztes Gewicht:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {cat.currentWeight ? `${parseFloat(cat.currentWeight).toFixed(2)} kg` : 'Keine Daten'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default CatList;
