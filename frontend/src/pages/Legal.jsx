import AnimatedPage from '../components/AnimatedPage';

const Legal = () => {
  return (
    <AnimatedPage>
      <h1>Rechtliches & Guidelines</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Wichtige Informationen und Community Regeln.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        <div className="card">
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Datenschutzbestimmungen</h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Deine Daten und die Gesundheitsdaten deiner Katze werden sicher verarbeitet. Wir geben keine Daten an unbefugte Dritte weiter. Alle eingetragenen Gewichtsverläufe, Fotos und Kaloriendaten dienen ausschließlich der persönlichen Analyse und Verbesserung der Tiergesundheit.
          </p>
        </div>

        <div className="card">
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Community Guidelines</h3>
          <ul style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Respektvoller Umgang:</strong> Behandle andere Katzenbesitzer in Diskussionsbereichen oder Chats immer freundlich und respektvoll.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Keine medizinische Diagnose:</strong> Nutze die App zur Unterstützung und Dokumentation. Unsere Tools und KIs ersetzen jedoch nie die Diagnose eines Tierarztes! Bei drastischem Gewichtsverlust suche sofort einen Mediziner auf.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Gesundes Abnehmen:</strong> Befolge die Regel: Maximal 1% bis 2% Gewichtsverlust pro Woche. Extreme Hungerkuren bei Katzen sind tierschutzwidrig, verboten und lebensgefährlich (Risiko der Fettleber/Hepatischen Lipidose).</li>
          </ul>
        </div>
      </div>
    </AnimatedPage>
  );
};
export default Legal;
