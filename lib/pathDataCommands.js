import { assertType } from './util';
import { Point, Vector } from './math';

export class Command {
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

export class ClosePathCommand extends Command {
    constructor (previous, returnTo) {
        super(previous);

        assertType('returnTo', returnTo, AbsMoveCommand, RelMoveCommand);
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

export class AbsMoveCommand extends Command {
    constructor (previous, end=null) {
        super(previous || false);

        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsMoveCommand(
            previous,
            new Point(...parameters.splice(0,2))
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

export class RelMoveCommand extends Command {
    constructor (previous, endRel=null) {
        super(previous);

        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelMoveCommand(
            previous,
            new Vector(...parameters.splice(0,2))
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

export class AbsLineCommand extends Command {
    constructor (previous, end=null) {
        super(previous);

        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsLineCommand(
            previous,
            new Point(parameters[0], parameters[1])
        );
    }
    static getParameterCount () {
        return 2;
    }
    toString() {
        return `L${this.end.x},${this.end.y}`;
    }
    slice (t) {
        const end = Point.weightedAverage([this.begin, (1-t)], [this.end, t]);
        return new AbsLineCommand(this.previous, end);
    }
}

export class RelLineCommand extends Command {
    constructor (previous, endRel=null) {
        super(previous);

        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelLineCommand(
            previous,
            new Vector(parameters[0], parameters[1])
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

export class AbsCubicSplineCommand extends Command {
    constructor (previous, handle1=null, handle2=null, end=null) {
        super(previous);

        this.handle1 = handle1;
        this.handle2 = handle2;
        this.end = end;
    }
    static fromParameters (previous, parameters) {
        return new AbsCubicSplineCommand(
            previous,
            new Point(parameters[0], parameters[1]),
            new Point(parameters[2], parameters[3]),
            new Point(parameters[4], parameters[5])
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

        const handle1 = Point.weightedAverage( [A, t_inv   ], [B,   t         ]                               );
        const handle2 = Point.weightedAverage( [A, t_inv_sq], [B, 2*t*t_inv   ], [C,   t_sq]                  );
        const end     = Point.weightedAverage( [A, t_inv_cu], [B, 3*t*t_inv_sq], [C, 3*t_sq*t_inv], [D, t_cu] );

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

        return Point.weightedAverage( [A, t_inv_cu], [B, 3*t*t_inv_sq], [C, 3*t_sq*t_inv], [D, t_cu] );
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

export class RelCubicSplineCommand extends AbsCubicSplineCommand {
    constructor (previous, handle1Rel=null, handle2Rel=null, endRel=null) {
        super(previous);

        this.handle1Rel = handle1Rel;
        this.handle2Rel = handle2Rel;
        this.endRel = endRel;
    }
    static fromParameters (previous, parameters) {
        return new RelCubicSplineCommand(
            previous,
            new Vector(parameters[0], parameters[1]),
            new Vector(parameters[2], parameters[3]),
            new Vector(parameters[4], parameters[5])
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
