## Testing

There are currently three folders for tests, `tests-qunit`,
`tests-mocha` and `tests-polyfill` (the latter are also Mocha-based
tests, but at present its W3C tests
[only work in Node](https://github.com/axemclion/IndexedDBShim/issues/249)).

They can be run through a variety of means as described below.

To properly build the files (lint, browserify, and minify), use `npm start`
or to also keep a web server, run `npm run dev` (or `grunt dev`). If
you wish to do testing which only rebuilds the browser files, run
`npm run dev-browser` and if only testing Node, run `npm run dev-node`.
But before release, one should run `npm run build` (or `npm run dev`).

The tests produce various database files. These are avoided in
`.gitignore` and should be cleaned up if the tests pass, but if
you wish to delete them all manually, run `npm run clean`.

### Browser testing

All QUnit-based tests should pass in modern browsers.

All Mocha-based browser tests should pass except for one test having
a [problem in Firefox](https://github.com/axemclion/IndexedDBShim/issues/250).

#### Automated browser unit testing

Follow all of the steps above to build the project, then run `npm test`
or `npm run sauce-qunit` (or `npm run puppeteer-qunit` or
`grunt puppeteer-qunit` to avoid using Saucelabs when you have
credentials set up as environmental variables) to run the unit tests.

Note that when not running Saucelabs, the tests are run in
[grunt-qunit-puppeteer](https://github.com/timostark/qunit-puppeteer),
which uses headless Chromium.

Although it is possible to get the W3C `web-platform-tests` runner
working via patches as per
<https://github.com/axemclion/IndexedDBShim/issues/249>,
allowing tests to be run from the runner without
obtrusive changes to the repository is not yet refined (see also
<https://github.com/w3c/web-platform-tests/issues/5133#issuecomment-293465747>).

The now [recommended way](https://github.com/web-platform-tests/wpt/issues/6565)
for installing [`web-platform-tests`](https://github.com/web-platform-tests/wpt/)
is:

1. (May need to do this first: `pip uninstall virtualenv`)
1. `pip install virtualenv`
1. Add to PATH (e.g., `sudo nano /etc/paths` and add path to bottom of file)
    `$HOME/Library/Python/2.7/bin`.

Then run (without any process for `npm run wpt` running):

1. `./wpt run --headless chrome IndexedDB` or
    `./wpt run --binary=path --headless chrome IndexedDB`,
    installing any required dependencies.

#### Manual browser testing

If you want to run the tests in a normal web browser, you'll need to
spin-up a local web server and then open
[`tests-qunit/index.html?noglobals`](https://github.com/axemclion/IndexedDBShim/blob/master/tests-qunit/index.html?noglobals)
and/or [`tests-mocha/index.html`](https://github.com/axemclion/IndexedDBShim/blob/master/tests-mocha/index.html)
in your browser. You can also run `npm run dev` and point your
browser to `http://localhost:9999/tests-qunit/index.html` or
`http://localhost:9999/tests-mocha/index.html`.

Note that, for the Mocha tests, you probably wish to
"Switch to IndexedDBShim" when doing
the testing since otherwise, it will only test the native implementation.

For the W3C `web-platform-tests` tests, individual tests can be run
in these ways.

1. The first way currently adds files within `web-platform-tests` but
    does not modify files. To do this you must run a `grunt dev` task
    or another such test that connects (to port 9999) and also follow
    the instructions to install and run the server at
    <https://github.com/w3c/web-platform-tests>. If you run
    `npm run w3c-add-wrap` (or `npm run w3c-remove-wrap` to undo), you
    will be able to add ".any.html" to an IndexedDB file, e.g.,
    <http://web-platform.test:8000/IndexedDB/historical.html>
    becomes
    <http://web-platform.test:8000/IndexedDB/historical.html.any.html>.
1. The second way, unlike the first, allows files to be run from the
    W3C test runner at <http://web-platform.test:8000/tools/runner/index.html>,
    but it involves modifying files within `web-platform-tests` (you can use
    `git reset` to undo, however). You can then run `npm run w3c-wrap` and
    run files in the runner or individually. As above, you must also keep the
    `grunt dev` task (or the like) running on port 9999 and install
    `web-platform-tests`.
1. One may use `./wpt run` with specific paths (See automated testing above).

### Node Testing

To run the Node tests, run the following:

1. `npm run node-qunit` - The full test suite sometimes
    [does not complete execution](https://github.com/axemclion/IndexedDBShim/issues/251).
1. `npm run mocha`
1. `npm run tests-polyfill` (or its components `npm run fake`,
    `npm run mock`, `npm run w3c-old`). Note that only `fake` is
    currently passing in full, however.
1. `npm run web-platform-tests` (or `npm run wpt`) and in a separate
    terminal window, `npm run w3c` (you must first run
    `git submodule update --init --recursive` (possibly without
    [init](http://stackoverflow.com/a/10168693/271577) too if using
    an older version of Git), `git submodule foreach --recursive git fetch`,
    and `git submodule foreach git merge origin master` or possibly
    `git submodule foreach git pull --ff-only origin master`). For the
    former three, you can run `npm run submodules`. Note that some
    of these tests may not be passing because of the test environment not
    being completely configured for Node. We are working on fixing this.
    There are some older and less complete W3C tests that can be run
    with `npm run w3c-old`, but the goal is to remove these once
    the new ones are configured properly and working in the browser
    as do the old tests. The W3C Python browser server also ought to be
    running due to requirements with the URL having permissions.
    Once `npm run w3c` has been run once, you may also test against
    individual tests with:
    `npm run w3c-test -- <test-name>`, e.g., `npm run w3c-test -- idbdatabase_createObjectStore7.js`, or with a starting index
    and length (so as to break up the many tests into more
    manageable segments, as may become necessary if there are
    memory issues, e.g., `0 200` then `200 200`).

If you need to rebuild SQLite, you can run `npm install` inside of the
`node_modules/sqlite3` directory or run the IndexedDBShim `sqlite-rebuild`
script.

To run a specific Mocha test (which includes the `tests-polyfill`
tests), run `npm --test=... run mocha`.

### Testing in a Cordova/PhoneGap app

(Note that the repository as is might no longer be compatible with
Cordova/PhoneGap support. Please let us know if you can try or supply
any needed fixes.)

If you want to run the tests in a Cordova or PhoneGap app, then you'll need
to create a new Cordova/PhoneGap project, and add the
[IndexedDB plug-in](http://plugins.cordova.io/#/package/com.msopentech.indexeddb).
Then copy the contents of our
[`tests`](https://github.com/axemclion/IndexedDBShim/tree/master/tests)
directory into your project's `www` directory.   Delete our
[`index.html`](https://github.com/axemclion/IndexedDBShim/blob/master/tests/index.html)
file and rename
[`cordova.html`](https://github.com/axemclion/IndexedDBShim/blob/master/tests/cordova.html)
to `index.html`.
