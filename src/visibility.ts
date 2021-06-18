import { VisibilityCallback } from "./types";

export const strictlyOnBlur: VisibilityCallback = ({ blurred, validation: { valid } }) => !valid && blurred;

export const onBlurButNotWhenRefocussed: VisibilityCallback = ({ blurred, validation: { valid }, isFocussed }) => !valid && (blurred && !isFocussed);

export const generic: VisibilityCallback = ({ validation: { valid }}) => !valid; 
