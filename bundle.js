/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export getTypeName */
/* harmony export (immutable) */ __webpack_exports__["a"] = assertType;
const SVGNS = 'http://www.w3.org/2000/svg';
/* unused harmony export SVGNS */


function getTypeName (thing) {
    if (typeof thing === 'object') {
        if (thing === null) {
            return '(null)';
        } else {
            return thing.constructor.name;
        }
    } else {
        return typeof thing;
    }
}

function assertType (description, thing, ...types) {
    if (types.length === 0) {
        throw new Error(`Bad call to assertType(): At least one type must be specified`);
    }

    for (let type of types) {
        if (typeof type === 'function') {
            if (thing instanceof type) {
                return;
            }
        } else if (typeof type === 'string') {
            if (typeof thing === type) {
                return;
            }
        } else {
            // Type-checking in a type checker is meta
            throw new Error(`Bad call to assertType(): All types must be a function or a string; got a ${getTypeName(type)}`);
        }
    }

    const validTypeList = Array.from(types).map(t => (typeof t === 'function') ? t.name : t);
    const formattedValidTypeList = (validTypeList.length === 1)
        ? validTypeList[0]
        : validTypeList.slice(0, -1).join(', a ') + ' or a ' + validTypeList.pop();

    throw new Error(`Expected ${description} to be a ${formattedValidTypeList}; got a ${getTypeName(thing)}`);
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = asyncExec;
/* harmony export (immutable) */ __webpack_exports__["b"] = timeout;
function asyncExec (generator) {
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

function timeout (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__ = __webpack_require__(4);
/* unused harmony export lexPathData */
/* harmony export (immutable) */ __webpack_exports__["a"] = parsePathData;


class LexerError extends Error {
    constructor (message, index, dataString) {
        super(`${message} at character ${index} of "${dataString}"`);
    }
}
/* unused harmony export LexerError */


class ParserError extends Error {
    constructor (message, token, index, dataString) {
        super(`${message} for token '${token}' at character ${index} of "${dataString}"`);
    }
}
/* unused harmony export ParserError */


function * lexPathData(dataString) {
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

function * parsePathData(dataString) {

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

            case 'M': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["a" /* AbsMoveCommand */]; break;
            case 'm': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["b" /* RelMoveCommand */]; break;
            case 'L': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["c" /* AbsLineCommand */]; break;
            case 'l': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["d" /* RelLineCommand */]; break;
            case 'C': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["e" /* AbsCubicSplineCommand */]; break;
            case 'c': commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["f" /* RelCubicSplineCommand */]; break;
            case 'z': {
                commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["g" /* ClosePathCommand */];

                // Finalize the command here since it doesn't take parameters
                previousCommand = new __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["g" /* ClosePathCommand */](previousCommand, pathBeginCommand);
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
                    if (previousCommand === null && commandClass === __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["b" /* RelMoveCommand */]) {
                        previousCommand = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["a" /* AbsMoveCommand */].fromParameters(
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
                case __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["a" /* AbsMoveCommand */]:
                    // Switch to implicit line commands
                    commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["c" /* AbsLineCommand */];

                    // SVG Spec Section 8.3.3: First moveto command in a data
                    // string or following a close-path command resets the path
                    // starting point to the moveto command's destination
                    if (!previousCommand.previous || previousCommand.previous instanceof __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["g" /* ClosePathCommand */]) {
                        pathBeginCommand = previousCommand;
                    }
                    break;
                case __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["b" /* RelMoveCommand */]:
                    commandClass = __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["d" /* RelLineCommand */];

                    if (!previousCommand.previous || previousCommand.previous instanceof __WEBPACK_IMPORTED_MODULE_0__pathDataCommands__["g" /* ClosePathCommand */]) {
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


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(rhs) {
        return rhs instanceof Point && this.x === rhs.x && this.y === rhs.y;
    }
    minus(rhs) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])('RHS', rhs, Point, Vector);

        if (rhs instanceof Point) {
            return new Vector(this.x - rhs.x, this.y - rhs.y);
        } else {
            return new Point(this.x - rhs.x, this.y - rhs.y);
        }
    }
    plus(vector) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])('RHS', vector, Vector);

        return new Point(this.x + vector.x, this.y + vector.y);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }

    static weightedAverage(...tuples) {
        let x = 0;
        let y = 0;
        let i = 0;
        for (let [point, weight] of tuples) {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])(`first element of tuple ${i}`, point, Point);
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])(`second element of tuple ${i}`, weight, 'number');

            x += point.x * weight;
            y += point.y * weight;

            i++;
        }
        return new Point(x, y);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Point;


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(rhs) {
        return rhs instanceof Point && this.x === rhs.x && this.y === rhs.y;
    }
    plus(rhs) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])('RHS', rhs, Point, Vector);

        if (rhs instanceof Point) {
            return new Point(this.x + rhs.x, this.y + rhs.y);
        } else {
            return new Vector(this.x + rhs.x, this.y + rhs.y);
        }
    }
    times(rhs) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])('RHS', rhs, 'number');

        return new Vector(this.x * rhs, this.y * rhs);
    }
    get length () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Vector;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__math__ = __webpack_require__(3);



