"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const validation_1 = require("./validation");
exports.initialState = {
    touched: {},
    valid: true,
    validating: {},
    validation: {},
    values: {},
};
exports.reducer = (state, action) => {
    switch (action.type) {
        case types_1.ActionType.SET_VALUE: {
            const { payload: { fromInitial, name, value, validating }, } = action;
            return Object.assign(Object.assign({}, state), { touched: Object.assign(Object.assign({}, state.touched), { [name]: !fromInitial }), values: Object.assign(Object.assign({}, state.values), { [name]: value }), validating: Object.assign(Object.assign({}, state.validating), { [name]: validating }) });
        }
        case types_1.ActionType.SET_VALIDATION: {
            const { payload: { fieldName, validation, isFinal }, } = action;
            const newState = Object.assign(Object.assign({}, state), { validating: Object.assign(Object.assign({}, state.validating), { [fieldName]: !isFinal }), validation: Object.assign(Object.assign({}, state.validation), { [fieldName]: Object.assign(Object.assign({}, state.validation[fieldName]), validation) }) });
            newState.valid = validation_1.allFieldsValid(newState);
            return newState;
        }
        case types_1.ActionType.REMOVE_FIELD: {
            const { payload: { name }, } = action;
            const newState = Object.assign({}, state);
            delete newState.touched[name];
            delete newState.validation[name];
            delete newState.values[name];
            delete newState.validating[name];
            newState.valid = validation_1.allFieldsValid(newState);
            return newState;
        }
        default:
            return state;
    }
};
//# sourceMappingURL=reducer.js.map