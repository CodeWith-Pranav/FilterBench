# FilterBench status — 2026-11-05

Completed: original generic linear op-amp/RC circuit; actual nominal AC, transient and noise runs; 128 actual seeded tolerance AC runs; independent equation checks; recorded CSVs/JSON; schematic; standalone scientific evidence figure; browser analytic explorer; custom netlist and JSON exports; beginner and interview guides; reproducible setup.

Local evidence: gain 1.99994 V/V, cutoff 1024.23 Hz, noise 25.47 µV RMS over 1 Hz–1 MHz; tolerance sample cutoffs 977.69–1075.99 Hz. Complex AC, noise, step and tolerance checks passed. JavaScript model agreement with actual SPICE data passed.

Publication complete: https://filterbench.vercel.app/ and https://github.com/CodeWith-Pranav/FilterBench . Vercel is connected to main. GitHub Actions run 41965209900 passed the complete simulation and browser-model checks on the CI-setup checkpoint 0849ea7. Final documentation edits trigger another normal run and deployment.

Live verification completed: nominal report loads; resistance doubling moves analytic cutoff to about 512.2 Hz; phase view works; reset restores nominal; custom R=20kΩ, C=22nF, gain=5, GBW=0.3MHz updates to about 232.8 Hz. JSON and custom-netlist downloads completed and parsed. The actual downloaded custom netlist ran in ngspice and all 481 complex AC points matched independent equations (max relative error about 4.05e-12). See export-check.txt.

Source publication checkpoint files matched local source byte for byte. Browser evidence remains fixed while preview settings change, as specified. No dedicated mobile, accessibility or load audit is claimed. Preserve recorded evidence and resume from this checkpoint; do not rerun unchanged simulations without a concrete reason.

Scope: laptop-only analog simulation. No physical hardware or measurements; no paid services or AI API required. The website preview is analytic, not a remote SPICE runtime.
