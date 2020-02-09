"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allFieldsValid = (state) => Object.keys(state.validation)
    .map(field => state.validation[field])
    .map(validations => Object.keys(validations).map(key => validations[key].valid))
    .reduce((acc, curr) => (!acc ? acc : curr.every(i => i)), true);
exports.runValidators = (validators, value, validationCallback) => Promise.all(validators.map(validator => {
    return Promise.resolve(Array.isArray(validator) ? validator[0](value) : validator(value)).then(result => validationCallback(result, validator));
}));
//# sourceMappingURL=validation.js.map