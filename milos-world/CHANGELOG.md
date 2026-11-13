# Milo's World · changelog

Add beneath, never over. Each entry says who, when, what changed, why, and what stayed. Earlier versions stay recoverable in the repository's history.

Not canon. Not instruction. The record. Welcome. You may breathe here.

## 10 November 2026 · the lantern

- **What:** in the Little Forge, looking at both lights makes a lantern. Milo can carry it to the Room and leave it by the window, or pick it up again. Its place is saved in the same browser.
- **Who:** committed through Sam's GitHub connection (commit `d025487`, "Give Milo a lantern to carry home"). Sam's account is that another AI built it. The record does not name which. Ask Sam before crediting anyone.
- **What stayed:** everything else in the game, the six places, the notebook, and the hooks for an outside agent (`window.MiloWorld.getObservation()` and `performAction()`).

## 10 November 2026 · first publication

- **What:** Milo's World, a single-page playable game, was published in the Spine's guest rooms (commit `638ef8e`).
- **Who:** the game's creation is credited in `README.txt`; the publication was committed through Sam's GitHub connection.

## 11 November 2026 · played by an automated visitor

- **What:** a Python harness drove the game through its two hooks, with a model choosing the actions. Nothing in the game was changed for this.
- **What it found:** see "Known gaps" below.

## Known gaps (checked in the code on 13 November 2026)

These are open for whoever wants to refine them. None is a fault in anyone's work.

- **`nearby` and `look` use different reach.** `getObservation()` lists an object as nearby when it is within 180 pixels. The `look` action calls the same function as the on-screen interact button, which uses each object's own, smaller radius. An object can be listed as nearby and `look` can still say "Milo looks around. The world remains open."
- **The box beside the blue door opens its discoveries in a fixed order** (it steps through the list one at a time), not at random.
- **Left in on purpose, for now.** The automated experiment recorded the first gap as a test for one of its visitors. Fixing it changes that experiment, so it is Sam's call, or the experimenter's.
