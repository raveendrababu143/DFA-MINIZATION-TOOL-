# DFA Minimization Tool – Interactive Finite Automata Visualizer

A college-level automata theory project built with Next.js App Router, TypeScript, Tailwind CSS, React Flow, Framer Motion, Lucide React, and Zustand.

## Features

- DFA builder with state/alphabet editing, start/final-state selection, transition editing, validation, JSON import/export, and CSV export.
- Interactive state diagram with draggable nodes, pan/zoom, directed labeled edges, self-loops, and final-state styling.
- DFA minimization using reachable-state analysis and iterative partition refinement.
- Step-by-step partition explanation, original/minimized comparison, and string simulation.
- Five prebuilt examples and a learning section.

## Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Quality checks

```bash
npm run typecheck
npm run build
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at https://vercel.com/new.
3. Select the Next.js framework preset.
4. Use `npm install` and `npm run build`.
5. Deploy. No environment variables are required for the core application.

## Algorithm

1. Validate that the transition function is complete and all states/symbols are valid.
2. Find states reachable from the start state.
3. Discard unreachable states.
4. Partition reachable states into accepting and non-accepting groups.
5. Repeatedly split groups when states transition into different groups for any alphabet symbol.
6. Convert each stable partition into one state of the minimized DFA.

The string tester reads input as Unicode code points; use single-character alphabet symbols when entering a string.
