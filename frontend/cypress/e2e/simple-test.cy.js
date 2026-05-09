describe('Simple Test', () => {
  it('should load login page', () => {
    cy.visit('http://localhost:5173/login');
    cy.get('h1').should('contain', 'Willkommen zurück');
  });

  it('should show login form', () => {
    cy.visit('http://localhost:5173/login');
    cy.get('[data-cy="login-email-input"]').should('be.visible');
    cy.get('[data-cy="login-password-input"]').should('be.visible');
    cy.get('[data-cy="login-submit-btn"]').should('be.visible');
  });

  it('should show error with wrong password', () => {
    cy.visit('http://localhost:5173/login');
    cy.get('[data-cy="login-email-input"]').type('test@example.com');
    cy.get('[data-cy="login-password-input"]').type('WrongPassword123');
    cy.get('[data-cy="login-submit-btn"]').click();
    cy.get('[data-cy="login-error-message"]').should('contain', 'ungültig');
  });
});
