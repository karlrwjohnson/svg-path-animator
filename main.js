import asyncExec, { timeout } from './lib/asyncExec';
import { parsePathData } from './lib/pathParser';
import { assertType } from './lib/util';

function animatePath(path, config={}) {
    assertType('path', path, SVGPathElement);

    let pausePromise = null;    // When set, execution waits until the promise resolves
    let unpause = null;         // Callback to resolve pausePromise, resuming execution 
    let shouldStop = false;     // Flag to halt execution gracefully

    // Animation daemon
    asyncExec(function*() {
        const originalPathData = path.getAttribute('d');
        const commands = Array.from(parsePathData(originalPathData));

        try {
            let completedCommandString = '';
            for (let command of commands) {
                if (command.hasLength()) {
                    const duration = config.millisPerSegment
                        || (config.millisPerPixel && config.millisPerPixel * command.estimateLength())
                        || 100;

                    const begin = +(new Date());

                    for (let progress = 0; progress < 1.0; progress = (new Date() - begin)/duration) {
                        const slicedCommand = command.slice(progress);
                        path.setAttribute('d', completedCommandString + slicedCommand);

                        if (pausePromise) {
                            yield pausePromise;
                        } else {
                            // Delay so GUI can render
                            // yield timeout(50); // 20 fps?
                            yield timeout(0); // as smooth as possible
                        }

                        if (shouldStop) {
                            return;
                        }
                    }
                }
                completedCommandString += command;
            }
        } finally {
            path.setAttribute('d', originalPathData);
        }
    });

    // Animation Controller
    return {
        pause() {
            if (!pausePromise) {
                pausePromise = new Promise(resolve => {
                    unpause = resolve;
                });
            }
        },
        resume() {
            if (pausePromise) {
                unpause();

                unpause = null;
                pausePromise = null;
            }
        },
        reset() {
            shouldStop = true;
            this.resume();
        },
    };
}

window.animatePath = animatePath;
