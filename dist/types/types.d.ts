export declare type UseOxin = {
    inputState: InputState;
    inputProps: OxinPropsFunction;
};
export declare type ValidatorCreator<S = any> = (settings: S) => Validator;
export declare type ValidatorFunction = (value: any) => ValidatorResult;
export declare type ValidatorFunctionAsync = (value: any) => Promise<ValidatorResult>;
export declare type ValidatorResult = boolean;
export declare type ValidatorMessage = any;
export interface Validator {
    name: string;
    test: boolean | ValidatorFunction | ValidatorFunctionAsync;
}
export declare type ValidatorTuple = [Validator, ValidatorMessage];
export declare type OptionsValidators = (Validator | ValidatorCreator)[];
export interface OptionsValidation {
    debounce?: number;
    onBlur?: boolean;
    initialValue?: boolean;
}
export interface ValidationState {
    [validatorName: string]: {
        valid: ValidatorResult;
        message?: ValidatorMessage;
    };
}
export interface ValidatingState {
    [fieldName: string]: string[];
}
export interface FormFields {
    [fieldName: string]: any;
}
export interface InputState {
    readonly valid: boolean;
    readonly touched: {
        [fieldName: string]: boolean;
    };
    readonly validation: {
        [fieldName: string]: ValidationState | undefined;
    };
    readonly validating: {
        [fieldName: string]: boolean;
    };
    readonly values: any;
}
export interface InputOptions {
    initialValue?: any;
    name: string;
    validation?: OptionsValidation;
    validators?: (Validator | ValidatorTuple)[];
}
export declare type OxinPropsFunction = (options: InputOptions) => OxinProps;
export interface ValidationProps {
    valid: boolean;
    messages: any[];
}
export interface OxinProps<T = any> {
    name: string;
    value?: T;
    validation?: ValidationProps;
    validating: boolean;
    touched: boolean;
    onChange: (value: T) => void;
    onBlur: (value: T) => void;
    onRemove: () => void;
}
export declare enum ActionType {
    SET_INITIAL = "SET_INITIAL",
    SET_VALUE = "SET_VALUE",
    SET_VALIDATION = "SET_VALIDATION",
    SET_VALIDATING = "SET_VALIDATING",
    REMOVE_FIELD = "REMOVE_FIELD"
}
export interface BaseAction {
    type: ActionType;
}
export interface SetValueAction extends BaseAction {
    payload: {
        name: string;
        value: any;
        fromInitial?: boolean;
    };
}
export interface SetValidationAction extends BaseAction {
    payload: {
        fieldName: string;
        validation: ValidationState;
    };
}
export interface RemoveInputAction extends BaseAction {
    payload: {
        name: string;
    };
}
export declare type Action = SetValueAction | SetValidationAction | RemoveInputAction;
