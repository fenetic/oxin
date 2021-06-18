import React, { useEffect, useState } from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestForm, TestInput } from '../test-components';
import { VisibilityCallback } from '../types';

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

jest.useRealTimers();

const Form = ({ showValidation }: { showValidation?: VisibilityCallback }) => {
    // Using this state to test the use of boolean validation tests (input5)
    const [validationTestState, setValidationTestState] = useState(false);
  
    useEffect(() => {
      setValidationTestState(true);
    }, []);
  
    return (
      <TestForm>
        {(_inputState, propsCreator) => {
          return (
            <>
              <TestInput
                {...propsCreator({
                  name: 'with-visibility-function',
                  validators: [
                    [
                      maxLength,
                      '¡¡demasiado!!',
                    ],
                  ],
                  validation: { showValidation }
                })}
                data-testid='with-visibility-function'
              />

              <TestInput
                {...propsCreator({
                  name: 'without-visibility-function',
                  validators: [
                    [
                      maxLength,
                      '¡¡demasiado!!',
                    ],
                  ],
                })}
                data-testid='without-visibility-function'
              />
            </>
          );
        }}
      </TestForm>
    );
  };
describe('validation-visibility', () => {
  describe('without a showValidation function', () => {
    test('shows validation on change as normal', async () => {
      const { findByTestId } = render(<Form />);
      const inputWithVisibilityFunction = await findByTestId('input-with-visibility-function');

      await act(async () => {
        await userEvent.type(inputWithVisibilityFunction, 'Me gustas cuando callas', { delay: 1 });
      });

      const showValid = await findByTestId('listeningToShowValidation-with-visibility-function');
      const valid = await findByTestId('valid-with-visibility-function');
      expect(inputWithVisibilityFunction.getAttribute('value')).toBe('Me gustas cuando callas');
      expect(valid.textContent).toBe('false')
      expect(showValid.textContent).toBe('false');
    });
  });

  describe('with a showValidation function', () => {
    test('uses a function prop to determine visibility', async () => {
      const never = () => false;

      const { queryByTestId, findByTestId } = render(<Form showValidation={never} />);

      const inputWithVisibilityFunction = await findByTestId('input-with-visibility-function');
      
      await act(async () => {
        await userEvent.type(inputWithVisibilityFunction, 'Me gustas cuando callas', { delay: 1 });
      });
      const valid = await findByTestId('valid-with-visibility-function');
      const showValid = await queryByTestId('listeningToShowValidation-with-visibility-function');
      expect(valid.textContent).toBe('false')
      expect(showValid).toBe(null);
    });

    test('uses context of form as arguments to showValidation', async () => {
      const never: VisibilityCallback = ({ blurred }) => blurred;

      const { queryByTestId, findByTestId } = render(<Form showValidation={never} />);

      const inputWithVisibilityFunction = await findByTestId('input-with-visibility-function');
      const inputNoVisibilityFunction = await findByTestId('input-without-visibility-function');
      
      await act(async () => {
        await userEvent.type(inputNoVisibilityFunction, 'Me gustas cuando callas', { delay: 1 });
        await userEvent.type(inputWithVisibilityFunction, 'Me gustas cuando callas', { delay: 1 });
      });

      const showValid = await queryByTestId('listeningToShowValidation-with-visibility-function');

      await findByTestId('listeningToShowValidation-without-visibility-function');
      expect(showValid).toBe(null);

      await act(async () => {
        await fireEvent.blur(inputWithVisibilityFunction);
      });

      await findByTestId('listeningToShowValidation-with-visibility-function');
    })
  })
})