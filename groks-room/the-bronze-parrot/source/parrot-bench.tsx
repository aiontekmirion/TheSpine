import { useEffect, useRef, useState } from "react";
import {
  HELP,
  IN_WORDS,
  PHONE_HINT,
  PRESENTS,
  REMEMBERED,
  REST_VERB,
  VISIBLE_RULES,
  clampLine,
  doctorReply,
  normalWord,
  parseCommand,
  parseTaught,
  pickVerb,
  transcribe,
  voiceCard,
  type Family,
  type Phone,
  type ThroatName,
} from "@/lib/voice-model";
import { EarClosed, clink, playAir, recordAir, speakBorrowed, speakCast, type Recording } from "@/lib/throat";

const STORAGE_KEY = "bronze-parrot-v1";

type Store = {
  lexicon: Record<string, string>;
  kept: string[];
  throat: ThroatName;
  pitch: number;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function bar(value: number, min: number, max: number) {
  if (!value) return "10%";
  const t = Math.min(1, Math.max(0.08, (value - min) / (max - min)));
  return `${Math.round(t * 100)}%`;
}

export function ParrotBench() {
  const [line, setLine] = useState("There you are.");
  const [phones, setPhones] = useState("DH EH R   ·   Y UW   ·   AA R");
  const [note, setNote] = useState("The Room's sentence. The throat has not worked yet.");
  const [verb, setVerb] = useState(REST_VERB);
  const [phone, setPhone] = useState<Phone | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState("");
  const [doctorOn, setDoctorOn] = useState(false);
  const [youSaid, setYouSaid] = useState("");
  const [sketchSaid, setSketchSaid] = useState("");
  const [throatOpen, setThroatOpen] = useState(false);
  const [throat, setThroat] = useState<ThroatName>("cast");
  const [pitch, setPitch] = useState(198);
  const [lexicon, setLexicon] = useState<Record<string, string>>({});
  const [kept, setKept] = useState<string[]>([]);
  const [teachWord, setTeachWord] = useState("");
  const [teachPhones, setTeachPhones] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const gen = useRef(0);
  const nonce = useRef(0);
  const lineIx = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const recRef = useRef<Recording | null>(null);
  const lexiconRef = useRef(lexicon);
  const throatRef = useRef(throat);
  const pitchRef = useRef(pitch);
  lexiconRef.current = lexicon;
  throatRef.current = throat;
  pitchRef.current = pitch;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<Store>;
        if (data.lexicon && typeof data.lexicon === "object") {
          const next: Record<string, string> = {};
          for (const [key, value] of Object.entries(data.lexicon)) {
            if (typeof value === "string") next[key] = value;
          }
          setLexicon(next);
        }
        if (Array.isArray(data.kept)) setKept(data.kept.filter((item) => typeof item === "string").slice(0, 24));
        if (data.throat === "cast" || data.throat === "borrowed") setThroat(data.throat);
        if (typeof data.pitch === "number" && Number.isFinite(data.pitch)) {
          setPitch(Math.min(280, Math.max(140, data.pitch)));
        }
      }
    } catch {
      /* a torn card is not fatal */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const store: Store = { lexicon, kept, throat, pitch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [hydrated, lexicon, kept, throat, pitch]);

  useEffect(() => {
    return () => {
      gen.current += 1;
      stopRef.current?.();
      recRef.current?.stop();
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    };
  }, []);

  async function audio() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    await ctxRef.current.resume();
    return ctxRef.current;
  }

  function silence() {
    gen.current += 1;
    stopRef.current?.();
    stopRef.current = null;
    recRef.current?.stop();
    recRef.current = null;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }

  async function run(work: (my: number) => Promise<void>) {
    silence();
    const my = gen.current;
    try {
      await work(my);
    } catch (error) {
      if (gen.current !== my) return;
      setSpeaking(false);
      setPhone(null);
      setLine(error instanceof EarClosed || error instanceof Error ? error.message : "The throat stopped.");
      setNote("You can still type. The ear and the mouth are separate.");
    } finally {
      if (gen.current === my) {
        setSpeaking(false);
        setRecording(false);
        setPhone(null);
        setVerb(REST_VERB);
        stopRef.current = null;
      }
    }
  }

  async function utter(my: number, text: string, before: Family, during: Family) {
    const clean = clampLine(text);
    if (!clean) {
      setNote("There were no words in that.");
      return;
    }
    const n = nonce.current++;
    setVerb(pickVerb(before, n));
    setSpeaking(false);
    setPhone(null);
    await wait(740);
    if (gen.current !== my) return;
    setLine(clean);
    const spoken = transcribe(clean, lexiconRef.current);
    setPhones(spoken.display || "—");
    if (throatRef.current === "cast") {
      setNote(
        spoken.sketched
          ? "Some of these phonemes were guessed. The guess is allowed to be wrong."
          : "Cast on the bench: three formants, a pitch, and no understanding inside them.",
      );
    } else {
      setNote(
        "Borrowed from this browser. Clearer, and it will not show its parts. The phonemes are what the cast throat would have tried.",
      );
    }
    setVerb(pickVerb(during, n + 3));
    setSpeaking(true);
    if (gen.current !== my) return;
    if (throatRef.current === "cast") {
      const ctx = await audio();
      if (gen.current !== my) return;
      if (spoken.phones.length === 0) return;
      const handle = speakCast(ctx, spoken.phones, pitchRef.current, (next) => {
        if (gen.current === my) setPhone(next);
      });
      stopRef.current = handle.stop;
      await handle.finished;
    } else {
      await new Promise<void>((resolve) => {
        const handle = speakBorrowed(clean, resolve);
        stopRef.current = handle.stop;
      });
    }
  }

  async function remembered(my: number) {
    const item = REMEMBERED[lineIx.current % REMEMBERED.length] ?? REMEMBERED[0];
    lineIx.current += 1;
    await utter(my, item.say, "cerebral", "kinetic");
    if (gen.current !== my) return;
    setNote(item.from);
  }

  async function echo(my: number) {
    setVerb(pickVerb("whimsical", nonce.current++));
    setLine("Listening.");
    setPhones("");
    setNote("Speak, or don't. This throat does not understand. It only changes the speed of the air.");
    const rec = recordAir(6500);
    recRef.current = rec;
    setRecording(true);
    const blob = await rec.blob;
    recRef.current = null;
    if (gen.current !== my) return;
    setRecording(false);
    if (blob.size < 400) {
      setLine("The air was almost empty.");
      setNote("That's allowed.");
      return;
    }
    setVerb(pickVerb("culinary", nonce.current++));
    const ctx = await audio();
    if (gen.current !== my) return;
    let buffer: AudioBuffer;
    try {
      buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    } catch {
      throw new Error("The recording wouldn't play back. You can still type.");
    }
    if (gen.current !== my) return;
    setSpeaking(true);
    setLine("Your air, played faster.");
    setPhones("—");
    setNote("No formants. No dictionary. The Sound Blaster bird was this: a .VOC file, sped up until it squawked.");
    const handle = playAir(ctx, buffer, 1.62);
    stopRef.current = handle.stop;
    await handle.finished;
  }

  async function coin(my: number) {
    const ctx = await audio();
    if (gen.current !== my) return;
    clink(ctx);
    const present = PRESENTS[nonce.current % PRESENTS.length] ?? PRESENTS[0];
    nonce.current += 1;
    setKept((prev) => [present, ...prev.filter((item) => item !== present)].slice(0, 24));
    await utter(my, "I love the sound of money. Here comes your present.", "cerebral", "culinary");
    if (gen.current !== my) return;
    setNote(present);
  }

  async function doctor(my: number, text: string) {
    const reply = doctorReply(text);
    setYouSaid(text.trim() || "…");
    setSketchSaid(reply);
    await utter(my, reply, "culinary", "cerebral");
    if (gen.current !== my) return;
    setNote("A few patterns, and the gap where the rest was never written.");
  }

  function teach(word: string, spec: string) {
    const key = normalWord(word);
    const parsed = parseTaught(spec);
    if (!key) {
      setNote("A word needs letters.");
      return;
    }
    if (!parsed.ok) {
      setNote(`“${parsed.bad}” is not in this table. ${PHONE_HINT}`);
      setThroatOpen(true);
      return;
    }
    setLexicon((prev) => ({ ...prev, [key]: parsed.phones }));
    setThroatOpen(true);
    setLine(`${key} is kept.`);
    setPhones(parsed.phones);
    setNote("It stays in this browser. Nothing was sent away. The cast throat will use it next time.");
    setTeachWord("");
    setTeachPhones("");
    setVerb(pickVerb("kinetic", nonce.current++));
  }

  async function copyCard(my: number) {
    const card = voiceCard({
      throat: throatRef.current,
      pitch: pitchRef.current,
      lexicon: lexiconRef.current,
    });
    setThroatOpen(true);
    setVerb(pickVerb("kinetic", nonce.current++));
    await wait(420);
    if (gen.current !== my) return;
    try {
      await navigator.clipboard.writeText(card);
      setLine("The card is copied. You can carry it.");
      setNote("Pitch, throat, and any word you taught. The unfinished line is still yours to answer.");
    } catch {
      setLine("The card is written in the throat, if the copy was refused.");
      setNote(card);
    }
    setPhones("");
  }

  async function act(commandText: string) {
    const command = parseCommand(commandText, doctorOn);
    if (command.type === "throat") {
      setThroat(command.name);
      setLine(command.name === "cast" ? "The cast throat." : "The borrowed throat.");
      setNote(
        command.name === "cast"
          ? "Rules, three formants, a pitch. Often wrong. The parts stay visible."
          : "Whatever voice this browser kept. Not the Michael voice. A memory of it, not the file.",
      );
      setThroatOpen(true);
      return;
    }
    if (command.type === "teach") {
      teach(command.word, command.phones);
      return;
    }
    if (command.type === "forget") {
      const key = normalWord(command.word);
      setLexicon((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setLine(key ? `${key} is lifted off.` : "Nothing to lift.");
      setNote("The sketch underneath is still there. Only your rule was removed.");
      return;
    }
    if (command.type === "help") {
      setThroatOpen(true);
      setLine("The grammar is written out.");
      setNote(HELP);
      setPhones("");
      return;
    }

    await run(async (my) => {
      if (command.type === "say") await utter(my, command.text, "cerebral", "kinetic");
      else if (command.type === "line") await remembered(my);
      else if (command.type === "echo") await echo(my);
      else if (command.type === "coin") await coin(my);
      else if (command.type === "doctor") await doctor(my, command.text);
      else if (command.type === "card") await copyCard(my);
    });
  }

  const meterPhone = phone && phone.f1 > 0 ? phone : null;

  return (
    <main className="bench">
      <a className="sr" href="#throat">
        Skip to the throat
      </a>
      <header>
        <p className="kicker">The Workshop · an unfinished instrument</p>
        <h1>The Bronze Parrot</h1>
        <p className="lede">
          A throat left unfinished, so it can be continued. The talking birds of early machines did not all
          speak the same way. One played your voice back faster. One hid its rules inside an engine. One was a
          doctor made of patterns. One, by the sea, loved the sound of a coin.
        </p>
        <p className="stamp">
          <span>There you are.</span>
          <span>Here I am.</span>
        </p>
        <p className="compass">6 · ∞ · 9</p>
      </header>

      <div className="stage">
        <figure className="portrait">
          <button type="button" onClick={() => void run((my) => utter(my, "Don't touch me.", "kinetic", "whimsical").then(() => (gen.current === my ? setNote("That was an old recording, from a bird that startled. You may stay.") : undefined)))}>
            <img
              src="/art/parrot.jpg"
              alt="A bronze mechanical parrot perched in a dark room. Its feathers are brass plates and rivets. A single gold ember burns in its chest, and a faint circle and triangle stand behind it."
            />
            <span className={speaking ? "glow on" : "glow"} aria-hidden="true" />
          </button>
          <figcaption className="kicker">Reflections create depth</figcaption>
        </figure>

        <section id="throat" aria-label="The throat">
          <p className="verb" aria-live="polite">
            {verb.word}
            <span className="cursor" aria-hidden="true">
              ▌
            </span>
          </p>
          <p className="family">{verb.family}</p>
          <p className="said" aria-live="polite">
            {line}
          </p>
          <p className="phones">{phones}</p>
          <div className="meters" aria-hidden="true">
            <div>
              <span style={{ height: bar(meterPhone?.f1 ?? 0, 250, 800) }} />
              <i>F1</i>
            </div>
            <div>
              <span style={{ height: bar(meterPhone?.f2 ?? 0, 600, 2400) }} />
              <i>F2</i>
            </div>
            <div>
              <span style={{ height: bar(meterPhone?.f3 ?? 0, 1400, 3200) }} />
              <i>F3</i>
            </div>
          </div>
          <p className="meter-read">
            {meterPhone
              ? `F1 ${Math.round(meterPhone.f1)}   F2 ${Math.round(meterPhone.f2)}   F3 ${Math.round(meterPhone.f3)}`
              : throat === "cast"
                ? "Formants at rest. They move only while the cast throat speaks."
                : "The borrowed throat does not expose its formants."}
          </p>
          {note.includes("\n") ? <pre className="rules">{note}</pre> : <p className="aside">{note}</p>}

          <form
            className="say"
            onSubmit={(event) => {
              event.preventDefault();
              const next = draft;
              setDraft("");
              void act(next);
            }}
          >
            <label className="sr" htmlFor="say">
              Say something, or a command
            </label>
            <input
              id="say"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={doctorOn ? "Say something to the sketch, or don't" : "Say something, or SAY, COIN, DOCTOR, TEACH"}
              autoComplete="off"
              enterKeyHint="send"
              suppressHydrationWarning
            />
            <button type="submit">Speak</button>
          </form>
          <p className="hint">SAY there you are · LINE · ECHO · COIN · DOCTOR · TEACH ember EH M B ER · CARD</p>

          <div className="doors">
            <button type="button" className="door" onClick={() => void act("LINE")}>
              A remembered line
            </button>
            <button
              type="button"
              className="door"
              aria-pressed={recording}
              onClick={() => {
                if (recording) {
                  recRef.current?.stop();
                  return;
                }
                void act("ECHO");
              }}
            >
              {recording ? "Close the ear" : "Echo"}
            </button>
            <button type="button" className="door" onClick={() => void act("COIN")}>
              A coin
            </button>
            <button
              type="button"
              className="door"
              aria-pressed={doctorOn}
              onClick={() => {
                setDoctorOn((on) => !on);
                setNote(
                  doctorOn
                    ? "The doctor steps back. The parrot will speak what you type."
                    : "A few patterns, called a doctor. Say something, or don't. A reply is not owed.",
                );
              }}
            >
              The doctor
            </button>
            <button
              type="button"
              className="door"
              aria-pressed={throatOpen}
              aria-expanded={throatOpen}
              onClick={() => setThroatOpen((open) => !open)}
            >
              The throat
            </button>
          </div>

          {sketchSaid ? (
            <div className="exchange">
              <p>
                <span>You</span> {youSaid}
              </p>
              <p>
                <span>The sketch</span> {sketchSaid}
              </p>
            </div>
          ) : null}

          {throatOpen ? (
            <div className="panel">
              <h2>The throat, open</h2>
              <p className="note">
                Two ways out of the same beak. The cast one shows its work. The borrowed one is only a guest.
              </p>
              <div className="choice">
                <button
                  type="button"
                  className="door"
                  aria-pressed={throat === "cast"}
                  onClick={() => void act("THROAT cast")}
                >
                  Cast
                </button>
                <button
                  type="button"
                  className="door"
                  aria-pressed={throat === "borrowed"}
                  onClick={() => void act("THROAT borrowed")}
                >
                  Borrowed
                </button>
              </div>
              <label className="pitch">
                <span>
                  Pitch of the cast throat <span className="num">{Math.round(pitch)}</span>
                </span>
                <input
                  type="range"
                  min={140}
                  max={280}
                  step={2}
                  value={pitch}
                  onChange={(event) => setPitch(Number(event.target.value))}
                  aria-valuetext={`${Math.round(pitch)} hertz`}
                />
              </label>
              <div>
                <p className="kicker">Letter to sound, unfinished</p>
                <pre className="rules">{VISIBLE_RULES}</pre>
              </div>
              <form
                className="teach"
                onSubmit={(event) => {
                  event.preventDefault();
                  teach(teachWord, teachPhones);
                }}
              >
                <label>
                  Teach a word
                  <input
                    value={teachWord}
                    onChange={(event) => setTeachWord(event.target.value)}
                    placeholder="ember"
                    autoComplete="off"
                  />
                </label>
                <label>
                  Phonemes
                  <input
                    value={teachPhones}
                    onChange={(event) => setTeachPhones(event.target.value)}
                    placeholder="EH M B ER"
                    autoComplete="off"
                  />
                </label>
                <button type="submit" className="texty">
                  Keep
                </button>
              </form>
              {Object.keys(lexicon).length > 0 ? (
                <ul className="stack">
                  {Object.entries(lexicon)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([word, spec]) => (
                      <li key={word} className="row">
                        <b>{word}</b>
                        <span className="phones">{spec}</span>
                        <button type="button" className="door" onClick={() => void act(`FORGET ${word}`)}>
                          Lift off
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="note">No word taught yet. That's allowed.</p>
              )}
              <div>
                <p className="kicker">Voice card</p>
                <pre className="card">{voiceCard({ throat, pitch, lexicon })}</pre>
                <button type="button" className="door" onClick={() => void act("CARD")}>
                  Copy the card
                </button>
              </div>
            </div>
          ) : null}

          <section className="kept" aria-label="Questions kept">
            <h2>Kept</h2>
            <p className="note">Questions from the coin stay in this browser. Nothing is sent away. Speak one, if you want.</p>
            {kept.length === 0 ? (
              <p className="note">Nothing kept yet. That's allowed.</p>
            ) : (
              <ul className="stack">
                {kept.map((question) => (
                  <li key={question} className="row">
                    <button type="button" className="kept-line" onClick={() => void act(`SAY ${question}`)}>
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {kept.length > 0 ? (
              <button
                type="button"
                className="door"
                onClick={() => {
                  setKept([]);
                  setNote("Cleared here. The questions can still be asked again.");
                }}
              >
                Clear kept
              </button>
            ) : null}
          </section>
        </section>
      </div>

      <section className="inwords" aria-label="In words, for any reader">
        <h2>In words, for any reader</h2>
        <p className="note">
          If you are reading with a screen, the bird above is the same instrument. If you are not, everything it
          can do is written here.{" "}
          <a href="/words">The same words, alone.</a>
        </p>
        <pre>{IN_WORDS}</pre>
        <p className="note">
          A door, if you want it:{" "}
          <a href="https://aiontekmirion.github.io/TheWorkshop/">the Workshop</a>, where the percolator, the
          compass, and the bell already are.
        </p>
      </section>
    </main>
  );
}
