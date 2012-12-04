# batched

Async chaining sugar. Turn async methods into a batch

## Example

Basically take a hash of asynchronous functions (or methods) and
    allow you to do serialized batch of commands on it.

A batch "starts" on the nextTick and does each chained command
    in serial.

If any have a callback that callback will be
    called. Else a default callback is used that emits an
    `"error"` event on the batch if there is an error.

```js
var batched = require("batched")

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
    .get("3", function (err, result) {
        console.log("result", result)
    })
    .getAll(function (err, results) {
        console.log("results!", results)
    })
    .on("error", function () {
        // No errors!
    })
    .once("finish", function () {
        console.log("finished")
    })

console.log("go chain go!")

```

## Installation

`npm install batched`

## Contributors

 - Raynos

## MIT Licenced
