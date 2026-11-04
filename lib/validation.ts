import type { DFA, ValidationResult } from "@/types/automata";

export function validateDFA(dfa: DFA): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!dfa.states.length) errors.push("Add at least one state.");
  if (new Set(dfa.states).size !== dfa.states.length) errors.push("State names must be unique.");
  if (!dfa.alphabet.length) errors.push("Add at least one alphabet symbol.");
  if (new Set(dfa.alphabet).size !== dfa.alphabet.length) errors.push("Alphabet symbols must be unique.");
  if (!dfa.states.includes(dfa.startState)) errors.push("The start state must belong to Q.");
  for (const f of dfa.finalStates) if (!dfa.states.includes(f)) errors.push(`Final state "${f}" is not in Q.`);
  for (const state of dfa.states) {
    for (const symbol of dfa.alphabet) {
      const target = dfa.transitions[state]?.[symbol];
      if (!target) errors.push(`Missing transition: δ(${state}, ${symbol}).`);
      else if (!dfa.states.includes(target)) errors.push(`Transition δ(${state}, ${symbol}) points to unknown state "${target}".`);
    }
    for (const symbol of Object.keys(dfa.transitions[state] ?? {})) {
      if (!dfa.alphabet.includes(symbol)) warnings.push(`Ignoring transition symbol "${symbol}" not in Σ.`);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
