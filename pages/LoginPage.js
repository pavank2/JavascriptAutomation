const { element, browser, By } = require("protractor");

var EC = protractor.ExpectedConditions;

class LoginPage {
  username = element(By.name("user-name"));
  pass = element(By.name("password"));
  loginBtn = element(By.id("login-button"));
  creds = element(By.xpath("//div[@id='login_credentials']"));

  enterCredentials = (user, pass) => {
    this.username.sendKeys(user);
    this.pass.sendKeys(pass);
    browser.sleep(1000);
  };

  clickOnLogin = () => {
    this.loginBtn.click();
    browser.sleep(2000);
  };

  getLoginButton = () => {
    return this.loginBtn;
  };
}

module.exports = new LoginPage();
