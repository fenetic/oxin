"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.setValue = (payload) => ({
    payload,
    type: types_1.ActionType.SET_VALUE,
});
exports.setValidation = (payload) => {
    return {
        payload,
        type: types_1.ActionType.SET_VALIDATION,
    };
};
exports.removeField = (name) => ({
    payload: {
        name,
    },
    type: types_1.ActionType.REMOVE_FIELD,
});
//# sourceMappingURL=actions.js.map