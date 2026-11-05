# FilterBench status — 2026-11-05

Completed: original generic linear op-amp/RC circuit; actual nominal AC, transient and noise runs; 128 actual seeded tolerance AC runs; independent equation checks; recorded CSVs/JSON; schematic; standalone scientific evidence figure; browser analytic explorer; custom netlist and JSON exports; beginner and interview guides; reproducible setup.

Local evidence: gain 1.99994 V/V, cutoff 1024.23 Hz, noise 25.47 µV RMS over 1 Hz–1 MHz; tolerance sample cutoffs 977.69–1075.99 Hz. Complex AC, noise, step and tolerance checks passed. JavaScript model agreement with actual SPICE data passed.

Publication is in progress: public GitHub and Vercel resources are being connected. Record final deployment, CI and live-flow results after completion. Preserve recorded evidence; do not rerun unchanged simulations without a concrete reason.

Scope: laptop-only analog simulation. No physical hardware or measurements; no paid services or AI API required. The website preview is analytic, not a remote SPICE runtime.
