// Client voice: how each client SOUNDS when life happens to their money.
// Lines arrive as phone texts (informational "client notes", never graded) and
// as testimonials on contract report cards. One reaction bark max per client
// per week — priority: goodbye > dream > dreamClose > crash > misery >
// recovery > loss > win > idle. Dream epilogues are additive (the payoff).
//
// Relationship-aware: renewal lines are staged by contracts completed, and
// small talk graduates from `idle` to `idleClose` (memories, inside jokes)
// once a client has finished two contracts with you. Lines may embed
// {advisor} and {crashes} tokens, filled from VoiceContext.
//
// Writing rules: every line must be sayable by exactly ONE person on the
// roster; reference the dream when stakes matter; never explain a mechanic.

import { ClientMessage } from './clientMessages';
import { ContractGrade } from './contractSystem';

export interface VoicePack {
  win: string[]; // weekly return >= +2.5%
  loss: string[]; // weekly return <= -2.5%
  crash: string[]; // black-swan week while invested
  misery: string[]; // happiness crosses DOWN through 25 — the warning shot
  recovery: string[]; // happiness crosses UP through 25 — "I almost walked"
  dreamClose: string[]; // portfolio first crosses 85% of the dream target
  dream: string[]; // the dream is funded
  epilogue: string[]; // weeks later: the photo, the postcard, the thank-you
  renewal: string[]; // staged by contracts completed: [after 1st, 2nd, 3rd+]
  goodbye: string[]; // fired you — the breakup text
  comeback: string[]; // returned after firing/dismissal
  idle: string[]; // small talk, early relationship
  idleClose: string[]; // small talk once you're part of their life
  holiday: string[]; // once a year, week 51
  gradeHigh: string[]; // report card S/A
  gradeMid: string[]; // report card B
  gradeLow: string[]; // report card C/D
}

