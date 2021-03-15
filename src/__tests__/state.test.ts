import { act, renderHook } from '@testing-library/react-hooks';

import { useOxin } from '../hook';
import { OxinProps } from '../types';
import { createInitialState, createReducer } from '../reducer';

describe('Oxin state', () => {
  it('reducer returns default state', () => {
    const reducer = createReducer();
    const initialState = createInitialState();

    expect(reducer(initialState, { type: 'SOME_ACTION' } as any)).toEqual(
      initialState,
    );
  });

  it('useOxin returns initial state', () => {
    const initialState = createInitialState();
    const {
      result: { current },
    } = renderHook(() => useOxin());

    expect(current.inputState).toEqual(initialState);
  });

  it('adds fields to state', async () => {
    const { result } = renderHook(() =>
      useOxin<{ myField: unknown; myOtherField: unknown }>(),
    );

    await act(async () => {
      await result.current.inputProps({ name: 'myField' });
      await result.current.inputProps({ name: 'myOtherField' });
    });

    // touched, validating, values
    expect(result.current.inputState.touched).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current.inputState.validating).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current.inputState.values).toEqual({
      myField: null,
      myOtherField: null,
    });
  });

  describe('onChange', () => {
    it('updates field value', async () => {
      const { result } = renderHook(() => useOxin<{ myField: string }>());

      await act(async () => {
        const props = result.current.inputProps({
          name: 'myField',
        });

        props.onChange('Some value');
      });

      expect(result.current.inputState.values.myField).toBe('Some value');
    });
  });

  describe('onRemove', () => {
    it('removes a field', async () => {
      const { result } = renderHook(() =>
        useOxin<{ myField: unknown; myOtherField: unknown }>(),
      );

      await act(async () => {
        await result.current.inputProps({ name: 'myField' });

        await result.current.inputProps({
          name: 'myOtherField',
        });
      });

      expect(result.current.inputState.values).toEqual({
        myField: null,
        myOtherField: null,
      });

      expect(result.current.inputState.values).toEqual({
        myField: null,
        myOtherField: null,
      });
    });
  });

  it('adds empty validation for field if no validators supplied', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOxin<{ myField: unknown }>(),
    );

    await act(async () => {
      result.current.inputProps({
        name: 'myField',
      });

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(true);
    expect(result.current.inputState.validation).toEqual({
      myField: {},
    });
  });

  it('handles validation state changes', async () => {
    let props = {} as OxinProps;
    const { result, waitForNextUpdate } = renderHook(() =>
      useOxin<{ myField: string }>(),
    );

    await act(async () => {
      props = result.current.inputProps({
        name: 'myField',
        validators: [
          { name: 'validator1', test: (value: any) => !!value },
          [
            {
              name: 'validator2',
              test: (value: any) => value === true || value === null,
            },
            'Some validation message',
          ],
        ],
      });

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange([]);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(false);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(null);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: true },
      },
    });

    await act(async () => {
      props.onChange(true);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(true);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: true },
      },
    });
  });

  it('applies global validationMessage to validators in state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOxin<{ myField: string }>(),
    );
    const testMessage = 'This is the badger badger badger badger';

    await act(async () => {
      result.current.inputProps({
        name: 'myField',
        validators: [
          { name: 'validator1', test: (value: any) => !!value },
          [
            {
              name: 'validator2',
              test: (value: any) => value === true || value === null,
            },
            'Some validation message that should never be applied',
          ],
        ],
        validationMessage: testMessage,
      });

      await waitForNextUpdate();
    });

    const { validation } = result.current.inputState;

    expect(validation.myField?.validator1?.message).toBe(testMessage);
    expect(validation.myField?.validator2?.message).toBe(testMessage);
  });
});
