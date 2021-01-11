import { InputState, Validator, ValidationState, ValidatorTuple } from './types';
export declare const allFieldsValid: (state: InputState) => boolean;
export declare const getBooleanValidators: (validators: (Validator | ValidatorTuple)[]) => (Validator | ValidatorTuple)[];
export declare const mergeValidators: (merge: (Validator | ValidatorTuple)[], into: (Validator | ValidatorTuple)[]) => (Validator | ValidatorTuple)[];
export declare const runValidators: (validators: (Validator | ValidatorTuple)[], value: any, batchId: string) => Promise<{
    validationState: ValidationState;
    batchId: string;
}>;
