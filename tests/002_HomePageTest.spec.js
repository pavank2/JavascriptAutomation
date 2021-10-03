const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const data = require("../data/data.json");

ec = protractor.ExpectedConditions;

describe("HomePage functions", () => {
  beforeAll(() => {
    browser.get(data.application.url);
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Just adding sleep to slow down execution for the demo
    loginPage.enterCredentials(
      data.application.username,
      data.application.password
    );
    loginPage.clickOnLogin();
  });

  it("Add items to cart", async () => {
    homePage.addItemsToCart();
    numOfItems = await homePage.getItemCount();
    expect(numOfItems).toEqual("2");
  });

  it("Remove items from cart", async () => {
    homePage.removeItemsFromCart();

    expect(homePage.shoppingCartItems.isPresent()).toBe(false); //No items is shooping cart now
  });
});
