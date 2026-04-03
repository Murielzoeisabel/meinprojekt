import AnimatedPage from '../components/AnimatedPage';
import { Activity } from 'lucide-react';

const HealthCheck = () => {
  return (
    <AnimatedPage>
      <h1>Gesundheits-Check</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ist deine Katze übergewichtig? Finde es heraus!</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="var(--accent-primary)" /> Sichtprüfung von oben</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Betrachte deine Katze von oben, während sie steht. Eine normalgewichtige Katze sollte eine gut erkennbare Taille direkt hinter den Rippen aufweisen. Fehlt diese Einbuchtung, liegt vermutlich leichtes bis starkes Übergewicht vor.</p>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="#f59e0b" /> Rippen-Test</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Lege deine Hände flach und mit leichtem Druck an die Seiten deiner Katze. Die Rippen sollten spürbar sein – etwa so intensiv, wie wenn du über die Knöchel deines Handrückens streichst. Sind sie nicht ertastbar, ist die Fettschicht zu dick.</p>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="var(--danger)" /> Der Bauch ("Urprall-Falte")</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Ein kleiner leerer Hautbeutel am Unterbauch ist normal (besonders nach einer Kastration). Dieser sollte jedoch locker hängen und hauptsächlich aus Haut bestehen, ohne massive Fetteinlagerungen.</p>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default HealthCheck;
