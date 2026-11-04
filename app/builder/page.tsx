"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Upload, CheckCircle2, Table2, WandSparkles, ArrowRight } from "lucide-react";
import { useDFAStore } from "@/store/useDFAStore";
import { validateDFA } from "@/lib/validation";
import StateDiagram from "@/components/StateDiagram";
import TransitionTable from "@/components/TransitionTable";

function parseItems(value: string) {
  return [...new Set(value.split(/[\\s,;]+/).map(item => item.trim()).filter(Boolean))];
}

export default function Builder() {
  const dfa = useDFAStore(s => s.dfa);
  const setDFA = useDFAStore(s => s.setDFA);
  const [statesText, setStatesText] = useState(dfa.states.join(", "));
  const [alphabetText, setAlphabetText] = useState(dfa.alphabet.join(", "));
  const [stateName, setStateName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [message, setMessage] = useState("");
  const validation = useMemo(() => validateDFA(dfa), [dfa]);
  const update = (patch: Partial<typeof dfa>) => setDFA({ ...dfa, ...patch });

  function applyStates() {
    const states = parseItems(statesText);
    if (!states.length) return setMessage("Enter at least one state.");
    const transitions = Object.fromEntries(states.map(state => [
      state,
      Object.fromEntries(dfa.alphabet.map(a => [a, states.includes(dfa.transitions[state]?.[a]) ? dfa.transitions[state][a] : state]))
    ]));
    const startState = states.includes(dfa.startState) ? dfa.startState : states[0];
    const finalStates = dfa.finalStates.filter(s => states.includes(s));
    update({ states, transitions, startState, finalStates });
    setStatesText(states.join(", "));
    setMessage(`Applied ${states.length} states. Complete the transition table below.`);
  }

  function applyAlphabet() {
    const alphabet = parseItems(alphabetText);
    if (!alphabet.length) return setMessage("Enter at least one alphabet symbol.");
    const transitions = Object.fromEntries(dfa.states.map(state => [
      state,
      Object.fromEntries(alphabet.map(a => [a, dfa.states.includes(dfa.transitions[state]?.[a]) ? dfa.transitions[state][a] : state]))
    ]));
    update({ alphabet, transitions });
    setAlphabetText(alphabet.join(", "));
    setMessage(`Applied ${alphabet.length} input symbols. Complete the transition table below.`);
  }

  function addState() {
    const state = stateName.trim();
    if (!state || dfa.states.includes(state)) return setMessage("Enter a unique state name.");
    const transitions = { ...dfa.transitions, [state]: Object.fromEntries(dfa.alphabet.map(a => [a, state])) };
    update({ states: [...dfa.states, state], transitions });
    setStatesText([...dfa.states, state].join(", "));
    setStateName("");
    setMessage(`State ${state} added. Update its destinations in the table.`);
  }

  function addSymbol() {
    const item = symbol.trim();
    if (!item || dfa.alphabet.includes(item)) return setMessage("Enter a unique alphabet symbol.");
    const alphabet = [...dfa.alphabet, item];
    const transitions = Object.fromEntries(dfa.states.map(s => [s, { ...dfa.transitions[s], [item]: s }]));
    update({ alphabet, transitions });
    setAlphabetText(alphabet.join(", "));
    setSymbol("");
    setMessage(`Symbol ${item} added. Set its destination for every state.`);
  }

  function deleteState(state: string) {
    if (dfa.states.length === 1) return setMessage("A DFA must contain at least one state.");
    const states = dfa.states.filter(s => s !== state);
    const transitions = Object.fromEntries(states.map(s => [
      s,
      Object.fromEntries(dfa.alphabet.map(a => [a, dfa.transitions[s]?.[a] === state ? states[0] : (dfa.transitions[s]?.[a] ?? states[0])]))
    ]));
    const startState = dfa.startState === state ? states[0] : dfa.startState;
    const finalStates = dfa.finalStates.filter(s => s !== state);
    update({ states, transitions, startState, finalStates });
    setStatesText(states.join(", "));
    setMessage(`State ${state} removed. Transitions pointing to it were redirected to ${states[0]}.`);
  }

  function download() {
    const blob = new Blob([JSON.stringify(dfa, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dfa.json"; a.click(); URL.revokeObjectURL(url);
  }

  async function importFile(file?: File) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const result = validateDFA(parsed);
      if (!result.valid) throw new Error(result.errors.join(" "));
      setDFA(parsed);
      setStatesText(parsed.states.join(", "));
      setAlphabetText(parsed.alphabet.join(", "));
      setMessage("DFA imported successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid JSON file.");
    }
  }

  function exportCSV() {
    const rows = [["State", ...dfa.alphabet, "Type"], ...dfa.states.map(s => [
      `${s === dfa.startState ? "→ " : ""}${s}`,
      ...dfa.alphabet.map(a => dfa.transitions[s]?.[a] || ""),
      dfa.finalStates.includes(s) ? "Final" : "Normal"
    ])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "dfa-transition-table.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">Build your own automaton</p>
          <h1 className="mt-2 text-3xl font-black">DFA Builder</h1>
          <p className="mt-2 text-slate-400">Enter any set of states and symbols, then define every transition in one table.</p>
        </div>
        <Link href="/minimization" className="btn-primary inline-flex items-center gap-2">Minimize this DFA <ArrowRight size={16} /></Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-5">
          <section className="panel space-y-4 p-5">
            <div className="flex items-center gap-2"><WandSparkles className="text-violet-300" /><h2 className="font-bold">1. Define states and alphabet</h2></div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">STATES (Q) — comma or space separated</label>
              <textarea className="field min-h-20" value={statesText} onChange={e => setStatesText(e.target.value)} placeholder="q0, q1, q2, q3" />
              <button className="btn-primary mt-2" onClick={applyStates}>Apply states</button>
            </div>
            <div className="border-t border-white/10 pt-4">
              <label className="mb-2 block text-xs font-semibold text-slate-400">ALPHABET (Σ) — comma or space separated</label>
              <input className="field" value={alphabetText} onChange={e => setAlphabetText(e.target.value)} placeholder="0, 1" />
              <button className="btn-primary mt-2" onClick={applyAlphabet}>Apply alphabet</button>
            </div>
            <div className="rounded-xl border border-violet-300/15 bg-violet-400/5 p-3 text-sm text-slate-300">
              Current states: <strong className="text-violet-200">{dfa.states.length}</strong> · Input symbols: <strong className="text-cyan-200">{dfa.alphabet.length}</strong>
              <div className="mt-2 flex flex-wrap gap-2">{dfa.states.map(s => <span key={s} className="inline-flex items-center gap-2 rounded-lg bg-violet-400/10 px-2.5 py-1.5 text-violet-100">{s}<button aria-label={`Delete ${s}`} onClick={() => deleteState(s)}><Trash2 size={13} /></button></span>)}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2"><input className="field min-w-0" value={stateName} onChange={e => setStateName(e.target.value)} placeholder="Add one state" /><button className="btn-secondary" onClick={addState} aria-label="Add state"><Plus size={17} /></button></div>
              <div className="flex gap-2"><input className="field min-w-0" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Add one symbol" /><button className="btn-secondary" onClick={addSymbol} aria-label="Add symbol"><Plus size={17} /></button></div>
            </div>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-bold">2. Choose start and final states</h2>
            <div><label className="mb-2 block text-xs text-slate-400">START STATE (q₀)</label><select className="field" value={dfa.startState} onChange={e => update({ startState: e.target.value })}>{dfa.states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="mb-2 block text-xs text-slate-400">FINAL / ACCEPTING STATES (F)</label><div className="flex flex-wrap gap-2">{dfa.states.map(s => <label key={s} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"><input type="checkbox" checked={dfa.finalStates.includes(s)} onChange={e => update({ finalStates: e.target.checked ? [...dfa.finalStates, s] : dfa.finalStates.filter(x => x !== s) })} />{s}</label>)}</div></div>
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="font-bold">Import and export</h2>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary inline-flex items-center gap-2" onClick={download}><Download size={15} />JSON</button>
              <label className="btn-secondary inline-flex cursor-pointer items-center gap-2"><Upload size={15} />Import JSON<input type="file" accept="application/json,.json" className="hidden" onChange={e => importFile(e.target.files?.[0])} /></label>
              <button className="btn-secondary" onClick={exportCSV}>Export CSV table</button>
            </div>
            {message && <p role="status" className="text-sm text-cyan-200">{message}</p>}
          </section>
        </div>

        <section className="panel min-w-0 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Table2 className="text-cyan-300" /><div><h2 className="font-bold">3. Transition table δ</h2><p className="text-xs text-slate-400">Choose the next state for each state and input symbol.</p></div></div>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{dfa.states.length * dfa.alphabet.length} transitions</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead className="bg-white/[.07] text-slate-300"><tr><th className="px-4 py-3">State</th>{dfa.alphabet.map(a => <th key={a} className="min-w-28 px-3 py-3">δ(state, {a})</th>)}</tr></thead>
              <tbody>{dfa.states.map(state => <tr key={state} className="border-t border-white/10">
                <th className="whitespace-nowrap px-4 py-3 font-bold text-violet-200">{state === dfa.startState ? "→ " : ""}{state}{dfa.finalStates.includes(state) && <span className="ml-2 text-fuchsia-300">◎</span>}</th>
                {dfa.alphabet.map(a => <td key={a} className="px-2 py-2"><select aria-label={`Transition from ${state} on ${a}`} className="field min-w-24 py-2" value={dfa.transitions[state]?.[a] || ""} onChange={e => update({ transitions: { ...dfa.transitions, [state]: { ...dfa.transitions[state], [a]: e.target.value } } })}><option value="">Choose…</option>{dfa.states.map(target => <option key={target} value={target}>{target}</option>)}</select></td>)}
              </tr>)}</tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400"><span><strong className="text-cyan-300">→</strong> Start state</span><span><strong className="text-fuchsia-300">◎</strong> Final state</span><span>Each cell is one transition.</span></div>
          <div className="mt-5 flex items-center gap-2 font-bold"><CheckCircle2 className={validation.valid ? "text-emerald-300" : "text-rose-300"} /> DFA validation</div>
          {validation.valid ? <p className="mt-2 text-sm text-emerald-300">All states and transitions are complete. Your DFA is ready to visualize and minimize.</p> : <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-300">{validation.errors.map((error, i) => <li key={i}>{error}</li>)}</ul>}
          <Link href="/minimization" className="btn-primary mt-5 inline-flex items-center gap-2">Continue to step-by-step minimization <ArrowRight size={16} /></Link>
        </section>
      </div>

      <StateDiagram dfa={dfa} title="4. Original DFA visualization" />
      <section className="panel space-y-3 p-5"><div><h2 className="font-bold">Original DFA transition table</h2><p className="mt-1 text-xs text-slate-400">This is the complete transition table for the DFA you entered.</p></div><TransitionTable dfa={dfa} /></section>
    </div>
  );
}
