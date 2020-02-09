import { ValidatorCreator, ValidatorFunction } from './types';
export declare const required: ValidatorFunction;
export declare const numeric: ValidatorFunction;
export declare const minLength: ValidatorCreator<number>;
export declare const maxLength: ValidatorCreator<number>;
export declare const mustMatch: ValidatorCreator<RegExp>;
export declare const mustNotMatch: ValidatorCreator<RegExp>;
export declare const allEqual: ValidatorFunction;
export declare const allRequired: ValidatorFunction;
