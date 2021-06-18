export declare type Oxin<Inputs> = {
    inputState: InputState<Inputs>;
    inputProps: <K extends keyof Inputs>(options: InputOptions<K, Inputs[K]>) => OxinProps<K, Inputs[K]>;
};
export interface InputState<Inputs> {
    valid: boolean;
    touched: Partial<Record<keyof Inputs, boolean>>;
    validation: Partial<Record<keyof Inputs, ValidationState | undefined>>;
    validating: Partial<Record<keyof Inputs, boolean | undefined>>;
    values: Partial<{
        [K in keyof Inputs]: Inputs[K];
    }>;
    blurred: Partial<Record<keyof Inputs, number>>;
    focussed: keyof Inputs | null;
    changing: Partial<Record<keyof Inputs, boolean>>;
}
export interface InputOptions<K, T> {
    initialValue?: T;
    name: K;
    validation?: OptionsValidation;
    validators?: (Validator | ValidatorTuple)[];
    validationMessage?: any;
}
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
export interface VisibilityCallbackProps {
    touched: boolean;
    blurred: boolean;
    currentFocussed: string | null;
    isFocussed: boolean;
    validation: ValidationProps;
    hadChanged: boolean;
}
export declare type VisibilityCallback = (props: VisibilityCallbackProps) => boolean;
export interface OptionsValidation {
    debounce?: number;
    onBlur?: boolean;
    initialValue?: boolean;
    showValidation?: (props: VisibilityCallbackProps) => boolean;
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
export interface ValidationProps {
    valid: boolean;
    messages: any[];
}
export interface OxinProps<K = string, T = any> {
    name: K;
    value?: T;
    validation?: ValidationProps;
    validating: boolean;
    touched: boolean;
    onChange: (value: T) => void;
    onBlur: (value: T) => void;
    onRemove: () => void;
    showValidation: boolean;
}
export declare enum ActionType {
    SET_INITIAL = "SET_INITIAL",
    SET_VALUE = "SET_VALUE",
    SET_VALIDATION = "SET_VALIDATION",
    SET_VALIDATING = "SET_VALIDATING",
    SET_VISIBILITY = "SET_VISIBILITY",
    SET_FOCUSSED = "SET_FOCUSSED",
    SET_BLURRED = "SET_BLURRED",
    REMOVE_FIELD = "REMOVE_FIELD"
}
export interface BaseAction {
    type: ActionType;
}
export interface SetValueAction<K, T> extends BaseAction {
    payload: {
        name: K;
        value: T;
        fromInitial?: boolean;
    };
}
export interface SetValidationAction<K> extends BaseAction {
    payload: {
        fieldName: K;
        validation: ValidationState;
        validationMessage?: unknown;
    };
}
export interface SetVisibilityAction<K> extends BaseAction {
    payload: {
        fieldName: K;
        visibile: boolean;
    };
}
export interface SetBlurredAction<K> extends BaseAction {
    payload: {
        fieldName: K;
    };
}
export interface SetFocussedAction<K> extends BaseAction {
    payload: {
        fieldName: K;
    };
}
export interface RemoveInputAction<K> extends BaseAction {
    payload: {
        name: K;
    };
}
export declare type Action<Inputs> = SetValueAction<keyof Inputs, unknown> | SetValidationAction<keyof Inputs> | SetVisibilityAction<keyof Inputs> | SetBlurredAction<keyof Inputs> | SetFocussedAction<keyof Inputs> | RemoveInputAction<keyof Inputs>;