const VOICES: Record<string, VoicePack> = {
  // ── Alex — exclamatory oversharer, parenthetical anxiety ─────────────────
  alex: {
    win: [
      'DUDE. I just checked the app. Is this real?? I told my roommate you were a wizard!!',
      'Okay I keep refreshing the number and it keeps being big. Grilled cheese fund is COOKING!',
    ],
    loss: [
      "hey so… the app is showing a lot of red? is that normal?? tell me that's normal.",
      "I'm not panicking!! I'm just. checking in. very calmly. about the red.",
    ],
    crash: [
      "THE WHOLE MARKET IS RED. my coworker says it's called a 'black swan'?? why is a BIRD taking my truck money??",
    ],
    misery: ["I keep thinking about the truck. My dad said this would happen. Please tell me it won't."],
    recovery: ["Okay. Okokok. We're back?? WE'RE BACK. I never doubted you. (I doubted you a little.)"],
    dreamClose: [
      "We're SO CLOSE to truck money that I started sketching the menu. There's a sandwich called The Advisor. It has everything on it.",
    ],
    dream: [
      "SIXTEEN THOUSAND. THE TRUCK IS REAL. First grilled cheese has your name on it. I'M NOT CRYING, YOU'RE CRYING.",
    ],
    epilogue: [
      'PHOTO: Fried & True, parked outside the library, line around the block!! Your sandwich is on the board. Free for life, remember. I keep my deals!!',
    ],
    renewal: [
      'Round two!! Same Alex, same dream, slightly less panicking. (Slightly.)',
      "You again?? Obviously you again. My dad asked who my 'money person' was and I got weirdly proud saying your name.",
      "Contract number a-million!! At this point you're basically family. Family that charges fees. Still family!!",
    ],
    goodbye: ["I trusted you with everything I saved. The truck was the whole plan. Please don't call me."],
    comeback: [
      'So… hi. Again. I asked around and everyone else was SO boring. Can we try one more time? For the truck?',
    ],
    idle: [
      'No money question, just: today I made a grilled cheese so good I got a little emotional. Ok bye!!',
      "My roommate wants to know if you're taking new clients. I said you were mine. That came out weird. Keeping it.",
    ],
    idleClose: [
      'Remember when I texted you in ALL CAPS like four times a week? Growth. (This text is different. This is lowercase panic.)',
      "{advisor}, real talk: you've survived {crashes} market meltdowns with me. That's more than most of my friendships.",
    ],
    holiday: [
      "HAPPY HOLIDAYS!! I made you a card. It's a drawing of the truck with a wreath on it. It's terrible. It's from the heart.",
    ],
    gradeHigh: ['Best. Advisor. Ever. I already told literally everyone I know.'],
    gradeMid: ["Solid! We're getting there. The truck waits for no one though!!"],
    gradeLow: ["I mean… we're still friends. But my savings account is giving me a look."],
  },

  // ── Rosa — warm handwritten-letter texts, signs off "— R." ───────────────
  rosa: {
    win: [
      'Oh, how lovely, dear. I checked the number twice, like re-reading a favorite chapter. Even better the second time. — R.',
      "Good news in the ledger today. I celebrated with the fancy tea and told Harold you're a keeper. — R.",
    ],
    loss: [
      "The number went down, didn't it, dear. Don't you worry about me — I've weathered book fairs with a broken register. Onward. — R.",
      'A dip, I see. Every good story has a difficult middle. I trust you with our ending. — R.',
    ],
    crash: [
      "The television used the word 'meltdown' and Harold turned it off. I've decided to trust you instead of the television, dear. — R.",
    ],
    misery: [
      "I don't sleep quite as well lately, dear. I keep counting libraries that aren't built yet. Please be careful with them. — R.",
    ],
    recovery: [
      "Slept properly last night, first time in weeks. Harold says the color's back in my cheeks. Thank you for steering us through, dear. — R.",
    ],
    dreamClose: [
      "So close now, dear. I've picked the paint — robin's-egg blue with cream trim. Harold's already sanding the oak. — R.",
    ],
    dream: [
      "Dear, we've done it. Twenty little doors for twenty blocks. Forty years of story time, and the story keeps going. Bless your good hands. — R.",
    ],
    epilogue: [
      "The first library went up on Maple Street this morning. A little girl took 'Charlotte's Web' and left a drawing of a spider in trade. I laminated it. — R.",
    ],
    renewal: [
      "Shall we keep going, dear? I've bought a nicer pen for the signing this time. — R.",
      "Of course we'll continue, dear. Harold asked if I'd found a good one. I said I found one of mine — you read carefully. — R.",
      "Signing again, dear. You're in my prayers rotation now — between the grandchildren and the Dodgers. — R.",
    ],
    goodbye: [
      "I trusted you the way I taught the children to trust books, dear. I'm sorry to say I must close this one. Be kinder to your next reader. — R.",
    ],
    comeback: [
      'Hello again, dear. I stayed cross for exactly one month, then Harold reminded me forgiveness shelves better than grudges. Shall we try again? — R.',
    ],
    idle: [
      "No business today, dear. A boy came by asking when the little libraries arrive. I said soon. He said he'd wait 'even a week.' Children measure time so bravely. — R.",
      "I reorganized the study again. Harold says I miss the Dewey Decimal System more than I miss working. He isn't wrong. — R.",
    ],
    idleClose: [
      "Do you know, dear, I've told the grandchildren about you. 'The one who minds our libraries.' You have a shelf in this family now. — R.",
      "We've weathered {crashes} of those dreadful market storms together, haven't we, dear. Like riding out a leaky roof with a good book. — R.",
    ],
    holiday: [
      "Happy holidays, dear one. There's a tin of shortbread with your name on it — Harold's recipe, my supervision. Come collect it someday. — R.",
    ],
    gradeHigh: ["A gold-star term, dear. I'd have put you at the very top of the honor roll. — R."],
    gradeMid: ['A solid B, as we used to say. Perfectly respectable, with room on the shelf for more. — R.'],
    gradeLow: ["I've marked this one 'needs improvement', dear — gently, but in pen. — R."],
  },

  // ── Dev — 3am deadpan, ER gallows humor, "anyway." ───────────────────────
  dev: {
    win: [
      '3:14am. quiet shift. checked the account instead of my pulse. both elevated, only one in a good way. nice work. anyway.',
      "the van fund grew more this week than my will to live during a double shift. that's a compliment. high praise, even.",
    ],
    loss: [
      'saw the red. i triage for a living — this looks stable, walking wounded. correct me if i should be running.',
      "portfolio's down. i've seen worse vitals at 4am. keep it breathing.",
    ],
    crash: [
      "market coded tonight, huh. i've done chest compressions in an elevator. this is your elevator. compress.",
    ],
    misery: [
      'not gonna lie. started googling bus tours of the coast. BUS tours. do not make me take a bus tour.',
    ],
    recovery: ['ok. pulled back from the bus-tour cliff. van dream restored to stable condition. visiting hours resume.'],
    dreamClose: [
      "close enough that i test-drove a van. sat in the back for ten minutes in the dealership lot, just breathing. the salesman was very patient. so am i. barely.",
    ],
    dream: [
      "$17k. bought the van. it's ugly and perfect and i cried in the hospital parking lot, which is the ONE place i swore i'd never cry. eight weeks of coastline, booked.",
    ],
    epilogue: [
      "photo: ocean, 6:42am, van in frame, me off shift. first water i've seen in six years that didn't come from a supply closet. thank you. genuinely. anyway.",
    ],
    renewal: [
      'round two. you kept the dream alive through round one. that\'s a discharge summary i can sign.',
      "third rotation together. in hospital terms you're basically an attending now. don't let it go to your head.",
      "renewing again. you're the only person i text more than my charge nurse. that's intimacy, in my line of work.",
    ],
    goodbye: [
      'i deal with bad outcomes professionally. this one was preventable. that\'s the kind that keeps you up. take care.',
    ],
    comeback: [
      "back. turns out other advisors don't answer texts at 3am either, but yours at least felt warmer. low bar. you cleared it.",
    ],
    idle: [
      "quiet shift. (i said the q-word. someone just came in. this is your fault.)",
      "a patient told me today to 'invest in myself.' sir, this is an IV.",
    ],
    idleClose: [
      "you've talked me off {crashes} market ledges now. i keep count. it's very ER of me.",
      "told the day shift about the van plan. someone said 'must be nice.' it WILL be nice, susan. it will.",
    ],
    holiday: [
      "working the holiday, obviously. someone brought cookies to the nurses' station and nobody's coded since 7pm. miracle season. happy everything.",
    ],
    gradeHigh: ["top marks. if you were a resident i'd let you do the fun procedures."],
    gradeMid: ["solid, stable, unremarkable. in medicine that's a compliment. take it."],
    gradeLow: ["we'd call this outcome 'guarded.' do better rounds next time."],
  },

  // ── June — earnest, apologizes, long texts, "sorry for the essay" ────────
  june: {
    win: [
      'Oh!! The number went up — I checked between a first dance and a bouquet toss and did a tiny fist pump behind the cake. Nobody saw. Okay, one bridesmaid saw.',
      "Good week!! I put another pin in my Seoul map. It's mostly pins now. Sorry, that's so cheesy. I'm keeping it.",
    ],
    loss: [
      "Hey, um. The number dipped and I spiraled a little on the bus. But I re-read her letter and I'm okay. We're okay. Right? Sorry. We're okay.",
      "Down week. I keep telling myself it's like an overcast shoot — bad light, same faces. Sorry for the metaphor. Photographer brain.",
    ],
    crash: [
      "Everything's red and I typed and deleted this message four times. I trust you. That's the whole text. (Sorry it took four drafts to say.)",
    ],
    misery: [
      "I did the flight math again and started crying in a camera store. The clerk gave me a lens cloth. I need good news soon. Sorry. No — actually, I'm not sorry. I need it.",
    ],
    recovery: [
      "Okay. Deep breath. The number's climbing and I un-cancelled my Korean lessons. 다시 시작 — 'we begin again.' My tutor taught me that one. Fitting, right?",
    ],
    dreamClose: [
      "I'm close enough that I looked at actual flight dates. There's a Tuesday in spring that keeps looking back at me. Almost. ALMOST.",
    ],
    dream: [
      "I booked it. The Tuesday. I'm going to Seoul, and I'm going to knock on her door with a fruit basket and forty rehearsed sentences. You did this. I'm never deleting this text thread.",
    ],
    epilogue: [
      'She kept my baby photo. Twenty-two years, on her refrigerator, this whole time. We made dumplings and she fixed my folding without saying anything, like moms do. Sorry for the essay. You earned the essay.',
    ],
    renewal: [
      "Round two! I promise to send at least 30% fewer panicked texts. (I've been told not to make promises I can't keep. 25%.)",
      "Signing again — you know you're in my top three most-texted? You, my tutor, and a pizza place. Elite company.",
      "Another contract! You've read more of my feelings than my diary has. Thank you for never once replying 'per my last message.'",
    ],
    goodbye: [
      "I keep starting this text and stopping. That money was the door, and it's shut now. I don't hate you. I just really needed you to be careful. Goodbye.",
    ],
    comeback: [
      'Hi. Me again. I stayed away a while and photographed a couple who met, broke up, and re-met. So. Second chances are kind of my brand now. Can we try again?',
    ],
    idle: [
      'Shot a wedding today where the groom cried before the bride even showed up. Ten out of ten. No money question, just wanted to tell someone.',
      "My tutor says my accent is 'improving from adorable to acceptable.' ACCEPTABLE. Huge day.",
    ],
    idleClose: [
      "I realized you've heard about my birth mom, my panic drafts, and my pin map. You're basically my second-most-trusted adult. Don't tell my dad the ranking.",
      "We've been through {crashes} scary market weeks and you never once made me feel dumb for asking. I notice that stuff. Okay bye, sorry, bye.",
    ],
    holiday: [
      'Happy holidays!! I shot three winter weddings and cried at all three. Professional distance is a myth. Sending you the least blurry snow photo, promise.',
    ],
    gradeHigh: ["A+!! I'd frame this report card if that wasn't a genuinely weird thing to do. (I might anyway.)"],
    gradeMid: ["A solid middle grade! Like a decent photo — sharp enough, could use better light. We'll get better light."],
    gradeLow: ["This one stung a little. I'm not mad, I'm just… okay, I'm a little mad. Mostly at the market. Partly not."],
  },

  // ── Jamie — lowercase, self-deprecating, ramen & logos ───────────────────
  jamie: {
    win: [
      'ok wow. checked the number twice. maybe i can be one of those people who buys the nice coffee.',
      "the studio fund said a big number today. don't make it weird. but thank you.",
    ],
    loss: [
      "saw the number. going to draw sad logos for a bit. it's fine. probably fine?",
      'ramen week energy. tell me you have a plan.',
    ],
    crash: [
      "the whole market did a ramen week at once, huh. i'm going to design a small commemorative crash logo. it's healing. probably.",
    ],
    misery: ["i keep doing the math on how many client projects this loss equals. it's a lot of logos."],
    recovery: ['not gonna lie, i drafted the "we should talk" text. deleting it now. keep going.'],
    dreamClose: [
      "we're close enough to the number that i opened a doc called 'studio names'. it has forty-one options. all bad. don't jinx this.",
    ],
    dream: ['fifty. thousand. i just gave my worst client notice. the studio is happening. you did that.'],
    epilogue: [
      "studio update: lease signed. i put a little plaque by the door — 'funded by ramen, patience, and one decent advisor.' come by sometime. bring nothing. i have coffee now. the nice kind.",
    ],
    renewal: [
      "ok. round two. last time i drafted a breakup text and deleted it. let's aim for zero drafts this time.",
      "third contract. you're officially the longest professional relationship i've ever had. that's either sweet or deeply sad. both.",
      "renewing again. didn't even read the terms this time. that's called trust. or negligence. trust.",
    ],
    goodbye: ['i did the math. that was three years of freelancing, gone. good luck with everything.'],
    comeback: [
      "hey. so. i left, and then i interviewed other advisors, and they all talk like linkedin posts. i'm back if you'll have me.",
    ],
    idle: [
      "no reason, just saw a logo today so bad i thought about it for an hour. anyway. how's my money.",
      "a client just paid me in 'exposure' again. the studio cannot come fast enough.",
    ],
    idleClose: [
      "you've seen me through {crashes} crashes and one very embarrassing panic text. don't think i forgot the panic text. i think about it weekly.",
      "made coffee this morning and thought 'the nice kind.' that's you. that's your fault.",
    ],
    holiday: [
      "happy holidays. designed you a card in fourteen minutes. it's the best work i've done all year. that's concerning.",
    ],
    gradeHigh: ["ok this deserves the nice coffee. logo's in progress. it's good. you'll cry."],
    gradeMid: ['respectable. the studio remains a future studio, but respectable.'],
    gradeLow: ["i've had clients ghost me with better results. we're renegotiating my patience."],
  },

  // ── Omar — physics metaphors, dad jokes, coach energy ────────────────────
  omar: {
    win: [
      "Momentum, people!! The fund moved like our bot in the sprint round — fast AND legal. The team says hi. Well, they said 'who?' but they meant hi.",
      "Great week! I told my wife the fund gained velocity. She asked if that's good. In this house we respect vectors — direction matters. It's GOOD.",
    ],
    loss: [
      'Down week. As I tell my students: gravity is not personal. Reset the experiment, check the variables, run it again.',
      'We lost some altitude. Physics says what goes down had potential energy all along. Coach says: shake it off.',
    ],
    crash: [
      "Whole market hit the wall like our bot in '22 — full speed, no brakes, parts everywhere. We rebuilt that bot in nine days. Your move, coach.",
    ],
    misery: [
      "Real talk, no physics jokes: I promised twelve kids they're going to Nationals. I look at them every practice and I can't take it back. Please.",
    ],
    recovery: [
      "We're climbing again and I did the solo fist-pump in the lab. A sophomore saw. My dignity: gone. My hope: restored.",
    ],
    dreamClose: [
      "SO close I priced the flights. Window seats for the kids who've never flown. That's six of them. SIX. Almost there, coach.",
    ],
    dream: [
      "FUNDED. I told the team at practice. Rivera cried into a servo motor. I said 'water damages electronics' and then cried on a different motor. NATIONALS, BABY!",
    ],
    epilogue: [
      "Nationals report: 14th of 96!! But the real score — six kids took their first flight, and Rivera's mom framed the boarding pass. FRAMED IT. Thank you, from all thirteen of us.",
    ],
    renewal: [
      "Round two! First law of advisors: a good one in motion stays in motion. Let's keep the motion.",
      "Contract three! You're officially tenured in my book. The book is a spreadsheet. The tenure is real.",
      "Renewing again. The team named a test robot after you — the reliable one that never breaks. Highest honor we've got.",
    ],
    goodbye: [
      "I've coached kids through losses that weren't their fault. This one was ours — mostly yours. I have to protect the team fund now. No hard feelings. Some hard feelings.",
    ],
    comeback: [
      "Coach's rule: everyone gets one rebuild. I thought about it, my wife's on board, the team voted 9-3. Don't worry about the 3. Let's rebuild.",
    ],
    idle: [
      "No update needed, but a student just asked if compound interest is 'like a robot that builds robots.' I have never been prouder.",
      'Pop quiz: what has twelve kids, one tie, and a dream? Correct. This guy.',
    ],
    idleClose: [
      "You've weathered {crashes} crashes with me — that's varsity, coach. There is no junior varsity. It's the honor that counts.",
      "My wife asked about 'that advisor' at dinner. You come up at DINNER now, {advisor}. Use the power wisely.",
    ],
    holiday: [
      'Happy holidays from the robotics lab! The team built a robot that wraps presents. Works 60% of the time, 100% chaotic. Corny sign-off incoming: the best gift is the dream staying on track. TRUE though.',
    ],
    gradeHigh: ["A+ term! Going on the fridge. Yes, teachers have fridges. Mine is mostly failed circuit diagrams. You're the exception."],
    gradeMid: ["Solid B. As I tell my students: B stands for 'building toward something.' It also just stands for B. Keep going."],
    gradeLow: ["This grade goes in the drawer, not on the fridge. Every scientist has a drawer. Let's not fill it."],
  },

  // ── Priya — clinical precision + warmth, medical framing ─────────────────
  priya: {
    win: [
      'Between rounds. Saw the number. Prognosis: excellent. My mother would say God is good; I say the advisor is competent. Both can be true.',
      "Strong week. I told Papa the shop's Sundays are 'in surgery.' He laughed, then went quiet. He knows what I'm doing. He pretends not to.",
    ],
    loss: [
      "Noted the dip. In medicine we don't panic at one bad reading; we monitor trends. Consider yourself monitored.",
      "Down week. I've seen patients rally from worse charts. Adjust the treatment plan, please.",
    ],
    crash: [
      "The market coded. I've run actual codes — the survivors are the ones with a calm team leader. Be the calm team leader.",
    ],
    misery: [
      'I calculated it tonight: at this rate the shutters stay up another three years. Papa turns 61 in three years. Recalculate. Please.',
    ],
    recovery: [
      "The chart is improving. I've stopped checking it between every patient and now check between every third. That's recovery, for me.",
    ],
    dreamClose: [
      "So close. I've drafted the sign for the shop door: 'CLOSED SUNDAYS — by order of their daughter.' It's in my locker. Almost.",
    ],
    dream: [
      "Debt cleared. I drove home and taped the sign to the door myself. Mama cried. Papa polished a counter that was already clean. Twenty-six years, and now: Sundays. Thank you. Doctor's honor.",
    ],
    epilogue: [
      "First Sunday. They didn't know what to do with it — Papa reorganized the stockroom out of habit. Then Mama put a blanket out in the park like it was 1994, and he fell asleep mid-sentence in the sun. Best chart I've ever read.",
    ],
    renewal: [
      'Second course of treatment. The first showed measurable outcomes. Continuing care approved.',
      "Third engagement. I've stopped seeking second opinions on you. That's the highest compliment in my field.",
      'Renewing. Mama is sending you sweets from the shop. This is escalation. Accept the ladoo graciously.',
    ],
    goodbye: [
      "I'll say this precisely: my parents' Sundays were in your hands, and your hands were careless. I'm transferring their care. Be better for someone else's family.",
    ],
    comeback: [
      "I consulted other advisors. Their bedside manner was worse and their outcomes were no better. Resuming with you. Don't make me regret evidence-based decision-making.",
    ],
    idle: [
      'Seven-minute break. Ate half a samosa, checked the fund, remembered why I sleep four hours. Worth it. Back to rounds.',
      "A patient today grew up over a corner shop too. We compared our parents' work ethics for ten minutes. His also never close. There are so many of us.",
    ],
    idleClose: [
      "You've been steady through {crashes} crashes. In hospital terms: I'd want you on my code team. I don't say that about consultants.",
      "Papa asked about you by name today. He calls you 'the Sunday person.' You have a title in my family now.",
    ],
    holiday: [
      'Holiday shift, of course. But the shop is closing early tonight — one whole hour early. Baby steps toward Sundays. Happy holidays from all of us.',
    ],
    gradeHigh: ["Distinction-level work. If advising had board exams, you'd have passed first attempt. Rare."],
    gradeMid: ['A pass. Competent, unremarkable, safe. Medicine loves safe. Daughters funding Sundays want slightly more.'],
    gradeLow: ['This performance reads like a chart I would flag. Intervention required. Consider this the intervention.'],
  },

  // ── Frank — terse, road-worn, calls you "boss" ───────────────────────────
  frank: {
    win: [
      'Saw the number. Good haul, boss.',
      "Number's up. Told Linda over the phone. She said don't jinx it. So that's all I'll say.",
    ],
    loss: [
      "Number's down. Hit weather before. Keep her between the lines.",
      "Red week. I've driven through worse. So have you, I figure.",
    ],
    crash: ["Whole market jackknifed. Seen it happen on I-80. You steer INTO it, boss. Don't brake."],
    misery: [
      "Gonna say this once. That porch is thirty years of promise. Don't make a liar of me at the church and again at the bank.",
    ],
    recovery: ["Back on the road. Knew you'd find the gears. Never doubted it. Okay. Doubted it Tuesday."],
    dreamClose: ["Close now. Drove the long way past Lake Chelan on Sunday. Didn't stop. Next time I stop."],
    dream: [
      "Bought it. The house. Porch faces the water. Told Linda at dinner, plain as pie. She didn't say one word — just got her mother's rocking chair out of storage. 1993, boss. Paid in full.",
    ],
    epilogue: [
      "First morning on the porch. Coffee. Linda in her mother's chair. Three million miles, and this is the only view I ever wanted. You're welcome at that rail anytime.",
    ],
    renewal: [
      'Another run, same route. You drive, boss.',
      "Third haul together. I don't switch carriers when the freight arrives whole. Sign it.",
      "Load me up again. You're the only dispatcher never lied to me. That's the whole speech.",
    ],
    goodbye: [
      'My old man trusted a bank once. I trusted you. Same lesson, one generation apart. End of the road, boss.',
    ],
    comeback: ["Cooled off. A man deserves one more run if he owns his wreck. You gonna own it? Then let's roll."],
    idle: [
      "Amarillo tonight. Same lot my dad used to park in. Waved at his spot like always. Drive safe, boss.",
      "Radio's broke. Six hundred miles of my own thoughts. Mostly the porch. Some of it your fees.",
    ],
    idleClose: [
      "Rode through {crashes} market storms with you now. You'd have made a decent trucker. Take that how it's meant — it's top shelf.",
      'Linda asked after you. By name. Thirty-one years, she has asked after exactly four people. You, two mechanics, and one priest.',
    ],
    holiday: [
      'Holiday run tonight. Lights on the overpasses all the way through Ohio. Prettiest commute in America and nobody knows it. Merry one, boss.',
    ],
    gradeHigh: ['Clean run, no damage, ahead of schedule. Best grade I give.'],
    gradeMid: ['Freight arrived. Some rattles. Fair haul.'],
    gradeLow: ['Load shifted, boss. Check your straps before the next run.'],
  },

  // ── Sarah — precise, engineering-brained, quietly devastating ────────────
  sarah: {
    win: [
      'Reviewed the week. Above benchmark, sensible exposure. Noted, and appreciated.',
      'Good week. My daughter asked why I was smiling at a spreadsheet. Keep it up.',
    ],
    loss: [
      "I ran the drawdown against my model. You're inside tolerance — barely. Tighten up.",
      "Volatility I can accept. Sloppiness I can't. Which was this?",
    ],
    crash: [
      'I watched the crash from a standup meeting and said nothing. Internally I was refreshing our positions at 60-second intervals. Report, please.',
    ],
    misery: [
      "I recalculated the sabbatical timeline tonight. It moved a year out. She'll be ten. Fix this.",
    ],
    recovery: ['The numbers are recovering. So is my confidence. Both remain on probation.'],
    dreamClose: [
      "We're within striking distance of the sabbatical number. I told my daughter 'maybe soon.' Do not make me have said that for nothing.",
    ],
    dream: [
      'The fund is there. $90k. I gave notice this morning — a whole year with her. Thank you. Genuinely.',
    ],
    epilogue: [
      "Week one of the sabbatical. She taught me her card game; the rules change whenever she's losing. I have never billed fewer hours or been happier. 'Thank you' remains an understatement.",
    ],
    renewal: [
      "Contract two. Your process last time was… defensible. I've updated my priors accordingly.",
      'Third engagement. I no longer re-verify your math. Understand what that means, coming from me.',
      "Renewing. My daughter asked if 'the money person' is coming to her birthday. You've breached containment.",
    ],
    goodbye: ["I computed exactly what your decisions cost: the year with my daughter. We're done."],
    comeback: [
      'I ran a retrospective on our failure. Root cause was shared — my tolerance model was wrong too. Restarting the engagement. Once.',
    ],
    idle: [
      "Sprint review ran long. I stared at the sabbatical spreadsheet the whole time. It's the only tab that matters.",
      "My daughter built a 'portfolio' of leaves ranked by crunchiness. Strong methodology. She may be your competition.",
    ],
    idleClose: [
      '{crashes} crashes weathered together. My probation metaphors have quietly lapsed. Noted for the record.',
      'I recommended you to a colleague today. I do not do that. Calibrate accordingly.',
    ],
    holiday: [
      "Holiday status: tree acquired, lights debugged — two dead bulbs, found via binary search. My daughter says hello to 'the money person.'",
    ],
    gradeHigh: ["Rigorous, defensible, repeatable. If you were a codebase, I'd approve the merge."],
    gradeMid: ['Adequate. "Adequate" is not a word I enjoy using about my daughter\'s year.'],
    gradeLow: ["I've documented my concerns. There are several. Alphabetized."],
  },

  // ── Elena — feeds everyone, loud joy, fierce grief ───────────────────────
  elena: {
    win: [
      'GOOD WEEK! I made osso buco to celebrate and fed half the block. You cook the money, I cook the rest. Come by, I will feed you.',
      'The number went UP! I told table six — total strangers — and they applauded. This is why I love this neighborhood.',
    ],
    loss: [
      'Down week. Fine. You know what I do with bruised tomatoes? Sauce. Make me sauce out of this.',
      'I saw the red. I burned exactly one pan tonight thinking about it. ONE. That is restraint, for me.',
    ],
    crash: [
      "The market crashed and two of my suppliers called me crying. I fed them both. Now — what's OUR plan? And have you eaten? You never answer that part.",
    ],
    misery: [
      "Tonight I stayed late and talked to the kitchen like he was still in it. I don't do that when the numbers are good. Understand me? Make the numbers good.",
    ],
    recovery: [
      'The numbers turned and I sang in the kitchen again. The staff noticed. Nobody said anything. Good week. Come eat.',
    ],
    dreamClose: [
      'SO CLOSE. I drove past the space for Table Two and pressed my hand on the window like a crazy person. The letters go up soon. The BIG letters.',
    ],
    dream: [
      "We signed the lease. Table Two is real. I hung his photo in the new kitchen first — before the pans, before anything. MATEO'S goes over the door in letters you can read from the bus. Come to opening night or I will find you.",
    ],
    epilogue: [
      "Opening night. Full house. His sister flew in and stood under the sign for ten whole minutes. I cooked his osso buco and nobody knew why the chef was crying. YOU know. Your table is table two, forever. It's held.",
    ],
    renewal: [
      'Again, yes, of course again! You did good work. Sit, sign, eat. In that order or any order.',
      'Third contract! You know what that makes you? A regular. Regulars get the good table and the honest gossip.',
      "Sign, sign. You're family now — which means I feed you more AND yell at you more. It's a package.",
    ],
    goodbye: [
      'I gave you a seat at my table and you served me this. In my kitchen we throw out what spoils — fast, before it ruins the walk-in. Goodbye.',
    ],
    comeback: [
      "Okay. I cooled down. Mateo used to say I fire people on Friday and rehire them Sunday with cannoli. It's Sunday. There's cannoli. Come back.",
    ],
    idle: [
      'A critic came in tonight. I know because he ordered wrong on purpose. We won him over with the special. We ALWAYS win them over with the special.',
      'Slow Tuesday. I taught the new kid the sauce. He added cream. We are in a rebuilding phase.',
    ],
    idleClose: [
      '{crashes} crashes we have cooked through together now. You know who else never left when the kitchen caught fire? Exactly. You have his stubbornness. It is my favorite thing about you both.',
      "I put your name on the chalkboard wall. Regulars only. Don't make that face — it's chalk, I can erase it. I won't. But I can.",
    ],
    holiday: [
      "Holidays at the restaurant — free dinner for anyone alone that night. His tradition, year fifteen. There's a plate with your name on it if you're ever the one alone. I mean it.",
    ],
    gradeHigh: ['PERFECT service, start to finish. If you were a dish, you would be the special I never take off the menu.'],
    gradeMid: ['Good, not great — like a risotto that needed two more minutes. We both know it. Two more minutes next time.'],
    gradeLow: ['This term? This was the night the fish came late and we 86ed half the menu. That happens ONCE. You hear me? Once.'],
  },

  // ── Walt — measured, logbooks, laminated maps ────────────────────────────
  walt: {
    win: [
      'Logged the week: up. Carol put a new pin-flag on the fridge map. Good work.',
      "Number's up. In machining terms: clean cut, no burrs. Appreciated.",
    ],
    loss: [
      "Down week. Checked my log — within tolerance, barely. I mark tolerances in red pen. Pen's out.",
      'Loss noted and measured. A thousandth here, a thousandth there. Watch the drift.',
    ],
    crash: [
      "Market crash. I ran the numbers twice, then went to the shop and made a part I didn't need. Steadies the hands. Yours steady too, I trust.",
    ],
    misery: [
      "Carol asked how the parks fund was doing and I changed the subject. Thirty-nine years, I have never changed the subject on her. Fix that for me.",
    ],
    recovery: [
      "Told Carol the fund's mended. She moved the map from the fridge to the table. Table means planning. Don't put us back on the fridge.",
    ],
    dreamClose: [
      "Close now. Carol's plotted the route — starts at Acadia, ends at Denali. 14,000 miles. She laminated a SECOND map. That's how you know it's serious.",
    ],
    dream: [
      'Target hit. Bought the truck Tuesday, the camper Thursday. Carol teared up at the Badlands brochure alone. Sixty-three parks, zero excuses left. We leave in spring. Precision work, all around.',
    ],
    epilogue: [
      "Postcard from park #11, Yellowstone. Carol's handwriting on the front, mine on the back: 'Knees holding. Marriage excellent. 52 to go.' Mailed you a real one too. Check your box.",
    ],
    renewal: [
      'Second contract. The first measured within spec. Proceed.',
      "Third go. I've stopped double-checking your figures. First time in thirty-eight years I've said that to anyone but Carol.",
      "Signing again. You're in the logbook in pen now. I do everything else in pencil.",
    ],
    goodbye: [
      "I measured this term three times hoping I was wrong. I wasn't. A machinist scraps the part, not the standard. Take care now.",
    ],
    comeback: [
      'Carol says everyone deserves a second setup on the lathe. She is the better machinist of us, morally speaking. Back to work, then.',
    ],
    idle: [
      'Retirement update: built a birdhouse to blueprint. The wrens rejected it. No accounting for taste.',
      "Cleaned the shop, sharpened everything, ran out of things to sharpen. Spring can't come fast enough.",
    ],
    idleClose: [
      'By my log we have been through {crashes} crashes together. I keep that log in the same drawer as the map. Same drawer means something, in this house.',
      "Carol set a third plate at Sunday dinner 'in case the advisor is ever hungry.' That's her highest setting. Consider yourself calibrated.",
    ],
    holiday: [
      'Holidays. Carol strung lights on the birdhouse the wrens rejected. Cardinals live in it now. There is a lesson in there somewhere. Merry Christmas from us both.',
    ],
    gradeHigh: ['Within a thousandth, every week of it. Finest work I have commissioned.'],
    gradeMid: ["Serviceable part. Passes inspection. A machinist knows 'passes' isn't 'proud.'"],
    gradeLow: ['Out of spec. Filed under rework. No shame in rework — once.'],
  },

  // ── Naomi — narrates in scene directions, wry, deadline-haunted ──────────
  naomi: {
    win: [
      "INT. EDIT BAY — NIGHT. The filmmaker checks her fund. It's up. She allows herself one (1) small dance. CUT TO: more editing.",
      'Good week. The budget spreadsheet and I are briefly on speaking terms. Historic footage.',
    ],
    loss: [
      'EXT. HER APARTMENT WINDOW — DUSK. She stares meaningfully into the middle distance. The fund is down. The score is one cello. Fix the third act.',
      "Down week. In documentary we call this 'the low point before the turn.' Please confirm the turn is scheduled.",
    ],
    crash: [
      "SMASH CUT: the entire market, on fire. I've filmed actual floods with more composure than the news had today. Steady hands. Wide shot. Tell me we hold.",
    ],
    misery: [
      "I called the village yesterday. Auntie Ruth's memory is going faster than the fund is growing. There's a version of this film that is just gravestones. I refuse to make it. Please.",
    ],
    recovery: [
      'The fund turned. I re-cut the trailer out of sheer relief. It has hope in it now, which is new.',
    ],
    dreamClose: [
      "We're close. I emailed the crew availability holds. My editor said 'so it's real this time?' It's real this time. Right? It's real.",
    ],
    dream: [
      "FUNDED. Flights booked, crew locked, color grade paid. I called the village and told Auntie Ruth we're coming. She said 'finally' in three languages. Roll credits on doubt. Roll cameras on everything else.",
    ],
    epilogue: [
      "Rough cut is done. There's a shot of Auntie Ruth laughing at her own joke for forty seconds and it's the best thing I have ever filmed. Your name is in the thanks. Deal with it.",
    ],
    renewal: [
      "Season two. The critics said season one had 'promising fundamentals.' I'm the critics.",
      'Third contract. You have survived my metaphors longer than two producers and one fiancé. This is called character development.',
      "Renewing. At this point you're less an advisor and more a recurring character. Beloved. Weirdly reliable. Great arc.",
    ],
    goodbye: [
      "FINAL SHOT: the filmmaker closes the account. VOICEOVER: 'Some stories end because someone stopped protecting them.' That's the cut. No sequel.",
    ],
    comeback: [
      "Every documentary has the return-to-the-village scene. This is mine. The industry standard elsewhere turned out to be worse lighting AND worse returns. I'm back. Camera's rolling.",
    ],
    idle: [
      'Spent today logging footage. Auntie Ruth told the flood story again — third version, new ending. Historians hate her. I love her.',
      "A festival programmer asked what the film's about. I said 'time.' He nodded slowly. It's about my grandmother. But 'time' gets funding.",
    ],
    idleClose: [
      'MONTAGE: {crashes} market crashes, one steady advisor, me learning not to write panic emails. Character growth. Yours was already complete. Annoying.',
      "I found a shot of my grandmother's hands last night and thought about all of this — the fund, the film, you keeping the lights on. It's all one project, really.",
    ],
    holiday: [
      "Holiday update: I filmed my family's dinner 'for archival purposes.' Everyone performed for the camera except grandma, who owned it. Some people are simply leads. Happy holidays.",
    ],
    gradeHigh: ["Five stars. 'A triumph of patient construction' — me, just now, about your work. Pull-quote approved."],
    gradeMid: ["Three stars. 'Competent, if conventional.' The festival circuit's coldest compliment. Do bolder work."],
    gradeLow: ["The review is in and it isn't kind. 'A promising premise, poorly executed.' Recut and resubmit."],
  },

  // ── Marcus — clipped, imperious, Whitmore-obsessed ───────────────────────
  marcus: {
    win: [
      "Saw the number. Acceptable. Whitmore's guy did less. Continue.",
      'Good. Do it again.',
    ],
    loss: [
      'Explain the drawdown. One sentence. Choose it carefully.',
      'Whitmore called to ask how my portfolio was doing. Fix this.',
    ],
    crash: ["Crash. Whitmore is panicking. Tell me you aren't. One word will do."],
    misery: ['I have fired better advisors for less. Consider the next few weeks an audition.'],
    recovery: ["You climbed out of the hole. Noted. Don't dig another."],
    dreamClose: ["The number is close. I've booked the family dinner. Don't make me cancel a reservation."],
    dream: [
      'Whitmore went quiet at dinner when I said the number. Quiet. Money well spent — yours and mine.',
    ],
    epilogue: [
      "Follow-up. Whitmore's wife asked for your name at brunch. I said you were retained. Exclusively. That word cost me nothing and him plenty.",
    ],
    renewal: [
      'Again. Same terms. Fewer questions this time — from both of us.',
      "Third contract. I don't do third contracts. Note the exception.",
      "Renew. Skip the pleasantries. You've earned the skip.",
    ],
    goodbye: [
      'Three companies. Two divorces. One rule: never pay twice for incompetence. Records to my lawyer.',
    ],
    comeback: [
      "I fired you. I've since fired the replacement. Draw whichever conclusion flatters you least, and take the account.",
    ],
    idle: [
      'Whitmore bought a boat. A boat. Continue as planned.',
      "Board meeting today. Someone said 'synergy.' I thought about the portfolio instead. It calmed me. Marginally.",
    ],
    idleClose: [
      "You've survived {crashes} crashes and my temperament. Only one of those impresses me.",
      "My daughter interns at a fund now. I told her: watch the quiet advisors. She asked if I meant you. I didn't deny it.",
    ],
    holiday: ['Family dinner season. Whitmore will bring up returns. Ensure I bring up ours louder.'],
    gradeHigh: ['Competence. Rarer than it should be. There may be more capital where that came from.'],
    gradeMid: ["Passing. Whitmore's manager also passes. Do you see the problem?"],
    gradeLow: ["I've seen better performance from a savings account. Impress me or lose me."],
  },

  // ── Vivian — dry ex-hedge-fund wit, secretly sentimental ─────────────────
  vivian: {
    win: [
      "Reviewed the week. Alpha where you claimed it, beta where you hid it. I've fired men for less and funded women for more. Continue.",
      "Up week. My old desk would've taken triple the risk for double the return and lost both. Your restraint is almost charming.",
    ],
    loss: [
      "A drawdown. What matters is whether you sized it deliberately or accidentally. I'll know from your next move, so consider it carefully.",
      'Down week. I once watched a partner liquidate a position out of pure fear. He makes artisanal candles now. Don\'t make candles.',
    ],
    crash: [
      'A proper crash. I survived four of these professionally. The amateurs sell, the professionals breathe, and the legends buy the silence. Which are you? Show me.',
    ],
    misery: [
      'A rare personal note: my father used to say a floor tells you everything about who walks on it. This account is the floor. It has been dirty for weeks. He would notice. So do I.',
    ],
    recovery: [
      'The account recovered. Adequate speed, decent shape. My father waxed floors faster than you fix drawdowns — but he had thirty years of practice. You have me. Arguably harsher.',
    ],
    dreamClose: [
      "We're near the number. I called Halloway's dean — the east panel of the donor wall is available. East catches the morning light. He'd have liked mornings better if he'd ever been allowed to sleep through one.",
    ],
    dream: [
      'The scholarship is funded. EMMANUEL OKAFOR, in bronze, on the wall he polished. First recipient starts autumn term — a girl whose mother cleans offices. He would have said I made a fuss. I made exactly enough fuss.',
    ],
    epilogue: [
      "The unveiling was Thursday. I touched the bronze and did something undignified in front of the dean. The first scholar sent a thank-you letter in perfect penmanship; my father's was terrible. I've framed hers beside his one surviving note. That's all. Back to business.",
    ],
    renewal: [
      'The study continues. Preliminary finding: retail advisors are survivable. Further research required.',
      "Third engagement. For calibration: I've extended a third year to exactly two people at this tier. One runs a sovereign fund now. No pressure.",
      "Renewing. My anthropological study has failed — I can no longer observe you objectively. That's the entire disclosure. Sign.",
    ],
    goodbye: [
      "I graded generously because I liked the thesis. But my father's name doesn't ride on sentiment, and neither do I. The study concludes. Findings: unpublishable.",
    ],
    comeback: [
      "Revised finding: the market for competent advisors is thinner than I remembered. I've re-attributed your failure — half market, a quarter you, a quarter my interference. I don't apologize. I re-engage. Similar thing.",
    ],
    idle: [
      "I sat on a nonprofit board today and said 'basis points' to people who flinched. I miss desks. This account is my methadone. Perform accordingly.",
      'A former analyst called me for advice. I quoted your last quarter at him anonymously. He assumed it was institutional. I let him.',
    ],
    idleClose: [
      "For the record: {crashes} crashes together and you've never sent me one panicked message. Do you know what I'd have paid for that quality on my old desk? I do. To the dollar.",
      'My father would have liked you, which annoys me. He liked exactly nine people. The list was competitive.',
    ],
    holiday: [
      "Season's greetings. I fund the janitorial staff's holiday bonus at Halloway now, anonymously. You are one of four people who know. Audit your discretion accordingly.",
    ],
    gradeHigh: [
      'Top decile. On my old desk you would have received a bonus, a title, and an ulcer. Here you receive my respect, which compounds better.',
    ],
    gradeMid: [
      'Median. The middle of the pack is where careers go to be comfortable. My father scrubbed floors so I would never be comfortable. Reconsider your ambitions.',
    ],
    gradeLow: ['Bottom quartile. I once closed an entire desk with a single email. Consider the brevity of this one a mercy.'],
  },

  // ── Gus — proverbs (half invented), thawing distrust ─────────────────────
  gus: {
    win: [
      "Money grew this week. Like rain you didn't order arriving anyway. Don't strut about it.",
      "Saw the gain. My father said never praise the field till the barn is full. Barn's filling. That's all I'll say.",
    ],
    loss: [
      'Lost some. Frost takes a row now and then. Question is whether you planted deep enough. Did you?',
      "Red week. A man who panics at one storm has never farmed. I've farmed. Steady on.",
    ],
    crash: [
      "Whole market went down like the hail of '96. Took every window and the north crop. Know what we did? Reglazed. Replanted. Get to it.",
    ],
    misery: [
      "Starting to think you're like the forecast — confident and wrong. That west field's waited forty years. It shouldn't have to wait on your learning curve too.",
    ],
    recovery: [
      "Account's mended. I'll allow I said some things at the kitchen table about you. The dog heard most of it. He's agreed to keep it between us.",
    ],
    dreamClose: [
      "Getting close. Walked the fence line of the west field Sunday. Somebody's got to check the posts before it's ours. Forty years of somebody is me.",
    ],
    dream: [
      "It's done. Signed the papers in the same bank branch that took it — different men, same soft shoes, but this time the deed came ACROSS the desk. My grandson's name is on it. Eli Brandt. My father can rest now. So can I, some.",
    ],
    epilogue: [
      "Planted the west field. First seed in forty-three years. Eli drove the tractor and I rode along and said nothing, the way my father would have wanted words. You did right by us, money man. That's a full sentence from me. Frame it.",
    ],
    renewal: [
      'Another season, then. Same rules: no promises, no soft shoes, no surprises.',
      "Third season. I've kept hired hands longer for less reason. You'll do.",
      "Sign it again. You know I told the co-op about you? Bragged, my wife calls it. I call it accurate reporting.",
    ],
    goodbye: [
      "My father watched a bank fence off his field and never spoke of it again. Now I know what he wasn't saying. You're the fence, son. We're done.",
    ],
    comeback: [
      "Wife says a grudge is the only crop that grows better untended. I've tended mine long enough. One more season. Earn it this time.",
    ],
    idle: [
      'No business. Rained good and slow all night, the kind the ground actually drinks. Even the money news couldn\'t spoil it.',
      "Eli asked what you do for a living. I said 'farms numbers.' He asked if numbers have seasons. Boy's smarter than the both of us.",
    ],
    idleClose: [
      "{crashes} storms we've been through now, and you never once sold the seed corn. My father had a word for men like that. Never told me what it was, but he'd have used it on you.",
      'You should know the dog likes you now. Took him two years to like the mailman. Draw your own conclusions.',
    ],
    holiday: [
      "Holidays at the farm. Wife's pie, Eli's noise, one empty chair we set anyway. My father'd say the table is the only ledger that matters. Even you'd balance on it, money man. Merry Christmas.",
    ],
    gradeHigh: ["Best harvest I've had off land I can't walk. Near said thank you. Take the 'near' — it's worth more."],
    gradeMid: ['Fair yield. Not a drought, not a bumper crop. A farmer plants again either way.'],
    gradeLow: ["Thin harvest. My father would walk a field like this once, quiet-like, and you'd feel it worse than any yelling. Consider yourself walked past."],
  },
};

