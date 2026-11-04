"use client";
import StateDiagram from "@/components/StateDiagram";
import TransitionTable from "@/components/TransitionTable";
import {useDFAStore} from "@/store/useDFAStore";
export default function Visualization(){const dfa=useDFAStore(s=>s.dfa);return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm uppercase tracking-[.2em] text-cyan-300">Graph explorer</p><h1 className="mt-2 text-3xl font-black">DFA Visualization</h1><p className="mt-2 text-slate-400">Drag states, zoom, pan, and inspect the directed transition graph.</p></div><StateDiagram dfa={dfa}/><TransitionTable dfa={dfa}/><p className="text-xs text-slate-500">Incoming arrow marks q₀ · double ring marks accepting states · edge labels show input symbols.</p></div>}
