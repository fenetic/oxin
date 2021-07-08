"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generic = exports.notWhenChanging = exports.onBlurButNotWhenRefocussed = exports.strictlyOnBlur = void 0;
const strictlyOnBlur = ({ blurred, validation: { valid } }) => !valid && blurred;
exports.strictlyOnBlur = strictlyOnBlur;
const onBlurButNotWhenRefocussed = ({ blurred, validation: { valid }, isFocussed }) => !valid && (blurred && !isFocussed);
exports.onBlurButNotWhenRefocussed = onBlurButNotWhenRefocussed;
const notWhenChanging = ({ validation: { valid }, hadChanged, isFocussed }) => {
    return !valid && (!hadChanged && !isFocussed);
};
exports.notWhenChanging = notWhenChanging;
const generic = ({ validation: { valid } }) => !valid;
exports.generic = generic;
//# sourceMappingURL=visibility.js.map