import { RemoveInputAction, SetValidationAction, SetValueAction, SetVisibilityAction, SetBlurredAction, SetFocussedAction, ValidationState } from './types';
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
export declare const setValidationVisibilty: <K>(payload: {
    fieldName: K;
    visibile: boolean;
}) => SetVisibilityAction<K>;
export declare const setBlurred: <K>(fieldName: K) => SetBlurredAction<K>;
export declare const setFocussed: <K>(fieldName: K) => SetFocussedAction<K>;
export declare const removeField: <K>(name: K) => RemoveInputAction<K>;
