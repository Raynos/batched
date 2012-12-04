var toArray = require("to-array")
    , EventEmitter = require("events").EventEmitter
    , inherits = require("util").inherits

inherits(Batch, EventEmitter)

module.exports = batched

function batched(methods) {
    var batch = new Batch(methods)

    Object.keys(methods).forEach(createBatchMethod, batch)

    return batch
}

/* Use prototype for performance and debugging */
function Batch(methods) {
    this.__context__ = null
    this.__methods__ = methods
}

/*
    If no context exec batch on nextTick.

    Else add method invocation to context.
*/
function createBatchMethod(name) {
    var batch = this

    batch[name] = proxy

    function proxy() {
        var args = toArray(arguments)
            , context = batch.__context__

        if (!context) {
            batch.__context__ = context = []
            process.nextTick(exec.bind(null, batch))
        }

        context.push([name, args])

        return batch
    }
}

/*
    If there is an error not handled by a user callback emit
        error event.

    If command has no user callback pass loop as callback and run
        it.

    If command has user callback then ensure we nuke the
        __context__ of this batch before calling the callback
        to ensure that new batches created in the callback
        work as expected.

    If there are more commands in the batch after the user
        callback then continue looping.
*/
function exec(batch) {
    var context = batch.__context__
        , methods = batch.__methods__

    loop()

    function loop(err) {
        if (err) {
            return batch.emit("error", err)
        }

        var command = context.shift()
            , name = command[0]
            , args = command[1]
            , lastIndex = args.length - 1
            , callback = args[lastIndex]

        if (typeof callback === "function") {
            args.splice(lastIndex, 1, intercept)
        } else {
            args.push(loop)
        }

        methods[name].apply(methods, args)

        function intercept(err) {
            if (err) {
                return callback(err)
            }

            if (context.length === 0) {
                batch.__context__ = null
            }

            callback.apply(this, arguments)

            if (context.length !== 0) {
                loop()
            } else {
                batch.emit("finish")
            }
        }
    }
}
