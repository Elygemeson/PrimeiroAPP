import { useCallback, useReducer } from 'react';

import {
  initialState,
  reduceBackspace,
  reduceClearAll,
  reduceDecimal,
  reduceDigit,
  reduceEquals,
  reduceOperator,
  reducePercent,
  reduceToggleSign,
  reduceUnaryOp,
  type CalculatorState,
  type PendingOp,
  type UnaryOp,
} from '@/lib/calculator-engine';

type Action =
  | { type: 'digit'; d: string }
  | { type: 'decimal' }
  | { type: 'backspace' }
  | { type: 'toggleSign' }
  | { type: 'percent' }
  | { type: 'operator'; op: NonNullable<PendingOp> }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'unary'; op: UnaryOp }
  | { type: 'constant'; value: string }
  | { type: 'toggleAngle' };

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'digit':
      return reduceDigit(state, action.d);
    case 'decimal':
      return reduceDecimal(state);
    case 'backspace':
      return reduceBackspace(state);
    case 'toggleSign':
      return reduceToggleSign(state);
    case 'percent':
      return reducePercent(state);
    case 'operator':
      return reduceOperator(state, action.op);
    case 'equals':
      return reduceEquals(state);
    case 'clear':
      return reduceClearAll();
    case 'unary':
      return reduceUnaryOp(state, action.op);
    case 'constant':
      return {
        ...state,
        display: action.value,
        freshEntry: true,
      };
    case 'toggleAngle':
      return {
        ...state,
        angleMode: state.angleMode === 'deg' ? 'rad' : 'deg',
      };
    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const inputDigit = useCallback((d: string) => dispatch({ type: 'digit', d }), []);
  const inputDecimal = useCallback(() => dispatch({ type: 'decimal' }), []);
  const backspace = useCallback(() => dispatch({ type: 'backspace' }), []);
  const toggleSign = useCallback(() => dispatch({ type: 'toggleSign' }), []);
  const percent = useCallback(() => dispatch({ type: 'percent' }), []);
  const setOperator = useCallback((op: NonNullable<PendingOp>) => dispatch({ type: 'operator', op }), []);
  const equals = useCallback(() => dispatch({ type: 'equals' }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const unaryOp = useCallback((op: UnaryOp) => dispatch({ type: 'unary', op }), []);
  const constant = useCallback((value: string) => dispatch({ type: 'constant', value }), []);
  const toggleAngle = useCallback(() => dispatch({ type: 'toggleAngle' }), []);

  return {
    state,
    inputDigit,
    inputDecimal,
    backspace,
    toggleSign,
    percent,
    setOperator,
    equals,
    clear,
    unaryOp,
    constant,
    toggleAngle,
  };
}

export type { CalculatorState, UnaryOp };
