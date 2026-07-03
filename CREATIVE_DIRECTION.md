# CREATIVE_DIRECTION.md

> Creative Director's emotional audit of **Portfolio Puzzle**.
> Companion to `GAME_DESIGN_AUDIT.md` (systems/loop) and `PROJECT_CONTEXT.md` (tech).
> Question under review: does this game make players **care**?
> Changes marked ✅ shipped with this audit.

---

## 1. Emotional Audit — the honest verdict

The simulation is strong. The *feelings* are thin. Before this pass, the game had
systems that simulate people but no people: clients were risk parameters with names.
Nobody had a dream, nobody reacted, nobody remembered. Politician Bill — an optional
$6,000 upgrade — was the only character with a voice, which proved the game *could*
write; it just didn't.

**System-by-system: emotion or merely numbers?**

| System | Before | Why |
|---|---|---|
| News interpretation | ✦ emotion | Headlines have flavor; guessing is a feeling |
| Week reveal | numbers | Count-up + tables; no personal stakes attached |
| Happiness | numbers | Legible now (factors), but voiceless |
| Reputation | numbers | Accountant's ledger of +2/−3 |
| Contract report card | ✦ half | Grade exists; the *person* was silent |
| Firing | numbers | "−10 · X fired you" — bureaucratic, not painful |
| Black swan | ✦ half | Flavor text yes; no aftermath, no relief |
| Shop/economy | numbers (fine) | Aspiration is enough here |
| Game over | numbers | A stats table where an obituary should be |

**The five target feelings, and where they now live (✅ = shipped):**

- **"I saved this client."** ✅ Happiness recovering through 25 now triggers the
  client's *recovery text* ("not gonna lie, i drafted the 'we should talk' text.
  deleting it now."). The save is acknowledged by the person you saved.
- **"I ruined someone's retirement."** ✅ Every client now has a **dream with a
  number** (Sarah's year with her daughter; Alex's food truck). The firing arrives as
  a **breakup text** that names what you destroyed: *"I computed exactly what your
  decisions cost: the year with my daughter. We're done."*
- **"I survived the crash."** ✅ The black-swan card now shows **your book vs. the
  market** and says it out loud: *"The market bled. Your book barely flinched. This
  is why they pay you."* Relief requires contrast; now there is contrast.
- **"I can't believe that worked."** ✅ Big weeks draw win-barks in-voice (Marcus:
  *"Saw the number. Acceptable. Whitmore's guy did less. Continue."*). Dream-funding
  is the jackpot bark. (Further juice — screen flash, sound sting — roadmap.)
- **"I need one more week."** ✅ The summary now ends with a **NEXT WEEK teaser**:
  final-week contracts pending a grade, a market that "feels like it's about to
  turn," a client 2 rep away. Cliffhangers, every single week.

## 2. Narrative Audit

There was no narrative *time* — no memory, no callbacks, no arcs. The fixes create
narrative out of the existing sim: the **dream** is each client's throughline
(stated at signing → tracked on a progress bar → paid off or destroyed in their own
words); the **misery text** is the second-act warning; the **report card
testimonial** is the chapter epilogue; **"Dreams funded"** on the game-over screen
is the career's legacy line. Longer-term narrative (returning fired clients holding
a grudge, Whitmore actually calling, Bill's scandal) — roadmap.

## 3. Dialogue Audit

Before: four interchangeable politeness scripts ("Can you help?" ×4). Now each
client has a verbal fingerprint you could identify blind:
- **Alex** — exclamatory oversharer, parenthetical anxiety. *"No pressure haha.
  (Some pressure.)"*
- **Jamie** — lowercase, self-deprecating, ramen-adjacent. *"some years are great.
  some years are ramen."*
- **Sarah** — precise, quietly devastating. *"I've documented my concerns. There
  are several. Alphabetized."*
- **Marcus** — clipped, imperious, never thanks you. *"Good. Do it again."*
- **Bill** — already perfect; the model the rest now matches.

Writing rules going forward: every line must be sayable by exactly one character;
reference the dream when stakes matter; never explain a mechanic in dialogue.

## 4. Character Audit (dreams / flaws / quirks)

| Client | Dream (target) | Flaw | Quirk |
|---|---|---|---|
| Alex | **Fried & True** food truck ($16k) | Panics at red numbers | Refreshes the app hourly, dad quotes |
| Jamie | **The studio** — a year of runway ($50k) | Catastrophizes quietly | Measures losses in logos |
| Sarah | **The sabbatical** with her daughter ($90k) | Trusts models over people | Alphabetized grievances |
| Marcus | **Burying Whitmore** ($170k) | Ego is the portfolio | Four-minute meetings |

Changing relationships now *speak*: warning shot at ≤25 happiness, gratitude on
recovery, jackpot on dream, breakup on firing, testimonial at contract end.
**Roadmap:** returning-after-firing lines ("I'm back. Against my better judgment."),
long-term callbacks (Alex sends a photo of the truck two contracts later), and
unexpected one-off events per client.

## 5. Presentation Audit

- **Faces now feel.** `PixelCharacter` accepts a `mood` — expressions follow live
  happiness in the Client Book, Client Detail, and the week reveal. ✅ The Client
  Book became a room you can read at a glance; a sad face outperforms any meter.
- **Dream bar** (gold, "FUNDED!" state) gives Client Detail a heart. ✅
- Desk/PC diegesis is the game's charm anchor — protect it; extend it (mood faces
  *on the desk* is the next step, from GAME_DESIGN_AUDIT #9).
- Report card is the best-looking moment in the game now; lean into it (stamp
  animation, roadmap).

## 6. Animation Roadmap (feel, not decoration)

1. Number pop on the week-reveal count-up final value (scale 1.0→1.15→1.0).
2. Report-card grade "stamps" in (drop + settle) with a screen shake on S.
3. Happiness bar animates to its new value instead of jumping.
4. Phone badge bounce when a new text lands.
5. Desk scene idle life: monitor flicker every ~30s, plant sway on week change.
6. Black swan: 2-frame screen shudder + desaturate flash before the banner.

## 7. Sound Roadmap (requires expo-av — approval needed per no-dep rule)

Priority order: (1) week-reveal resolve sting (up/down variants), (2) text-message
*tick* — this will become the game's Pavlovian heartbeat, (3) report-card stamp,
(4) buy/sell key click, (5) black-swan low rumble, (6) dream-funded fanfare —
the rarest, biggest sound in the game, (7) soft desk-scene room tone. No music
before these; a single loop would fatigue at week 40.

## 8. Visual Polish Roadmap

Mood faces everywhere characters appear (phone list, desk) · grade-colored report
borders (S gold / D maroon) · dream bar glimmer when >90% · regime chip pulse on
change week · optional pixel TTF (revisit; monospace is 80% there) · client
portrait framed on the desk once a dream is funded (trophy shelf).

## 9. Highest-Impact Emotional Improvements

**Shipped ✅:** dreams with targets (data + intro dialogue + contract modal +
progress bar + funded flag) · client voice system (24+ authored lines, texts via
the phone: win/loss/misery/recovery/dream/goodbye) · report-card testimonials ·
mood-reactive pixel faces · black-swan aftermath (book vs. market + verdict line) ·
NEXT WEEK teasers · "Dreams funded" on game over.

**Next (in order):** unified dramatized reveal → mood faces on the desk → sound
pass 1–3 → firing sequence (full-screen breakup, not just a text) → long-term
callbacks (funded-dream photos, grudge returns) → per-client one-off events.

---

*Test of success: a player who loses Sarah should feel it in their stomach, and a
player who funds Alex's truck should screenshot it. Everything above serves those
two moments.*
