// audio.js — every sound is synthesised live with WebAudio. No audio
// files, no network: a gobble is a wobbling sawtooth, a knife is filtered
// noise, the escape jingle is a little major arpeggio.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      ctx = new AudioContext();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensureContext();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function noise(dur, vol, filterFreq) {
    if (muted) return;
    const ac = ensureContext();
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1200;
    const gain = ac.createGain();
    gain.gain.value = vol || 0.15;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  }

  return {
    unlock() { ensureContext(); },
    get muted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    // The turkey's signature: three quick descending gobbles.
    gobble() {
      tone(320, 0.09, 'sawtooth', 0.10, 180);
      setTimeout(() => tone(300, 0.09, 'sawtooth', 0.10, 170), 90);
      setTimeout(() => tone(280, 0.12, 'sawtooth', 0.10, 150), 180);
    },
    jump() { tone(280, 0.16, 'sine', 0.10, 560); },
    dash() { noise(0.18, 0.12, 2400); },
    pickup() { tone(660, 0.09, 'triangle', 0.12); setTimeout(() => tone(880, 0.12, 'triangle', 0.12), 80); },
    hurt() { tone(220, 0.25, 'sawtooth', 0.14, 90); noise(0.15, 0.10, 500); },
    knifeWhoosh() { noise(0.22, 0.14, 3200); },
    // Two-note alarm when the farmer spots the turkey.
    spotted() { tone(520, 0.12, 'square', 0.07); setTimeout(() => tone(392, 0.16, 'square', 0.07), 130); },
    hide() { noise(0.3, 0.08, 700); },
    stageClear() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.12), i * 110)); },
    // Escaped! A rising major arpeggio, then a gobble of triumph.
    escapeJingle() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.13), i * 130));
      setTimeout(() => this.gobble(), 560);
    },
    // Caught: a short descending trombone-ish sigh.
    caughtSting() { tone(330, 0.5, 'sawtooth', 0.10, 110); tone(165, 0.6, 'sawtooth', 0.07, 82); },
  };
}
