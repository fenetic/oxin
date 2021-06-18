import {
  ActionType,
  RemoveInputAction,
  SetValidationAction,
  SetValueAction,
  SetVisibilityAction,
  SetBlurredAction,
  SetFocussedAction,
  ValidationState,
} from './types';

export const setValue = <K, T>(payload: {
  name: K;
  value: T;
  fromInitial?: boolean;
  validating: boolean;
}): SetValueAction<K, T> => ({
  payload,
  type: ActionType.SET_VALUE,
});

export const setValidation = <K>(payload: {
  fieldName: K;
  validation: ValidationState;
  fromInitial?: boolean;
  validationMessage?: any;
}): SetValidationAction<K> => {
  return {
    payload: {
      fieldName: payload.fieldName,
      validation: payload.validationMessage
        ? Object.entries(payload.validation).reduce<ValidationState>(
            (acc, curr) => ({
              ...acc,
              [curr[0]]: {
                ...curr[1],
                message: payload.validationMessage,
              },
            }),
            {},
          )
        : payload.validation,
    },
    type: ActionType.SET_VALIDATION,
  };
};

export const setValidationVisibilty = <K>(payload: {
  fieldName: K;
  visibile: boolean;
}): SetVisibilityAction<K> => ({
  type: ActionType.SET_VISIBILITY,
  payload
});

export const setBlurred = <K>(
  fieldName: K
): SetBlurredAction<K> => ({
  type: ActionType.SET_BLURRED,
  payload: { fieldName }
});

export const setFocussed = <K>(
  fieldName: K
): SetFocussedAction<K> => ({
  type: ActionType.SET_FOCUSSED,
  payload: { fieldName }
});

export const removeField = <K>(name: K): RemoveInputAction<K> => ({
  payload: {
    name,
  },
  type: ActionType.REMOVE_FIELD,
});
