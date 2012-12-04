var batched = require("../index")

var asyncThing = {
    _state: {
        1: 1
        , 2: 2
        , 3: 3
    }
    , getAll: function (callback) {
        var state = this._state
        process.nextTick(function () {
            callback(null, state)
        })
    }
    , get: function (id, callback) {
        var state = this._state
        process.nextTick(function () {
            callback(null, state[id])
        })
    }
    , set: function (id, value, callback) {
        var state = this._state
        process.nextTick(function () {
            state[id] = value
            callback(null)
        })
    }
    , del: function (id, callback) {
        var state = this._state
        process.nextTick(function () {
            delete state[id]
            callback(null)
        })
    }
}

batched(asyncThing)
    .set("foo", "bar")
    .set("hello", "world")
    .del("1")
    .del("2")
    .getAll(function (err, results) {
        console.log("results!", results)
    })
