// ===================================================================
// VIGHNAHARTA AUDIO MANAGER (PROCEDURAL WEB AUDIO SYNTHESIZER)
// Provides authentic Indian temple soundscapes, dynamic runner rhythms,
// resonant temple bells, sacred drones, and responsive interaction audio.
// ===================================================================

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.droneOscillators = [];
    this.isPlayingMusic = false;
    this.musicBeatTimer = null;
    this.bpm = 112;
    this.beatIndex = 0;
    this.currentStage = 1;
    this.isTempleClimax = false;
    this.comboCounter = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Dynamic Runner Rhythmic Music Generator ---
  startRunnerMusic() {
    if (this.isPlayingMusic) return;
    this.init();
    this.resume();
    this.isPlayingMusic = true;
    this.isTempleClimax = false;
    this.beatIndex = 0;
    this.scheduleNextBeat();
    this.startSacredDrone();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicBeatTimer) {
      clearTimeout(this.musicBeatTimer);
      this.musicBeatTimer = null;
    }
    this.stopSacredDrone();
  }

  setSpeedFactor(speedRatio) {
    // Dynamically adjust BPM with runner speed
    this.bpm = Math.min(145, 110 + (speedRatio - 1.0) * 25);
  }

  scheduleNextBeat() {
    if (!this.isPlayingMusic) return;

    const intervalMs = (60 / this.bpm / 2) * 1000; // Eighth notes
    this.playPercussionBeat(this.beatIndex);
    this.beatIndex = (this.beatIndex + 1) % 16;

    this.musicBeatTimer = setTimeout(() => {
      this.scheduleNextBeat();
    }, intervalMs);
  }

  // Synthesize Indian Dholak / Tabla Rhythm Pattern
  playPercussionBeat(step) {
    if (!this.ctx || this.isMuted || this.isTempleClimax) return;
    const t = this.ctx.currentTime;

    // Dholak Bass (Geer / Dhin) on steps 0, 4, 8, 10
    if (step === 0 || step === 6 || step === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.22);
    }

    // High Snare / Ta slap on steps 2, 4, 8, 12, 14
    if (step === 4 || step === 12 || step === 14) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }

    // Manjira (brass finger cymbals) high shimmer on steps 2, 6, 10, 14
    if (step % 4 === 2) {
      this.playManjira(0.08);
    }
  }

  playManjira(volume = 0.1) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2450, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // --- Sacred Tanpura & Flute Drone ---
  startSacredDrone() {
    this.stopSacredDrone();
    if (!this.ctx) return;
    const baseFreq = 108; // Sacred Om fundamental
    const ratios = [1.0, 1.5, 2.0, 3.0]; // Sa - Pa - Sa (octave) - Pa (fifth)

    ratios.forEach((r, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * r, this.ctx.currentTime);

      const vol = 0.08 / (idx + 1);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);

      // Add gentle LFO pulsing
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();

      this.droneOscillators.push({ osc, gain, lfo });
    });
  }

  stopSacredDrone() {
    this.droneOscillators.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch (e) {}
    });
    this.droneOscillators = [];
  }

  // --- Sound FX: Golden Star Pickup ---
  playStarPickup(combo = 1) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const noteIdx = (combo - 1) % pentatonic.length;
    const freq = pentatonic[noteIdx];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // Harmonic sparkle
    const sparkle = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(freq * 2.5, t + 0.04);
    sGain.gain.setValueAtTime(0.15, t + 0.04);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    sparkle.connect(sGain);
    sGain.connect(this.sfxGain);
    sparkle.start(t + 0.04);
    sparkle.stop(t + 0.28);
  }

  // --- Sound FX: Jump Whoosh ---
  playJump() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // --- Sound FX: Slide Skid ---
  playSlide() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // --- Sound FX: Lane Shift ---
  playLaneShift() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // --- Sound FX: Temple Bell (Ghanta) ---
  playTempleBell(loudness = 0.5) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Temple bell overtone series: Fundamental + Minor 3rd + Fifth + Octave
    const partials = [
      { f: 587.33, g: 0.5 * loudness, dur: 2.2 },  // D5
      { f: 784.00, g: 0.35 * loudness, dur: 1.8 }, // G5
      { f: 1174.66, g: 0.25 * loudness, dur: 1.4 },// D6
      { f: 1760.00, g: 0.15 * loudness, dur: 0.9 },// A6
      { f: 2349.32, g: 0.08 * loudness, dur: 0.6 } // D7
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, t);
      gain.gain.setValueAtTime(p.g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + p.dur);
    });
  }

  // --- Sound FX: Obstacle Impact ---
  playImpact() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  // --- Transition to Sacred Temple Climax ---
  transitionToTempleClimax() {
    this.isTempleClimax = true;
    if (!this.ctx) return;

    // Fade out fast percussion and introduce peaceful divine temple harmonics
    this.playTempleBell(0.9);
    setTimeout(() => this.playTempleBell(0.7), 900);
    setTimeout(() => this.playTempleBell(0.8), 2100);

    // Deep sacred resonance
    const t = this.ctx.currentTime;
    const omOsc = this.ctx.createOscillator();
    const omGain = this.ctx.createGain();
    omOsc.type = 'sine';
    omOsc.frequency.setValueAtTime(108, t); // Sacred 108Hz
    omGain.gain.setValueAtTime(0.01, t);
    omGain.gain.linearRampToValueAtTime(0.45, t + 3.0);

    omOsc.connect(omGain);
    omGain.connect(this.musicGain);
    omOsc.start(t);

    // Continuous soft Aarti rhythmic bell
    const aartiInterval = setInterval(() => {
      if (!this.isTempleClimax) {
        clearInterval(aartiInterval);
        return;
      }
      this.playManjira(0.12);
    }, 750);
  }
}
