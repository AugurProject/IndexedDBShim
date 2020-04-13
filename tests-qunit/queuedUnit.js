/* eslint-env qunit */
/* eslint-disable no-var, unicorn/no-for-loop */
/**
 * Ideally unit tests should be independent, but there are some cases where you
 * really want those tests to be executed one after the other. Here is some code
 * that does exactly that - a wrapper on top of QUnit.
 *
 * Usage: Instead of `asyncTest`, call `queuedAsyncTest` (same params) Instead of
 * `module()`, call `queuedModule`. After a test is over and the next test has to
 * run, call `nextTest()`
 */
(function (window, console) {
    var testQueue = [], currentModule = null;

    // Filtering the tests based on the URLs
    var filteredTests = [];
    if (window.location) {
        var q = window.location.search.slice(1).split('&');
        for (var i = 0; i < q.length; i++) {
            var parts = q[i].split('=');
            switch (parts[0]) {
            case 'filter': {
                filteredTests.push(decodeURIComponent(parts[1]));
                break;
            }
            }
        }
    }

    QUnit.test('Setting up qunit', function (assert) {
        var done = assert.async(); // Needed by grunt-contrib-qunit
        assert.ok('Queued Unit setup complete');
        done();
    });

    /**
    * Use this method instead of QUnit.test. Once the test is finished, call
    * `nextTest();`.
    * @param {string} name
    * @param {external:QUnitTest} test
    * @returns {void}
    */
    function queuedAsyncTest (name, test) {
        if (filteredTests.length === 0 || filteredTests.includes(currentModule + ': ' + name)) {
            testQueue.push({
                name,
                module: currentModule,
                args: [name, test]
            });
        }
    }

    /**
    * Use this in place of module(blah).
    * @param {string} module
    * @returns {void}
    */
    function queuedModule (module) {
        currentModule = module;
    }

    /**
    * Once the current test is over, call `nextTest()` to start running the
    * next test.
    */
    var testCount = 1;
    function nextTest () {
        if (testQueue.length <= 0) {
            if (console.groupEnd) console.groupEnd();
            console.log('All tests completed');
            return;
        }
        var current = testQueue.splice(0, 1)[0];
        if (console.groupEnd) console.groupEnd();
        if (console.groupCollapsed) console.groupCollapsed('=========', testCount++, current.module, ':', current.name, '============');
        else console.log('=========', testCount++, current.module, ':', current.name, '============');
        QUnit.module(current.module);

        // Expected asserts specified or not
        if (current.args.length === 2) {
            QUnit.test(current.name, current.args[1]);
        } else if (current.args.length === 3) {
            throw new Error('Replace 2nd arg to QUnit.test with `assert.expect(2nd arg val)`; test name: ' + current.name);
        }
    }

    // Following for Saucelabs as per https://github.com/axemclion/grunt-saucelabs#test-result-details-with-qunit
    var log = [];
    var testName; // eslint-disable-line no-unused-vars
    QUnit.done(function (testResults) {
        var tests = [];
        for (var i = 0, len = log.length; i < len; i++) {
            var details = log[i];
            tests.push({
                name: details.name,
                result: details.result,
                expected: details.expected,
                actual: details.actual,
                source: details.source
            });
        }
        testResults.tests = tests;

        window.global_test_results = testResults;
    });
    QUnit.testStart(function (testDetails) {
        QUnit.log(function (details) {
            if (!details.result) {
                details.name = testDetails.name;
                log.push(details);
            }
        });
    });

    window.queuedAsyncTest = queuedAsyncTest;
    window.queuedModule = queuedModule;
    window.nextTest = nextTest;
}(window, console));
