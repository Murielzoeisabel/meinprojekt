const { Resend } = require('resend');
const React = require('react');
const { render } = require('@react-email/render');
const { Html, Head, Preview, Body, Container, Heading, Text, Link, Hr, Section } = require('@react-email/components');

const resend = new Resend(process.env.RESEND_API_KEY || 're_mockKey1234');

// React Email template using plain JS (React.createElement)
const NewPostEmailTemplate = ({ author, text, postUrl }) => {
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Preview, null, `Neuer Beitrag von ${author} im Community-Forum!`),
    React.createElement(Body, { style: { fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' } },
      React.createElement(Container, { style: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '30px', maxWidth: '600px', margin: '0 auto' } },
        React.createElement(Heading, { style: { color: '#fb923c', fontSize: '24px', marginBottom: '10px' } }, "CatSlimDown Community"),
        React.createElement(Text, { style: { fontSize: '16px', color: '#333333' } }, `Hallo! Es gibt einen neuen Beitrag in der Community von **${author}**:`),
        React.createElement(Section, { style: { backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '15px', margin: '20px 0', borderLeft: '4px solid #fb923c' } },
          React.createElement(Text, { style: { fontSize: '15px', color: '#4b5563', margin: 0, fontStyle: 'italic' } }, `"${text}"`)
        ),
        React.createElement(Text, { style: { fontSize: '16px', color: '#333333', marginBottom: '30px' } }, "Klicke auf den folgenden Link, um den Beitrag direkt in der App anzusehen und zu reagieren:"),
        React.createElement(Link, { href: postUrl, style: { backgroundColor: '#fb923c', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' } }, "Beitrag ansehen"),
        React.createElement(Hr, { style: { borderColor: '#e0e0e0', margin: '30px 0' } }),
        React.createElement(Text, { style: { fontSize: '12px', color: '#9ca3af', textAlign: 'center' } }, "CatSlimDown App - Unterstütze deine Katze beim gesunden Abnehmen.")
      )
    )
  );
};

/**
 * Sends a non-blocking transactional email when a new post is created in the community forum.
 */
const sendNewPostEmailAsync = (to, { author, text, postId }) => {
  // Execute asynchronously to NOT block the HTTP request
  setImmediate(async () => {
    try {
      console.log(`[Mailer] Starte E-Mail-Versand an ${to} für Post von ${author}...`);
      
      const postUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/community#post-${postId}`;
      
      const emailHtml = await render(
        React.createElement(NewPostEmailTemplate, { author, text, postUrl })
      );

      const response = await resend.emails.send({
        from: 'CatSlimDown Community <onboarding@resend.dev>',
        to: to,
        subject: `Neuer Beitrag von ${author} im Forum`,
        html: emailHtml
      });

      if (response.error) {
        console.error('[Mailer ERROR] Resend meldet Fehler:', response.error);
      } else {
        console.log(`[Mailer SUCCESS] E-Mail erfolgreich gesendet! ID: ${response.data.id}`);
      }
    } catch (error) {
      console.error('[Mailer ERROR] Unerwarteter Fehler beim E-Mail-Versand:', error);
    }
  });
};

module.exports = {
  sendNewPostEmailAsync
};
