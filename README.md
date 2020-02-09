# Oxin: no mess form state (React hook)

![CI](https://github.com/Madebyfen/oxin/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/Madebyfen/oxin/branch/master/graph/badge.svg)](https://codecov.io/gh/Madebyfen/oxin)

`npm install oxin`

## Another form library, huh

Building and managing form state can be pretty tedious; in large applications even moreso. Early decisions buying into hefty libraries that take on too much responsibility or put hard rules on how the UI is structured can reach cumbersome limits that are hard to exit from, and building your own form state solution is a chore when you have fun stuff to be doing!

Oxin is a form state companion designed to make handling inputs and validation a breeze without dictating anything about your UI -- it provides you with:

- The state of your input field values and validity.
- A props creator for your input components that dynamically creates form state.

Oxin was built with the following notions and ideals:

- Forms should not require a complex component tree because of their state managment.
- Form state should be managed in the form component.
- Building form state should be declarative.
- Inputs can be _any type_.
- Validation can be complex and asynchronous.

## Declarative forms with components

All you need to do to create a form is call `useOxin()` in your function component. You can make decisions about your form behaviour using the provided `inputState`, and you can add input fields to that state by calling `inputProps(options)`. The only requirement is a `name` provided in the options.

For the purpose of these examples, this is our `Input` component; `name` and `onChange` are provided by Oxin:

```jsx
const Input = ({ name, onChange }) => {
  return <input type="text" onChange={e => onChange(e.target.value)} />;
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

This creates an input field in Oxin's state and provides your input component (whatever you decide that to be) with a few choice props (including change and blur handlers) which are used to update and track state for that field.

Don't worry about calling on every render, Oxin uses caching to prevent unnecessary validation and updates; although you may want to memoise your inputs as updates to form state will cause the form component to re-render.

## Validation

When you update the input with the `onChange(value)` prop, any validators passed to the props creator run over the value and input state is updated accordingly. This input will be invalid while it has an empty string as its value:

```jsx
const required = value => value !== '';

<Input
  {...inputProps({
    name: 'text1',
    validators: [required],
  })}
/>;
```

Oxin validator functions can be as simple (like above) or complex as you need. They just need to return `true` if valid or `false` when invalid.

**N.b. validators must be _named_ functions**.

When validators are executed they are added to input state, with their `valid` state and error messages.

You can also provide validator creators, which are higher order functions that take options and return validators based on those options:

```javascript
const minLength = length =>
  function minLength(value: string) {
    return value.length < length;
  };
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
    validators: [
      async value => {
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

All the examples above use strings as input types, but your inputs can be any type you need them to be. For instance, you could have an input component that generates and image that you run through a specialised image validator that runs asynchronously! An aim of this library is to provide flexibility to input components.

## `InputPropsOptions`

You can supply the following options to the `inputProps()` props creator:

### `name: string`

The name of the input field.

### ``

## Props

The props creator generates the following props for use with input components:

### `name: string`

The name of the input as set in `OxinOptions`.

### `touched: boolean`

Inputs are marked as `touched` after the first `onChange` handler fires. Inputs are _not_ marked as `touched` wen providing initial values for inputs.

### `validation: ValidationProps`

An object containing the input's validation state and any failed validator messages:

```typescript
{
  valid: boolean;
  messages: any[];
}
```

### `validating: boolean`

Denotes the input validator activity. `false` when _all_ validators have resolved.

### `onChange: (value: any) => void`

Change handler for the input. Must be called with the input value.

### `onBlur: (value: any) => void`

A proxy function to `onChange`, fires if `validation: { onBlur: true }` is supplied in `OxinOptions`. Validations fired `onBlur` are not debounced.

### `onRemove: () => void`

A cleanup function that can be called when unmounting a component (`useEffect` return) -- needed if you are planning to create/remove inputs dynamically.
