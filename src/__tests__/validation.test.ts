import { ValidationState, Validator, ValidatorTuple } from '../types';
import {
  validationEquals,
  validatorsEquals,
  getValidatorName,
} from '../validation';

const validation1: ValidationState = {
  someValidator: {
    valid: true,
    message: 'Some validation message',
  },
  someOtherValidator: {
    valid: false,
    message: 'Some other validation message',
  },
};

const validation2: ValidationState = {
  someValidator: {
    valid: true,
    message: 'Some validation message',
  },
  someOtherValidator: {
    valid: true,
    message: 'Some other validation message',
  },
};

const validator1: Validator = {
  name: 'myCoolValidator',
  test: (value: string) => value !== '',
};

const validator2: Validator = {
  name: 'myOtherCoolValidator',
  test: (value: string) => value !== '',
};

const validatorTuple1: ValidatorTuple = [
  { name: 'myCoolValidatorTuple', test: (value: string) => value !== '' },
  'My validation message',
];

const validatorTuple2: ValidatorTuple = [
  { name: 'myOtherCoolValidatorTuple', test: (value: string) => value !== '' },
  'My other validation message',
];

describe('Validator functions', () => {
  describe('validationEquals()', () => {
    test('returns true if validation states are identical', () => {
      const v1 = { ...validation1 };
      const v2 = { ...validation1 };

      expect(validationEquals(v1, v2)).toBe(true);
    });

    test('returns false if validation states are not identical', () => {
      const v1 = { ...validation1 };
      const v2 = { ...validation2 };

      expect(validationEquals(v1, v2)).toBe(false);
    });

    test('returns false if either validation states are undefined', () => {
      const v1 = { ...validation1 };
      const v2 = { ...validation2 };

      expect(validationEquals(v1, undefined)).toBe(false);
      expect(validationEquals(undefined, v2)).toBe(false);
    });
  });

  describe('validatorsEquals()', () => {
    test('returns true if validators are identical', () => {
      const v1 = { ...validator1 };
      const v2 = { ...validator1 };

      expect(validatorsEquals([v1], [v2])).toBe(true);
    });

    test('returns false if validators are not identical', () => {
      const v1 = { ...validator1 };
      const v2 = { ...validator2 };

      expect(validatorsEquals([v1], [v2])).toBe(false);
    });

    test('returns true if validator tuples are identical', () => {
      const v1 = [...validatorTuple1];
      const v2 = [...validatorTuple1];

      expect(validatorsEquals(v1, v2)).toBe(true);
    });

    test('returns false if validator tuples are not identical', () => {
      const v1 = [...validatorTuple1];
      const v2 = [...validatorTuple2];

      expect(validatorsEquals(v1, v2)).toBe(false);
    });
  });

  describe('getValidatorName()', () => {
    test('returns validator name', () => {
      expect(getValidatorName(validator1)).toBe('myCoolValidator');
    });

    test('returns tuple name', () => {
      expect(getValidatorName(validatorTuple1)).toBe('myCoolValidatorTuple');
    });
  });
});
