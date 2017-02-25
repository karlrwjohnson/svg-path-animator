export const SVGNS = 'http://www.w3.org/2000/svg';

export function getTypeName (thing) {
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

export function assertType (description, thing, ...types) {
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
