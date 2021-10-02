var fs = require("fs");
var path = require("path");

//setDefaultTimeout(60 * 1000);
var HtmlReporter = require("protractor-beautiful-reporter");

exports.config = {
  seleniumAddress: "http://localhost:4444/wd/hub",
  specs: ["tests/*.spec.js"],
  baseURL: "http://localhost:8080/",
  framework: "jasmine",

  capabilities: {
    browserName: "chrome",
  },

  onPrepare: async () => {
    await browser.waitForAngularEnabled(false);
    jasmine.getEnv().addReporter(
      new HtmlReporter({
        baseDirectory: "reports/screenshots",
      }).getJasmine2Reporter()
    );
  },
};
