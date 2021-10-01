const { browser } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");

describe("Login Page:", () => {
  beforeAll(() => {
    browser.get("https://saucedemo.com");
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Adding sleep to slow down execution for the demo
  });

  it("login to saucedemo homepage", () => {
    loginPage.enterCredentials("standard_user", "secret_sauce");
    loginPage.clickOnLogin();
    browser.sleep(2000);
  });
});
