/**
 * Extrahierte reine Funktion für Login-Payload-Validierung
 * Keine Datenbankzugriffe, keine externen Dependencies
 */
const parseLoginPayload = (body) => {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!email || !password) {
    return {
      error: {
        status: 400,
        message: 'E-Mail und Passwort sind erforderlich.'
      }
    };
  }

  return { email, password };
};

module.exports = { parseLoginPayload };
