import type { DFA, MinimizeResult, PartitionStep } from "@/types/automata";
import { validateDFA } from "./validation";

function reachableFromStart(dfa: DFA): string[] {
  const seen = new Set<string>();
  const queue = [dfa.startState];
  while (queue.length) {
    const state = queue.shift()!;
    if (seen.has(state)) continue;
    seen.add(state);
    for (const symbol of dfa.alphabet) {
      const target = dfa.transitions[state]?.[symbol];
      if (target && !seen.has(target)) queue.push(target);
    }
  }
  return dfa.states.filter(s => seen.has(s));
}

function samePartition(a: string[][], b: string[][]): boolean {
  const norm = (p: string[][]) => p.map(g => [...g].sort().join("\u0000")).sort().join("|");
  return norm(a) === norm(b);
}

export function minimizeDFA(input: DFA): MinimizeResult {
  const validation = validateDFA(input);
  if (!validation.valid) throw new Error(validation.errors.join("\n"));
  const reachable = reachableFromStart(input);
  const unreachable = input.states.filter(s => !reachable.includes(s));
  const finals = reachable.filter(s => input.finalStates.includes(s));
  const nonFinals = reachable.filter(s => !input.finalStates.includes(s));
  let partitions = [finals, nonFinals].filter(g => g.length);
  const steps: PartitionStep[] = [
    { title: "Reachability analysis", description: `Starting at ${input.startState}, follow every transition. Reachable states: ${reachable.join(", ") || "none"}.`, partitions: [reachable], kind: "reachability" },
    { title: "Remove unreachable states", description: unreachable.length ? `Discard states that cannot be visited: ${unreachable.join(", ")}.` : "Every state is reachable, so no states are removed.", partitions: [reachable], kind: "reachability" },
    { title: "Initial partition", description: "Separate accepting states from non-accepting states. These groups cannot be equivalent.", partitions: partitions.map(g => [...g]), kind: "initial" }
  ];
  let changed = true;
  let round = 0;
  while (changed) {
    changed = false;
    const next: string[][] = [];
    const groupOf = new Map<string, number>();
    partitions.forEach((group, i) => group.forEach(s => groupOf.set(s, i)));
    for (const group of partitions) {
      const buckets = new Map<string, string[]>();
      for (const state of group) {
        const signature = input.alphabet.map(symbol => {
          const target = input.transitions[state][symbol];
          return groupOf.get(target) ?? -1;
        }).join(",");
        const bucket = buckets.get(signature) ?? [];
        bucket.push(state);
        buckets.set(signature, bucket);
      }
      if (buckets.size > 1) changed = true;
      next.push(...buckets.values());
    }
    partitions = next;
    round++;
    steps.push({
      title: `Partition refinement ${round}`,
      description: changed ? "States with transitions into different groups are split. Repeat until every state in a group has the same destination-group pattern." : "No group can be split further. The partition is stable.",
      partitions: partitions.map(g => [...g]), kind: "refinement"
    });
  }
  const nameOf = new Map<string, string>();
  const minimizedStates = partitions.map((group, i) => {
    const name = group.length === 1 ? group[0] : `{${group.join(",")}}`;
    group.forEach(s => nameOf.set(s, name));
    return name;
  });
  const transitions: DFA["transitions"] = {};
  partitions.forEach((group, i) => {
    const representative = group[0];
    const name = minimizedStates[i];
    transitions[name] = {};
    for (const symbol of input.alphabet) transitions[name][symbol] = nameOf.get(input.transitions[representative][symbol])!;
  });
  const minimized: DFA = {
    states: minimizedStates,
    alphabet: [...input.alphabet],
    startState: nameOf.get(input.startState)!,
    finalStates: partitions.filter(g => g.some(s => input.finalStates.includes(s))).map(g => nameOf.get(g[0])!),
    transitions
  };
  steps.push({ title: "Equivalent states merged", description: "Each stable partition becomes one state. Its transitions are inherited from any representative in the group.", partitions: partitions.map(g => [...g]), kind: "result" });
  steps.push({ title: "Minimized DFA", description: `The minimized DFA has ${minimized.states.length} states, compared with ${input.states.length} originally.`, partitions: partitions.map(g => [...g]), kind: "result" });
  return { dfa: minimized, reachableStates: reachable, unreachableStates: unreachable, partitions, steps, removedStates: input.states.length - minimized.states.length };
}
