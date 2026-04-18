import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';

const NoCatsFeedback = ({ compact = false }) => {
  return (
    <div
      className="card"
      style={{
        marginBottom: compact ? '0' : '2rem',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        background: 'rgba(16, 185, 129, 0.08)'
      }}
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
        Noch keine Katze hinterlegt. Lege zuerst deinen Liebling unter Katzen an, dann kannst du hier direkt loslegen.
      </p>
      <Link
        to="/cats"
        className="btn-primary"
        style={{
          marginTop: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Heart size={16} />
        Zu Katzen
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default NoCatsFeedback;