class Command {
    constructor (previous) {
        if (previous === undefined) {
            throw new Error('Data must begin with an Absolute Move command');
        }
        this.previous = previous;
    }
    get begin () {
        if (this.previous === null) {
            throw new Error('Data began without a Move command');
        }
        return this.previous.end;
    }
    slice (_t) {
        // Effectively no-op
        return this;
    }
    interpolate (_t) {
        return this;
    }
    hasLength() {
        return true;
    }
    estimateLength() {
        if (this.hasLength()) {
            return this.end.minus(this.begin).length;
        } else {
            return 0;
        }
    }
}
/* unused harmony export Command */


class ClosePathCommand extends Command {
    constructor (previous, returnTo) {
        super(previous);

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* assertType */])('returnTo', returnTo, AbsMoveCommand, RelMoveCommand);
        this.returnTo = returnTo;
    }
    get end() {
        return this.returnTo.end;
    }
    static fromParameters () {
        throw new Error('ClosePathCommand cannot be constructed from parameters');
    }
    static getParameterCount () {
        return 0;
    }
    slice (t) {
        return AbsLineCommand.prototype.slice.call(this, t);
    }
    toString() {
        return 'z';
    }
}
/* harmony export (immutable) */ __webpack_exports__["g"] = ClosePathCommand;


class AbsMoveCommand extends Command {
    constructor (previous, end=null) {
        super(previous || false);

        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsMoveCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */](...parameters.splice(0,2))
        );
    }
    static getParameterCount () {
        return 2;
    }
    get begin() {
        return this.end;
    }
    toString() {
        return `M${this.end.x},${this.end.y}`;
    }
    hasLength() {
        return false;
    }
    // inherit no-op slice()
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AbsMoveCommand;


class RelMoveCommand extends Command {
    constructor (previous, endRel=null) {
        super(previous);

        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelMoveCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["b" /* Vector */](...parameters.splice(0,2))
        );
    }
    static getParameterCount () {
        return 2;
    }
    get begin() {
        if (this.previous === false) {
            return this.end;
        } else {
            return super.begin;
        }
    }
    get end() {
        return this.begin.plus(this.endRel);
    }
    toString() {
        return `m${this.endRel.x},${this.endRel.y}`;
    }
    hasLength() {
        return false;
    }
    estimateLength() {
        return this.endRel.length;
    }
    // inherit no-op slice()
}
/* harmony export (immutable) */ __webpack_exports__["b"] = RelMoveCommand;


class AbsLineCommand extends Command {
    constructor (previous, end=null) {
        super(previous);

        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsLineCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */](parameters[0], parameters[1])
        );
    }
    static getParameterCount () {
        return 2;
    }
    toString() {
        return `L${this.end.x},${this.end.y}`;
    }
    slice (t) {
        const end = __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */].weightedAverage([this.begin, (1-t)], [this.end, t]);
        return new AbsLineCommand(this.previous, end);
    }
}
/* harmony export (immutable) */ __webpack_exports__["c"] = AbsLineCommand;


class RelLineCommand extends Command {
    constructor (previous, endRel=null) {
        super(previous);

        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelLineCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["b" /* Vector */](parameters[0], parameters[1])
        );
    }
    static getParameterCount () {
        return 2;
    }
    get end () {
        return this.previous.end.plus(this.endRel);
    }
    toString() {
        return `l${this.endRel.x},${this.endRel.y}`;
    }
    slice (t) {
        const endRel = this.endRel.times(t);
        const slice = new RelLineCommand(this.previous, endRel);
        return slice;
    }
}
/* harmony export (immutable) */ __webpack_exports__["d"] = RelLineCommand;


