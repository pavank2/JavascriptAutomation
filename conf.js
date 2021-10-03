exports.config = {
  seleniumAddress: "http://localhost:4444/wd/hub",
  specs: ["tests/*.spec.js"],
  baseURL: "http://localhost:8080/",
  framework: "jasmine",

  capabilities: {
    browserName: "chrome",
    acceptInsecureCerts: true,
  },

  onPrepare: async () => {
    await browser.waitForAngularEnabled(false);
    let HtmlReporter = require("protractor-beautiful-reporter");
    jasmine.getEnv().addReporter(
      new HtmlReporter({
        baseDirectory: "reports",
        screenshotsSubfolder: "screenshotsOnFailure",
        takeScreenShotsOnlyForFailedSpecs: true,
        jsonsSubfolder: "jsonFiles",
        excludeSkippedSpecs: true,
        preserveDirectory: false,
        clientDefaults: {
          showTotalDurationIn: "header",
          totalDurationFormat: "h:m:s",
          gatherBrowserLogs: true,
        },
      }).getJasmine2Reporter()
    );
  },
};
