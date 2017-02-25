export default function asyncExec (generator) {
    return new Promise((resolve, reject) => {
        const iterator = generator();

        function processIteration (iteration) {
            // Generator has returned successfully
            if (iteration.done) {
                resolve(iteration.value);
            }
            // Generator has returned a promise
            else if ('value' in iteration && iteration.value instanceof Promise) {
                iteration.value.then(resumeGenerator, throwGenerator);
            }
            // Generator has mistakenly returned a non-promise value.
            // Be forgiving and immediately resume execution
            else {
                resumeGenerator(iteration.value);
            }
        }

        function resumeGenerator(value) {
            try {
                // Resume execution
                processIteration(iterator.next(value));
            } catch(e) {
                // Catch errors that propagated out of the generator and
                // pass them along to the promise.
                reject(e);
            }
        }

        function throwGenerator(error) {
            try {
                // Throw an exception within the generator where it last yielded
                processIteration(iterator.throw(error));
            } catch(e) {
                reject(e);
                // Catch errors that propagated out of the generator and
                // pass them along to the promise.
            }
        }

        resumeGenerator(undefined);
    });
}

export function timeout (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
