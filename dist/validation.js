"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidators = exports.mergeValidators = exports.getValidatorName = exports.getBooleanValidators = exports.allFieldsValid = exports.validatorsEquals = exports.validationEquals = void 0;
const validationEquals = (v1, v2) => {
    const stringify = (obj) => Object.values(obj)
        .map((val) => JSON.stringify(val))
        .join('');
    return !v1 || !v2 ? false : stringify(v1) === stringify(v2);
};
exports.validationEquals = validationEquals;
const validatorsEquals = (v1, v2) => {
    return JSON.stringify(v1) === JSON.stringify(v2);
};
exports.validatorsEquals = validatorsEquals;
const allFieldsValid = (state) => Object.keys(state.validation)
    .map((field) => state.validation[field])
    .map((validations) => Object.keys(validations).map((key) => validations[key].valid))
    .reduce((acc, curr) => (!acc ? acc : curr.every((i) => i)), true);
exports.allFieldsValid = allFieldsValid;
const getBooleanValidators = (validators) => validators.reduce((validators, validator) => {
    const typeOfValidator = Array.isArray(validator)
        ? typeof validator[0].test
        : typeof validator.test;
    return typeOfValidator === 'boolean'
        ? [...validators, validator]
        : validators;
}, []);
exports.getBooleanValidators = getBooleanValidators;
const getValidatorName = (validator) => (Array.isArray(validator) ? validator[0].name : validator.name);
exports.getValidatorName = getValidatorName;
const mergeValidators = (merge, into) => {
    const intoFiltered = merge.length
        ? into.filter((validator) => merge
            .map(exports.getValidatorName)
            .some((validatorName) => validatorName !== exports.getValidatorName(validator)))
        : into;
    const merged = [...intoFiltered, ...merge];
    return merged;
};
exports.mergeValidators = mergeValidators;
const runValidator = async (validator, value) => {
    const setResult = async (validatorDefinition) => typeof validatorDefinition.test === 'function'
        ? await validatorDefinition.test(value)
        : validatorDefinition.test;
    return {
        name: Array.isArray(validator) ? validator[0].name : validator.name,
        valid: await setResult(Array.isArray(validator) ? validator[0] : validator),
        message: Array.isArray(validator) ? validator[1] : undefined,
    };
};
const runValidators = async (validators, value, batchId) => {
    const resolved = await Promise.all(validators.map(async (validator) => await runValidator(validator, value)));
    return {
        validationState: resolved.reduce((state, validatorResult) => {
            return Object.assign(Object.assign({}, state), { [validatorResult.name]: {
                    valid: validatorResult.valid,
                    message: validatorResult.message,
                } });
        }, {}),
        batchId,
    };
};
exports.runValidators = runValidators;
//# sourceMappingURL=validation.js.map