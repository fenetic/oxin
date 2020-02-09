import { InputState, OptionsValidators, ValidatorFunction, ValidatorFunctionAsync, ValidatorTuple } from './types';
export declare const allFieldsValid: (state: InputState) => boolean;
export declare const runValidators: (validators: OptionsValidators, value: any, validationCallback: (result: boolean, validator: ValidatorFunction | ValidatorFunctionAsync | ValidatorTuple) => void) => Promise<void[]>;
