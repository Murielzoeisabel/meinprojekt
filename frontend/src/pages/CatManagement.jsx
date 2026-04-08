import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { Cat, Sparkles, ClipboardList, ArrowRight } from 'lucide-react';

const CatManagement = () => {
  return (
    <AnimatedPage>
      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', borderRadius: '16px', padding: '0.8rem', color: 'var(--accent-primary)' }}>
            <Cat size={28} />
          </div>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Katzen-Verwaltung</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Eine zentrale Übersicht für Pflege, Gewicht und Profilpflege.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', background: 'var(--bg-color)' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3 style={{ marginBottom: '0.4rem' }}>Profile pflegen</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Name, Rasse, Zielgewicht und Foto können im Katzenbereich angepasst werden.</p>
          </div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', background: 'var(--bg-color)' }}>
            <ClipboardList size={20} color="var(--accent-primary)" />
            <h3 style={{ marginBottom: '0.4rem' }}>Gewicht im Blick</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Neues Gewicht eintragen und die Entwicklung im Dashboard verfolgen.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/cats" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Zur Katzenliste <ArrowRight size={18} />
          </Link>
          <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Zum Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CatManagement;