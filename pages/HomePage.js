const { element, browser, By } = require("protractor");

class HomePage {
  title = element(By.className("title"));
  backpack = element(By.id("add-to-cart-sauce-labs-backpack"));
  bikelight = element(By.id("add-to-cart-sauce-labs-bike-light"));
  checkout = element(By.id("shopping_cart_container"));
  dropDown = element(By.className("product_sort_container"));
  dropDownPrice = element(
    By.xpath("//select[@class='product_sort_container']//option[@value='za']")
  );
  itemCount = element(By.className("shopping_cart_badge"));

  addItemsToCart = () => {
    this.backpack.click();
    this.bikelight.click();
    browser.sleep(2000);
  };

  continueToCheckOut = () => {
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
}

module.exports = new HomePage();
