import { useReducer, useRef } from 'react';
import debounce = require('lodash.debounce');

import {
  FieldOptions,
  FormupProps,
  ValidationProps,
  UseFormup,
  ValidationState,
  ValidatorResult,
  ValidatorMessage,
} from './types';

import { initialState, reducer } from './reducer';
import { setValue, removeField, setValidation } from './actions';
import { runValidators } from './validation';

interface Cache {
  getOrSet: (key: string, value: any) => any;
  set: (key: string, value: any) => Map<any, any>;
  has: (key: string) => boolean;
  get: (key: string) => any;
}

function useCache(): Cache {
  const cache = useRef(new Map());
  const has: Cache['has'] = key => cache.current.has(key);
  const get: Cache['get'] = key => cache.current.get(key);
  const set: Cache['set'] = (key, value) => cache.current.set(key, value);
  const getOrSet: Cache['getOrSet'] = (key, value) =>
    has(key) ? get(key) : set(key, value) && get(key);

  return { getOrSet, set, has, get };
}

const validationEquals = (v1: ValidationState, v2: ValidationState) => {
  const stringify = (obj: ValidationState) =>
    Object.values(obj)
      .map(val => JSON.stringify(val))
      .join('');

  return stringify(v1) === stringify(v2);
};

export function useFormup(): UseFormup {
  const [formState, dispatch] = useReducer(reducer, initialState);
  const fieldCache = useCache();

  const createProps = (fieldOptions: FieldOptions): FormupProps => {
    const { initial, name, validation, validators } = fieldOptions;
    const validatorCount = validators?.length || 0;
    const cacheKeys = {
      validationProp: `${name}-validationProp`,
      validationBatchCount: `${name}-validationBatchCount`,
      settledValidations: `${name}-settledValidations`,
      onChange: `${name}-onChange`,
      changes: `${name}-changes`,
      onBlur: `${name}-onBlur`,
      onRemove: `${name}-onRemove`,
    };

    // We're using counters to determine where we are when async validators
    // resolve. This helps provide good 'state UX' because we can mark fields
    // as 'validating' until all validators have run.
    // We're tracking settled validations and validation batch count so we can
    // update state on final validator resolution.
    // We're tracking input changes to conditionally perform certain validation
    // behaviours.
    fieldCache.getOrSet(cacheKeys.settledValidations, 0);
    fieldCache.getOrSet(cacheKeys.validationBatchCount, 0);
    fieldCache.getOrSet(cacheKeys.changes, 0);

    const handleSetValidation = (
      validatorName: string,
      result: ValidatorResult,
      message: ValidatorMessage,
    ) => {
      const settledValidations = fieldCache.get(cacheKeys.settledValidations);

      // Is final validator in batch?
      if (settledValidations === validatorCount - 1) {
        // All validators settled, one batch resolved
        fieldCache.set(cacheKeys.settledValidations, 0);
        fieldCache.set(
          cacheKeys.validationBatchCount,
          fieldCache.get(cacheKeys.validationBatchCount) - 1,
        );
      } else {
        fieldCache.set(cacheKeys.settledValidations, settledValidations + 1);
      }

      dispatch(
        setValidation({
          fieldName: name,
          validation: { [validatorName]: { valid: result, message } },
          // Only end validation if this is the final batch (as opposed to
          // final validator.)
          isFinal: fieldCache.get(cacheKeys.validationBatchCount) === 0,
        }),
      );
    };

    const handleRunValidators = (value: any) => {
      fieldCache.set(
        cacheKeys.validationBatchCount,
        fieldCache.get(cacheKeys.validationBatchCount) + 1,
      );
      // Async execute every validator (whether or not it was defined async),
      // and set validation state for the relevant input with each result.
      runValidators(validators || [], value, (result, validator) =>
        handleSetValidation(
          Array.isArray(validator) ? validator[0].name : validator.name,
          result,
          Array.isArray(validator) ? validator[1] : undefined,
        ),
      );
    };

    const handleRunValidatorsDebounced = debounce(
      handleRunValidators,
      validation?.debounce || 0,
    );

    // If the field is new to the state, dispatch an initial setValue
    // to kick things off. This is how we dynamically add fields when
    // we call the props creator.
    if (!(name in formState.values)) {
      dispatch(
        setValue({
          name,
          fromInitial: true,
          value: initial || null,
        }),
      );

      handleRunValidators(initial);
    }

    const validationState = formState.validation[name] || {};
    const cachedValidation = fieldCache.get(cacheKeys.validationProp);

    // Cache transformed validation state to prevent unnecessary renders
    if (
      !cachedValidation ||
      !validationEquals(cachedValidation, validationState)
    ) {
      fieldCache.set(
        cacheKeys.validationProp,
        Object.keys(validationState)
          .map(validatorName => validationState[validatorName])
          .reduce(
            (acc, curr) => ({
              messages: !curr.valid
                ? [...acc.messages, curr.message]
                : [...acc.messages],
              valid: acc.valid && curr.valid,
            }),
            { valid: true, messages: [] } as ValidationProps,
          ),
      );
    }

    const handleChange = fieldCache.getOrSet(
      cacheKeys.onChange,
      async (value: any) => {
        dispatch(setValue({ name, value }));

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
      value: formState.values[name],
      touched: formState.touched[name],
      validation: fieldCache.get(cacheKeys.validationProp),
      validating: formState.validating[name],
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

  return [formState, createProps];
}
