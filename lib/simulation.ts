import type { DFA, SimulationStep } from "@/types/automata";
export function simulateDFA(dfa: DFA, input: string): { accepted: boolean; steps: SimulationStep[]; error?: string } {
  const symbols = [...input];
  const invalid = symbols.find(s => !dfa.alphabet.includes(s));
  if (invalid) return { accepted: false, steps: [], error: `Symbol "${invalid}" is not in the alphabet.` };
  let state = dfa.startState;
  const steps: SimulationStep[] = [];
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const nextState = dfa.transitions[state]?.[symbol];
    if (!nextState) return { accepted: false, steps, error: `No transition defined for (${state}, ${symbol}).` };
    steps.push({ index: i + 1, state, symbol, nextState });
    state = nextState;
  }
  return { accepted: dfa.finalStates.includes(state), steps };
}