class AbsCubicSplineCommand extends Command {
    constructor (previous, handle1=null, handle2=null, end=null) {
        super(previous);

        this.handle1 = handle1;
        this.handle2 = handle2;
        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsCubicSplineCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */](parameters[0], parameters[1]),
            new __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */](parameters[2], parameters[3]),
            new __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */](parameters[4], parameters[5])
        );
    }
    static getParameterCount () {
        return 6;
    }
    toString() {
        return `C${this.handle1.x},${this.handle1.y} ${this.handle2.x},${this.handle2.y} ${this.end.x},${this.end.y}`;
    }
    slice (t) {

        // ⎡ A' ⎤ = ⎡ 1       0         0         0  ⎤ ⎡ A ⎤
        // ⎢ B' ⎥ = ⎢ (1-t)   t         0         0  ⎥ ⎢ B ⎥
        // ⎢ C' ⎥ = ⎢ (1-t)²  (1-t)t    t²        0  ⎥ ⎢ C ⎥
        // ⎣ D' ⎦ = ⎣ (1-t)³  3t(1-t)²  3t²(1-t)  t³ ⎦ ⎣ D ⎦

        // Alias variables so the code matches the math
        const A = this.begin;
        const B = this.handle1;
        const C = this.handle2;
        const D = this.end;

        // Also alias the powers of `t` because the power operator isn't supported
        // everywhere and Math.pow() looks ugly
        const t_sq = t * t;
        const t_cu = t * t_sq;
        const t_inv = 1 - t;
        const t_inv_sq = t_inv * t_inv;
        const t_inv_cu = t_inv * t_inv_sq;

        // By the way, I've checked the order of operations on * versus ** (exponenentiation).
        // It follows Please-Excuse-My-Dear-Aunt-Sally as one would expect. It's fine.

        const handle1 = __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */].weightedAverage( [A, t_inv   ], [B,   t         ]                               );
        const handle2 = __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */].weightedAverage( [A, t_inv_sq], [B, 2*t*t_inv   ], [C,   t_sq]                  );
        const end     = __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */].weightedAverage( [A, t_inv_cu], [B, 3*t*t_inv_sq], [C, 3*t_sq*t_inv], [D, t_cu] );

        return new AbsCubicSplineCommand(this.previous, handle1, handle2, end);
    }
    interpolate (t) {
        const t_sq = t * t;
        const t_cu = t * t_sq;
        const t_inv = 1 - t;
        const t_inv_sq = t_inv * t_inv;
        const t_inv_cu = t_inv * t_inv_sq;

        const A = this.begin;
        const B = this.handle1;
        const C = this.handle2;
        const D = this.end;

        return __WEBPACK_IMPORTED_MODULE_1__math__["a" /* Point */].weightedAverage( [A, t_inv_cu], [B, 3*t*t_inv_sq], [C, 3*t_sq*t_inv], [D, t_cu] );
    }
    estimateLength() {
        // Use 4 interpolated segments to estimate
        const intermediate1 = this.interpolate(0.25);
        const intermediate2 = this.interpolate(0.50);
        const intermediate3 = this.interpolate(0.75);

        return intermediate1.minus(this.begin).length +
            intermediate2.minus(intermediate1).length +
            intermediate3.minus(intermediate2).length +
            this.end.minus(intermediate3).length;
    }
}
/* harmony export (immutable) */ __webpack_exports__["e"] = AbsCubicSplineCommand;


class RelCubicSplineCommand extends AbsCubicSplineCommand {
    constructor (previous, handle1Rel=null, handle2Rel=null, endRel=null) {
        super(previous);

        this.handle1Rel = handle1Rel;
        this.handle2Rel = handle2Rel;
        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelCubicSplineCommand(
            previous,
            new __WEBPACK_IMPORTED_MODULE_1__math__["b" /* Vector */](parameters[0], parameters[1]),
            new __WEBPACK_IMPORTED_MODULE_1__math__["b" /* Vector */](parameters[2], parameters[3]),
            new __WEBPACK_IMPORTED_MODULE_1__math__["b" /* Vector */](parameters[4], parameters[5])
        );
    }
    static getParameterCount () {
        return 6;
    }
    toString() {
        return `c${this.handle1Rel.x},${this.handle1Rel.y} ${this.handle2Rel.x},${this.handle2Rel.y} ${this.endRel.x},${this.endRel.y}`;
    }

    // Create getters to wrap the properties
    get handle1 () { return this.begin.plus(this.handle1Rel); }
    get handle2 () { return this.begin.plus(this.handle2Rel); }
    get end     () { return this.begin.plus(this.endRel); }

    // Black-hole setters so the parent class can assign to this property
    set handle1 (_) { }
    set handle2 (_) { }
    set end     (_) { }
}
/* harmony export (immutable) */ __webpack_exports__["f"] = RelCubicSplineCommand;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_asyncExec__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_pathParser__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_util__ = __webpack_require__(0);




function animatePath(path, config={}) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__lib_util__["a" /* assertType */])('path', path, SVGPathElement);

    let pausePromise = null;    // When set, execution waits until the promise resolves
    let unpause = null;         // Callback to resolve pausePromise, resuming execution 
    let shouldStop = false;     // Flag to halt execution gracefully

    // Animation daemon
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__lib_asyncExec__["a" /* default */])(function*() {
        const originalPathData = path.getAttribute('d');
        const commands = Array.from(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_pathParser__["a" /* parsePathData */])(originalPathData));

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
                            yield __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__lib_asyncExec__["b" /* timeout */])(0); // as smooth as possible
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


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map