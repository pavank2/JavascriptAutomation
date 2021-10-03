const { browser } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const data = require("../data/data.json");
ec = protractor.ExpectedConditions;

describe("Login Logout Scenario:", () => {
  beforeAll(() => {
    browser.get(data.app.url);
    browser.driver.manage().window().maximize();
    browser.sleep(1000); // Adding sleep to slow down execution for the demo
  });

  it("login to saucedemo homepage", async () => {
    console.log("Test : Login to Saucedemo");
    loginPage.enterCredentials(data.app.username, data.app.password);

    loginPage.clickOnLogin();
    browser.sleep(1000);
    const homePageTitle = await homePage.getTitle().getText();
    expect(homePageTitle).toEqual("PRODUCTS");
  });

  it("logout from saucedemo", async () => {
    console.log("Test : Logout from Saucedemo");

    await homePage.logout();
    browser.sleep(3000);
    expect(loginPage.getLoginButton().isEnabled()).toBe(true);
  });
});
