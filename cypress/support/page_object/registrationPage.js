import { input, selector } from "../data.js";
import { methodsPage } from "./methodsPage.js";

export class RegistrationPage {
  registrationSteps(
    typeOfPassword,
    typeOfEmail = input.GeneratedValidEmail,
    yearOfBirth = undefined,
    sex = undefined,
    firstName,
    lastName
  ) {
    if (firstName === " ") {
      cy.log("First name is not valid, but I'll continue");
    } else {
      cy.get(selector.FirstName).type(input.FirstName);
    }
    if (lastName === " ") {
      cy.log("First name is not valid, but I'll continue");
    } else {
      cy.get(selector.LastName).type(input.LastName);
    }
    cy.get(selector.Password).type(typeOfPassword, { log: false });
    if (typeOfPassword === input.PwnedPassword) {
      cy.on("window:alert", (alertText) => {
        const match = alertText.match(/\d+/);
        const number = match ? parseInt(match[0], 10) : null;
        expect(alertText).to.eq(
          `Your password has been found in ${number} data breaches. Please choose another password!`
        );
      });
      cy.url().should("eq", "http://localhost:3000/register").end();
    }
    cy.get(selector.ConfirmPassword).type(typeOfPassword, { log: false });
    if (typeOfEmail === input.GeneratedValidEmail) {
      cy.generateEmail();
    } else {
      cy.get(selector.Email).type(typeOfEmail);
    }
    cy.get(selector.MotherTongue).select("Romanian");
    cy.get(selector.Country).select("ROMANIA");
    if (yearOfBirth === undefined) {
      cy.log("Year of birth is undefined, I will continue.");
    } else {
      cy.get(selector.YearOfBirth).type(yearOfBirth);
    }
    if (sex === undefined) {
      cy.log("Sex is not defined, I will continue");
    } else {
      cy.get(selector.Sex).select([sex]);
    }
    cy.get(selector.LanguagePairSelect).select("English --> Romanian");
    cy.get(selector.LanguagePairLink).click();
    cy.get(selector.Question1).type(input.LoremIpsumText, { delay: 0 });
    cy.get(selector.Question2).type(input.LoremIpsumText, { delay: 0 });
    cy.get(selector.Question3).type(input.LoremIpsumText, { delay: 0 });
    cy.get(selector.Origin).select([1]);
    cy.get(selector.Specify).type(input.LoremIpsumText, { delay: 0 });
    cy.get(selector.SubmitButton).click();
    if (firstName === " ") {
      methodsPage.checkToastMessage(
        selector.FirstName,
        "Please fill out this field."
      );
    }
    if (lastName === " ") {
      methodsPage.checkToastMessage(
        selector.LastName,
        "Please fill out this field."
      );
    }
    if (typeOfEmail === input.InvalidFormatEmail) {
      methodsPage.checkToastMessage(
        selector.Email,
        `Please include an '@' in the email address. '${input.InvalidFormatEmail}' is missing an '@'.`
      );
      cy.url().should("eq", "http://localhost:3000/register");
    }
    if (typeOfEmail === input.AlreadyUsedEmail) {
      methodsPage.checkDisplayedAlert(
        selector.AlertEmailProblem,
        "This user is already registered."
      );
      cy.url().should("eq", "http://localhost:3000/register");
    }
    if (typeOfEmail === input.YahooEmail) {
      methodsPage.checkDisplayedAlert(
        selector.AlertEmailProblem,
        "Please don't use a yahoo email address."
      );
      cy.url().should("eq", "http://localhost:3000/register");
    }
    if (yearOfBirth !== undefined) {
      if (yearOfBirth < 1940) {
        methodsPage.checkToastMessage(
          selector.YearOfBirth,
          "Value must be greater than or equal to 1940."
        );
      } else if (yearOfBirth > 2010) {
        methodsPage.checkToastMessage(
          selector.YearOfBirth,
          "Value must be less than or equal to 2010."
        );
      }
    }
  }
}
export const registrationPage = new RegistrationPage();
