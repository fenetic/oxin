import { VisibilityCallback } from "./types";

export const strictlyOnBlur: VisibilityCallback = ({ blurred, validation: { valid } }) => !valid && blurred;

export const generic: VisibilityCallback = ({ validation: { valid }}) => !valid; 
