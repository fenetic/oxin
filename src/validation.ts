import {
  InputState,
  OptionsValidators,
  ValidatorFunction,
  ValidatorFunctionAsync,
  ValidatorTuple,
  ValidationState,
} from './types';

export const allFieldsValid = (state: InputState) =>
  Object.keys(state.validation)
    .map(field => state.validation[field] as ValidationState)
    .map(validations =>
      Object.keys(validations).map(key => validations[key].valid),
    )
    .reduce((acc, curr) => (!acc ? acc : curr.every(i => i)), true);

export const runValidators = (
  validators: OptionsValidators,
  value: any,
  validationCallback: (
    result: boolean,
    validator: ValidatorFunction | ValidatorFunctionAsync | ValidatorTuple,
  ) => void,
) =>
  Promise.all(
    validators.map(validator => {
      return Promise.resolve(
        Array.isArray(validator) ? validator[0](value) : validator(value),
      ).then(result => validationCallback(result, validator));
    }),
  );
