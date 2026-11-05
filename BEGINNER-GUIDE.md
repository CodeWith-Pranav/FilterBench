# Start from zero: the analog project

## What is it?

A filter changes how much of a signal gets through at different frequencies. A low-pass passes slow variations and weakens faster ones. It can help condition a sensor's signal before conversion to digital data. This design also multiplies the slow signal by about two.

You are describing a circuit in a text file and asking ngspice to solve its electrical equations. No physical resistor, capacitor, oscilloscope or board is required. The website helps explain the circuit and share the evidence. It does not replace the simulator and does not need an AI model, backend or database.

## Learn the components

A resistor relates voltage and current. A capacitor stores charge and changes impedance with frequency. Put a resistor in series and a capacitor from its output to ground: slow variations appear at the output, while fast variations are increasingly diverted through the capacitor.

An op-amp amplifies the difference between two input voltages. Negative feedback connects its output back to the minus input so the closed-loop circuit becomes useful and predictable. U1 connects its output directly to minus and behaves approximately as a buffer: output follows input. Its high input impedance avoids loading the first RC. U2 uses two feedback resistors to give approximately 1+Rf/Rg gain.

A real op-amp is limited. This project models finite open-loop gain, bandwidth and white input-voltage noise. It deliberately does not model power rails, clipping, slew rate or all real noise mechanisms. You should be able to state those limits in an interview.

## First run

Download or clone the public repository. Open a terminal in the directory containing Makefile. Follow the README installation commands, then run make simulate. You should see nominal metrics and all 128 tolerance curves checked. Run make test with Node.js installed. Optional make plot requires matplotlib. The real waveform data is already provided, so you can inspect the project before installing plot dependencies.

Start with nominal.cir. The first line names the circuit. R lines are resistors, C lines capacitors, E lines dependent voltage sources, X lines subcircuit instances. Node 0 is ground. The .control section asks for AC, transient and noise analyses. Running ngspice -b nominal.cir writes ac.txt, step.txt and noise.txt in your current directory. To regenerate the organized project evidence, use make simulate instead.

## Read a Bode plot

The horizontal frequency axis is logarithmic: equal distances represent factors of ten. The gain axis is decibels: 20 log10(output/input). Gain two is about 6.02 dB. Zero dB means equal amplitude, not zero voltage. The −3 dB cutoff here is relative to the passband, so it occurs at about +3.01 dB absolute gain.

Each 10 kΩ/10 nF RC pole is near 1592 Hz. Two cascaded identical poles put the combined −3 dB cutoff lower, near 1024 Hz. Do not call this Butterworth: the shape and pole placement are different.

Phase describes the shift between output and input sine waves. It becomes increasingly negative as frequency rises. Phase is unwrapped in the plots to avoid a misleading jump from −180 to +180 degrees.

## Read the other analyses

The step plot shows how output moves after input changes rapidly. Here a 100 mV input settles near 200 mV; the response takes time because capacitors store charge. This small-signal model does not predict a real op-amp's clipping or slew-rate limit.

Noise density is measured in V/√Hz. To obtain RMS noise, square the density, integrate over a frequency interval, then take square root. “25.47 µV RMS over 1 Hz–1 MHz” needs those frequency limits. That is not a physical oscilloscope measurement.

Tolerance analysis changes component values within stated bounds. We ran 128 separate SPICE AC simulations. Each sample uses its own actual R/C values, recorded in tolerance.csv. Their histogram shows one assumed sample distribution; its extremes are not guaranteed worst-case limits.

## Use the website

The upper four metrics and lower evidence panels always show recorded nominal results. Change resistance, capacitance, gain or GBW and click Update preview to change the green analytic curve. Orange stays the actual recorded nominal curve. Try doubling R: the cutoff should roughly halve. Reset restores nominal. Export JSON records your design and predicted metrics. Export netlist gives you a custom circuit to simulate offline.

## Make one change yourself

Keep the original evidence. Predict what happens if both capacitors double, then change c1 and c2 in DEFAULT in circuit.py. Run make simulate, make test and make plot. If you change nominal defaults, also update defaults in model.mjs, the default form values, schematic, tests and documentation. Preview the site and make a real commit with your changes. A custom one-off exploration can use the browser netlist export without editing project defaults.

## What to explain honestly

Explain the two RC stages, why U1 exists, how Rf/Rg gives gain, and why both filters do not suppress every noise source. State the simulator, assumed tolerances and missing real-device effects. If asked how you built it, describe AI assistance truthfully and explain the parts you understand. Do not claim PCB fabrication, real component selection, laboratory measurements or transistor-level amplifier design.
