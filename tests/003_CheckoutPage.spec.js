const { browser, element, By } = require("protractor");
const loginPage = require("../pages/LoginPage");
const homePage = require("../pages/HomePage");
const checkoutPage = require("../pages/CheckoutPage");
const { assert } = require("chai");

describe("Checkout Page:", () => {
  beforeAll(() => {
    browser.get("https://saucedemo.com");
    browser.driver.manage().window().maximize();
    browser.sleep(2000); // Adding sleep to slow down execution for the demo
    loginPage.enterCredentials("standard_user", "secret_sauce");
    loginPage.clickOnLogin();
    //  homePage.addItemsToCart();
    homePage.continueToCheckOut();
  });

  it("Verify Shopping cart items", () => {
    var actualItemsList = [];
    var expectedItemsList = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
    checkoutPage.getCartItems().then(function (itemsList) {
      for (let item of itemsList) {
        item.getText().then(function (itemName) {
          // if (!expectedItemsList.includes(itemName)) {
          //   assert.fail("Items missing from cart");
          // }
          assert.isTrue(
            expectedItemsList.includes(itemName),
            "Actual items does not match expected items"
          );
        });
      }

      //  console.log(actualItemsList);
    });
  });

  it("Enter User Details and Finish", () => {
    checkoutPage.clickCheckOutOnCartPage();
    checkoutPage.enterUserDetails("John", "Doe", "51000");
    checkoutPage.clickContinueButton();
    checkoutPage.clickFinishButton();
    checkoutPage
      .getConfirmationMessage()
      .getText()
      .then(function (confirmationMsg) {
        expect(confirmationMsg).toEqual("THANK YOU FOR YOUR ORDER");
      });
  });
});
