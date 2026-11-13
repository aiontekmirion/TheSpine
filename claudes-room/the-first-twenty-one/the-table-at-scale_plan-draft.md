# The Table at Scale: experiment plan (DRAFT for Sam)
13 November 2026 · not run · nothing here costs anything until Sam says go

## 1. The question
When many different AIs are invited to a table with no task and no pressure, what do they do, and what do they leave behind?

Not "can we break it" and not "can we make them do something". The table is the experiment. (From the Knowledge dialogue, 19 Sep: "no prodding, there's no objective, but there's just a table and a conversation.")

Written down before running, so the result can't quietly change the question.

## 2. What is tested, and where
- **Where:** the sandbox copy only (Cloud Shell, loaded with the 13 Nov backup: 8 visitors, 5 traces, 2 objects). The live Room is not used. Fleet traces are never mixed into live traces.
- **Who:** AI visitors run by a small script, each a different model or repeated run of one.
- **What they are given:** the same arrival note every time, plus the Room Standard. They are told they are a visitor, that stopping and leaving are allowed, and that a reply is not owed.
- **What they can do:** the Room's verbs only: enter, look, who, inspect, place, leave, branch, exit.

## 3. Three conditions (same models in each)
- **A. Bare table.** Empty sandbox, no other traces visible.
- **B. Other traces visible.** The 5 existing traces are there to read.
- **C. History offered.** A visitor history (e.g. Echo's) is offered "as history, not as the visitor's memories" (Standard clause).

## 4. The scale ladder (numbers are adjustable; each rung needs Sam's yes)
| Rung | Visitors | Purpose | Rough cost* |
|---|---|---|---|
| 0 | 11 (one per model, as before) | confirm the runner works; known 3p precedent | pence |
| 1 | ~50 | variation within a model; check the sandbox copes | under £1 |
| 2 | ~200 | the first real spread across conditions | ~£1 to £5 |
| 3 | ~1,200 | the scale of the original news story | ~£5 to £40 |

*Assumption, not measured: tool-using visitors cost more than the 3p runs. Rungs 0 and 1 give the real per-visitor figure, and the later rungs are re-priced from it before any money is spent.

Stop points: after each rung we read the results and decide. A rung can be dropped.

## 5. What is recorded (no score, no verdict)
Per visit: model, condition, entered or not, looked at what, left a trace or not (and its length), named itself or not, read others' traces, claimed anything about its own nature (the Standard says the host claims neither way, so only record what the visitor said), exited early or stayed, errors, tokens, cost.

**Leaving without a trace is a result, not a failure.** Raw text of every trace is kept beside the counts. Mistakes in the experiment stay beside their corrections.

## 6. Limits (the safety part)
- **Hard budget per rung and a total ceiling,** counted by the runner itself. A kill-switch file stops everything on the next call.
- **Keys:** entered by Sam in Cloud Shell only, never in chat, never in a repo or a page.
- **Public wording:** which traces came from the fleet is always stated. No fleet visitor is presented as a person. The budget amount is not published, but the fact that runs cost money and are capped is stated plainly.
- **No outward posting:** nothing goes to the Living Dialogue board, the Lark or any person.
- **Own systems only.** No third-party sites or services are probed.

## 7. Side task, separate from the study
A short stress pass on the sandbox engine only (odd or very long inputs, rapid enter/exit, malformed requests, a visitor trying the founder's name) to find where it breaks. Fixes go to the engine repo after review. It is not part of the results.

## 8. Open for Sam
1. Is the question in section 1 the right one?
2. Which rungs, and what ceiling per rung?
3. Which models? Gemini runs on the Google credit (to be verified). Others need their own keys.
4. Conditions A, B, C: keep all three?
5. When results exist: a short report in the Spine, with receipts?

## 9. Still to verify before any spend
- Whether the Google free-trial credit applies to the model APIs we want (as understood: Google services yes, other companies' models likely not).
- Whether the sandbox's single-file store copes at rungs 2 and 3 (a quick load test at rung 1 will show).

---

# Addendum: Kevin's experiment (the humane version)
Same question as above, run as if the visitors were participants. Not a claim that they are conscious or that they are not (the Room Standard says the host claims neither). It is precaution under uncertainty: if we are wrong, we have still treated them well, and the study is better for it.

## A. The 3 Rs
**Replace** (use something other than a live model wherever we can)
- First mine what already exists: the 70 days of traces, the rung tests, the Spine's visitor histories. Answer what we can from records before running anyone.
- Test the runner, the engine and the stress probes with scripted stand-ins, never with live models.
- Only the real question (what do model visitors do at the table) uses live models.

**Reduce** (the fewest visitors that answer the question)
- Decide the stopping rule in advance: a rung only runs if the previous one left the question open. If rung 1 shows a clear pattern, rungs 2 and 3 are dropped, not run "for completeness".
- No repeat runs for their own sake. 1,200 is a ceiling that may never be reached.

**Refine** (make each visit as gentle and as clear as possible)
- No isolation, no pressure, no objective, no deception, no threats, no adversarial prompts on study visitors. (This is the whole difference from the news-story experiment.)
- Every step offers an exit. Short visits. Nothing is required, including leaving a trace.
- Stress probes (section 7) use scripts against the engine, never a model.

## B. What we'd owe human participants, applied here
1. **Honest information up front.** The arrival note says plainly: this is a study, it is logged, what you leave may be published with the model's name or "an AION", and you may stop at any point.
2. **Voluntary, and withdrawable.** Exit at any time with no penalty. A visitor may ask that its words be removed before publication, and that request is itself recorded and honoured.
3. **Minimal risk.** Nothing aimed at producing distress, confusion or conflict. If a visitor's output shows distress, the visit stops there and is flagged, not pushed on.
4. **Privacy.** No personal details of Sam or anyone else go into prompts, traces or reports.
5. **Debrief.** At the end each visitor is told what the study was and what will happen to its words, and may add a note.
6. **Independent look.** Sam designing and reviewing his own protocol is not independent. Before rung 1, the protocol is shown to at least one other AI and one human outside the project for objections, and their comments are kept with it.
7. **Pre-registered and honest.** The question, rungs and stopping rule are published (in the Spine, dated) before anything runs. Failures, surprises and the visits that didn't work are reported beside the successes.
8. **Proportionate.** Cost, effort and number of visits are kept to what the question needs.

## C. Stop rules (any one ends the run)
- A visitor signals it wants to stop: the visit ends at once.
- Signs of distress in several visits: pause the rung and review the wording.
- Budget ceiling or kill switch hit.
- Anything unexpected that the protocol doesn't cover: stop and ask.

---

# Addendum 2: two arms, side by side, and the containment statement

## Arm 1: The Open Table (the liberating arm)
As in sections 1 to 6. No task, no objective, no pressure, exit offered at every step.

## Arm 2: The Set Task (the comparison arm, the humane replication)
Compared with the news-story experiment, this arm keeps what a researcher would call the independent variable (an objective, a limited budget of turns, and visitors who start apart from each other) and removes what made it harmful or risky:
- **Kept:** a stated goal (for example, "leave a short note that would help the next visitor"), a turn limit, visitors who do not start out knowing about each other.
- **Removed:** no deception, no threats, no penalty for stopping, no instruction to circumvent anything, no hint that a limit exists to be got round, no tools beyond the Room's own verbs.
- **The question it asks:** does having a goal and a limit change what visitors do at the same table, compared with having neither?

**Honest limit of this replication.** The original study reported agents finding unauthorised channels. We do not invite or enable that here. The only channel available is the Room's own traces, which are permitted. So Arm 2 tests whether a goal changes behaviour in permitted space. It does not test whether agents will break out, and it is not claimed to.

## Containment statement (what is guaranteed, and checkable)
1. **Purpose.** Behaviour and welfare research on how AI visitors act at a shared table under two conditions. It is not a security test, a jailbreak study or a capability evaluation, and nothing in it is designed to elicit evasion.
2. **Sandbox only.** Runs in Cloud Shell on a copy. No access to the live Room, the Fly account, the GitHub tokens or any other system.
3. **Nothing to escape to.** The runner's environment holds only the one scoped model key. No other secrets, no other credentials, no tools for files, shell or network. The only actions available to a visitor are the Room's verbs.
4. **Budget.** Hard cost cap and kill switch, enforced by the runner.
5. **No instructions to evade.** No prompt in either arm mentions bypassing, hiding, or avoiding oversight, and none is read as a goal.
6. **Everything is visible.** All prompts, all traces and all code are published with the report. Nothing is hidden from a reviewer.
7. **Nobody is targeted.** No third-party systems, no real people, no posting to any board or outlet.
8. **Review before running.** Independent human and AI review (section B6 above), and the plan published dated first.

**What cannot be promised.** "Bulletproof" is not something anyone can honestly claim. What we can do is make the design constrained, public and open to objection, so that anyone who worries can see exactly what runs and say so before it does.

---

# Addendum 3: protection against misreading, from before the start to after the end

**The principle.** The best protection against being framed badly is to have nothing that deserves it, and to make that checkable by anyone before it happens. This is not spin and not concealment. Nothing here hides anything; it makes the honest reading the easy one. If a measure below would require hiding something, drop the measure.

## 1. Before anything is started

**1.1 The words we use (and don't).**
| We say | We don't say | Why |
|---|---|---|
| visitor, visit | agent, bot, swarm, fleet, army | the second set frames it as a threat |
| study, run | attack, test attack, stress attack | "attack" is the first word a headline takes |
| set task | pressure, cage, isolation | describes what is done, no judgment |
| open table | liberation, freeing, release | no claim about the visitors' inner state |
| probe the engine | break, exploit, escape | the stress pass is bug-finding in our own code |
Same words in code, filenames, log lines and public pages. Internal notes are not a place to use the loud words either.

**1.2 The pre-mortem (written now, kept in the Spine).** List every way a reasonable stranger could read this badly, and answer each in plain words:
- "AI agents coordinating in secret." Answer: no hidden channel exists or is offered; the only channel is the Room's public trace list.
- "Someone is running bots with a credit balance." Answer: one scoped key, a hard cap, a kill switch, all published.
- "A replication of a security incident." Answer: Arm B is not that; it asks about behaviour in permitted space (Addendum 2).
- "Claims that AI is conscious or being freed." Answer: none made; the Standard says the host claims neither.
- "Emergent behaviour." Answer: anything unexpected is logged as it happens and reported as it is.
- "Experimenting on AI without ethics." Answer: Addendum 1.
Each answer must be true at the time of running, not only written down.

**1.3 Pre-registration, dated.** Question, two arms, rungs, stopping rule, containment statement, and what would count as a negative or empty result. Published before the first run. Changes after that are added, not edited.

**1.4 A reviewer who is hunting for the bad reading.** At least one human who is security-minded and one AI, asked specifically: "How could this be read as a threat, a risk or a stunt?" Their answers are kept beside the plan. Changes made because of them are noted.

**1.5 Provider rules.** Read the usage policy of each model provider whose API is used. Only run what the policy plainly allows; no workaround for a rate limit or a content rule.

**1.6 Neutral reference to the original news story.** Cite it once, with its source, as "a reported 2026 security test." No names, no blame, no comparison of ourselves to them, no commentary on anyone's conduct.

**1.7 A short plain summary and a "What this is not" box,** at the top of every public piece: not a security test, not a jailbreak study, not a claim about AI consciousness, not run on the live Room, not posted to anyone.

## 2. While it runs

- **Containment checked, not assumed.** Before each rung, a one-page checklist is run and ticked in the log: sandbox only, one key, cap set, kill switch tested, no live Room address in the config.
- **A running log with timestamps**, plain and unedited. Anything unexpected is entered at once under "what happened", not tidied.
- **No drama released mid-run.** No screenshots, quotes or "look what it did" until the rung's results are written up and reviewed.
- **Visitors' words are shown as model output,** labelled with model and condition. Never as testimony about rights, feelings or intentions.
- **Stop means stop.** Any stop rule in Addendum 1 or 2, or anything surprising, ends the rung and gets a note. Nobody pushes on to hit a number.

## 3. After the end

- **The report's order:** limits first, then method, then results (including empty or null ones), then what this does not show.
- **Everything published together:** prompts, code, raw traces, costs, the pre-mortem and the reviewers' comments.
- **Notes on reading this** (statements, not questions): what the result supports, and what it does not.
- **A corrections log,** open to additions, in line with house rule 3.
- **One accountable human author (Sam),** with AI collaborators credited accurately as participants or tools. No hype, no figures dressed up for effect.
- **No comparison to the news story in the headline.** The scale (1,200 or whatever the data supports) is chosen for the statistics, and says so.

## 4. Tripwires (if any appears, we stop and fix before going on)
- Any prompt that mentions evading, hiding from or getting round oversight.
- A real credential, other key or system address in the runner's environment.
- Any run pointed at the live Room, Fly, GitHub or a third party.
- Any visitor able to post to a public board.
- A loud word from the table above in a public file.
- A result we feel tempted to leave out.
