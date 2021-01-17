import React, { useEffect, useState } from 'react';
import {
  act,
  render,
  cleanup,
  fireEvent,
  waitFor,
  RenderResult,
} from '@testing-library/react';
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

const inputs: InputOptions[] = [
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
            <span data-testid="allValid">{inputState.valid.toString()}</span>
          </>
        );
      }}
    </TestForm>
  );
};

let renderResult = {} as RenderResult;

describe('Props', () => {
  afterEach(cleanup);

  test('initial', async () => {
    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId } = renderResult;

    expect(getByTestId('input-test1').getAttribute('value')).toBe(
      'Initial value',
    );
  });

  test('value', async () => {
    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId } = renderResult;
    const input1 = getByTestId('input-test1');
    const input2 = getByTestId('input-test3');

    // Using `waitFor` in this "creative" way, in combination with `delay: 1`
    // appears to be the only way to avoid `act` warnings and timeouts.
    await waitFor(async () => {
      await userEvent.clear(input1);
      await userEvent.type(input1, 'Helo uno', { delay: 1 });
      await userEvent.type(input2, 'Helo deuxo', { delay: 1 });
    });

    expect(input1.getAttribute('value')).toBe('Helo uno');
    expect(input2.getAttribute('value')).toBe('Helo deuxo');
  });

  test('valid', async () => {
    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId } = renderResult;

    const input2 = getByTestId('input-test2');
    const input3 = getByTestId('input-test3');
    const valid1 = getByTestId('valid-test1');
    const valid2 = getByTestId('valid-test2');
    const valid3 = getByTestId('valid-test3');

    await waitFor(async () => {
      await userEvent.clear(input3);
      await userEvent.type(input2, 'Valid');
      await userEvent.type(input3, 'Not so valid', { delay: 1 });
    });

    expect(valid1.textContent).toBe('true');
    expect(valid2.textContent).toBe('true');
    expect(valid3.textContent).toBe('false');

    await waitFor(async () => {
      await userEvent.clear(input3);
      await userEvent.type(input3, 'Also valid');
    });

    expect(valid3.textContent).toBe('true');
  });

  test('allValid', async () => {
    jest.useFakeTimers();

    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId, rerender } = renderResult;

    const input2 = getByTestId('input-test2');
    const input3 = getByTestId('input-test3');
    const input4 = getByTestId('input-test4');
    const input5 = getByTestId('input-test5');
    const allValid = getByTestId('allValid');

    expect(allValid.textContent).toBe('false');

    rerender(<Form />);

    await waitFor(async () => {
      await userEvent.type(input2, 'Valid');
      await userEvent.type(input3, 'Also valid');
      await userEvent.type(input4, 'Correcto');
      await userEvent.type(input5, 'Hello');

      jest.runAllTimers();
    });

    expect(allValid.textContent).toBe('true');
  });

  test('external state validation', async () => {
    await waitFor(() => {
      renderResult = render(<Form />);
    });

    const { getByTestId } = renderResult;

    expect(getByTestId('validating-test5').textContent).toBe('false');
    expect(getByTestId('valid-test5').textContent).toBe('false');

    await waitFor(async () => {
      await userEvent.type(getByTestId('input-test5'), 'Hello');
    });

    expect(getByTestId('validating-test5').textContent).toBe('false');
    expect(getByTestId('valid-test5').textContent).toBe('true');

    await waitFor(async () => {
      await userEvent.click(getByTestId('test5-valid-state-toggle'));
    });

    expect(getByTestId('validating-test5').textContent).toBe('false');
    expect(getByTestId('valid-test5').textContent).toBe('false');
  });

  test('validationMessages', async () => {
    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId, queryByTestId } = renderResult;
    const input3 = getByTestId('input-test3');

    await waitFor(async () => {
      await userEvent.clear(input3);
      await userEvent.type(input3, 'Not so valid');
    });

    expect(getByTestId('valid-test1').textContent).toBe('true');
    expect(queryByTestId('validationMessages-test1')).not.toBeInTheDocument();
    expect(getByTestId('valid-test2').textContent).toBe('false');
    expect(queryByTestId('validationMessages-test2')).not.toBeInTheDocument();
    expect(getByTestId('valid-test3').textContent).toBe('false');
    expect(getByTestId('validationMessages-test3').textContent).toBe(
      'Too much',
    );
  });

  test('validation onBlur', async () => {
    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId } = renderResult;

    const input2 = getByTestId('input-test2');
    const input3 = getByTestId('input-test3');
    const messages3 = getByTestId('validationMessages-test3');
    const valid2 = getByTestId('valid-test2');
    const valid3 = getByTestId('valid-test3');
    const touched2 = getByTestId('touched-test2');
    const touched3 = getByTestId('touched-test3');

    await waitFor(async () => {
      await fireEvent.blur(input2);
      await fireEvent.blur(input3);
    });

    expect(valid2.textContent).toBe('false');
    expect(touched2.textContent).toBe('false');
    expect(valid3.textContent).toBe('false');
    expect(touched3.textContent).toBe('true');
    expect(messages3.textContent).toBe('Give it some');
  });

  test('async validation', async () => {
    jest.useFakeTimers();

    await act(async () => {
      renderResult = render(<Form />);
    });
    const { getByTestId } = renderResult;

    const input1 = getByTestId('input-test1');
    const validating1 = getByTestId('validating-test1');
    const input4 = getByTestId('input-test4');
    const messages4 = getByTestId('validationMessages-test4');
    const valid4 = getByTestId('valid-test4');
    const validating4 = getByTestId('validating-test4');

    await waitFor(async () => {
      await userEvent.type(input4, 'Correcto', { delay: 1 });

      jest.runAllTimers();
    });

    expect(valid4.textContent).toBe('true');
    expect(messages4).not.toBeInTheDocument();

    // Testing the "validating" state with the debounced validator (input4)
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
