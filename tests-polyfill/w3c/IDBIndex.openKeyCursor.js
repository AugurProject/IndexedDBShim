describe('W3C IDBIndex.openKeyCursor Tests', function () {
    var createdb = support.createdb;

    // idbindex_openKeyCursor
    it('throw DataError when using a invalid key', function (done) {
        var db;

        var open_rq = createdb(done);
        open_rq.onupgradeneeded = function(e) {
            db = e.target.result;
            var store = db.createObjectStore("store", { keyPath: "key" });
            var index = store.createIndex("index", "indexedProperty");

            store.add({ key: 1, indexedProperty: "data" });

            support.throws(function(){
                index.openKeyCursor(NaN);
            }, 'DataError');
            done();
        }
        open_rq.onsuccess = function () {};
    });

    // idbindex_openKeyCursor
    it('throw InvalidStateError when the index is deleted', function (done) {
        var db;

        var open_rq = createdb(done);
        open_rq.onupgradeneeded = function(e) {
            db = e.target.result;
            var store = db.createObjectStore("store", { keyPath: "key" });
            var index = store.createIndex("index", "indexedProperty");

            store.add({ key: 1, indexedProperty: "data" });
            store.deleteIndex("index");

            support.throws(function(){
                index.openKeyCursor();
            }, 'InvalidStateError');
            done();
        }
        open_rq.onsuccess = function () {};
    });

    // idbindex_openKeyCursor
    it('throw TransactionInactiveError on aborted transaction', function (done) {
        var db;

        var open_rq = createdb(done);
        open_rq.onupgradeneeded = function(e) {
            db = e.target.result;
            var store = db.createObjectStore("store", { keyPath: "key" });
            var index = store.createIndex("index", "indexedProperty");
            store.add({ key: 1, indexedProperty: "data" });
        }

        open_rq.onsuccess = function(e) {
            var tx = db.transaction('store');
            var index = tx.objectStore('store').index('index');
            tx.abort();

            support.throws(function(){
                index.openKeyCursor();
            }, 'TransactionInactiveError');
            done();
        }

        open_rq.onerror = function () {};
    });
});
