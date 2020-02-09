import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestForm, TestMulti } from '../test-components';

const Form = () => {
  return (
    <TestForm>
      {(inputState, propsCreator) => (
        <>
          <TestMulti propsCreator={propsCreator} />
        </>
      )}
    </TestForm>
  );
};

describe('Dynamic inputs', () => {
  test('Adding and removing fields', async () => {
    const { getAllByTestId, getByTestId } = render(<Form />);

    expect(getAllByTestId('fieldContainer').length).toBe(1);

    await act(async () => {
      await userEvent.click(getByTestId('addField'));
      await userEvent.click(getByTestId('addField'));
    });

    expect(getAllByTestId('fieldContainer').length).toBe(3);

    await act(async () => {
      await userEvent.click(getByTestId('remove-field1'));
    });

    expect(getAllByTestId('fieldContainer').length).toBe(2);
  });
});
