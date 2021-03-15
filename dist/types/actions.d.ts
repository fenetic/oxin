import { RemoveInputAction, SetValidationAction, SetValueAction, ValidationState } from './types';
export declare const setValue: <K, T>(payload: {
    name: K;
    value: T;
    fromInitial?: boolean | undefined;
    validating: boolean;
}) => SetValueAction<K, T>;
export declare const setValidation: <K>(payload: {
    fieldName: K;
    validation: ValidationState;
    fromInitial?: boolean | undefined;
    validationMessage?: any;
}) => SetValidationAction<K>;
export declare const removeField: <K>(name: K) => RemoveInputAction<K>;
