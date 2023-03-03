import { input, selector } from "../data.js";

export class MethodsPage {
  randomValidYear() {
    const min = 1940;
    const max = 2010;
    const randomValidYear = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomValidYear;
  }

  randomInvalidYear() {
    const min = 1940;
    const max = 2010;
    let randomInvalidYear = Math.floor(Math.random() * (min - 1));
    if (Math.random() < 0.5) {
      randomInvalidYear = max + Math.floor(Math.random() * (100 - max));
    }
    return randomInvalidYear;
  }

  visitRegistrationPage() {
    cy.visit("s");
    cy.get("a").contains("here").click();
    cy.url().should("eq", "http://localhost:3000/register");
    cy.get("form input").should("be.empty");
    cy.get("form select").should("contain", "Select");
    cy.get("form textarea").should("be.empty");
  }

  checkDisplayedAlert(selector, value) {
    cy.get(selector).should("contain", value);
  }

  checkPasswordFormat(password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    cy.get(selector.Password)
      .type(password, { log: false })
      .then(($input) => {
        const value = $input.val();
        if (!passwordRegex.test(value)) {
          this.checkToastMessage(
            selector.Password,
            "Make sure your password contains at least 8 characters, including 1 lowercase letter, 1 uppercase letter, 1 digit and 1 special character."
          );
        } else {
          expect(passwordRegex.test(value)).to.be.true;
        }
      });
  }

  checkToastMessage(selector, message) {
    cy.get(selector)
      .invoke("prop", "validationMessage")
      .should("equal", message);
  }

  checkAlertMessage(message) {
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.eq(message);
    });
  }
}

export const methodsPage = new MethodsPage();
