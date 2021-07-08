import { VisibilityCallback } from "./types";

export const strictlyOnBlur: VisibilityCallback = ({ blurred, validation: { valid } }) => !valid && blurred;

export const onBlurButNotWhenRefocussed: VisibilityCallback = ({ blurred, validation: { valid }, isFocussed }) => !valid && (blurred && !isFocussed);

export const notWhenChanging: VisibilityCallback = ({ validation: { valid }, hadChanged, blurred }) => {
    return !valid && blurred && !hadChanged
};

export const generic: VisibilityCallback = ({ validation: { valid }}) => !valid; 
