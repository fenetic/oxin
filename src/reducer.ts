import {
  Action,
  ActionType,
  FormState,
  SetValueAction,
  SetValidationAction,
  RemoveInputAction,
} from './types';

import { allFieldsValid } from './validation';

export const initialState: FormState = {
  touched: {},
  valid: true,
  validating: {},
  validation: {},
  values: {},
};

export const reducer = (state = initialState, action: Action): FormState => {
  switch (action.type) {
    case ActionType.SET_VALUE: {
      const {
        payload: { fromInitial, name, value },
      } = action as SetValueAction;

      return {
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
          [name]: !fromInitial,
        },
      };
    }

    case ActionType.SET_VALIDATION: {
      const {
        payload: { fieldName, fromInitial, validation, isFinal },
      } = action as SetValidationAction;

      const newState = {
        ...state,
        validating: {
          ...state.validating,
          [fieldName]: !isFinal,
        },
        validation: fromInitial
          ? state.validation
          : {
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

    case ActionType.REMOVE_FIELD: {
      const {
        payload: { name },
      } = action as RemoveInputAction;

      const newState = {
        ...state,
      };

      delete newState.touched[name];
      delete newState.validation[name];
      delete newState.values[name];
      delete newState.validating[name];

      newState.valid = allFieldsValid(newState);

      return newState;
    }
    default:
      return state;
  }
};
