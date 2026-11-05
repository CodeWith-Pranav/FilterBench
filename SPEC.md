# FilterBench specification

## Objective

Design and examine a roughly 1 kHz, gain-two low-pass signal-conditioning chain using free laptop simulation. Deliver source, a reproducible test suite, actual frequency/noise/transient data, 128 tolerance samples and an interactive explanatory site.

## Nominal circuit

R1=R2=10 kΩ, C1=C2=10 nF. First RC feeds unity-gain buffer U1, isolating the second RC from loading the first. Second RC feeds U2 in noninverting configuration with Rf=Rg=10 kΩ. Thus ideal low-frequency gain is 1+Rf/Rg=2. Ground is 0 V; input is an ideal zero-impedance source. All capacitors are ideal; no external load is modeled. Eout in each model is an ideal voltage source with zero output impedance. The op-amp control input is infinite impedance.

The op-amp is an original generic linear subcircuit with A0=100000 and GBW=3 MHz. A VCVS, a noiseless mathematical RC dominant pole, and another VCVS implement A(s)=A0/(1+s A0/(2π GBW)). This introduces no supply rails, clipping or slew-rate behavior. Internal Rdom has `noisy=0`; it is not a physical noise source.

Each op-amp has 10 nV/√Hz white input-voltage noise. A resistor at 27 °C produces that density through Rn=en²/(4 k T); a unity VCVS adds its noise voltage to the noninverting input. That resistor has zero DC node voltage, no signal loading, and no 1/f noise coefficient. R1, R2, Rf and Rg supply their normal thermal noise.

## Analyses and metrics

- AC: 80 points/decade, 1 Hz–1 MHz, unit AC input. Export full complex response; display unwrapped phase.
- Bandwidth: relative to gain at 1 Hz, first downward crossing of gain/√2, interpolated linearly in dB versus log frequency. Exact analytic cutoff uses DC gain and bisection, so minor grid/interpolation differences are expected.
- Transient: 0 to 5 ms, maximum step 2 µs. Input rises from 0 to 100 mV between 0.9999 ms and 1 ms and stays there.
- 1% settling time: earliest sampled time after 1 ms from which all remaining output samples are within 1% of the final simulated output. Finite observation window; no claim about arbitrary nonlinear settling.
- Noise: ngspice small-signal spectral analysis, output voltage and input-referred amplitude density; integrate output power density by trapezoids over 1 Hz–1 MHz, then take square root. This is band-limited RMS, not all-frequency integrated noise. Assumes uncorrelated sources. No current or flicker noise or interference.
- Tolerances: 128 actual AC runs; Python Random seed 17; independent uniform ±1% for R1, R2, Rf, Rg and ±5% for C1, C2. A0/GBW/en/temp fixed. Quantiles linearly interpolate sorted sampled cutoffs; standard deviation is sample stdev. No worst-case guarantee or fabricated yield specification.

## Browser scope

R1=R2 adjustable from 1–100 kΩ; C1=C2 from 1–100 nF; target gain from 1.1–10; GBW from 0.1–10 MHz. Rg stays 10 kΩ; Rf=(gain−1)Rg. A0 and en fixed. Preview uses exact finite-model equations; nominal recorded evidence stays fixed. Export JSON states the analytic origin; export netlist uses the same generic model. Browsing requires no login and all data remains local to the browser. No custom netlist is executed on the server.

## Exclusions

No physical hardware, components, FPGA, vendor op-amp selection, power optimization, transistor-level IC design, PCB layout, fabricated measurements, paid services or AI API. This is an undergraduate analog design/simulation portfolio project.
