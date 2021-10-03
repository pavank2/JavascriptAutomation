const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const checkoutPage = require("../pages/CheckoutPage");
const data = require("../data/data.json");

const { assert } = require("chai");

describe("Checkout Page:", () => {
  beforeAll(() => {
    console.log("\nScenario 3:\n");
    browser.get(data.app.url);
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Adding sleep to slow down execution for the demo
    loginPage.enterCredentials(data.app.username, data.app.password);
    loginPage.clickOnLogin();
    homePage.addItemsToCart();
    homePage.continueToCheckOut();
  });

  it("Verify Shopping cart items", async () => {
    console.log("\nTest : Add items again and Verify items added to Cart");
    var expectedItemsList = data.itemsList.items;
    itemsList = await checkoutPage.getCartItems();
    for (let item of itemsList) {
      itemName = await item.getText();
      assert.isTrue(expectedItemsList.includes(itemName), "Items not matching");
    }
  });

  it("Enter User Details and Finish", async () => {
    console.log("\nTest : Complete Checkout");
    checkoutPage.clickCheckOutOnCartPage();
    checkoutPage.enterUserDetails("John", "Doe", "51000");
    checkoutPage.clickContinueButton();
    checkoutPage.clickFinishButton();
    const confirmationMsg = await checkoutPage
      .getConfirmationMessage()
      .getText();
    expect(confirmationMsg).toEqual("THANK YOU FOR YOUR ORDER");
    browser.sleep(5000);
  });
});
