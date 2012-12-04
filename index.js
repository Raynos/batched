var toArray = require("to-array")

module.exports = batched

/*
    To batch an object with async methods, generate a batch
        object with the same method name and hold an internal
        context of what operations need to be executed in
        serial.
*/
function batched(methods) {
    var batch = {}
        , context = []

    Object.keys(methods).forEach(function (name) {
        batch[name] = proxy(name)
    })

    return batch

    /*
        Return a function that capture arguments. Store the
            arguments and the method name on the context.

        If a callback is passed execute the batch. Do this
            by emptying the context one by one. Each time
            execute the method with the args and add in the loop
            function as a callback to apply the next method.

        Do this until the context is empty then fire the callback
            passed in to the last batched method with the results
            of that method
    */
    function proxy(name) {
        return function () {
            var args = toArray(arguments)
                , callback = args.pop()

            context.push([name, args])
            if (typeof callback !== "function") {
                args.push(callback)
            } else {
                loop()
            }

            return batch

            function loop(err) {
                if (err) {
                    return callback(err)
                }

                if (context.length === 0) {
                    return callback.apply(this, arguments)
                }

                var command = context.shift()
                    , name = command[0]
                    , args = command[1]

                args.push(loop)

                methods[name].apply(methods, args)
            }
        }
    }
}
