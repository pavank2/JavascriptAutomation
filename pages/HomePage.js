const { element, browser, By } = require("protractor");
var EC = protractor.ExpectedConditions;

class HomePage {
  title = element(By.className("title"));
  backpack = element(By.id("add-to-cart-sauce-labs-backpack"));
  bikelight = element(By.id("add-to-cart-sauce-labs-bike-light"));
  remove_backpack = element(By.id("remove-sauce-labs-backpack"));
  remove_bikelight = element(By.id("remove-sauce-labs-bike-light"));
  checkout = element(By.id("shopping_cart_container"));
  itemCount = element(By.className("shopping_cart_badge"));
  burgerMenu = element(By.id("react-burger-menu-btn"));
  logoutBtn = element(By.id("logout_sidebar_link"));
  shoppingCartItems = element(By.className("shopping_cart_badge"));

  getTitle = () => {
    return this.title;
  };

  addItemsToCart = () => {
    this.backpack.click();
    this.bikelight.click();
    browser.sleep(2000);
  };

  removeItemsFromCart = () => {
    this.remove_backpack.click();
    this.remove_bikelight.click();
    browser.sleep(2000);
  };

  continueToCheckOut = async () => {
    this.checkout.click();
    browser.sleep(2000);
  };

  getItemCount = () => {
    return this.itemCount.getText();
  };

  selectDropDown = () => {
    this.dropDown.click();
    this.dropDownPrice.click();
    browser.sleep(2000);
    return this.dropDownPrice.getText();
  };

  logout = async () => {
    await this.burgerMenu.click();
    await browser.wait(
      EC.visibilityOf(element(By.id("logout_sidebar_link")), 5000)
    );
    await this.logoutBtn.click();
  };

  getShoppingCartItems = async () => {
    return this.shoppingCartItems;
  };
}

module.exports = new HomePage();
