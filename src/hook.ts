import { useReducer, useRef } from 'react';
import debounce from 'lodash.debounce';
import { nanoid } from 'nanoid/non-secure';

import {
  InputOptions,
  OxinProps,
  ValidationProps,
  UseOxin,
  ValidationState,
  Validator,
  ValidatorTuple,
} from './types';

import { initialState, reducer } from './reducer';
import { setValue, removeField, setValidation } from './actions';
import {
  runValidators,
  getBooleanValidators,
  mergeValidators,
} from './validation';

interface Cache {
  getOrSet: (key: string, value: any) => any;
  set: (key: string, value: any) => Map<any, any>;
  has: (key: string) => boolean;
  get: (key: string) => any;
}

function useCache(): Cache {
  const cache = useRef(new Map());
  const has: Cache['has'] = (key) => cache.current.has(key);
  const get: Cache['get'] = (key) => cache.current.get(key);
  const set: Cache['set'] = (key, value) => cache.current.set(key, value);
  const getOrSet: Cache['getOrSet'] = (key, value) =>
    has(key) ? get(key) : set(key, value) && get(key);

  return { getOrSet, set, has, get };
}

// TODO: move to validation
const validationEquals = (v1: ValidationState, v2: ValidationState) => {
  const stringify = (obj: ValidationState) =>
    Object.values(obj)
      .map((val) => JSON.stringify(val))
      .join('');

  return stringify(v1) === stringify(v2);
};

const validatorsEquals = (
  v1: (Validator | ValidatorTuple)[],
  v2: (Validator | ValidatorTuple)[],
) => {
  return JSON.stringify(v1) === JSON.stringify(v2);
};

export function useOxin(): UseOxin {
  const [inputState, dispatch] = useReducer(reducer, initialState);
  const fieldCache = useCache();

  const inputProps = (inputOptions: InputOptions): OxinProps => {
    const {
      initialValue,
      name,
      validation,
      validators = [],
      validationMessage,
    } = inputOptions;
    const cacheKeys = {
      validationProp: `${name}-validationProp`,
      booleanValidators: `${name}-booleanValidators`,
      finalValidationBatchId: `${name}-finalValidationBatchId`,
      onChange: `${name}-onChange`,
      changes: `${name}-changes`,
      onBlur: `${name}-onBlur`,
      onRemove: `${name}-onRemove`,
    };

    // We're tracking input change count to conditionally perform debounced
    // validation behaviour
    fieldCache.getOrSet(cacheKeys.changes, 0);

    const handleRunValidators = async (value: any) => {
      const newBatchId = nanoid();

      fieldCache.set(cacheKeys.finalValidationBatchId, newBatchId);

      const {
        validationState,
        batchId: completedBatchId,
      } = await runValidators(
        // Merge cached (fresh) boolean validators with original in case
        // state updated externally.
        mergeValidators(
          fieldCache.get(cacheKeys.booleanValidators) || [],
          validators,
        ),
        value,
        newBatchId,
      );

      // Only update state after last validation batch
      if (
        completedBatchId === fieldCache.get(cacheKeys.finalValidationBatchId)
      ) {
        dispatch(
          setValidation({
            fieldName: name,
            validation: validationState,
          }),
        );
      }
    };

    const handleRunValidatorsDebounced = debounce(
      handleRunValidators,
      validation?.debounce || 0,
    );

    // If the field is new to the state, dispatch an initial setValue
    // to kick things off. This is how we dynamically add fields when
    // we call the props creator.
    if (!(name in inputState.values)) {
      dispatch(
        setValue({
          name,
          fromInitial: true,
          value: initialValue || null,
          validating: false,
        }),
      );

      handleRunValidators(initialValue);
    }

    const validationState = inputState.validation[name] || {};
    const cachedValidation = fieldCache.get(cacheKeys.validationProp);

    fieldCache.getOrSet(
      cacheKeys.booleanValidators,
      getBooleanValidators(validators),
    );

    // If cached boolean validators don't equal current boolean validators,
    // we need to update validation state.
    if (
      !validatorsEquals(
        getBooleanValidators(validators),
        fieldCache.get(cacheKeys.booleanValidators),
      )
    ) {
      fieldCache.set(
        cacheKeys.booleanValidators,
        getBooleanValidators(validators),
      );

      handleRunValidators(inputState.values[name]);
    }

    // Cache transformed validation state to prevent unnecessary renders
    if (
      !cachedValidation ||
      !validationEquals(cachedValidation, validationState)
    ) {
      fieldCache.set(
        cacheKeys.validationProp,
        Object.values(validationState).reduce<ValidationProps>(
          (acc, curr) => ({
            messages:
              !curr.valid && validationMessage
                ? [validationMessage]
                : !curr.valid && curr.message
                ? [...acc.messages, curr.message]
                : [...acc.messages],
            valid: acc.valid && curr.valid,
          }),
          { valid: true, messages: [] },
        ),
      );
    }

    const handleChange = fieldCache.getOrSet(
      cacheKeys.onChange,
      async (value: any) => {
        dispatch(setValue({ name, value, validating: !!validators.length }));

        fieldCache.set(
          cacheKeys.changes,
          fieldCache.get(cacheKeys.changes) + 1,
        );

        const dispatchValidators =
          !!validation?.debounce && fieldCache.get(cacheKeys.changes) > 1
            ? handleRunValidatorsDebounced
            : handleRunValidators;

        dispatchValidators(value);
      },
    );

    return {
      name,
      value: inputState.values[name],
      touched: inputState.touched[name],
      validation: fieldCache.get(cacheKeys.validationProp),
      validating: inputState.validating[name],
      onChange: handleChange,
      onBlur: fieldCache.getOrSet(cacheKeys.onBlur, (value: any) => {
        if (validation?.onBlur) {
          handleChange(value);
        }
      }),
      onRemove: fieldCache.getOrSet(cacheKeys.onRemove, () => {
        dispatch(removeField(name));
      }),
    };
  };

  return { inputState, inputProps };
}
