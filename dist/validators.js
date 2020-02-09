"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.required = function required(value) {
    return value === false || value === 0 || !!value;
};
exports.numeric = function numeric(value) {
    return typeof value === 'string'
        ? /^\d+(.\d+?)?$/.test(value)
        : !isNaN(value);
};
exports.minLength = length => function minLength(value) {
    return !!(value && value.length && !(value.length < length));
};
exports.maxLength = length => function maxLength(value) {
    return !!(value && value.length && !(value.length > length));
};
exports.mustMatch = regex => function mustMatch(value) {
    return regex.test(value);
};
exports.mustNotMatch = regex => function mustNotMatch(value) {
    return !regex.test(value);
};
exports.allEqual = function allEqual(values) {
    const valueEntries = values && Object.entries(values);
    return (!!valueEntries &&
        valueEntries.every(value => value[1] === valueEntries[0][1]));
};
exports.allRequired = function allRequired(values) {
    const valueEntries = values && Object.entries(values);
    return !!values && valueEntries.every(value => exports.required(value[1]));
};
//# sourceMappingURL=validators.js.map