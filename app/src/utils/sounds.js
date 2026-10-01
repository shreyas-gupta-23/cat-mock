export function playBeep(frequency = 440, duration = 200, volume = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch (e) {}
}

export function playWarningBeep() {
  // 3 short beeps at 880Hz for 5 min remaining warning
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const frequency = 880;
    const beepDuration = 150;
    const gap = 100;
    const volume = 0.4;

    const playBeepAtTime = (startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + beepDuration / 1000);
      osc.start(startTime);
      osc.stop(startTime + beepDuration / 1000);
    };

    const now = ctx.currentTime;
    playBeepAtTime(now);
    playBeepAtTime(now + (beepDuration + gap) / 1000);
    playBeepAtTime(now + 2 * (beepDuration + gap) / 1000);

    setTimeout(() => ctx.close(), 3 * beepDuration + 2 * gap + 100);
  } catch (e) {}
}

export function playTimeUpSound() {
  // Descending tone for section time up
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const duration = 600;
    const startFreq = 880;
    const endFreq = 440;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration / 1000);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch (e) {}
}

export function playAnswerSound() {
  // Subtle click/tick when answer is selected
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const duration = 50;
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch (e) {}
}

export function playViolationSound() {
  // Harsh beep for proctoring violation
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const duration = 400;
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch (e) {}
}
