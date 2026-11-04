"use client";
import { useMemo } from "react";
import { Background, Controls, MiniMap, ReactFlow, MarkerType, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { DFA } from "@/types/automata";

export default function StateDiagram({ dfa, title="State transition diagram" }: { dfa: DFA; title?: string }) {
 const nodes = useMemo<Node[]>(() => dfa.states.map((state,i) => ({
  id:state, position:{x:100+(i%4)*190,y:90+Math.floor(i/4)*155},
  data:{label:<div className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 text-sm font-bold shadow-xl ${state===dfa.startState?"border-cyan-300 bg-cyan-400/20 text-cyan-100":dfa.finalStates.includes(state)?"border-fuchsia-300 bg-fuchsia-500/20 text-fuchsia-100":"border-slate-500 bg-slate-800 text-white"}`}>{state}{dfa.finalStates.includes(state)&&<span className="pointer-events-none absolute inset-[5px] rounded-full border border-fuchsia-300/80"/>}{state===dfa.startState&&<span className="absolute -left-7 text-cyan-300">→</span>}</div>}
 })),[dfa]);
 const edges = useMemo<Edge[]>(() => {
  const grouped = new Map<string,string[]>();
  for (const from of dfa.states) for (const symbol of dfa.alphabet) {
   const to=dfa.transitions[from]?.[symbol]; if(!to) continue;
   const key=from+"::"+to; grouped.set(key,[...(grouped.get(key)||[]),symbol]);
  }
  return [...grouped.entries()].map(([key,symbols])=>{const [source,target]=key.split("::");return {id:key,source,target,label:symbols.join(", "),type:source===target?"default":"smoothstep",animated:true,style:{stroke:"#9b8cff",strokeWidth:2},labelStyle:{fill:"#e8e5ff",fontWeight:700},markerEnd:{type:MarkerType.ArrowClosed,color:"#9b8cff"}} as Edge;});
 },[dfa]);
 return <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1225]"><div className="border-b border-white/10 px-5 py-3 text-sm font-semibold text-slate-200">{title}</div><div className="h-[420px]"><ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{padding:.25}} nodesDraggable nodesConnectable={false}><Background color="#334155" gap={22}/><Controls/><MiniMap nodeColor={(n)=>n.id===dfa.startState?"#22d3ee":dfa.finalStates.includes(n.id)?"#d946ef":"#64748b"}/></ReactFlow></div></div>;
}
