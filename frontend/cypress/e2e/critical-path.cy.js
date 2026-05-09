describe('CatSlimDown - E2E Critical Path Tests', () => {
  const API_BASE_URL = 'http://localhost:3001';
  const FRONTEND_URL = 'http://localhost:5173';
  
  // Test-Daten
  const testUser = {
    email: `cypress-test-${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  const testCat = {
    name: 'Fluffy Test Cat',
    age: 3,
    breed: 'Mischling',
    size: 'mittel',
    idealWeight: 4.5
  };

  describe('1. KRITISCH: Register & Login Flow', () => {
    it('should register a new user', () => {
      cy.visit(`${FRONTEND_URL}/register`);
      
      // Finde und fülle Email-Input
      cy.get('[data-cy="register-email-input"]')
        .should('be.visible')
        .type(testUser.email);
      
      // Finde und fülle Password-Input
      cy.get('[data-cy="register-password-input"]')
        .should('be.visible')
        .type(testUser.password);
      
      // Klicke Submit
      cy.get('[data-cy="register-submit-btn"]')
        .should('be.visible')
        .click();
      
      // Nach erfolgreicher Registrierung sollte zur Login-Seite weitergeleitet werden
      cy.url().should('include', '/login');
      cy.get('h1').should('contain', 'Willkommen zurück');
    });

    it('should login with registered credentials', () => {
      cy.visit(`${FRONTEND_URL}/login`);
      
      // Login mit den zuvor registrierten Daten
      cy.get('[data-cy="login-email-input"]')
        .should('be.visible')
        .type(testUser.email);
      
      cy.get('[data-cy="login-password-input"]')
        .should('be.visible')
        .type(testUser.password);
      
      cy.get('[data-cy="login-submit-btn"]')
        .should('be.visible')
        .click();
      
      // Nach erfolgreicher Login sollte zur Dashboard-Seite weitergeleitet werden
      cy.url().should('include', '/');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should reject invalid credentials', () => {
      cy.visit(`${FRONTEND_URL}/login`);
      
      cy.get('[data-cy="login-email-input"]').type('invalid@example.com');
      cy.get('[data-cy="login-password-input"]').type('WrongPassword123');
      cy.get('[data-cy="login-submit-btn"]').click();
      
      // Sollte die Fehlermeldung anzeigen mit dem exakten Text
      cy.get('[data-cy="login-error-message"]')
        .should('be.visible')
        .should('contain', 'E-Mail oder Passwort ungültig');
      
      // Sollte NICHT zur Dashboard weitergeleitet werden
      cy.url().should('not.include', '/');
    });
  });

  describe('2. KRITISCH: Create Cat & Persist in Database', () => {
    beforeEach(() => {
      // Login vor jedem Test
      cy.visit(`${FRONTEND_URL}/login`);
      cy.get('[data-cy="login-email-input"]').type(testUser.email);
      cy.get('[data-cy="login-password-input"]').type(testUser.password);
      cy.get('[data-cy="login-submit-btn"]').click();
      cy.url().should('include', '/');
    });

    it('should navigate to cat management page', () => {
      cy.visit(`${FRONTEND_URL}/`);
      cy.url().should('include', '/');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should create a new cat', () => {
      cy.visit(`${FRONTEND_URL}/cats`);
      
      // Klicke "Katze hinzufügen"
      cy.get('[data-cy="add-cat-btn"]')
        .should('be.visible')
        .click();
      
      // Form sollte sichtbar werden
      cy.get('[data-cy="add-cat-name"]').should('be.visible');
      
      // Fülle das Formular
      cy.get('[data-cy="add-cat-name"]').type(testCat.name);
      
      // Ideal: Alle anderen Felder müssen auch mit data-cy versehen werden
      // Alternativ können wir Labels verwenden
      cy.get('label').contains('Alter').parent().find('input').type(testCat.age);
      cy.get('label').contains('Größe').parent().find('select').select('mittel');
      cy.get('label').contains('Zielgewicht').parent().find('input').type(testCat.idealWeight);
      
      // Speichern
      cy.get('[data-cy="add-cat-submit-btn"]')
        .should('be.visible')
        .click();
      
      // Erfolgs-Nachricht sollte angezeigt werden
      cy.get('[role="alert"]').should('be.visible').and('contain', 'erfolgreich');
      
      // Cat sollte in der Liste sichtbar sein
      cy.contains(testCat.name).should('be.visible');
    });

    it('should persist cat data after page reload', () => {
      // Erstelle eine Katze
      cy.visit(`${FRONTEND_URL}/cats`);
      cy.get('[data-cy="add-cat-btn"]').click();
      cy.get('[data-cy="add-cat-name"]').type('PersistTest Cat');
      cy.get('label').contains('Zielgewicht').parent().find('input').type('4.2');
      cy.get('[data-cy="add-cat-submit-btn"]').click();
      
      // Warte bis "erfolgreich" Nachricht sichtbar ist
      cy.get('[role="alert"]').should('contain', 'erfolgreich');
      
      // Reload die Seite
      cy.reload();
      
      // Katze sollte immer noch in der Liste sichtbar sein (Datenbankpersistierung!)
      cy.contains('PersistTest Cat').should('be.visible');
    });
  });

  describe('3. Erweitert: Weight Entry & Dashboard Update', () => {
    beforeEach(() => {
      // Login
      cy.visit(`${FRONTEND_URL}/login`);
      cy.get('[data-cy="login-email-input"]').type(testUser.email);
      cy.get('[data-cy="login-password-input"]').type(testUser.password);
      cy.get('[data-cy="login-submit-btn"]').click();
      cy.url().should('include', '/');
    });

    it('should show created cat on dashboard', () => {
      cy.visit(`${FRONTEND_URL}/`);
      cy.get('h1').should('contain', 'Dashboard');
      // Die gerade erstellte Katze sollte irgendwo auf dem Dashboard sichtbar sein
      cy.contains(testCat.name).should('exist');
    });
  });

  describe('4. E2E: Complete User Journey', () => {
    it('should complete full flow: Register → Login → Create Cat → Verify Persistence', () => {
      // SCHRITT 1: Register
      const uniqueEmail = `e2e-test-${Date.now()}@example.com`;
      const password = 'E2ETestPassword123';
      
      cy.visit(`${FRONTEND_URL}/register`);
      cy.get('[data-cy="register-email-input"]').type(uniqueEmail);
      cy.get('[data-cy="register-password-input"]').type(password);
      cy.get('[data-cy="register-submit-btn"]').click();
      cy.url().should('include', '/login');
      
      // SCHRITT 2: Login
      cy.get('[data-cy="login-email-input"]').type(uniqueEmail);
      cy.get('[data-cy="login-password-input"]').type(password);
      cy.get('[data-cy="login-submit-btn"]').click();
      cy.url().should('include', '/');
      
      // SCHRITT 3: Navigate to cats
      cy.visit(`${FRONTEND_URL}/cats`);
      cy.get('[data-cy="add-cat-btn"]').click();
      
      // SCHRITT 4: Create cat
      const newCatName = `E2E Cat ${Date.now()}`;
      cy.get('[data-cy="add-cat-name"]').type(newCatName);
      cy.get('label').contains('Alter').parent().find('input').type('2');
      cy.get('label').contains('Zielgewicht').parent().find('input').type('3.8');
      cy.get('[data-cy="add-cat-submit-btn"]').click();
      
      // Erfolg?
      cy.get('[role="alert"]').should('contain', 'erfolgreich');
      cy.contains(newCatName).should('be.visible');
      
      // SCHRITT 5: Verify persistence by reloading
      cy.reload();
      cy.contains(newCatName).should('be.visible');
      
      // SCHRITT 6: Go to dashboard and verify cat is there
      cy.visit(`${FRONTEND_URL}/`);
      cy.contains(newCatName).should('exist');
    });
  });

  describe('5. Sicherheit: Session & Auth Token', () => {
    it('should not allow access to protected routes without login', () => {
      // Navigiere zur Cats-Seite ohne Login
      cy.visit(`${FRONTEND_URL}/cats`, { failOnStatusCode: false });
      
      // Sollte zur Login-Seite umgeleitet werden
      cy.url().should('include', '/login');
    });

    it('should maintain session after page reload', () => {
      // Login
      cy.visit(`${FRONTEND_URL}/login`);
      cy.get('[data-cy="login-email-input"]').type(testUser.email);
      cy.get('[data-cy="login-password-input"]').type(testUser.password);
      cy.get('[data-cy="login-submit-btn"]').click();
      cy.url().should('include', '/');
      
      // Reload
      cy.reload();
      
      // Sollte immer noch auf Dashboard sein (Session bleibt)
      cy.url().should('include', '/');
      cy.get('h1').should('contain', 'Dashboard');
    });
  });

  describe('6. SAD PATH: Fehlerszenarien & Validierung', () => {
    it('should show error when login with wrong password', () => {
      // Registriere zuerst einen User
      const sadPathUser = {
        email: `sadpath-login-${Date.now()}@example.com`,
        password: 'ValidPassword123'
      };
      
      cy.visit(`${FRONTEND_URL}/register`);
      cy.get('[data-cy="register-email-input"]').type(sadPathUser.email);
      cy.get('[data-cy="register-password-input"]').type(sadPathUser.password);
      cy.get('[data-cy="register-submit-btn"]').click();
      cy.url().should('include', '/login');
      
      // Jetzt versuche mit falschem Passwort einzuloggen
      cy.get('[data-cy="login-email-input"]').type(sadPathUser.email);
      cy.get('[data-cy="login-password-input"]').type('WrongPassword123');
      cy.get('[data-cy="login-submit-btn"]').click();
      
      // Fehlermeldung sollte sichtbar sein
      cy.get('[data-cy="login-error-message"]')
        .should('be.visible')
        .should('contain', 'E-Mail oder Passwort ungültig');
      
      // Sollte immer noch auf Login-Seite sein
      cy.url().should('include', '/login');
    });

    it('should show error when registering with duplicate email', () => {
      const duplicateEmail = `duplicate-email-${Date.now()}@example.com`;
      const password = 'TestPassword123';
      
      // Erste Registrierung
      cy.visit(`${FRONTEND_URL}/register`);
      cy.get('[data-cy="register-email-input"]').type(duplicateEmail);
      cy.get('[data-cy="register-password-input"]').type(password);
      cy.get('[data-cy="register-submit-btn"]').click();
      cy.url().should('include', '/login');
      
      // Zweite Registrierung mit gleicher E-Mail
      cy.visit(`${FRONTEND_URL}/register`);
      cy.get('[data-cy="register-email-input"]').type(duplicateEmail);
      cy.get('[data-cy="register-password-input"]').type(password);
      cy.get('[data-cy="register-submit-btn"]').click();
      
      // Fehlermeldung sollte angezeigt werden
      cy.get('[data-cy="register-error-message"]')
        .should('be.visible')
        .should('contain', 'bereits vergeben');
      
      // Sollte auf Register-Seite bleiben
      cy.url().should('include', '/register');
    });

    it('should show error when login with empty password', () => {
      cy.visit(`${FRONTEND_URL}/login`);
      
      cy.get('[data-cy="login-email-input"]').type('test@example.com');
      // Passwort-Feld leer lassen
      cy.get('[data-cy="login-submit-btn"]').click();
      
      // Validierungsfehler oder Fehler-Nachricht
      cy.get('[data-cy="login-error-message"]')
        .should('be.visible');
    });

    it('should show error when login with empty email', () => {
      cy.visit(`${FRONTEND_URL}/login`);
      
      // Email-Feld leer lassen
      cy.get('[data-cy="login-password-input"]').type('Password123');
      cy.get('[data-cy="login-submit-btn"]').click();
      
      // Validierungsfehler oder Fehler-Nachricht
      cy.get('[data-cy="login-error-message"]')
        .should('be.visible');
    });

    it('should redirect to login when accessing protected route without authentication', () => {
      // Versuche auf Dashboard zuzugreifen ohne Login
      cy.visit(`${FRONTEND_URL}/`, { failOnStatusCode: false });
      
      // Sollte zur Login-Seite umgeleitet werden
      cy.url().should('include', '/login');
    });

    it('should not allow access to cats management page without login', () => {
      // Versuche auf Cats-Seite zuzugreifen ohne Login
      cy.visit(`${FRONTEND_URL}/cats`, { failOnStatusCode: false });
      
      // Sollte zur Login-Seite umgeleitet werden
      cy.url().should('include', '/login');
    });
  });
});
