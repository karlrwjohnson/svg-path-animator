import { assertType } from './util';

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(rhs) {
        return rhs instanceof Point && this.x === rhs.x && this.y === rhs.y;
    }
    minus(rhs) {
        assertType('RHS', rhs, Point, Vector);

        if (rhs instanceof Point) {
            return new Vector(this.x - rhs.x, this.y - rhs.y);
        } else {
            return new Point(this.x - rhs.x, this.y - rhs.y);
        }
    }
    plus(vector) {
        assertType('RHS', vector, Vector);

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
            assertType(`first element of tuple ${i}`, point, Point);
            assertType(`second element of tuple ${i}`, weight, 'number');

            x += point.x * weight;
            y += point.y * weight;

            i++;
        }
        return new Point(x, y);
    }
}

export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(rhs) {
        return rhs instanceof Point && this.x === rhs.x && this.y === rhs.y;
    }
    plus(rhs) {
        assertType('RHS', rhs, Point, Vector);

        if (rhs instanceof Point) {
            return new Point(this.x + rhs.x, this.y + rhs.y);
        } else {
            return new Vector(this.x + rhs.x, this.y + rhs.y);
        }
    }
    times(rhs) {
        assertType('RHS', rhs, 'number');

        return new Vector(this.x * rhs, this.y * rhs);
    }
    get length () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
}
