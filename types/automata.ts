export type TransitionMap = Record<string, Record<string, string>>;
export interface DFA {
  states: string[];
  alphabet: string[];
  startState: string;
  finalStates: string[];
  transitions: TransitionMap;
}
export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[] }
export interface PartitionStep { title: string; description: string; partitions: string[][]; kind: "reachability" | "initial" | "refinement" | "result" }
export interface MinimizeResult {
  dfa: DFA;
  reachableStates: string[];
  unreachableStates: string[];
  partitions: string[][];
  steps: PartitionStep[];
  removedStates: number;
}
export interface SimulationStep { index: number; state: string; symbol: string; nextState: string }
