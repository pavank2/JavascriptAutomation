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

  it("Sort items from Z to A", async () => {
    selectedDropDownText = await homePage.selectDropDown();
    expect(selectedDropDownText).toEqual("Name (Z to A)");
  });

  it("Select items and checkout", async () => {
    homePage.addItemsToCart();

    homePage.continueToCheckOut();

    numOfItems = await homePage.getItemCount();
    expect(numOfItems).toEqual("2");
  });
});
