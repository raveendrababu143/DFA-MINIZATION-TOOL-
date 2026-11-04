import type { DFA } from "@/types/automata";
export const examples: { id: string; title: string; description: string; dfa: DFA }[] = [
{ id:"ends-zero", title:"Binary strings ending in 0", description:"Accepts strings whose last symbol is 0.", dfa:{states:["q0","q1"],alphabet:["0","1"],startState:"q0",finalStates:["q1"],transitions:{q0:{0:"q1",1:"q0"},q1:{0:"q1",1:"q0"}}}},
{ id:"contains-101", title:"Binary strings containing 101", description:"Tracks progress toward the substring 101.", dfa:{states:["q0","q1","q2","q3"],alphabet:["0","1"],startState:"q0",finalStates:["q3"],transitions:{q0:{0:"q0",1:"q1"},q1:{0:"q2",1:"q1"},q2:{0:"q0",1:"q3"},q3:{0:"q3",1:"q3"}}}},
{ id:"even-ones", title:"Even number of 1s", description:"Accepts when the count of 1s is even.", dfa:{states:["even","odd"],alphabet:["0","1"],startState:"even",finalStates:["even"],transitions:{even:{0:"even",1:"odd"},odd:{0:"odd",1:"even"}}}},
{ id:"odd-zeros", title:"Odd number of 0s", description:"Accepts when the count of 0s is odd.", dfa:{states:["even","odd"],alphabet:["0","1"],startState:"even",finalStates:["odd"],transitions:{even:{0:"odd",1:"even"},odd:{0:"even",1:"odd"}}}},
{ id:"divisible-three", title:"Binary numbers divisible by 3", description:"Remainder-state DFA; leading zeroes are permitted.", dfa:{states:["r0","r1","r2"],alphabet:["0","1"],startState:"r0",finalStates:["r0"],transitions:{r0:{0:"r0",1:"r1"},r1:{0:"r2",1:"r0"},r2:{0:"r1",1:"r2"}}}}
];
