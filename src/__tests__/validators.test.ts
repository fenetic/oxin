import {
  required,
  numeric,
  minLength,
  maxLength,
  mustMatch,
  mustNotMatch,
  allEqual,
  allRequired,
} from '../validators';

describe('required', () => {
  it('returns correct validation if value supplied', () => {
    expect(required('Some value')).toEqual(true);
    expect(required({ some: 'value' })).toEqual(true);
    expect(required(['Some value'])).toEqual(true);
    expect(required(true)).toEqual(true);
    expect(required(false)).toEqual(true);
    expect(required(0)).toEqual(true);
  });

  it('returns correct validation if no value supplied', () => {
    expect(required('')).toEqual(false);
    expect(required(undefined)).toEqual(false);
    expect(required(null)).toEqual(false);
  });
});

describe('numeric', () => {
  it('returns correct validation if value is numeric', () => {
    expect(numeric('1')).toEqual(true);
    expect(numeric('105.432')).toEqual(true);
    expect(numeric(1)).toEqual(true);
    expect(numeric(105.432)).toEqual(true);
  });

  it('returns correct validation if value is not numeric', () => {
    expect(numeric('hey')).toEqual(false);
    expect(numeric({ ho: 'hum' })).toEqual(false);
  });
});

describe('minLength', () => {
  it('returns correct validation if value is equal to or over specified length', () => {
    expect(minLength(6)('onetwo')).toEqual(true);
    expect(minLength(6)('onetwothree')).toEqual(true);
  });

  it('returns correct validation if value under specified length', () => {
    expect(minLength(6)('one')).toEqual(false);
  });
});

describe('maxLength', () => {
  it('returns correct validation if value is under or equal to specified length', () => {
    expect(maxLength(6)('onetw')).toEqual(true);
    expect(maxLength(6)('onetwo')).toEqual(true);
  });

  it('returns correct validation if value is over specified length', () => {
    expect(maxLength(3)('onetwo')).toEqual(false);
  });
});

describe('mustMatch', () => {
  it('returns correct validation if value matches regex', () => {
    expect(mustMatch(/hello\?/)('hello?')).toEqual(true);
  });

  it('returns correct validation if value does not match regex', () => {
    expect(mustMatch(/hello\?/)('hello!')).toEqual(false);
  });
});

describe('mustNotMatch', () => {
  it('returns correct validation if value does not match regex', () => {
    expect(mustNotMatch(/hello\?/)('hello!')).toEqual(true);
  });

  it('returns correct validation if value matches regex', () => {
    expect(mustNotMatch(/hello\?/)('hello?')).toEqual(false);
  });
});

describe('allEqual', () => {
  it('returns correct validation if all values are equal', () => {
    expect(
      allEqual({
        one: 'one',
        two: 'one',
        three: 'one',
      }),
    ).toEqual(true);
  });

  it('returns correct validation if some values are not equal', () => {
    expect(
      allEqual({
        one: 'one',
        two: 'two',
        three: 'one',
      }),
    ).toEqual(false);
  });
});

describe('allRequired', () => {
  it('returns correct validation if all values have value', () => {
    expect(
      allRequired({
        one: 'one',
        two: 1,
        three: 0,
        four: {},
      }),
    ).toEqual(true);
  });

  it('returns correct validation if any values do not have value', () => {
    expect(
      allRequired({
        one: 'one',
        two: 1,
        three: 0,
        four: {},
        five: undefined,
        six: null,
      }),
    ).toEqual(false);
  });
});
