import AnimatedPage from '../components/AnimatedPage';
import { Activity, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

void motion;

const HealthCheck = () => {
  return (
    <AnimatedPage>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyItems: 'center' }}>
        <h1>Gesundheits-Check & Biologie</h1>
        <span className="wink-cat" style={{ fontSize: '2.5rem' }}></span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ist deine Katze übergewichtig? Finde es heraus und verstehe die wissenschaftlichen Hintergründe!</p>

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2rem', marginBottom: '1.5rem' }}>
        <Activity size={24} color="var(--accent-primary)" /> 1. Körperlicher Check
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', marginBottom: '3rem' }}>
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

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <BookOpen size={24} color="var(--accent-primary)" /> 2. Wissenschaftliche Hintergründe
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <motion.div className="card" whileHover={{ y: -5 }}>
          <h3>Körperzusammensetzung</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Zum Erhalt ihrer Gesundheit sind Katzen auf rein tierische Beute angewiesen (strikte Karnivoren). Ihr gesamter Organismus und Verdauungstrakt ist darauf spezialisiert.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
            <li>Hoher Eiweißbedarf (Erhalt der Muskelmasse)</li>
            <li>Kaum körpereigene Amylase, um Kohlehydrate effizient zu verdauen</li>
            <li>Natürliche Energiequelle: Fette und tierische Proteine</li>
          </ul>
        </motion.div>
        
        <motion.div className="card" whileHover={{ y: -5 }}>
          <h3>Physiologie des Abnehmens</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Anders als andere Tiere dürfen Katzen niemals abrupt hungern oder zu schnell Gewicht verlieren. Ansonsten droht eine fatale Leberschädigung.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
            <li>Gefahr der <strong style={{ color: 'var(--danger)' }}>Hepatischen Lipidose</strong> (Fettleber).</li>
            <li>Maximal sichere Abnahme: 1% bis 2% des Körpergewichts pro Woche.</li>
            <li>Mehr Bewegung ist gesünder als drastische Portionen-Reduktion.</li>
          </ul>
        </motion.div>

        <motion.div className="card" whileHover={{ y: -5 }}>
          <h3>Natürliche Nährstoffverteilung</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Die Zusammensetzung einer natürlichen Maus zum Vergleich:</p>
          
          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Protein</span> <span style={{ fontWeight: 'bold' }}>55%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--border-color)', height: '8px', borderRadius: '4px', marginBottom: '1.25rem' }}>
              <div style={{ width: '55%', background: 'var(--accent-primary)', height: '100%', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Fett</span> <span style={{ fontWeight: 'bold' }}>35%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--border-color)', height: '8px', borderRadius: '4px', marginBottom: '1.25rem' }}>
              <div style={{ width: '35%', background: '#f59e0b', height: '100%', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Kohlenhydrate</span> <span style={{ fontWeight: 'bold' }}>&lt;5%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--border-color)', height: '8px', borderRadius: '4px' }}>
              <div style={{ width: '5%', background: 'var(--danger)', height: '100%', borderRadius: '4px' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default HealthCheck;
