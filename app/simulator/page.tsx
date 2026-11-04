"use client";
import {useMemo,useState} from "react";
import {useDFAStore} from "@/store/useDFAStore";
import {minimizeDFA} from "@/lib/minimization";
import {simulateDFA} from "@/lib/simulation";
import {validateDFA} from "@/lib/validation";
import StateDiagram from "@/components/StateDiagram";
import TransitionTable from "@/components/TransitionTable";

export default function Simulator(){
 const dfa=useDFAStore(s=>s.dfa);
 const [input,setInput]=useState("101");
 const [which,setWhich]=useState<"original"|"minimized">("original");
 const validation=useMemo(()=>validateDFA(dfa),[dfa]);
 const minimized=useMemo(()=>validation.valid?minimizeDFA(dfa).dfa:null,[dfa,validation.valid]);
 const active=which==="minimized"&&minimized?minimized:dfa;
 const result=validation.valid
  ?simulateDFA(active,input)
  :{accepted:false,steps:[],error:validation.errors.join(" ")};
 const path=result.steps.length
  ?[active.startState,...result.steps.map(s=>s.nextState)]
  :[active.startState];

 return <div className="mx-auto max-w-7xl space-y-6">
  <div><p className="text-sm uppercase tracking-[.2em] text-cyan-300">Language membership</p><h1 className="mt-2 text-3xl font-black">String Simulator</h1><p className="mt-2 text-slate-400">Run an input through each transition and see whether the final state is accepting.</p></div>
  <section className="panel p-5">
   <div className="grid gap-4 md:grid-cols-[1fr_auto]">
    <div><label className="mb-2 block text-xs text-slate-400">Input string (empty string is allowed)</label><input className="field text-lg tracking-widest" value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. 10101"/></div>
    <div><label className="mb-2 block text-xs text-slate-400">Machine</label><select className="field min-w-44" value={which} onChange={e=>setWhich(e.target.value as typeof which)}><option value="original">Original DFA</option><option value="minimized" disabled={!minimized}>Minimized DFA</option></select></div>
   </div>
   <div className="mt-4 flex flex-wrap gap-2"><button className="btn-secondary" onClick={()=>setInput("101")}>101</button><button className="btn-secondary" onClick={()=>setInput("1101")}>1101</button><button className="btn-secondary" onClick={()=>setInput("000")}>000</button><button className="btn-secondary" onClick={()=>setInput("")}>ε (empty)</button></div>
   {result.error?<p className="mt-5 rounded-xl bg-rose-400/10 p-4 text-sm text-rose-300">{result.error}</p>:<div className={`mt-5 rounded-xl p-4 ${result.accepted?"bg-emerald-400/10 text-emerald-300":"bg-rose-400/10 text-rose-300"}`}><div className="text-lg font-bold">{result.accepted?"✓ ACCEPTED":"✕ REJECTED"}</div><p className="mt-1 text-sm">End state: {path[path.length-1]} · {active.finalStates.includes(path[path.length-1])?"accepting":"non-accepting"}</p></div>}
  </section>
  <div className="panel p-5"><h2 className="mb-4 font-bold">State traversal</h2><div className="flex flex-wrap items-center gap-2">{path.map((s,i)=><span key={i} className="flex items-center gap-2"><span className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-semibold text-cyan-100">{s}</span>{i<path.length-1&&<span className="text-slate-500">—{result.steps[i]?.symbol}→</span>}</span>)}</div></div>
  <div><h2 className="mb-3 font-bold">Simulation trace</h2><div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/5 text-slate-400"><tr>{["Step","Current state","Input","Next state"].map(x=><th className="px-4 py-3" key={x}>{x}</th>)}</tr></thead><tbody>{result.steps.map(s=><tr key={s.index} className="border-t border-white/5"><td className="px-4 py-3">{s.index}</td><td className="px-4 py-3">{s.state}</td><td className="px-4 py-3">{s.symbol}</td><td className="px-4 py-3">{s.nextState}</td></tr>)}</tbody></table></div></div>
  <StateDiagram dfa={active}/><TransitionTable dfa={active}/>
 </div>;
}
