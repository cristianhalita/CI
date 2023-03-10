let input = {
  FirstName: "John",
  LastName: "Doe",
  ValidPassword: "WxyZAbcD7!",
  InvalidPassword: "wxyzabcd7",
  PwnedPassword: "Test123*",
  GeneratedValidEmail: "input.generatedEmail",
  GeneratedMailSurpEmail: "@mailslurp.com",
  InvalidFormatEmail: "cristian.halita",
  AlreadyUsedEmail: "cristian.halita@gmail.com",
  EmailForPwnedPassCase: "blabla@blabla",
  YahooEmail: "cristian.halita@yahoo.com",
  UndefinedYearOfBirth: undefined,
  UndefinedSex: undefined,
  LoremIpsumText:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ValidYearOfBirth: 1940 || 2010,
  InvalidYearOfBirthSmaller: 1939,
  InvalidYearOfBirthBigger: 2011,
};

let selector = {
  FirstName: "#firstName",
  LastName: "#lastName",
  Password: "#password",
  Email: "#email",
  ConfirmPassword: "#confirmPassword",
  MotherTongue: "#motherTongue",
  Country: "#country",
  LanguagePairSelect: "#languagePairSelect",
  LanguagePairLink: "#languagePairLink",
  Question1: "#question1",
  Question2: "#question2",
  Question3: "#question3",
  Origin: "#origin",
  Specify: '[name="specify"]',
  SubmitButton: "#submitButton",
  Password: "#password",
  VerificationCode: "#verificationCode",
  LoginButton: "#loginButton",
  PwnedLink: "form .alert-info a",
  PwnedPasswordField: '[action="/Passwords"]',
  PwnedSearchPButton: "#searchPwnedPasswords",
  PwnedBannerTitle: ".pwnTitle",
  AlertEmailProblem: ".alert-danger.alert-dismissible",
  RemoveLanguageButton: "#languagePairList .btn-danger",
  LanguagePairList: "#languagePairList",
  YearOfBirth: "#yearOfBirth",
  Sex: '[name="sex"]',
};

export default {
  input,
  selector,
};
