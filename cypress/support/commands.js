import { input, selector } from "../support/data";
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --

// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("generateEmail", () => {
  function generateRandomEmail() {
    const domains = ["gmail.com", "hotmail.com", "aol.com", "outlook.com"];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomUsername = Math.random().toString(36).substring(2, 8);
    return randomUsername + "@" + randomDomain;
  }
  const email = generateRandomEmail();
  cy.wrap(email).as("emailForTask");
  cy.get("#email").type(email);
});

Cypress.Commands.add("generateEmailSlurp", () => {
  cy.log("Wrap inbox before test");
  return cy
    .mailslurp()
    .then((mailslurp) => mailslurp.createInbox())
    .then((inbox) => {
      cy.log(`Inbox id ${inbox.id}`);
      cy.wrap(inbox.id).as("inboxId");
      cy.wrap(inbox.emailAddress).as("emailAddress");
      cy.get("@emailAddress").then((type) => {
        cy.log(`${type}`);
        cy.get(selector.Email).type(`${type}`);
      });
    });
});

Cypress.Commands.add("checkVerificationCode", () => {
  cy.log();
  cy.mailslurp()
    .then(function (mailslurp) {
      return mailslurp.waitForLatestEmail(this.inboxId, 30000, true);
    })
    .then((email) => {
      const match = email.body.match(/\d{6}/);
      if (match) {
        const code = match[0];
        cy.log("Code found: " + code);
        cy.get("#verificationCode").type(code);
        cy.get("#loginButton").click();
        cy.url().should("eq", "http://localhost:3000/completeProfile");
      } else {
        cy.log("No six-digit code found in email body");
      }
    });
});

Cypress.Commands.add("checkInputHasNonSpaceChar", (selector, text) => {
  cy.get(selector)
    .type(text)
    .should("have.value", text)
    .then(($input) => {
      const value = $input.val();
      expect(/\S+/.test(value)).to.be.true;
    });
});