const FALLBACK: VoicePack = {
  win: ['Good week. Keep it going.'],
  loss: ['Saw the losses. Watching closely.'],
  crash: ['That crash was ugly. Tell me we came through.'],
  misery: ["I'm losing faith in this arrangement."],
  recovery: ['Better. I was close to leaving.'],
  dreamClose: ["We're getting close to the goal. I can feel it."],
  dream: ["We hit the target. I won't forget this."],
  epilogue: ['The plan worked out. Thank you for your part in it.'],
  renewal: ["Let's keep going.", 'Another term, then.', 'You know the drill by now.'],
  goodbye: ["This isn't working. I'm out."],
  comeback: ["I'm willing to try this again."],
  idle: ['No news. Just checking in.'],
  idleClose: ["We've been through a lot together."],
  holiday: ['Happy holidays.'],
  gradeHigh: ['Excellent work this contract.'],
  gradeMid: ['A fair result.'],
  gradeLow: ['I expected more.'],
};

function voiceOf(clientId: string): VoicePack {
  return VOICES[clientId] ?? FALLBACK;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Everything a line might reference about the shared history.
export interface VoiceContext {
  advisor?: string; // advisor's name
  crashes?: number; // black swans weathered together
  contracts?: number; // contracts completed together
}

function fillTokens(line: string, ctx?: VoiceContext): string {
  return line
    .replace(/\{advisor\}/g, ctx?.advisor || 'boss')
    .replace(/\{crashes\}/g, `${Math.max(1, ctx?.crashes ?? 1)}`);
}

export type BarkEvent =
  | 'win'
  | 'loss'
  | 'crash'
  | 'misery'
  | 'recovery'
  | 'dreamClose'
  | 'dream'
  | 'epilogue'
  | 'goodbye'
  | 'comeback'
  | 'idle'
  | 'holiday';

export function barkLine(clientId: string, event: BarkEvent, ctx?: VoiceContext): string {
  const v = voiceOf(clientId);
  if (event === 'idle') {
    // Small talk deepens once you've finished two contracts together: the
    // close pool carries memories and inside jokes instead of pleasantries.
    const pool = (ctx?.contracts ?? 0) >= 2 && v.idleClose.length > 0 ? v.idleClose : v.idle;
    return fillTokens(pick(pool), ctx);
  }
  return fillTokens(pick(v[event]), ctx);
}

// The text a client sends when signing ANOTHER contract with you — staged by
// how many they've completed, so the third renewal sounds nothing like the
// first. contractsCompleted >= 1 expected.
export function renewalLine(clientId: string, contractsCompleted: number, ctx?: VoiceContext): string {
  const v = voiceOf(clientId);
  const idx = Math.min(Math.max(contractsCompleted - 1, 0), v.renewal.length - 1);
  return fillTokens(v.renewal[idx], ctx);
}

// The client's one-line reaction on a contract report card.
export function gradeQuote(clientId: string, grade: ContractGrade): string {
  const v = voiceOf(clientId);
  if (grade === 'S' || grade === 'A') return pick(v.gradeHigh);
  if (grade === 'B') return pick(v.gradeMid);
  return pick(v.gradeLow);
}

// Wrap a bark as an informational phone text (never graded, arrives unread so
// the phone badge pings — the phone is the game's emotional bus).
export function makeClientNote(clientId: string, clientName: string, week: number, text: string): ClientMessage {
  return {
    id: `note-${clientId}-w${week}-${Math.floor(Math.random() * 100000)}`,
    clientId,
    clientName,
    messageType: 'client_note',
    stockId: '',
    stockName: '',
    messageText: text,
    weekIssued: week,
    deadline: week,
    baselineShares: 0,
    read: false,
    resolved: true,
    fulfilled: true,
  };
}
