const { element, browser, By } = require("protractor");
//const { protractor } = require("protractor/built/ptor");

// var chai = require("chai");
// var chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
// var expect = chai.expect;

var EC = protractor.ExpectedConditions;

class LoginPage {
  username = element(By.name("user-name"));
  pass = element(By.name("password"));
  loginBtn = element(By.id("login-button"));
  creds = element(By.xpath("//div[@id='login_credentials']"));

  enterCredentials = (user, pass) => {
    browser.sleep(2000);
    this.username.sendKeys(user);
    this.pass.sendKeys(pass);
  };

  clickOnLogin = () => {
    browser.sleep(2000);
    this.loginBtn.click();
  };
}

module.exports = new LoginPage();
