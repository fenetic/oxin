import { Reducer } from 'react';

import {
  Action,
  ActionType,
  InputState,
  SetValueAction,
  SetValidationAction,
  RemoveInputAction,
  SetFocussedAction,
  SetBlurredAction,
} from './types';

import { allFieldsValid } from './validation';

export const createInitialState = <Inputs>(): InputState<Inputs> => ({
  touched: {},
  valid: true,
  validating: {},
  validation: {},
  values: {},
  blurred: {},
  focussed: null,
  changing: {},
});

export type OxinReducer<Inputs> = (
  state: InputState<Inputs>,
  action: Action<Inputs>,
) => InputState<Inputs>;

export const createReducer = <Inputs>(): Reducer<
  InputState<Inputs>,
  Action<Inputs>
> => (state, action) => {
  switch (action.type) {
    case ActionType.SET_VALUE: {
      const {
        payload: { fromInitial, name, value },
      } = action as SetValueAction<keyof Inputs, unknown>;

      const newState: InputState<Inputs> = {
        ...state,
        touched: {
          ...state.touched,
          [name]: !fromInitial,
        },
        values: {
          ...state.values,
          [name]: value,
        },
        validating: {
          ...state.validating,
          [name]: true,
        },
        changing: {
          ...Object.keys(state.changing).reduce((acc: any, curr) => {
            acc[curr] = false;
            return acc;
          }, {}),
          [name]: !fromInitial,
        },
        focussed: !fromInitial ? name : null,
      };

      return newState;
    }

    case ActionType.SET_VALIDATION: {
      const {
        payload: { fieldName, validation },
      } = action as SetValidationAction<keyof Inputs>;

      const newState: InputState<Inputs> = {
        ...state,
        validating: {
          ...state.validating,
          [fieldName]: false,
        },
        validation: {
          ...state.validation,
          [fieldName]: {
            ...state.validation[fieldName],
            ...validation,
          },
        },
      };

      newState.valid = allFieldsValid(newState);

      return newState;
    }

    case ActionType.SET_BLURRED: {
      const {
        payload: { fieldName },
      } = action as SetBlurredAction<keyof Inputs>;

      const newState: InputState<Inputs> = {
        ...state,
        focussed: null,
        touched: {
          ...state.touched,
          [fieldName]: true,
        },
        blurred: {
          ...state.blurred,
          [fieldName]: true,
        },
        changing: {
          ...Object.keys(state.changing).reduce((acc: any, curr) => {
            acc[curr] = false;
            return acc;
          }, {}),
        },
      };

      return newState;
    }

    case ActionType.SET_FOCUSSED: {
      const {
        payload: { fieldName },
      } = action as SetFocussedAction<keyof Inputs>;

      const newState: InputState<Inputs> = {
        ...state,
        focussed: fieldName,
        changing: {
          ...Object.keys(state.changing).reduce((acc: any, curr) => {
            acc[curr] = false;
            return acc;
          }, {}),
        },
      };

      return newState;
    }

    case ActionType.REMOVE_FIELD: {
      const {
        payload: { name },
      } = action as RemoveInputAction<keyof Inputs>;

      const newState = {
        ...state,
      };

      delete newState.touched[name as keyof Inputs];
      delete newState.validation[name as keyof Inputs];
      delete newState.values[name as keyof Inputs];
      delete newState.validating[name as keyof Inputs];

      newState.valid = allFieldsValid(newState);

      return newState;
    }
    default:
      return state;
  }
};
