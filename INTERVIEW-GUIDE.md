# Interview preparation

## 45-second description

“I built a simulation-only analog signal-conditioning project with two buffered RC low-pass sections and a gain-two noninverting stage. I used an explicit finite-gain, finite-bandwidth op-amp model and white voltage-noise assumptions. I ran ngspice AC, transient and noise analyses plus 128 component-tolerance simulations, then checked the complex response and noise against independent equations. The project includes a public teaching demo and reproducible source. I have not built or measured it on physical hardware.”

Use this after personally running and understanding the work. Explain AI assistance accurately if asked.

## Questions to prepare

**Why a buffer between RC sections?** Without it, the second network loads the first. Their simple transfer functions would no longer multiply independently. The buffer isolates them within the model's ideal input/output impedance assumptions.

**Why isn't cutoff 1592 Hz?** That is each RC's individual pole. At that frequency, two identical sections are together down about 6 dB. The combined 3 dB cutoff is about 0.6436 times an individual pole, or 1024 Hz here.

**Is this Butterworth?** No. It is a cascade of two identical real RC poles. A Butterworth second-order filter requires different pole locations and Q.

**What does negative feedback do?** It feeds a portion of output to the minus input. With high enough loop gain, the circuit transfer approaches the resistor-defined gain. Finite loop gain creates a small gain error and frequency-dependent response.

**What is GBW?** For this single-dominant-pole model it sets the approximately constant gain-bandwidth product. A higher noise gain reduces closed-loop bandwidth. A real multi-pole op-amp also needs stability consideration.

**Where does noise come from?** R1, R2, Rf and Rg have thermal noise. Each op-amp has a specified white input-voltage-noise source. No flicker or current noise is included. Internal Rdom is noiseless because it is only a mathematical model element.

**Why doesn't noise fall like signal?** Sources are injected at different places. U2 and feedback-resistor noise enters after the two signal RC sections, so those sections cannot filter it.

**How did you verify it?** Compare actual complex SPICE output against independently implemented equations across 481 frequencies and all tolerance curves. Check noise density using source power summation. Check cutoff, step final value, overshoot bound and an RC-time-constant point. Separately compare JavaScript predictions against actual SPICE data.

**What does seed 17 mean?** It makes the pseudo-random tolerance component values reproducible. Sampling is independent uniform within stated bounds; it is not an asserted real manufacturing distribution.

**Does the histogram prove manufacturing yield?** No. There is no production specification or device population study. It reports 128 simulated samples under chosen assumptions.

**What would be needed for physical implementation?** Choose a real op-amp, supplies, component series and loading; include device models, rail/slew/input/output limits, parasitics and temperature behavior; then build and measure. Those are outside the laptop-only scope.

## Resume wording after review

“Designed and simulated a two-stage active low-pass signal-conditioning chain in ngspice; verified gain, bandwidth and output noise against independent equations and characterized component variation with 128 seeded tolerance runs.”

Never describe simulated values as hardware measurements, the generic model as a commercial op-amp, or the observed sample range as guaranteed worst-case performance.
