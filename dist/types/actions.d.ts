import { RemoveInputAction, SetValidationAction, SetValueAction, ValidationState } from './types';
export declare const setValue: (payload: {
    name: string;
    value: any;
    fromInitial?: boolean | undefined;
}) => SetValueAction;
export declare const setValidation: (payload: {
    fieldName: string;
    validation: ValidationState;
    fromInitial?: boolean | undefined;
    isFinal: boolean;
}) => SetValidationAction;
export declare const removeField: (name: string) => RemoveInputAction;
