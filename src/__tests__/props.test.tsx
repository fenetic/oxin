import React, { useEffect, useState } from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestForm, TestInput } from '../test-components';
import { InputOptions } from '../types';

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

const required = {
  name: 'required',
  test: (value: string) => !!value && !!value.length,
};
const maxLength = {
  name: 'maxLength',
  test: (value: string) => (value ? value.length <= 10 : true),
};
const asyncCheck = {
  name: 'asyncCheck',
  test: async (value: string) => {
    (() => new Promise((res) => setTimeout(res, 600)))();

    return value === 'Correcto';
  },
};

const inputs: InputOptions<string, string>[] = [
  { name: 'test1', initialValue: 'Initial value' },
  {
    name: 'test2',
    validators: [required],
  },
  {
    name: 'test3',
    validators: [
      [required, 'Give it some'],
      [maxLength, 'Too much'],
    ],
    validation: {
      onBlur: true,
    },
  },
  {
    name: 'test4',
    validators: [[asyncCheck, 'Not today']],
    validation: {
      debounce: 500,
    },
  },
  {
    name: 'test5',
  },
  {
    name: 'test6',
    validators: [
      [required, 'Never'],
      [maxLength, 'Nevernevernever'],
    ],
    validationMessage: 'One message to rule them all',
  },
];

const Form = () => {
  // Using this state to test the use of boolean validation tests (input5)
  const [validationTestState, setValidationTestState] = useState(false);

  useEffect(() => {
    setValidationTestState(true);
  }, []);

  return (
    <TestForm>
      {(inputState, propsCreator) => {
        return (
          <>
            <TestInput {...propsCreator(inputs[0])} />
            <TestInput {...propsCreator(inputs[1])} />
            <TestInput {...propsCreator(inputs[2])} />
            <TestInput {...propsCreator(inputs[3])} />
            <TestInput
              {...propsCreator({
                ...inputs[4],
                validators: [
                  [required, 'Give it some'],
                  [
                    {
                      name: 'stateValidator',
                      test: validationTestState,
                    },
                    'the state of that',
                  ],
                ],
              })}
            />
            <button
              onClick={() => setValidationTestState(!validationTestState)}
              data-testid="test5-valid-state-toggle"
            >
              Toggle valid state
            </button>
            <TestInput {...propsCreator(inputs[5])} />
            <span data-testid="allValid">{inputState.valid.toString()}</span>
          </>
        );
      }}
    </TestForm>
  );
};

// MUY IMPORTANTE: Tell jest to use real timers or all our async stuff times out.
jest.useRealTimers();

