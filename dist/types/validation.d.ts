import { InputState, Validator, ValidationState, ValidatorTuple } from './types';
export declare const validationEquals: (v1?: ValidationState | undefined, v2?: ValidationState | undefined) => boolean;
export declare const validatorsEquals: (v1: (Validator | ValidatorTuple)[], v2: (Validator | ValidatorTuple)[]) => boolean;
export declare const allFieldsValid: <Inputs>(state: InputState<Inputs>) => boolean;
export declare const getBooleanValidators: (validators: (Validator | ValidatorTuple)[]) => (Validator | ValidatorTuple)[];
export declare const mergeValidators: (merge: (Validator | ValidatorTuple)[], into: (Validator | ValidatorTuple)[]) => (Validator | ValidatorTuple)[];
export declare const runValidators: (validators: (Validator | ValidatorTuple)[], value: any, batchId: string) => Promise<{
    validationState: ValidationState;
    batchId: string;
}>;
