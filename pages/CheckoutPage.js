const { element, browser, By } = require("protractor");

class CheckoutPage {
  checkoutButton = element(By.id("checkout"));
  firstName = element(By.id("first-name"));
  lastName = element(By.id("last-name"));
  postalCode = element(By.id("postal-code"));
  continueButton = element(By.id("continue"));
  finishButton = element(By.id("finish"));
  confirmationMessage = element(By.className("complete-header"));

  cartItems = element.all(By.className("inventory_item_name"));

  getCartItems = () => {
    return this.cartItems;
  };

  clickCheckOutOnCartPage = () => {
    browser.sleep(2000);
    this.checkoutButton.click();
  };
  enterUserDetails = (firstName, lastName, postalCode) => {
    browser.sleep(2000);
    this.firstName.sendKeys(firstName);
    this.lastName.sendKeys(lastName);
    this.postalCode.sendKeys(postalCode);
  };

  clickContinueButton = () => {
    browser.sleep(2000);
    this.continueButton.click();
  };
  clickFinishButton = () => {
    browser.sleep(2000);
    this.finishButton.click();
  };

  getConfirmationMessage = () => {
    browser.sleep(2000);
    return this.confirmationMessage;
  };
}

module.exports = new CheckoutPage();
