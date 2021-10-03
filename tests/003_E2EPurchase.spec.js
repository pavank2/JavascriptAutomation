const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const checkoutPage = require("../pages/CheckoutPage");
const data = require("../data/data.json");

const { assert } = require("chai");

describe("Checkout Page:", () => {
  beforeAll(() => {
    browser.get("https://saucedemo.com");
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Adding sleep to slow down execution for the demo
    loginPage.enterCredentials("standard_user", "secret_sauce");
    loginPage.clickOnLogin();
    browser.sleep(2000);
    homePage.addItemsToCart();
    homePage.continueToCheckOut();
  });

  it("Verify Shopping cart items", async () => {
    var actualItemsList = [];
    //  var expectedItemsList = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
    var expectedItemsList = data.itemsList.items;
    itemsList = await checkoutPage.getCartItems();
    for (let item of itemsList) {
      itemName = await item.getText();
      assert.isTrue(expectedItemsList.includes(itemName), "Items not matching");
    }
  });

  it("Enter User Details and Finish", async () => {
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
