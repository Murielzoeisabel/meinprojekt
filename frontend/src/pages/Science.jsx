import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const Science = () => {
  return (
    <AnimatedPage>
      <h1>Wissenschaftliche Hintergründe</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Die Biologie und Bedürfnisse der Katze verstehen.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <motion.div className="card" whileHover={{ y: -5 }}>
          <h3>Körperzusammensetzung</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Zum Erhalt ihrer Gesundheit sind Katzen auf rein tierische Beute angewiesen (strikte Karnivoren). Ihr gesamter Organismus und Verdauungstrakt ist darauf spezialisiert.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Hoher Eiweißbedarf (Erhalt der Muskelmasse)</li>
            <li>Kaum körpereigene Amylase, um Kohlenhydrate effizient zu verdauen</li>
            <li>Natürliche Energiequelle: Fette und tierische Proteine</li>
          </ul>
        </motion.div>
        
        <motion.div className="card" whileHover={{ y: -5 }}>
          <h3>Physiologie des Abnehmens</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Anders als andere Tiere dürfen Katzen niemals abrupt hungern oder zu schnell Gewicht verlieren. Ansonsten droht eine fatale Leberschädigung.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
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
              <span style={{ fontSize: '0.9rem' }}>Protein</span> <span style={{ fontWeight: 'bold' }}>55%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--border-color)', height: '8px', borderRadius: '4px', marginBottom: '1.25rem' }}>
              <div style={{ width: '55%', background: 'var(--accent-primary)', height: '100%', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>Fett</span> <span style={{ fontWeight: 'bold' }}>35%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--border-color)', height: '8px', borderRadius: '4px', marginBottom: '1.25rem' }}>
              <div style={{ width: '35%', background: '#f59e0b', height: '100%', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>Kohlenhydrate</span> <span style={{ fontWeight: 'bold' }}>&lt;5%</span>
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

export default Science;
