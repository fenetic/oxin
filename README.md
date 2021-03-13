# Oxin: Form state sidekick (React hook)

![CI](https://github.com/fenetic/oxin/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/fenetic/oxin/branch/master/graph/badge.svg)](https://codecov.io/gh/fenetic/oxin) [![npm version](https://img.shields.io/npm/v/oxin.svg?style=flat)](https://npmjs.org/package/oxin 'View this project on npm')

`$ npm install oxin`

`$ yarn add oxin`

`$ pnpm add oxin`

```TypeScript
const { inputState, inputProps } = useOxin();

const myCoolInputProps = inputProps({ name: 'input1' });

return (
  <Input {...myCoolInputProps} />
);
```

Where your form UI is your hero, Oxin is your form state sidekick. It provides you with:

- The state of your input field values and validity.
- A props creator for your input components that dynamically creates form state.

Oxin was built because:

- Forms should not require a complex component tree to cope with the design of state.
- Form state should not add weight to cognitive load when building apps.
- Data are not always string values from HTML inputs.
- Validation can be complex and asynchronous.

## Creating inputs

To create initial form state, call `useOxin()` in your function component. You can make decisions about your form behaviour using the provided `inputState`, and you can add input fields to that state by calling `inputProps(options)`. The only requirement is a `name` provided in the options.

For the purpose of these examples, this is our `Input` component; `name`, `value` and `onChange` are provided by Oxin:

```jsx
const Input = ({ name, value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
```

Now we can use this input in our `Form` component to start composing our form:

```jsx
import React from 'react';
import { useOxin } from 'oxin';

const MyForm = () => {
  const { inputState, inputProps } = useOxin();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        console.log('Submitting', inputState.values);
      }}
    >
      <Input
        {...inputProps({
          name: 'myField',
        })}
      />
      <button type="submit">Submit</button>
    </form>
  ):
}
```

This creates a field in `inputState` and the input component is now able to update state via the `onChange` handler prop.

```javascript
// inputState after first render
{
  "touched": {
    "myField": false,
  },
  "valid": true,
  "validating": {
    "myField": false,
  },
  "validation": {
    "myField": {}
  },
  "values": {
    "myField": null,
  }
}
```

Don't worry about calling on every render, Oxin uses caching to prevent unnecessary validation and updates to props; although in performance-sensitive scenarios you may want to wrap your inputs with `React.memo` as updates to form state will cause the form component to re-render.

## Validation

Let's render some validation state inside our input component:

```jsx
const Input = ({ name, value, onChange, validation }) => {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {!validation.valid && validation.messages[0]}
    </>
  );
};
```

`InputProps.validation` is an object containing `valid` state for the input and an array of any failed validator `messages`. We’re just displaying the first one here; you can map over and render each one if needed.

When you update the input with the `onChange(value)` prop, any validators passed to the props creator run over the value and input state is updated accordingly...

```jsx
<Input
  {...inputProps({
    name: 'text1',
    validators: [[required, 'This field is required.']],
  })}
/>
```

...and as long as `required` is doing its job, the input's `validation` props will be `valid: false` and `messages: ['This field is required.']` while the input value is an empty string. You may notice the message is supplied alongside the validator function...

## BYO Validator functions

Oxin is not a validation library, but provides the engine for running validators over inputs. A validator must have a `name` and a `test` property. Validator tests can either be synchronous or asynchronous functions, or a boolean condition from external state.

This is a simple synchronous function validator:

```javascript
const required = {
  name: 'required',
  test: (value) => value !== '',
};
```

When validators are first resolved they are added to input state, with their `valid` state and error `messages`.

You can also provide validator creators, which are useful for creating resuable validators; they are functions that take options and return validators based on those options:

```javascript
const createMinLength = (length) => ({
  name: 'createMinLength',
  test: (value: string) => {
    return value.length < length;
  },
});

//...

inputProps({
  name: 'text1',
  validators: [createMinLength(8)],
});
```

## Validation error messages

Oxin doesn't handle error messages inside validator functions. You can supply a failure message alongside the validator as a “validator tuple”:

```javascript
inputProps({
  name: 'text1',
  validators: [
    [required, 'This field is required'],
    [createMinLength(3), 'Max 3 characters'],
  ],
});
```

The message does not have to be a string, it can be whatever you want to pass into your input component; this helps things play nicely with internationalisation (i18n.)

## Async validation

Validators can be plain functions or async, and you can even set a validation runner debounce timer on your input to control the rate at which validation is fired:

```jsx
<Input
  {...inputProps({
    name: 'text1',
    validators: [{
      name: 'myNetworkValidator',
      test: async (value) => {
        const result = await fetch(
          `/your/validation/endpoint?value=${value}`,
          value,
        );
        // ...
        return resultIsWhatYouNeed ? true : false;
      },
    ],
    validation: {
      debounce: 200,
    },
  })}
/>
```

This will perform a network validation when the input's `onChange(value)` prop is called, and a debounce wait time in milliseconds has been added to rate limit the input.

You can include a mix of sync and async functions, and you do not need to worry about slow async validators blocking other validator state updates.

## Input types

All the examples above use strings as input types, but your inputs can be any type you need them to be. For instance, you could have an input component that generates image that you run through a specialised image validator that runs asynchronously! An aim of this library is to provide flexibility to input components.

## Nesting

Oxin is designed to be nested, so it may help to think of input state as a collection of inputs rather than a form.

Nesting is useful when you want to validate a whole group of inputs at once, or nest your root input state for _whatever_ reason.

Let's see an example with a checkbox group -- _again, note that you only need to implement checkboxes like this if you want to validate the group or want your top level input state to be nested._

We want to validate a collection of checkboxes to ensure at least one has been selected. Our input group here is called `favouriteMovie`, our `atLeastOne` validator runs through a `values` object and is `valid` if at least one value evaluates `true`:

```jsx
import { useOxin } from 'oxin';
// ...
// Create root input state
const { inputProps } = useOxin();
// ...
// Render
<CheckboxGroup
  {...inputProps({
    name: 'favouriteMovie',
    validators: [[atLeastOne, 'Select one']],
  })}
/>;
```

Our `CheckboxGroup` component:

```jsx
import { useOxin } from 'oxin';

const CheckboxGroup = ({
  // OxinProps from the parent component.
  onChange,
  validation,
}) => {
  // Create new inputState for these checkboxes.
  const { inputState, inputProps } = useOxin();

  // Leverage `useEffect` to lift values using the parent
  // component's `onChange` handler whenever we update
  // our local `inputState`. You could also provide an
  // `onChange` handler to each checkbox; the idea is
  // that we call the parent `onChange` with our local
  // `inputState.values` whenever our checkbox state
  // changes.
  useEffect(() => {
    onChange(inputState.values);
  }, [inputState.values]);

  // You would probably supply options as props and map
  // over them here, but this is a contrived example.
  return (
    <>
      <Checkbox
        {...inputProps({
          name: 'jurassicPark',
        })}
        label="Jurassic Park"
      />
      <Checkbox
        {...inputProps({
          name: 'haroldAndKumar',
        })}
        label={'A Very Harold and Kumar 3D Christmas'}
      />
      {!validation.valid && <div>{validation.messages[0]}</div>}
    </>
  );
};
```

And finally our `Checkbox` component:

```jsx
export const Checkbox = ({ label, value, onChange, name }) => {
  return (
    <div>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={!!value}
        onChange={() => onChange(!value)}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );
};
```

# API

## `InputOptions`

You can supply the following options to the `inputProps()` props creator:

#### `initialValue: any`

Initial value for the input. Setting the initial value will run validators, but will not mark the field as `touched`. If you need protection from re-validating against an initial value, you can do so in a validator creator with an early return:

```javascript
const createUniqueValidator = initialValue =>
  ({
    name: 'uniqueValidator',
    test: (value) => {
      if (initialValue === value) return true;

      // Or continue with validation...
    }
  });

// ...

inputProps({
  name: 'text1',
  initialValue: someInitialValue
  validators: [createUniqueValidator(someInitialValue)]
})
```

#### `name: string`

The name of the input field.

#### `validation: ValidationOptions`

Options for validation behaviour:

**`debounce?: number = 0`** A number in milliseconds to debounce validation runs by. The longer this number, the longer the pause between last input signal and validation execution. If this is `0` (default), debouncing will not be applied.

**`onBlur?: boolean`** If this is set to `true`, validators will be executed when the `onBlur(value)` prop is called.

#### `validators: (ValidatorFunction | ValidatorFunctionAsync | ValidatorTuple)[]`

An array of validators which can be any of the following:

```typescript
// A function that returns true or false
type ValidatorFunction = (value: any) => boolean;
// An asynchronous function that returns true or false
type ValidatorFunctionAsync = (value: any) => Promise<boolean>;
// A 'tuple' of either of the above and a related error message
type ValidatorTuple = [
  ValidatorFunction | ValidatorFunctionAsync,
  ValidatorMessage,
];
```

#### `validationMessage: any`

A “global” validation message that is applied to _all_ validators on the field. This will override any validator messages supplied in a `ValidatorTuple`.

## `InputProps`

The props creator generates the following props for use with input components:

#### `name: string`

The name of the input as set in `InputOptions`.

#### `value: any`

The value of the input, use this to keep your inputs in a controlled state.

#### `touched: boolean`

Inputs are marked as `touched` after the first `onChange` handler fires. Inputs are _not_ marked as `touched` wen providing initial values for inputs.

#### `validation: ValidationProps`

An object containing the input's validation state and any failed validator messages:

```typescript
{
  valid: boolean;
  messages: any[];
}
```

#### `validating: boolean`

Denotes the input validator activity. `false` when _all_ validators have resolved.

#### `onChange: (value: any) => void`

Change handler for the input. Must be called with the input value.

#### `onBlur: (value: any) => void`

A proxy function to `onChange`, fires if `validation: { onBlur: true }` is supplied in `OxinOptions`. Validations fired `onBlur` are not debounced.

#### `onRemove: () => void`

A cleanup function that can be called when unmounting a component (`useEffect` return) -- needed if you are planning to create/remove inputs dynamically.

## Testing

Because Oxin inputs are asynchronous, your tests must account for this. This library is tested using the wonderful [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and Jest. This guide covers these tools. For other environments, please refer to asynchronous testing guides for them.

### Jest + Testing Library guide

When testing HTML inputs, we recommend using the `userEvent` functions from Testing Library. You will need to tell Jest to `useRealTimers()` for Testing Library's async `userEvent.type` behaviour to work correctly.

When rendering your form with Oxin inputs, use testing-library's async `findBy...` functions to select your inputs:

```TypeScript
jest.useRealTimers();

test('my form', async () => {
  const { findByTestId } = render(<MyCoolForm />);
  const input1 = await findByTestId('input-1-testid');
});
```

When updating HTML inputs within your test, use `userEvent.type` and wrap in an async `act` call:

```TypeScript
jest.useRealTimers();

test('my form', async () => {
  const { findByTestId } = render(<MyCoolForm />);
  const input1 = await findByTestId('input-1-testid');

  await act(async () => {
    await userEvent.type(input1, 'Some test text', { delay: 1 });
  })

  expect(input1.getAttribute('value')).toBe('Some test text');
});
```

Notice that we are `await`-ing the result of `userEvent.type` and supplying `{ delay: 1 }` as an option to the function to implement async behaviour as per the [Testing Library docs](https://testing-library.com/docs/ecosystem-user-event/#typeelement-text-options)
