"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOxin = void 0;
const react_1 = require("react");
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const non_secure_1 = require("nanoid/non-secure");
const reducer_1 = require("./reducer");
const actions_1 = require("./actions");
const validation_1 = require("./validation");
function useCache() {
    const cache = react_1.useRef(new Map());
    const has = (key) => cache.current.has(key);
    const get = (key) => cache.current.get(key);
    const set = (key, value) => cache.current.set(key, value);
    const getOrSet = (key, value) => has(key) ? get(key) : set(key, value) && get(key);
    return { getOrSet, set, has, get };
}
function useOxin() {
    const [inputState, dispatch] = react_1.useReducer(reducer_1.createReducer(), reducer_1.createInitialState());
    const fieldCache = useCache();
    const inputProps = (inputOptions) => {
        const { initialValue, name, validation, validators = [], validationMessage, } = inputOptions;
        const cacheKeys = {
            validationProp: `${name}-validationProp`,
            validationState: `${name}-validationState`,
            booleanValidators: `${name}-booleanValidators`,
            finalValidationBatchId: `${name}-finalValidationBatchId`,
            onChange: `${name}-onChange`,
            changes: `${name}-changes`,
            onBlur: `${name}-onBlur`,
            onRemove: `${name}-onRemove`,
        };
        fieldCache.getOrSet(cacheKeys.changes, 0);
        const handleRunValidators = async (value) => {
            const newBatchId = non_secure_1.nanoid();
            fieldCache.set(cacheKeys.finalValidationBatchId, newBatchId);
            const { validationState, batchId: completedBatchId, } = await validation_1.runValidators(validation_1.mergeValidators(fieldCache.get(cacheKeys.booleanValidators) || [], validators), value, newBatchId);
            if (completedBatchId === fieldCache.get(cacheKeys.finalValidationBatchId)) {
                dispatch(actions_1.setValidation({
                    fieldName: name,
                    validation: validationState,
                    validationMessage,
                }));
            }
        };
        const handleRunValidatorsDebounced = lodash_debounce_1.default(handleRunValidators, (validation === null || validation === void 0 ? void 0 : validation.debounce) || 0);
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
        const cachedValidation = fieldCache.get(cacheKeys.validationState);
        fieldCache.getOrSet(cacheKeys.booleanValidators, validation_1.getBooleanValidators(validators));
        if (!validation_1.validatorsEquals(validation_1.getBooleanValidators(validators), fieldCache.get(cacheKeys.booleanValidators))) {
            fieldCache.set(cacheKeys.booleanValidators, validation_1.getBooleanValidators(validators));
            handleRunValidators(inputState.values[name]);
        }
        if (!cachedValidation ||
            !validation_1.validationEquals(cachedValidation, validationState)) {
            fieldCache.set(cacheKeys.validationState, validationState);
            fieldCache.set(cacheKeys.validationProp, Object.values(validationState).reduce((acc, curr) => ({
                messages: !curr.valid && validationMessage
                    ? [validationMessage]
                    : !curr.valid && curr.message
                        ? [...acc.messages, curr.message]
                        : [...acc.messages],
                valid: acc.valid && curr.valid,
            }), { valid: true, messages: [] }));
        }
        const runValidatorDispatch = (value) => {
            const dispatchValidators = !!(validation === null || validation === void 0 ? void 0 : validation.debounce) && fieldCache.get(cacheKeys.changes) > 1
                ? handleRunValidatorsDebounced
                : handleRunValidators;
            dispatchValidators(value);
        };
        const handleChange = fieldCache.getOrSet(cacheKeys.onChange, async (value) => {
            dispatch(actions_1.setValue({ name, value, validating: !!validators.length }));
            fieldCache.set(cacheKeys.changes, fieldCache.get(cacheKeys.changes) + 1);
        });
        return {
            name,
            value: inputState.values[name],
            touched: !!inputState.touched[name],
            validation: fieldCache.get(cacheKeys.validationProp),
            validating: !!inputState.validating[name],
            onChange: (value) => {
                handleChange(value);
                if (!(validation === null || validation === void 0 ? void 0 : validation.onBlur)) {
                    runValidatorDispatch(value);
                }
            },
            onBlur: fieldCache.getOrSet(cacheKeys.onBlur, (value) => {
                if (validation === null || validation === void 0 ? void 0 : validation.onBlur) {
                    handleChange(value);
                    runValidatorDispatch(value);
                }
            }),
            onRemove: fieldCache.getOrSet(cacheKeys.onRemove, () => {
                dispatch(actions_1.removeField(name));
            }),
        };
    };
    return { inputState, inputProps };
}
exports.useOxin = useOxin;
//# sourceMappingURL=hook.js.map