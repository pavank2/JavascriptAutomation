const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const data = require("../data/data.json");

ec = protractor.ExpectedConditions;

describe("HomePage functions", () => {
  beforeAll(() => {
    console.log("\nScenario 2:\n");
    browser.get(data.app.url);
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Just adding sleep to slow down execution for the demo
    loginPage.enterCredentials(data.app.username, data.app.password);
    loginPage.clickOnLogin();
  });

  it("Add items to cart", async () => {
    console.log("\nTest : Add items to Cart");
    homePage.addItemsToCart();
    numOfItems = await homePage.getItemCount();
    expect(numOfItems).toEqual("2");
  });

  it("Remove items from cart", async () => {
    console.log("\nTest : Remove items from Cart");
    homePage.removeItemsFromCart();
    expect(homePage.shoppingCartItems.isPresent()).toBe(false); //No items is shooping cart now
  });
});
