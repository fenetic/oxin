import React, { useRef, useEffect, useState } from 'react';

import { useFormup } from '.';
import { FormupProps, FormState, FormupPropsFunction } from './types';

export const TestInput = React.memo(function TestInput({
  name,
  onChange,
  onBlur,
  onRemove,
  touched,
  validating,
  validation,
  value,
}: FormupProps) {
  const renderCounter = useRef(0);

  renderCounter.current = renderCounter.current + 1;

  useEffect(() => () => onRemove(), [onRemove]);

  return (
    <div data-testid={`fieldContainer`}>
      <span data-testid={`renderCounter-${name}`}>{renderCounter.current}</span>
      <span data-testid={`validating-${name}`}>{validating?.toString()}</span>
      <span data-testid={`valid-${name}`}>{validation?.valid.toString()}</span>
      <span data-testid={`validationMessages-${name}`}>
        {validation?.messages.map((msg, i) => (
          <span key={i}>{msg}</span>
        ))}
      </span>
      <span data-testid={`touched-${name}`}>{touched?.toString()}</span>
      <input
        type="text"
        name={name}
        data-testid={`input-${name}`}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onBlur(e.target.value)}
        value={value || ''}
      />
    </div>
  );
});

export const TestMulti = ({
  propsCreator,
}: {
  propsCreator: FormupPropsFunction;
}) => {
  const [fields, setFields] = useState([`field1`]);

  return (
    <React.Fragment>
      {fields.map((field, index) => (
        <div key={field}>
          <TestInput
            {...propsCreator({
              name: `multi-${field}`,
            })}
          />
          <button
            data-testid={`remove-${field}`}
            onClick={() =>
              setFields([...fields.slice(0, index), ...fields.slice(index + 1)])
            }
          >
            -
          </button>
        </div>
      ))}
      <button
        data-testid="addField"
        onClick={() => setFields([...fields, `field${fields.length + 1}`])}
      >
        +
      </button>
    </React.Fragment>
  );
};

export const TestForm = ({
  children,
}: {
  children: (
    formupState: FormState,
    propsCreator: FormupPropsFunction,
  ) => JSX.Element;
}) => {
  const [formupState, propsCreator] = useFormup();

  return children && children(formupState, propsCreator);
};
