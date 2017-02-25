import {
    ClosePathCommand,
    AbsMoveCommand,
    RelMoveCommand,
    AbsLineCommand,
    RelLineCommand,
    AbsCubicSplineCommand,
    RelCubicSplineCommand,
} from './pathDataCommands';

export class LexerError extends Error {
    constructor (message, index, dataString) {
        super(`${message} at character ${index} of "${dataString}"`);
    }
}

export class ParserError extends Error {
    constructor (message, token, index, dataString) {
        super(`${message} for token '${token}' at character ${index} of "${dataString}"`);
    }
}

export function * lexPathData(dataString) {
    for (let i = 0, j = 0; i < dataString.length; i = j) {
        const chr = dataString[i];
        switch(chr) {

        // Single-letter commands
        // (Quadratic splines, shorthand/"smooth" splines, and elliptical arcs not supported)
        case 'M': case 'm': // Move To
        case 'L': case 'l': // Line To
        case 'C': case 'c': // Cubic Spline To
        case 'Z': case 'z': // Close Path
            yield [chr, i];
            j = i + 1;
            break;

        // Unimplemented commands
        case 'S': case 's': throw new LexerError(    '"Smooth Cubic Spline To" commands are not implemented.', i, dataString);
        case 'Q': case 'q': throw new LexerError(       '"Quadradic Spline To" commands are not implemented.', i, dataString);
        case 'T': case 't': throw new LexerError('"Smooth Quadratic Spline To" commands are not implemented.', i, dataString);
        case 'A': case 'a': throw new LexerError(         '"Elliptical Arc To" commands are not implemented.', i, dataString);

        // Numbers
        // (Scientific notation not supported)
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
        case '.': case '-':
            {
                // Seek to the end of the list of character which could conceivably be part of a number
                for (j = i + 1;
                    dataString[j] >= '0' && dataString[j] <= '9' || dataString[j] === '.';
                    j++) {
                    // no op
                }

                const number = parseFloat(dataString.slice(i, j));
                if (isNaN(number)) {
                    throw new LexerError(`Unable to parse a number from "${dataString.slice(i, j)}"`, i, dataString);
                }

                yield [number, i];
            }
            break;

        // Whitespace and other separators
        case ' ': case '\t': case '\r': case '\n':
        case ',': case ';':
            j = i + 1;
            break;

        default:
            throw new LexerError(`Unexpected character '${dataString[i]}'`, i, dataString);
        }
    }
}

export function * parsePathData(dataString) {

    let previousCommand = null;
    let pathBeginCommand = null;
    let commandClass = null;
    let parameters = [];

    function checkAllParametersUsed (token, index) {
        if (parameters.length > 0) {
            throw new ParserError(
                `Expected ${commandClass.getParameterCount() - parameters.length} more parameters to complete ${commandClass.name} `,
                index, token, dataString
            );
        }
    }

    for (let [token, index] of lexPathData(dataString)) {
        if (typeof token === 'string') {
            checkAllParametersUsed(token, index);

            switch(token) {
            case null:
                break;

            case 'M': commandClass = AbsMoveCommand; break;
            case 'm': commandClass = RelMoveCommand; break;
            case 'L': commandClass = AbsLineCommand; break;
            case 'l': commandClass = RelLineCommand; break;
            case 'C': commandClass = AbsCubicSplineCommand; break;
            case 'c': commandClass = RelCubicSplineCommand; break;
            case 'z': {
                commandClass = ClosePathCommand;

                // Finalize the command here since it doesn't take parameters
                previousCommand = new ClosePathCommand(previousCommand, pathBeginCommand);
                yield previousCommand;

                break;
            }

            default:
                throw new ParserError(`No command implemented`, token, index, dataString);
            }
        } else if (typeof token === 'number') {
            parameters.push(token);

            if (parameters.length >= commandClass.getParameterCount()) {


                // Section 8.3.2 of the SVG Spec: (paraphrased)
                //  - If a moveto command is followed by 1 or more extra pairs of
                //    points, those pairs are to be interpreted as lineto commands.
                //  - If the moveto command is absolute or relative, the implicit
                //    lineto commands will also be absolute or relative.
                //  - If a relative moveto appears at the beginning of a path data
                //    string, it functions as an absolute moveto command, but any
                //    implicit subsequent lineto commands will be relative.

                // I'm making a decision to prioritize making it easy to interpret
                // the resulting object model rather than preserve the exact parse
                // tree of the original source code. If the SVG Spec contains
                // optimizations to compress data on disk, this parser will return
                // a simpler, semantically-equivalent data structure that does not
                // contain those optimizations.

                try {
                    if (previousCommand === null && commandClass === RelMoveCommand) {
                        previousCommand = AbsMoveCommand.fromParameters(
                            previousCommand,
                            parameters.splice(0, commandClass.getParameterCount())
                        );
                    } else {
                        previousCommand = commandClass.fromParameters(
                            previousCommand,
                            parameters.splice(0, commandClass.getParameterCount())
                        );
                    }
                } catch(e) {
                    throw new ParserError(`Error creating ${commandClass.name}: ${e.message}`, token, index, dataString);
                }

                // Move-type commands warrant two different side effects
                switch(commandClass) {
                case AbsMoveCommand:
                    // Switch to implicit line commands
                    commandClass = AbsLineCommand;

                    // SVG Spec Section 8.3.3: First moveto command in a data
                    // string or following a close-path command resets the path
                    // starting point to the moveto command's destination
                    if (!previousCommand.previous || previousCommand.previous instanceof ClosePathCommand) {
                        pathBeginCommand = previousCommand;
                    }
                    break;
                case RelMoveCommand:
                    commandClass = RelLineCommand;

                    if (!previousCommand.previous || previousCommand.previous instanceof ClosePathCommand) {
                        pathBeginCommand = previousCommand;
                    }
                    break;
                default:
                    break;
                }

                yield previousCommand;
            }
        } else {
            throw new ParserError(`Unhandled token`);
        }
    }

    checkAllParametersUsed('(EOF)', dataString.length);
}
