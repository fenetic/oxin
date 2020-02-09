import { ValidatorCreator, ValidatorFunction } from './types';

/**
 * Valid if value is truthy.
 */
export const required: ValidatorFunction = function required(value: any) {
  return value === false || value === 0 || !!value;
};

/**
 * Valid if value is numeric.
 */
export const numeric: ValidatorFunction = function numeric(
  value: string | number,
) {
  return typeof value === 'string'
    ? /^\d+(.\d+?)?$/.test(value)
    : !isNaN(value);
};

/**
 * String validator
 * Valid if value has length and is not under given length.
 */
export const minLength: ValidatorCreator<number> = length =>
  function minLength(value: string) {
    return !!(value && value.length && !(value.length < length));
  };

/**
 * String validator
 * Valid if value has length and is not over given length.
 */
export const maxLength: ValidatorCreator<number> = length =>
  function maxLength(value: string) {
    return !!(value && value.length && !(value.length > length));
  };
/**
 * Regex validator
 * Valid if regex matches value
 */
export const mustMatch: ValidatorCreator<RegExp> = regex =>
  function mustMatch(value: string) {
    return regex.test(value);
  };

/**
 * Regex validator
 * Valid if regex _does not_ match value
 */
export const mustNotMatch: ValidatorCreator<RegExp> = regex =>
  function mustNotMatch(value: string) {
    return !regex.test(value);
  };

/**
 * Object validator (shallow)
 * Takes key/value pairs. Valid if all values are equal (strict).
 */
export const allEqual: ValidatorFunction = function allEqual(values: {
  [k: string]: any;
}) {
  const valueEntries = values && Object.entries(values);

  return (
    !!valueEntries &&
    valueEntries.every(value => value[1] === valueEntries[0][1])
  );
};

/**
 * Object validator (shallow)
 * Takes key/value pairs. Valid if all values have value
 */
export const allRequired: ValidatorFunction = function allRequired(values: {
  [k: string]: any;
}) {
  const valueEntries = values && Object.entries(values);

  return !!values && valueEntries.every(value => required(value[1]));
};
