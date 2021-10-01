const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");

describe("HomePage functions", () => {
  beforeAll(() => {
    browser.get("https://saucedemo.com");
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Just adding sleep to slow down execution for the demo
    loginPage.enterCredentials("standard_user", "secret_sauce");
    loginPage.clickOnLogin();
  });

  it("Sort items from Z to A", () => {
    homePage.selectDropDown().then(function (selectedDropDown) {
      expect(selectedDropDown).toEqual("Name (Z to A)");
    });
  });

  it("Select items and checkout", () => {
    homePage.addItemsToCart();

    homePage.continueToCheckOut();

    homePage.getItemCount().then(function (numOfItems) {
      expect(numOfItems).toEqual("2");
    });

    // homePage.getNumOfButtons().then(function (numOfButtons) {
    //   console.log(`Number of buttons:${numOfButtons}`);
    // });
  });
});
