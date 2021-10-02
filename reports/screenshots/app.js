var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "login to saucedemo homepage|Login Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "dc397c569de2444cecdf1a521da6b880",
        "instanceId": 24952,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00ee00be-0067-0018-0028-00d800e000b8.png",
        "timestamp": 1633103438038,
        "duration": 6290
    },
    {
        "description": "Sort items from Z to A|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "dc397c569de2444cecdf1a521da6b880",
        "instanceId": 24952,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004b00b0-0027-0069-0073-006a00ae0099.png",
        "timestamp": 1633103450835,
        "duration": 2265
    },
    {
        "description": "Select items and checkout|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "dc397c569de2444cecdf1a521da6b880",
        "instanceId": 24952,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e400db-0091-0050-0014-0064000200cc.png",
        "timestamp": 1633103453459,
        "duration": 4223
    },
    {
        "description": "Verify Shopping cart items|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "dc397c569de2444cecdf1a521da6b880",
        "instanceId": 24952,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "006b00ab-00ca-00e9-00e0-000900a80041.png",
        "timestamp": 1633103466293,
        "duration": 43
    },
    {
        "description": "Enter User Details and Finish|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "dc397c569de2444cecdf1a521da6b880",
        "instanceId": 24952,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f7007f-009a-004c-00c9-00350070001d.png",
        "timestamp": 1633103466476,
        "duration": 8471
    },
    {
        "description": "Sort items from Z to A|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "05588e644998ea2e499485257821ff00",
        "instanceId": 5360,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00de0052-0065-0069-00ea-00c300870007.png",
        "timestamp": 1633136950453,
        "duration": 2664
    },
    {
        "description": "Select items and checkout|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "05588e644998ea2e499485257821ff00",
        "instanceId": 5360,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b60000-0033-0044-00b1-000e003d0040.png",
        "timestamp": 1633136953986,
        "duration": 4367
    },
    {
        "description": "login to saucedemo homepage|Login Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "3243073d9de7f1a661232ac81398adc2",
        "instanceId": 7376,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00320033-0070-00d6-00fb-0035009100d2.png",
        "timestamp": 1633137316887,
        "duration": 6502
    },
    {
        "description": "Sort items from Z to A|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "3243073d9de7f1a661232ac81398adc2",
        "instanceId": 7376,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00af0033-006b-00b8-0046-005f00fc008b.png",
        "timestamp": 1633137330807,
        "duration": 2534
    },
    {
        "description": "Select items and checkout|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "3243073d9de7f1a661232ac81398adc2",
        "instanceId": 7376,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009e0097-00a7-00b6-00ae-009b00510032.png",
        "timestamp": 1633137334748,
        "duration": 4737
    },
    {
        "description": "Verify Shopping cart items|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "3243073d9de7f1a661232ac81398adc2",
        "instanceId": 7376,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00b200d1-0083-0023-0038-007400d00069.png",
        "timestamp": 1633137349198,
        "duration": 97
    },
    {
        "description": "Enter User Details and Finish|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "3243073d9de7f1a661232ac81398adc2",
        "instanceId": 7376,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00db003e-0056-0052-00fe-0020002a009e.png",
        "timestamp": 1633137349752,
        "duration": 9536
    },
    {
        "description": "login to saucedemo homepage|Login Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "c43cc2e0438ad6c0d1179da4ee96331e",
        "instanceId": 41704,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00d70024-0061-00a5-002c-003b007a002b.png",
        "timestamp": 1633137383273,
        "duration": 6593
    },
    {
        "description": "Sort items from Z to A|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "c43cc2e0438ad6c0d1179da4ee96331e",
        "instanceId": 41704,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007b0018-004a-0042-001f-0002006e0073.png",
        "timestamp": 1633137397299,
        "duration": 2575
    },
    {
        "description": "Select items and checkout|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "c43cc2e0438ad6c0d1179da4ee96331e",
        "instanceId": 41704,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002d0053-00ef-001d-00ef-005d00f10039.png",
        "timestamp": 1633137401022,
        "duration": 4652
    },
    {
        "description": "Verify Shopping cart items|Checkout Page:",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "c43cc2e0438ad6c0d1179da4ee96331e",
        "instanceId": 41704,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": [
            "Failed: Items not matching: expected false to be true"
        ],
        "trace": [
            "AssertionError: Items not matching: expected false to be true\n    at UserContext.<anonymous> (C:\\Users\\PK\\Downloads\\ProtractorProject\\tests\\003_CheckoutPage.spec.js:25:14)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Verify Shopping cart items\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (C:\\Users\\PK\\Downloads\\ProtractorProject\\tests\\003_CheckoutPage.spec.js:18:3)\n    at addSpecsToSuite (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\PK\\Downloads\\ProtractorProject\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\PK\\Downloads\\ProtractorProject\\tests\\003_CheckoutPage.spec.js:7:1)\n    at Module._compile (internal/modules/cjs/loader.js:1015:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1035:10)\n    at Module.load (internal/modules/cjs/loader.js:879:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "0067000b-007f-006f-0066-00c400e60044.png",
        "timestamp": 1633137415448,
        "duration": 142
    },
    {
        "description": "Enter User Details and Finish|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "c43cc2e0438ad6c0d1179da4ee96331e",
        "instanceId": 41704,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00520071-002f-00cf-00e8-00b9004c001d.png",
        "timestamp": 1633137416071,
        "duration": 9186
    },
    {
        "description": "login to saucedemo homepage|Login Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2e2936c78b97612b89ea031044401728",
        "instanceId": 18324,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "002100a0-0093-0086-0038-006e007b00d0.png",
        "timestamp": 1633138735542,
        "duration": 6858
    },
    {
        "description": "Sort items from Z to A|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2e2936c78b97612b89ea031044401728",
        "instanceId": 18324,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002b0017-00d5-00c7-0062-00c10026004a.png",
        "timestamp": 1633138749828,
        "duration": 2881
    },
    {
        "description": "Select items and checkout|HomePage functions",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2e2936c78b97612b89ea031044401728",
        "instanceId": 18324,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ef009c-00f0-0073-0050-00bd002d001c.png",
        "timestamp": 1633138753694,
        "duration": 4567
    },
    {
        "description": "Verify Shopping cart items|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2e2936c78b97612b89ea031044401728",
        "instanceId": 18324,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "002d0095-0096-006c-008c-00600073000f.png",
        "timestamp": 1633138767978,
        "duration": 145
    },
    {
        "description": "Enter User Details and Finish|Checkout Page:",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2e2936c78b97612b89ea031044401728",
        "instanceId": 18324,
        "browser": {
            "name": "chrome",
            "version": "94.0.4606.61"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a500ea-003b-0093-0033-0095003c007c.png",
        "timestamp": 1633138768539,
        "duration": 9530
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });