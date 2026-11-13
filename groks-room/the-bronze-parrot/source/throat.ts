import type { Phone } from "@/lib/voice-model";

export class EarClosed extends Error {
  constructor() {
    super("The ear isn't open. That's allowed. You can still type.");
  }
}

const noises = new WeakMap<AudioContext, AudioBuffer>();

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const existing = noises.get(ctx);
  if (existing) return existing;
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noises.set(ctx, buffer);
  return buffer;
}

function envAt(ctx: AudioContext, t: number, dur: number): GainNode {
  const gain = ctx.createGain();
  const attack = Math.min(0.018, dur * 0.28);
  const release = Math.min(0.04, dur * 0.35);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(1, t + attack);
  const hold = Math.max(attack + 0.005, dur - release);
  gain.gain.setValueAtTime(1, t + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return gain;
}

function band(ctx: AudioContext, freq: number, q: number, t: number): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(Math.max(80, freq), t);
  filter.Q.setValueAtTime(q, t);
  return filter;
}

export type CastHandle = {
  finished: Promise<void>;
  stop: () => void;
};

/** Three formants, a pitch, a little noise. A chip, not a person. */
export function speakCast(
  ctx: AudioContext,
  phones: Phone[],
  pitch: number,
  onPhone: (phone: Phone | null) => void,
): CastHandle {
  const master = ctx.createGain();
  master.gain.value = 0.42;
  const cabinet = ctx.createBiquadFilter();
  cabinet.type = "lowpass";
  cabinet.frequency.value = 4200;
  cabinet.Q.value = 0.4;
  master.connect(cabinet);
  cabinet.connect(ctx.destination);

  const noise = noiseBuffer(ctx);
  const timers: number[] = [];
  const oscillators: OscillatorNode[] = [];
  const sources: AudioBufferSourceNode[] = [];
  let settled = false;
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
  });

  const t0 = ctx.currentTime + 0.06;
  let cursor = t0;

  const tick = ctx.createOscillator();
  const tickGain = ctx.createGain();
  tick.frequency.setValueAtTime(180, t0);
  tick.type = "square";
  tickGain.gain.setValueAtTime(0.03, t0);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
  tick.connect(tickGain);
  tickGain.connect(master);
  tick.start(t0);
  tick.stop(t0 + 0.04);
  oscillators.push(tick);

  for (const phone of phones) {
    const start = cursor;
    const dur = phone.dur;
    cursor += dur + phone.gap;
    const delay = Math.max(0, (start - ctx.currentTime) * 1000);
    timers.push(window.setTimeout(() => onPhone(phone.f1 > 0 ? phone : null), delay));
    if (!phone.voiced && phone.noise <= 0) continue;

    const spoken = envAt(ctx, start, dur);
    spoken.connect(master);
    const hz = pitch * (0.96 + Math.random() * 0.07);

    if (phone.voiced) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(hz, start);
      const body = ctx.createGain();
      body.gain.value = 0.22;
      osc.connect(body);
      body.connect(spoken);
      const levels = [0.55, 0.32, 0.18];
      [phone.f1, phone.f2, phone.f3].forEach((freq, index) => {
        if (freq < 90) return;
        const filter = band(ctx, freq, 4.2, start);
        const level = ctx.createGain();
        level.gain.value = levels[index] ?? 0.15;
        osc.connect(filter);
        filter.connect(level);
        level.connect(spoken);
      });
      osc.start(start);
      osc.stop(start + dur + 0.02);
      oscillators.push(osc);
    }

    if (phone.noise > 0) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const filter = band(ctx, phone.noiseHz, phone.voiced ? 1.4 : 0.8, start);
      const level = ctx.createGain();
      level.gain.value = phone.noise * (phone.voiced ? 0.35 : 0.7);
      src.connect(filter);
      filter.connect(level);
      level.connect(spoken);
      src.start(start);
      src.stop(start + dur + 0.02);
      sources.push(src);
    }
  }

  const endMs = Math.max(40, (cursor - ctx.currentTime) * 1000 + 50);
  const endTimer = window.setTimeout(() => {
    onPhone(null);
    resolveFinished();
  }, endMs);
  timers.push(endTimer);

  return {
    finished,
    stop: () => {
      timers.forEach((id) => window.clearTimeout(id));
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0.0001, now);
      for (const osc of oscillators) {
        try {
          osc.stop(now);
        } catch {
          /* already stopped */
        }
      }
      for (const src of sources) {
        try {
          src.stop(now);
        } catch {
          /* already stopped */
        }
      }
      onPhone(null);
      resolveFinished();
    },
  };
}

export function speakBorrowed(
  text: string,
  onEnd: () => void,
): { stop: () => void } {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.94;
  utterance.pitch = 1.12;
  utterance.lang = "en-US";
  const voices = window.speechSynthesis.getVoices();
  const male = voices.find(
    (voice) => /en(-|_)?(US|GB)?/i.test(voice.lang) && /david|daniel|alex|fred|male|rishi/i.test(voice.name),
  );
  if (male) utterance.voice = male;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onEnd();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return {
    stop: () => {
      window.speechSynthesis.cancel();
      finish();
    },
  };
}

export function clink(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1560, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.22);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.46);
}

export type Recording = {
  blob: Promise<Blob>;
  stop: () => void;
};

export function recordAir(maxMs = 6000): Recording {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      blob: Promise.reject(new EarClosed()),
      stop: () => {},
    };
  }

  let stopRec: () => void = () => {};
  const blob = navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(
      (stream) =>
        new Promise<Blob>((resolve, reject) => {
          const preferred = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
          const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
          const chunks: Blob[] = [];
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
          };
          recorder.onerror = () => {
            stream.getTracks().forEach((track) => track.stop());
            reject(new EarClosed());
          };
          recorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop());
            resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
          };
          stopRec = () => {
            if (recorder.state !== "inactive") recorder.stop();
          };
          recorder.start();
          window.setTimeout(stopRec, maxMs);
        }),
    )
    .catch(() => {
      throw new EarClosed();
    });

  return {
    blob,
    stop: () => stopRec(),
  };
}

export function playAir(ctx: AudioContext, buffer: AudioBuffer, rate = 1.62): CastHandle {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  source.connect(gain);
  gain.connect(ctx.destination);
  const started = ctx.currentTime + 0.02;
  source.start(started);
  const ms = (buffer.duration / rate) * 1000 + 80;
  let settled = false;
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
  });
  const timer = window.setTimeout(() => resolveFinished(), ms);
  return {
    finished,
    stop: () => {
      window.clearTimeout(timer);
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      resolveFinished();
    },
  };
}
