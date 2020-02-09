import { act, renderHook } from '@testing-library/react-hooks';

import { useFormup } from '../hook';
import { FormupProps } from '../types';

describe('useFormup', () => {
  it('returns initial state', () => {
    const {
      result: { current },
    } = renderHook(() => useFormup());

    expect(current[0].touched).toEqual({});
    expect(current[0].validating).toEqual({});
    expect(current[0].valid).toBe(true);
    expect(current[0].values).toEqual({});
  });

  it('adds fields to state', async () => {
    const { result } = renderHook(() => useFormup());

    act(() => {
      result.current[1]({ name: 'myField', type: 'someType' });
      result.current[1]({ name: 'myOtherField', type: 'someOtherType' });
    });

    // touched, validating, values
    expect(result.current[0].touched).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current[0].validating).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current[0].values).toEqual({
      myField: null,
      myOtherField: null,
    });
  });

  describe('onChange', () => {
    it('updates field value', () => {
      const { result } = renderHook(() => useFormup());

      act(() => {
        const props = result.current[1]({ name: 'myField', type: 'someType' });

        props.onChange('Some value');
      });

      expect(result.current[0].values.myField).toBe('Some value');
    });
  });

  describe('onRemove', () => {
    it('removes a field', () => {
      const { result } = renderHook(() => useFormup());

      act(() => {
        result.current[1]({ name: 'myField', type: 'someType' });

        result.current[1]({
          name: 'myOtherField',
          type: 'someOtherType',
        });
      });

      expect(result.current[0].values).toEqual({
        myField: null,
        myOtherField: null,
      });

      expect(result.current[0].values).toEqual({
        myField: null,
        myOtherField: null,
      });
    });
  });

  it('handles validation state changes', async () => {
    let props = {} as FormupProps;
    const { result, waitForNextUpdate } = renderHook(() => useFormup());

    await act(async () => {
      props = result.current[1]({
        name: 'myField',
        validators: [
          function validator1(value: any) {
            return !!value;
          },
          [
            function validator2(value: any) {
              return value === true || value === null;
            },
            'Some validation message',
          ],
        ],
      });

      await waitForNextUpdate();
    });

    expect(result.current[0].valid).toEqual(false);
    expect(result.current[0].validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange([]);

      await waitForNextUpdate();
    });

    expect(result.current[0].valid).toEqual(false);
    expect(result.current[0].validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(false);

      await waitForNextUpdate();
    });

    expect(result.current[0].valid).toEqual(false);
    expect(result.current[0].validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(null);

      await waitForNextUpdate();
    });

    expect(result.current[0].valid).toEqual(false);
    expect(result.current[0].validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: true },
      },
    });

    await act(async () => {
      props.onChange(true);

      await waitForNextUpdate();
    });

    expect(result.current[0].valid).toEqual(true);
    expect(result.current[0].validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: true },
      },
    });
  });
});
