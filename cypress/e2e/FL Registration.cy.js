import { input, selector } from "../support/data";
import { methodsPage } from "../support/page_object/methodsPage";
import { registrationPage } from "../support/page_object/registrationPage";

describe("Opening Registration Page", () => {
  it("FL-REGIS-1, Opening Registration page", () => {
    methodsPage.visitRegistrationPage();
  });
});

describe("Registration Page Test Cases", () => {
  beforeEach(() => {
    methodsPage.visitRegistrationPage();
  });

  it("FL-REGIS-2, Register with mandatory fields and check the verification code", () => {
    registrationPage.registrationSteps(
      input.ValidPassword,
      input.GeneratedValidEmail,
      input.UndefinedYearOfBirth,
      input.UndefinedSex
    );
    cy.task(
      "queryDb",
      `SELECT email FROM datamundi.freelancers ORDER BY stamp DESC LIMIT 1`
    ).then((result) => {
      const email = result[0].email;
      cy.get(selector.Email)
        // .type(email)
        .then(() => {
          cy.get(selector.Password).type(input.ValidPassword);
          cy.get(selector.LoginButton).click();
          cy.log(email);
          cy.task(
            "queryDb",
            `SELECT temporaryPassword FROM datamundi.freelancers WHERE email='${email}' ORDER BY stamp DESC LIMIT 1`
          ).then((result) => {
            const tempPass = result[0].temporaryPassword;
            cy.log(tempPass);
            cy.get(selector.VerificationCode).type(tempPass);
            cy.get(selector.LoginButton).click();
            cy.url().should("eq", "http://localhost:3000/completeProfile");
          });
        });
    });
    cy.task(
      "queryDb",
      `DELETE FROM datamundi.freelancers ORDER BY stamp DESC LIMIT 1`
    );
  });

  it.skip("FL-REGIS-3, *MERGED WITH FL-REGIS-2*", () => {
    cy.visit("http://localhost:3000/login");
  });

  it("FL-REGIS-4, Checks First Name and Last Name to contain at least one non-space character", () => {
    registrationPage.registrationSteps(
      input.ValidPassword,
      input.GeneratedValidEmail,
      undefined,
      undefined,
      " ",
      " "
    );
  });

  it("FL-REGIS-5, Check password value format", () => {
    cy.get(selector.ConfirmPassword).should("be.disabled");
    methodsPage.checkPasswordFormat(input.ValidPassword);
    cy.get(selector.ConfirmPassword).should("be.enabled");
  });

  it("FL-REGIS-6, Check for pwned password", () => {
    registrationPage.registrationSteps(
      input.PwnedPassword,
      input.GeneratedValidEmail
    );
  });

  it("FL-REGIS-6 *EXTRA*, Check for pwned password on link", () => {
    cy.get(selector.PwnedLink)
      .should("have.attr", "href", "https://haveibeenpwned.com/Passwords")
      .should("have.attr", "target", "_blank")
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("eq", "https://haveibeenpwned.com/Passwords");
    cy.get(selector.PwnedPasswordField).type(input.ValidPassword);
    cy.get(selector.PwnedSearchPButton).click();
    cy.get(selector.PwnedBannerTitle)
      .should("be.visible")
      .should("contain", "Good news — no pwnage found!");
  });

  it("FL-REGIS-7, Confirm password Value", () => {
    cy.get(selector.Password).type(input.ValidPassword, { log: false });
    cy.get(selector.ConfirmPassword).type(input.PwnedPassword, { log: false });
    methodsPage.checkToastMessage(
      selector.ConfirmPassword,
      "Please check that the confirmed password is the same as the password."
    );
  });

  it("FL-REGIS-8, Email has invalid format", () => {
    registrationPage.registrationSteps(
      input.ValidPassword,
      input.InvalidFormatEmail
    );
  });
  it("FL-REGIS-8, Email was already used", () => {
    registrationPage.registrationSteps(
      input.ValidPassword,
      input.AlreadyUsedEmail
    );
  });

  it("FL-REGIS-8, Email is a Yahoo address", () => {
    registrationPage.registrationSteps(input.ValidPassword, input.YahooEmail);
  });

  it("FL-REGIS-9, Adding Language Pairs", () => {
    cy.get(selector.LanguagePairLink).click().should("not.be.enabled");
    cy.get(selector.LanguagePairSelect).select(1);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    cy.get(selector.LanguagePairSelect).select(2);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    cy.get(selector.LanguagePairSelect).select(3);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    cy.get(selector.LanguagePairSelect).select(4);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    cy.get(selector.LanguagePairSelect).select(5);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    methodsPage.checkAlertMessage(
      "You can select a maximum of 4 language pairs."
    );
  });

  it("FL-REGIS-10, Removing Language Pairs", () => {
    cy.get(selector.LanguagePairSelect).select(1);
    cy.get(selector.LanguagePairLink).click().should("not.be.disabled");
    cy.get(selector.RemoveLanguageButton).click();
    cy.get(selector.LanguagePairList).should("not.be.visible");
  });

  it.skip("FL-REGIS-11, Input for optional fields, *SAME AS FL-REGIS-2*", () => {});

  it("FL-REGIS-12, Invalid Value for year of birth", () => {
    registrationPage.registrationSteps(
      input.ValidPassword,
      input.ValidEmail,
      input.InvalidYearOfBirthSmaller
    );
  });
});