describe('Props', () => {
  test('initial', async () => {
    const { findByTestId } = render(<Form />);
    const input = await findByTestId('input-test1');

    expect(input.getAttribute('value')).toBe('Initial value');
  });

  test('value', async () => {
    const { findByTestId } = render(<Form />);
    const testId1 = 'input-test1';
    const testId2 = 'input-test3';
    const input1 = await findByTestId(testId1);
    const input2 = await findByTestId(testId2);

    await act(async () => {
      await userEvent.clear(input1);
      await userEvent.type(input1, 'Helo uno', { delay: 1 });
      await userEvent.type(input2, 'Helo deuxo', { delay: 1 });
    });

    expect(input1.getAttribute('value')).toBe('Helo uno');
    expect(input2.getAttribute('value')).toBe('Helo deuxo');
  });

  test('valid', async () => {
    const { findByTestId } = render(<Form />);

    const input2 = await findByTestId('input-test2');
    const input3 = await findByTestId('input-test3');
    const valid1 = await findByTestId('valid-test1');
    const valid2 = await findByTestId('valid-test2');
    const valid3 = await findByTestId('valid-test3');

    await act(async () => {
      await userEvent.clear(input3);
      await userEvent.type(input2, 'Valid');
      await userEvent.type(input3, 'Not so valid', { delay: 1 });
    });

    expect(valid1.textContent).toBe('true');
    expect(valid2.textContent).toBe('true');
    expect(valid3.textContent).toBe('false');
  });

  test('valid onBlur', async () => {
    const { findByTestId } = render(<Form />);

    const onBlurInput = await findByTestId('input-test3');
    const onBlurValid = await findByTestId('valid-test3');

    await act(async () => {
      await userEvent.clear(onBlurInput);
      await userEvent.type(onBlurInput, 'Valid', { delay: 1 });
    });

    expect(onBlurValid.textContent).toBe('true');
  })

  test('allValid', async () => {
    const { findByTestId } = render(<Form />);

    const input2 = await findByTestId('input-test2');
    const input3 = await findByTestId('input-test3');
    const input4 = await findByTestId('input-test4');
    const input5 = await findByTestId('input-test5');
    const input6 = await findByTestId('input-test6');
    const allValid = await findByTestId('allValid');

    expect(allValid.textContent).toBe('false');

    await act(async () => {
      await userEvent.type(input2, 'Valid', { delay: 1 });
      await userEvent.type(input3, 'Also valid', { delay: 1 });
      await userEvent.type(input4, 'Correcto', { delay: 1 });
      await userEvent.type(input5, 'Hello', { delay: 1 });
      await userEvent.type(input6, 'Hi', { delay: 1 });
    });

    expect(allValid.textContent).toBe('true');
  });

  test('external state validation', async () => {
    const { findByTestId } = render(<Form />);
    const input5 = await findByTestId('input-test5');
    const validating5 = await findByTestId('validating-test5');
    const valid5 = await findByTestId('valid-test5');
    const valid5StateToggle = await findByTestId('test5-valid-state-toggle');

    expect(validating5.textContent).toBe('false');
    expect(valid5.textContent).toBe('false');

    await act(async () => {
      await userEvent.type(input5, 'Hello', { delay: 1 });
    });

    expect(validating5.textContent).toBe('false');
    expect(valid5.textContent).toBe('true');

    await act(async () => {
      await userEvent.click(valid5StateToggle);
    });

    expect(validating5.textContent).toBe('false');
    expect(valid5.textContent).toBe('false');
  });

  describe('validationMessages', () => {
    test('returns correct messages for individual validators', async () => {
      const { findByTestId, getByTestId, queryByTestId } = render(<Form />);
      const valid1 = await findByTestId('valid-test1');
      const valid2 = await findByTestId('valid-test2');
      const valid3 = await findByTestId('valid-test3');
      const input3 = await findByTestId('input-test3');

      await act(async () => {
        await userEvent.clear(input3);
        await userEvent.type(input3, 'Not so valid', { delay: 1 });
      });

      expect(valid1.textContent).toBe('true');
      expect(queryByTestId('validationMessages-test1')).not.toBeInTheDocument();
      expect(valid2.textContent).toBe('false');
      expect(queryByTestId('validationMessages-test2')).not.toBeInTheDocument();
      expect(valid3.textContent).toBe('false');
      expect(getByTestId('validationMessages-test3').textContent).toBe(
        'Too much',
      );
    });

    test('returns correct message if a global `validationMessage` supplied', async () => {
      const { findByTestId, queryByText } = render(<Form />);
      const input6 = await findByTestId('input-test6');

      await act(async () => {
        await userEvent.type(input6, 'in', { delay: 1 });
        await userEvent.clear(input6);
        await userEvent.tab();
      });

      expect(queryByText('Never')).not.toBeInTheDocument();
      expect(queryByText('Nevernevernever')).not.toBeInTheDocument();
      expect(queryByText('One message to rule them all')).toBeInTheDocument();

      await act(async () => {
        await userEvent.clear(input6);
        await userEvent.type(input6, 'Somethin‘ like a phenomenon');
      });

      expect(queryByText('Never')).not.toBeInTheDocument();
      expect(queryByText('Nevernevernever')).not.toBeInTheDocument();
      expect(queryByText('One message to rule them all')).toBeInTheDocument();
    });
  });

  test('validation onBlur', async () => {
    const { findByTestId } = render(<Form />);

    const input2 = await findByTestId('input-test2');
    const input3 = await findByTestId('input-test3');
    const messages3 = await findByTestId('validationMessages-test3');
    const valid2 = await findByTestId('valid-test2');
    const valid3 = await findByTestId('valid-test3');
    const touched2 = await findByTestId('touched-test2');
    const touched3 = await findByTestId('touched-test3');

    await act(async () => {
      await fireEvent.blur(input2);
      await fireEvent.blur(input3);
    });

    expect(valid2.textContent).toBe('false');
    expect(touched2.textContent).toBe('true');
    expect(valid3.textContent).toBe('false');
    expect(touched3.textContent).toBe('true');
    expect(messages3.textContent).toBe('Give it some');
  });

  test('async validation', async () => {
    const { findByTestId } = render(<Form />);

    const input1 = await findByTestId('input-test1');
    const validating1 = await findByTestId('validating-test1');
    const input4 = await findByTestId('input-test4');
    const messages4 = await findByTestId('validationMessages-test4');
    const valid4 = await findByTestId('valid-test4');
    const validating4 = await findByTestId('validating-test4');

    await act(async () => {
      await userEvent.type(input4, 'Correcto', { delay: 1 });
    });

    expect(valid4.textContent).toBe('true');
    expect(messages4).not.toBeInTheDocument();

    // Switch to fake timers so we can test "validating" state
    // as async validator does its thing on input 4
    jest.useFakeTimers();

    act(() => {
      userEvent.clear(input1);
      userEvent.clear(input4);
      userEvent.type(input1, 'No validators on Frank');
      userEvent.type(input4, 'Not so valid');
    });

    expect(valid4.textContent).toBe('true');
    expect(messages4).not.toBeInTheDocument();
    expect(validating1.textContent).toBe('true');
    expect(validating4.textContent).toBe('true');

    await act(async () => {
      jest.runAllTimers();
    });

    expect(valid4.textContent).toBe('false');
    expect(messages4.textContent).toBe('Not today');
    expect(validating1.textContent).toBe('false');
    expect(validating4.textContent).toBe('false');
  });
});
