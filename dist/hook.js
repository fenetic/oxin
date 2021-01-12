"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const reducer_1 = require("./reducer");
const actions_1 = require("./actions");
const validation_1 = require("./validation");
function useCache() {
    const cache = react_1.useRef(new Map());
    const has = key => cache.current.has(key);
    const get = key => cache.current.get(key);
    const set = (key, value) => cache.current.set(key, value);
    const getOrSet = (key, value) => has(key) ? get(key) : set(key, value) && get(key);
    return { getOrSet, set, has, get };
}
const validationEquals = (v1, v2) => {
    const stringify = (obj) => Object.values(obj)
        .map(val => JSON.stringify(val))
        .join('');
    return stringify(v1) === stringify(v2);
};
function useOxin() {
    const [inputState, dispatch] = react_1.useReducer(reducer_1.reducer, reducer_1.initialState);
    const fieldCache = useCache();
    const inputProps = (inputOptions) => {
        var _a, _b;
        const { initialValue, name, validation, validators } = inputOptions;
        const validatorCount = ((_a = validators) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const cacheKeys = {
            validationProp: `${name}-validationProp`,
            validationBatchCount: `${name}-validationBatchCount`,
            settledValidations: `${name}-settledValidations`,
            onChange: `${name}-onChange`,
            changes: `${name}-changes`,
            onBlur: `${name}-onBlur`,
            onRemove: `${name}-onRemove`,
        };
        fieldCache.getOrSet(cacheKeys.settledValidations, 0);
        fieldCache.getOrSet(cacheKeys.validationBatchCount, 0);
        fieldCache.getOrSet(cacheKeys.changes, 0);
        const handleSetValidation = (validatorName, result, message) => {
            const settledValidations = fieldCache.get(cacheKeys.settledValidations);
            if (settledValidations === validatorCount - 1) {
                fieldCache.set(cacheKeys.settledValidations, 0);
                fieldCache.set(cacheKeys.validationBatchCount, fieldCache.get(cacheKeys.validationBatchCount) - 1);
            }
            else {
                fieldCache.set(cacheKeys.settledValidations, settledValidations + 1);
            }
            dispatch(actions_1.setValidation({
                fieldName: name,
                validation: { [validatorName]: { valid: result, message } },
                isFinal: fieldCache.get(cacheKeys.validationBatchCount) === 0,
            }));
        };
        const handleRunValidators = (value) => {
            fieldCache.set(cacheKeys.validationBatchCount, fieldCache.get(cacheKeys.validationBatchCount) + 1);
            validation_1.runValidators(validators || [], value, (result, validator) => handleSetValidation(Array.isArray(validator) ? validator[0].name : validator.name, result, Array.isArray(validator) ? validator[1] : undefined));
        };
        const handleRunValidatorsDebounced = lodash_debounce_1.default(handleRunValidators, ((_b = validation) === null || _b === void 0 ? void 0 : _b.debounce) || 0);
        if (!(name in inputState.values)) {
            dispatch(actions_1.setValue({
                name,
                fromInitial: true,
                value: initialValue || null,
                validating: false,
            }));
            handleRunValidators(initialValue);
        }
        const validationState = inputState.validation[name] || {};
        const cachedValidation = fieldCache.get(cacheKeys.validationProp);
        if (!cachedValidation ||
            !validationEquals(cachedValidation, validationState)) {
            fieldCache.set(cacheKeys.validationProp, Object.keys(validationState)
                .map(validatorName => validationState[validatorName])
                .reduce((acc, curr) => ({
                messages: !curr.valid && curr.message
                    ? [...acc.messages, curr.message]
                    : [...acc.messages],
                valid: acc.valid && curr.valid,
            }), { valid: true, messages: [] }));
        }
        const handleChange = fieldCache.getOrSet(cacheKeys.onChange, async (value) => {
            var _a, _b;
            dispatch(actions_1.setValue({ name, value, validating: !!((_a = validators) === null || _a === void 0 ? void 0 : _a.length) }));
            fieldCache.set(cacheKeys.changes, fieldCache.get(cacheKeys.changes) + 1);
            const dispatchValidators = !!((_b = validation) === null || _b === void 0 ? void 0 : _b.debounce) && fieldCache.get(cacheKeys.changes) > 1
                ? handleRunValidatorsDebounced
                : handleRunValidators;
            dispatchValidators(value);
        });
        return {
            name,
            value: inputState.values[name],
            touched: inputState.touched[name],
            validation: fieldCache.get(cacheKeys.validationProp),
            validating: inputState.validating[name],
            onChange: handleChange,
            onBlur: fieldCache.getOrSet(cacheKeys.onBlur, (value) => {
                var _a;
                if ((_a = validation) === null || _a === void 0 ? void 0 : _a.onBlur) {
                    handleChange(value);
                }
            }),
            onRemove: fieldCache.getOrSet(cacheKeys.onRemove, () => {
                dispatch(actions_1.removeField(name));
            }),
        };
    };
    return { inputState, inputProps: inputProps };
}
exports.useOxin = useOxin;
//# sourceMappingURL=hook.js.map