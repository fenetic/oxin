"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeField = exports.setFocussed = exports.setBlurred = exports.setValidationVisibilty = exports.setValidation = exports.setValue = void 0;
const types_1 = require("./types");
const setValue = (payload) => ({
    payload,
    type: types_1.ActionType.SET_VALUE,
});
exports.setValue = setValue;
const setValidation = (payload) => {
    return {
        payload: {
            fieldName: payload.fieldName,
            validation: payload.validationMessage
                ? Object.entries(payload.validation).reduce((acc, curr) => (Object.assign(Object.assign({}, acc), { [curr[0]]: Object.assign(Object.assign({}, curr[1]), { message: payload.validationMessage }) })), {})
                : payload.validation,
        },
        type: types_1.ActionType.SET_VALIDATION,
    };
};
exports.setValidation = setValidation;
const setValidationVisibilty = (payload) => ({
    type: types_1.ActionType.SET_VISIBILITY,
    payload
});
exports.setValidationVisibilty = setValidationVisibilty;
const setBlurred = (fieldName) => ({
    type: types_1.ActionType.SET_BLURRED,
    payload: { fieldName }
});
exports.setBlurred = setBlurred;
const setFocussed = (fieldName) => ({
    type: types_1.ActionType.SET_FOCUSSED,
    payload: { fieldName }
});
exports.setFocussed = setFocussed;
const removeField = (name) => ({
    payload: {
        name,
    },
    type: types_1.ActionType.REMOVE_FIELD,
});
exports.removeField = removeField;
//# sourceMappingURL=actions.js.map