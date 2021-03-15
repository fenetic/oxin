import { Reducer } from 'react';
import { Action, InputState } from './types';
export declare const createInitialState: <Inputs>() => InputState<Inputs>;
export declare type OxinReducer<Inputs> = (state: InputState<Inputs>, action: Action<Inputs>) => InputState<Inputs>;
export declare const createReducer: <Inputs>() => Reducer<InputState<Inputs>, Action<Inputs>>;
