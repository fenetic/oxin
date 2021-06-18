import { useReducer, useRef } from 'react';
import debounce from 'lodash.debounce';
import { nanoid } from 'nanoid/non-secure';

import { ValidationProps, Oxin, ValidationState } from './types';

import { createInitialState, OxinReducer, createReducer } from './reducer';
import { setValue, removeField, setValidation, setFocussed, setBlurred } from './actions';
import {
  runValidators,
  getBooleanValidators,
  mergeValidators,
  validationEquals,
  validatorsEquals,
} from './validation';

import { generic, strictlyOnBlur } from './visibility'

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

export function useOxin<Inputs = Record<string, unknown>>(): Oxin<Inputs> {
  const [inputState, dispatch] = useReducer<OxinReducer<Inputs>>(
    createReducer<Inputs>(),
    createInitialState<Inputs>(),
  );
  const fieldCache = useCache();

  const inputProps: Oxin<Inputs>['inputProps'] = (inputOptions) => {
    const {
      initialValue,
      name,
      validation,
      validators = [],
      validationMessage,
    } = inputOptions;
    const cacheKeys = {
      validationProp: `${name}-validationProp`,
      validationState: `${name}-validationState`,
      booleanValidators: `${name}-booleanValidators`,
      finalValidationBatchId: `${name}-finalValidationBatchId`,
      onChange: `${name}-onChange`,
      changes: `${name}-changes`,
      onBlur: `${name}-onBlur`,
      onFocus: `${name}-onFocus`,
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
            validationMessage,
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
    const cachedValidation = fieldCache.get(cacheKeys.validationState);

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
      fieldCache.set(cacheKeys.validationState, validationState);
      fieldCache.set(
        cacheKeys.validationProp,
        Object.values(
          validationState as ValidationState,
        ).reduce<ValidationProps>(
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

    const runValidatorDispatch = (value: any) => {
      const dispatchValidators =
          !!validation?.debounce && fieldCache.get(cacheKeys.changes) > 1
            ? handleRunValidatorsDebounced
            : handleRunValidators;

        dispatchValidators(value);
    }

    const handleChange = fieldCache.getOrSet(
      cacheKeys.onChange,
      async (value: any) => {
        dispatch(setValue({ name, value, validating: !!validators.length }));

        fieldCache.set(
          cacheKeys.changes,
          fieldCache.get(cacheKeys.changes) + 1,
        );
      },
    );
    // Should take a look at an api for choosing from library-provided functions
    const showValidationFunction = validation?.showValidation || validation?.onBlur ? 
      strictlyOnBlur : generic;

    const touched = !!inputState.touched[name]
    const thisValidation = fieldCache.get(cacheKeys.validationProp);
    const showValidation = showValidationFunction({
      touched,
      validation: thisValidation,
      currentFocussed: inputState.focussed as string,
      blurred: !!inputState.blurred[name]
    })

    return {
      name,
      value: inputState.values[name],
      touched: !!inputState.touched[name],
      validation: fieldCache.get(cacheKeys.validationProp),
      validating: !!inputState.validating[name],
      onChange: (value) => {
        handleChange(value);
        runValidatorDispatch(value)
      },
      onBlur: fieldCache.getOrSet(cacheKeys.onBlur, () => {
        dispatch(setBlurred(name));
      }),
      onRemove: fieldCache.getOrSet(cacheKeys.onRemove, () => {
        dispatch(removeField(name));
      }),
      onFocus: fieldCache.getOrSet(cacheKeys.onFocus, () => {
        dispatch(setFocussed(name))
      }),
      showValidation
    };
  };

  return { inputState, inputProps };
}
