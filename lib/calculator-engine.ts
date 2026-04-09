/** Formata número para exibição sem artefatos de float. */
export function formatDisplay(n: number): string {
  if (!Number.isFinite(n)) return 'Erro';
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) {
    return n.toExponential(6).replace(/\.?0+e/, 'e');
  }
  const rounded = Number(n.toPrecision(12));
  let s = String(rounded);
  if (s.includes('e')) return n.toExponential(6).replace(/\.?0+e/, 'e');
  return s;
}

export type PendingOp = '+' | '-' | '*' | '/' | null;

export type CalculatorState = {
  display: string;
  accumulator: number | null;
  pendingOp: PendingOp;
  freshEntry: boolean;
  angleMode: 'deg' | 'rad';
};

export const initialState: CalculatorState = {
  display: '0',
  accumulator: null,
  pendingOp: null,
  freshEntry: true,
  angleMode: 'deg',
};

function parseDisplay(d: string): number {
  const n = parseFloat(d);
  return Number.isFinite(n) ? n : 0;
}

function applyBinary(
  left: number,
  right: number,
  op: NonNullable<PendingOp>
): number {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) return NaN;
      return left / right;
    default:
      return right;
  }
}

export function reduceDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.freshEntry) {
    return { ...state, display: digit, freshEntry: false };
  }
  const core = state.display.replace(/^-/, '');
  if (core === '0' && digit === '0' && !core.includes('.')) {
    return state;
  }
  if (core === '0' && digit !== '0' && !core.includes('.')) {
    const neg = state.display.startsWith('-');
    return { ...state, display: neg ? `-${digit}` : digit };
  }
  if (state.display.replace('-', '').replace('.', '').length >= 14) {
    return state;
  }
  return { ...state, display: state.display + digit };
}

export function reduceDecimal(state: CalculatorState): CalculatorState {
  if (state.freshEntry) {
    return { ...state, display: '0.', freshEntry: false };
  }
  if (state.display.includes('.')) return state;
  return { ...state, display: state.display + '.' };
}

export function reduceBackspace(state: CalculatorState): CalculatorState {
  if (state.freshEntry) return state;
  const next = state.display.slice(0, -1) || '0';
  return { ...state, display: next === '-' ? '0' : next };
}

export function reduceToggleSign(state: CalculatorState): CalculatorState {
  if (state.display === 'Erro') return initialState;
  const n = parseDisplay(state.display);
  return { ...state, display: formatDisplay(-n), freshEntry: true };
}

export function reducePercent(state: CalculatorState): CalculatorState {
  if (state.display === 'Erro') return initialState;
  const n = parseDisplay(state.display);
  return { ...state, display: formatDisplay(n / 100), freshEntry: true };
}

export function reduceOperator(
  state: CalculatorState,
  op: NonNullable<PendingOp>
): CalculatorState {
  if (state.display === 'Erro') return initialState;
  const current = parseDisplay(state.display);

  if (state.accumulator !== null && state.pendingOp && !state.freshEntry) {
    const result = applyBinary(state.accumulator, current, state.pendingOp);
    if (!Number.isFinite(result)) {
      return { ...initialState, display: 'Erro', freshEntry: true };
    }
    return {
      ...state,
      display: formatDisplay(result),
      accumulator: result,
      pendingOp: op,
      freshEntry: true,
    };
  }

  return {
    ...state,
    accumulator: current,
    pendingOp: op,
    freshEntry: true,
  };
}

export function reduceEquals(state: CalculatorState): CalculatorState {
  if (state.display === 'Erro') return initialState;
  if (state.accumulator === null || state.pendingOp === null) {
    return { ...state, freshEntry: true };
  }
  const current = parseDisplay(state.display);
  const result = applyBinary(state.accumulator, current, state.pendingOp);
  if (!Number.isFinite(result)) {
    return { ...initialState, display: 'Erro', freshEntry: true };
  }
  return {
    ...state,
    display: formatDisplay(result),
    accumulator: null,
    pendingOp: null,
    freshEntry: true,
  };
}

export function reduceClearAll(): CalculatorState {
  return { ...initialState };
}

export type UnaryOp = 'sin' | 'cos' | 'tan' | 'log10' | 'ln' | 'sqrt' | 'square' | 'inv';

function evalUnary(n: number, op: UnaryOp, angleMode: 'deg' | 'rad'): number {
  const rad = angleMode === 'deg' ? (n * Math.PI) / 180 : n;
  switch (op) {
    case 'sin':
      return Math.sin(rad);
    case 'cos':
      return Math.cos(rad);
    case 'tan':
      return Math.tan(rad);
    case 'log10':
      return Math.log10(n);
    case 'ln':
      return Math.log(n);
    case 'sqrt':
      return Math.sqrt(n);
    case 'square':
      return n * n;
    case 'inv':
      return 1 / n;
    default:
      return n;
  }
}

export function reduceUnaryOp(state: CalculatorState, op: UnaryOp): CalculatorState {
  if (state.display === 'Erro') return initialState;
  const n = parseDisplay(state.display);
  const result = evalUnary(n, op, state.angleMode);
  if (!Number.isFinite(result)) {
    return { ...initialState, display: 'Erro', freshEntry: true };
  }
  return { ...state, display: formatDisplay(result), freshEntry: true };
}
