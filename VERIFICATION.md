# Verification record

Recorded local engine: ngspice-39 on Linux x86_64; run date 2026-11-05. Data in report.json, nominal log in ngspice.log, check output in verification.txt. The original generic linear model is in circuit.py and nominal.cir. No externally supplied vendor model is used.

## Actual checks performed

| Check | Evidence / requirement |
|---|---|
| Complex AC response | 481 actual points, 1 Hz–1 MHz; maximum relative difference from independent equations 1.33e-11 or lower in recorded run |
| Noise density | 481 actual points; maximum relative difference from independent source-power budget about 1.74e-7 |
| Gain / final step | 100 mV input yields approximately 199.994 mV output, matches finite-A0 DC gain |
| Step bound | No overshoot above final value by more than 0.1% |
| Cutoff | Interpolated SPICE cutoff within 0.2% of ideal repeated-pole equation at nominal values |
| One-time-constant response | Sample near one RC time constant after step agrees with 1−2/e within stated 1.5% absolute normalized tolerance |
| Tolerance sweep | 128 actual ngspice AC curves; each compared to its own perturbed circuit equations |
| Browser model | 481 magnitude/phase and 481 noise comparisons to actual SPICE, cutoff and RC scaling, invalid values and export-model content checked |

Cutoff interpolation uses dB versus log f and gain at 1 Hz as reference. Analytic preview uses DC reference and bisection. Their small difference is expected. Noise RMS uses trapezoidal integration of squared output density over the specified finite band; it is not a sum of density values or an all-frequency result. Unwrapped displayed phase derives from actual complex AC values.

All sample R1/R2/Rf/Rg values are drawn independently within ±1%; C1/C2 within ±5%. Python Random seed=17, 128 cases. Sample extrema are approximately 977.69 and 1075.99 Hz; central sampled 5–95% interval is 994.19–1055.84 Hz. These are distribution summaries, not confidence bounds or manufacturing guarantees.

## Reproduction

`make simulate` reruns nominal and tolerance analyses and assertions. `make test` independently checks the JS model against the generated SPICE report. `make plot` refreshes the standalone figure from that report. Individual generated netlists and raw engine logs reside under ignored build/. Keep source and recorded evidence together when making circuit changes.

The GitHub workflow runs with contents:read. It installs free ngspice, runs Python simulation and JavaScript checks, then uploads evidence artifacts. It never commits or pushes code. Vercel builds the recorded static demo from main; CI and deployment run independently.

## Practical limits

No FPGA work, transistor-level device design, physical implementation, PCB parasitics, input source resistance, output load, measured power, phase margin analysis, saturation, slew limiting, input current noise, 1/f noise, tolerances on GBW/A0/en or temperature sweep. A selected real op-amp can behave differently. No dedicated mobile-device, accessibility or load audit is claimed. Browser live-flow verification is recorded in PROJECT-STATUS.md when publication finishes.

## Primary reference

Official ngspice user manual: https://ngspice.sourceforge.io/docs/ngspice-manual.pdf — circuit elements, dependent sources, resistor noise, AC/transient/noise analyses, and control-language data export. Consult the manual matching your installed engine version; the online development manual may be newer. No source passages or vendor netlists were copied into this project.

## Publication and browser checks

Live site: https://filterbench.vercel.app/
Public source: https://github.com/CodeWith-Pranav/FilterBench

CI setup checkpoint 0849ea7: GitHub Actions run 41965209900 completed successfully, rerunning nominal and 128 tolerance SPICE runs, JavaScript agreement checks and static build. Final documentation edits receive normal subsequent CI runs.

Live browser checks: recorded report loading, resistance scaling (20 kΩ gives about 512.2 Hz), phase switching, nominal reset, and custom parameters 20 kΩ/22 nF/gain 5/GBW 0.3 MHz. JSON download parsed with the expected parameters. Custom netlist download was run in ngspice; its 481 complex AC points agreed with independent equations to about 4.05e-12 relative error. Its interpolated cutoff was 232.767 Hz versus analytic bisection 232.795 Hz; the sampling/interpolation difference is expected. Details in export-check.txt.
