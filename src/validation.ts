import {
  InputState,
  Validator,
  ValidationState,
  ValidatorTuple,
} from './types';

/**
 * Verify all fields in validation state are valid
 */
export const allFieldsValid = (state: InputState): boolean =>
  Object.keys(state.validation)
    .map((field) => state.validation[field] as ValidationState)
    .map((validations) =>
      Object.keys(validations).map((key) => validations[key].valid),
    )
    .reduce<boolean>((acc, curr) => (!acc ? acc : curr.every((i) => i)), true);

/**
 * Returns a filtered array of validators where the `test` prop is a boolean value
 */
export const getBooleanValidators = (
  validators: (Validator | ValidatorTuple)[],
): (Validator | ValidatorTuple)[] =>
  validators.reduce<(Validator | ValidatorTuple)[]>((validators, validator) => {
    const typeOfValidator = Array.isArray(validator)
      ? typeof validator[0].test
      : typeof validator.test;
    return typeOfValidator === 'boolean'
      ? [...validators, validator]
      : validators;
  }, []);

/**
 * Get a name for a validator.
 */
const getValidatorName = (validator: Validator | ValidatorTuple) =>
  Array.isArray(validator) ? validator[0].name : validator.name;

/**
 * Merges an array of validators into another.
 */
export const mergeValidators = (
  merge: (Validator | ValidatorTuple)[],
  into: (Validator | ValidatorTuple)[],
): (Validator | ValidatorTuple)[] => {
  const intoFiltered = merge.length
    ? into.filter((validator) =>
        merge
          .map(getValidatorName)
          .some(
            (validatorName) => validatorName !== getValidatorName(validator),
          ),
      )
    : into;

  const merged = [...intoFiltered, ...merge];

  return merged;
};

/**
 * Returns the result of a validator function or a validator's `test` property
 * if said `test` prop is a boolean value.
 */
const runValidator = async (
  validator: Validator | ValidatorTuple,
  value: any,
): Promise<{ name: string; valid: boolean; message?: string }> => {
  // TODO: Maybe we should test if `validatorDefinition` is a function
  // and allow for original validator patterns which were pretty tidy.
  const setResult = async (validatorDefinition: Validator): Promise<boolean> =>
    typeof validatorDefinition.test === 'function'
      ? await validatorDefinition.test(value)
      : validatorDefinition.test;

  return {
    name: Array.isArray(validator) ? validator[0].name : validator.name,
    valid: await setResult(Array.isArray(validator) ? validator[0] : validator),
    message: Array.isArray(validator) ? validator[1] : undefined,
  };
};

export const runValidators = async (
  validators: (Validator | ValidatorTuple)[],
  value: any,
  batchId: string,
): Promise<{ validationState: ValidationState; batchId: string }> => {
  const resolved = await Promise.all(
    validators.map(async (validator) => await runValidator(validator, value)),
  );

  return {
    validationState: resolved.reduce<ValidationState>(
      (state, validatorResult) => {
        return {
          ...state,
          [validatorResult.name]: {
            valid: validatorResult.valid,
            message: validatorResult.message,
          },
        };
      },
      {},
    ),
    batchId,
  };
};
