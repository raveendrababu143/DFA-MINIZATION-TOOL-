"use client";
import { create } from "zustand";
import type { DFA } from "@/types/automata";
import { examples } from "@/lib/examples";
interface DFAState { dfa:DFA; setDFA:(dfa:DFA)=>void; reset:()=>void }
export const useDFAStore=create<DFAState>((set)=>({dfa:examples[0].dfa,setDFA:(dfa)=>set({dfa}),reset:()=>set({dfa:examples[0].dfa})}));
