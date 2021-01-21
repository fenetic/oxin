"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeField = exports.setValidation = exports.setValue = void 0;
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
const removeField = (name) => ({
    payload: {
        name,
    },
    type: types_1.ActionType.REMOVE_FIELD,
});
exports.removeField = removeField;
//# sourceMappingURL=actions.js.map