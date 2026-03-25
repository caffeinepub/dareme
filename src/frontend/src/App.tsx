import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Copy,
  Dices,
  Flame,
  Heart,
  RefreshCw,
  RotateCcw,
  Share2,
  Star,
  Trash2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Dare } from "./backend";
import { useFavorites } from "./hooks/useFavorites";
import { useDaresByCategory } from "./hooks/useQueries";

type Tab = "discover" | "favorites";
type AppPhase =
  | "wheel"
  | "result"
  | "difficulty"
  | "categories"
  | "content"
  | "setup"
  | "rating"
  | "endgame";
type ContentType = "truth" | "dare" | "situation";
type DifficultyLevel = "easy" | "medium" | "extreme";

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORY_LIST = [
  { id: "Funny", label: "Funny", emoji: "😂" },
  { id: "Awkward", label: "Awkward", emoji: "😬" },
  { id: "Emotional", label: "Emotional", emoji: "😭" },
  { id: "School", label: "School", emoji: "🎒" },
  { id: "Romantic", label: "Romantic", emoji: "💕" },
  { id: "Social Prank", label: "Social Prank", emoji: "🎭" },
];

const CATEGORIES = [{ id: null, label: "All", emoji: "🔥" }, ...CATEGORY_LIST];

// ─── Hashtags ────────────────────────────────────────────────────────────────
const HASHTAGS: Record<string, string[]> = {
  Funny: ["#DareMe", "#Viral", "#FunnyDare", "#LaughChallenge", "#Hilarious"],
  Awkward: [
    "#DareMe",
    "#Viral",
    "#AwkwardMoment",
    "#Cringe",
    "#SocialExperiment",
  ],
  Emotional: [
    "#DareMe",
    "#Viral",
    "#EmotionalChallenge",
    "#HeartFelt",
    "#Feelings",
  ],
  School: [
    "#DareMe",
    "#Viral",
    "#SchoolDare",
    "#StudentLife",
    "#ClassroomChaos",
  ],
  Romantic: [
    "#DareMe",
    "#Viral",
    "#RomanticDare",
    "#CrushChallenge",
    "#LoveVibes",
  ],
  "Social Prank": [
    "#DareMe",
    "#Viral",
    "#PrankChallenge",
    "#SocialExperiment",
    "#GotEm",
  ],
  default: ["#DareMe", "#Viral", "#Challenge", "#ShortVideo", "#Trending"],
};

function getHashtags(category: string | null): string {
  const key = category ?? "default";
  return (HASHTAGS[key] ?? HASHTAGS.default).join(" ");
}

// ─── Dare Data ───────────────────────────────────────────────────────────────
const FALLBACK_DARES: Dare[] = [
  {
    id: 1n,
    dare: 'Text your crush: "I need to tell you something" and don\'t reply for 10 minutes.',
    caption: "This app just ruined my relationship 💀",
    category: "Awkward",
  },
  {
    id: 6n,
    dare: 'Walk up to a stranger and say "We need to talk" then walk away immediately.',
    caption: "Chaos. Pure chaos. 😬",
    category: "Awkward",
  },
  {
    id: 9n,
    dare: "Go to a store, pick up an item, then put it back and shake your head disapprovingly very loudly.",
    caption: "The cashier was trying so hard not to laugh 💀",
    category: "Awkward",
  },
  {
    id: 10n,
    dare: "Wave back confidently at someone who wasn't waving at you.",
    caption: "I committed. They were confused. I walked away. 😬",
    category: "Awkward",
  },
  {
    id: 11n,
    dare: 'Call a family member and tell them you have important news — then say "never mind" and hang up.',
    caption: "Three missed calls later… 💀",
    category: "Awkward",
  },
  {
    id: 12n,
    dare: "Hold the door for someone who is way too far away and force them to awkwardly jog.",
    caption: "They speed-walked. I maintained eye contact. 😬",
    category: "Awkward",
  },
  {
    id: 13n,
    dare: "Sit next to a stranger and open your laptop to a totally blank document and dramatically sigh every 30 seconds.",
    caption: "They asked if I was okay. I said 'not really.' 😬",
    category: "Awkward",
  },
  {
    id: 14n,
    dare: "Order something at a food place, pay, and then say 'wait actually never mind' right as they start making it.",
    caption: "I don't know why I did this. But here we are. 💀",
    category: "Awkward",
  },
  {
    id: 15n,
    dare: 'Text three friends: "We need to talk" then respond with "never mind lol" to every reply.',
    caption: "The anxiety I caused was immeasurable 😭",
    category: "Awkward",
  },
  {
    id: 2n,
    dare: "Ask your best friend for $20 with a completely straight face.",
    caption: "POV: You're testing if they're real ones 😭",
    category: "Funny",
  },
  {
    id: 3n,
    dare: "Stay completely silent for 1 full minute while your friends try to make you laugh.",
    caption: "I lasted 12 seconds. This app is dangerous 💀",
    category: "Funny",
  },
  {
    id: 8n,
    dare: "Do a British accent for the next 5 minutes of your day.",
    caption: "Right then, cheerio and all that innit 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    category: "Funny",
  },
  {
    id: 16n,
    dare: "Narrate everything you do for the next 3 minutes in a dramatic movie-trailer voice.",
    caption: "'He opened the fridge… and saw nothing.' Oscar-worthy. 🎬",
    category: "Funny",
  },
  {
    id: 17n,
    dare: "Try to eat a cracker, then whistle. Whoever can do it first wins nothing but glory.",
    caption: "This seemed easy. It was not. 💀",
    category: "Funny",
  },
  {
    id: 18n,
    dare: "Speak only in questions for the next 5 minutes. Any statement = forfeit.",
    caption: "Did I lose in under 60 seconds? Would I do it again? 😂",
    category: "Funny",
  },
  {
    id: 19n,
    dare: "Put an ice cube in your mouth and try to say the alphabet without it falling out.",
    caption: "Made it to F. This is my legacy. 😂",
    category: "Funny",
  },
  {
    id: 20n,
    dare: "Do your best impression of your mom/dad calling you for dinner. Hold nothing back.",
    caption: "My parents watched this. They have questions. 😂",
    category: "Funny",
  },
  {
    id: 21n,
    dare: "Try to say 'toy boat' five times fast. Film every attempt.",
    caption: "Toy boyt. Toi boit. I give up. 💀",
    category: "Funny",
  },
  {
    id: 22n,
    dare: "Pretend your hand is a puppet and have a full conversation with it for 2 minutes.",
    caption: "The puppet has opinions. And honestly? Valid ones. 😂",
    category: "Funny",
  },
  {
    id: 23n,
    dare: "Let your sibling or friend draw a mustache on your face with a marker. Wear it for 1 hour.",
    caption: "I went outside. I regret nothing. 😂",
    category: "Funny",
  },
  {
    id: 4n,
    dare: "Tell someone you appreciate them more than they know — without explaining why.",
    caption: "They cried. I cried. We all cried. 😭",
    category: "Emotional",
  },
  {
    id: 7n,
    dare: "Call your mom and pretend you're lost in a place you know perfectly.",
    caption: "She almost cried. I'm a terrible child. 😭",
    category: "Emotional",
  },
  {
    id: 24n,
    dare: "Write down one thing you're proud of yourself for this week — and say it out loud to someone.",
    caption: "Hardest dare I've ever done. Recommended. 💛",
    category: "Emotional",
  },
  {
    id: 25n,
    dare: "Tell your best friend the one thing you've never said to their face.",
    caption: "It got really real, really fast. 😭",
    category: "Emotional",
  },
  {
    id: 26n,
    dare: "Send your childhood best friend (even if you've lost touch) a message saying you miss them.",
    caption: "They replied in 2 minutes. I ugly-cried. 😭",
    category: "Emotional",
  },
  {
    id: 27n,
    dare: "Write a letter to your past self from 3 years ago. Read it out loud.",
    caption: "I owed that kid an apology. 💙",
    category: "Emotional",
  },
  {
    id: 28n,
    dare: "Tell a parent or guardian one thing they did that you're genuinely grateful for.",
    caption: "My dad didn't know what to do with himself. 😭",
    category: "Emotional",
  },
  {
    id: 29n,
    dare: "Call your grandparent (or an elder you respect) just to say hi — no agenda, just love.",
    caption: "They talked for 40 minutes. I listened to all of it. 💛",
    category: "Emotional",
  },
  {
    id: 30n,
    dare: "Look in the mirror for 30 seconds and say one genuine compliment to yourself out loud.",
    caption: "Weirdly the hardest dare on this app. 💙",
    category: "Emotional",
  },
  {
    id: 5n,
    dare: 'Raise your hand in class and say "I have a follow-up question" — when there was no question before.',
    caption: "Teacher gave me a look. Worth it. 🎒",
    category: "School",
  },
  {
    id: 31n,
    dare: "Ask your teacher what their favorite subject was in school — and actually listen to the answer.",
    caption: "She lit up. I wasn't ready for that. 🎒",
    category: "School",
  },
  {
    id: 32n,
    dare: "Submit an assignment using the most dramatic font available and see if anyone notices.",
    caption: "Comic Sans was a bold choice. Still got a B+. 😂",
    category: "School",
  },
  {
    id: 33n,
    dare: "Start a slow clap after a classmate finishes a presentation. See if it catches on.",
    caption: "One person joined. That was enough. 👏",
    category: "School",
  },
  {
    id: 34n,
    dare: "Sit in a different seat than usual and act like you've always sat there.",
    caption: "The audacity. The chaos. The looks. 🎒",
    category: "School",
  },
  {
    id: 35n,
    dare: "Compliment a classmate you've never spoken to. Just one genuine thing. Go.",
    caption: "They smiled for the rest of class. I witnessed it. 💛",
    category: "School",
  },
  {
    id: 36n,
    dare: "Answer a question in class in the most unnecessarily formal, old-English way possible.",
    caption: "'Indeed, forsooth, the mitochondria doth power the cell.' 💀",
    category: "School",
  },
  {
    id: 37n,
    dare: "Bring a snack to share with literally everyone near you during a break.",
    caption: "Instant classroom legend status achieved. 🎒",
    category: "School",
  },
  {
    id: 38n,
    dare: "Ask your teacher: 'Will this be on the test?' after every single thing they say for one class.",
    caption: "They started giving me a look. A specific look. 💀",
    category: "School",
  },
  {
    id: 39n,
    dare: "Doodle an entire portrait of your teacher on your notes page. Show it to a friend.",
    caption: "It looked nothing like them. They were flattered. 🎒",
    category: "School",
  },
  {
    id: 40n,
    dare: "Give a standing ovation to the lunch staff today. Loudly. Sincerely.",
    caption: "They deserved it. Also I went viral in the cafeteria. 😂",
    category: "School",
  },
  {
    id: 41n,
    dare: "Send your crush a voice note saying 'I keep thinking about something but I'm scared to say it' then don't text back for an hour.",
    caption: "They texted 7 times. I said nothing. Power. 💕",
    category: "Romantic",
  },
  {
    id: 42n,
    dare: "Ask someone you like: 'If I asked you out right now, what would you say?' then look them dead in the eyes.",
    caption: "The silence was 4 seconds long. I counted. 💀",
    category: "Romantic",
  },
  {
    id: 43n,
    dare: "Write a cheesy love poem in 60 seconds and read it to your best friend with full seriousness.",
    caption: "They ugly laughed. I performed anyway. Commitment. 💕",
    category: "Romantic",
  },
  {
    id: 44n,
    dare: "Text your crush 'I had a dream about you last night' and then go completely offline.",
    caption: "I came back 2 hours later to 11 messages. Worth it. 😏",
    category: "Romantic",
  },
  {
    id: 45n,
    dare: "Compliment a person you like on something super specific — not their looks. Something you actually noticed.",
    caption: "'I like how you laugh at your own jokes first.' They melted. 💕",
    category: "Romantic",
  },
  {
    id: 46n,
    dare: "Send your crush a playlist titled 'No reason' with 5 songs that lowkey describe how you feel.",
    caption: "No context. No explanation. Let the songs do the talking. 🎵",
    category: "Romantic",
  },
  {
    id: 47n,
    dare: "Ask someone you like to describe you in 3 words — and actually listen without deflecting.",
    caption:
      "They said 'warm, funny, confusing.' I'm choosing to take that well. 💕",
    category: "Romantic",
  },
  {
    id: 48n,
    dare: "Leave a sticky note somewhere your crush will find it that says 'You made my day better and you don't even know it.'",
    caption: "Anonymous chaos. Romantic chaos. But chaos. 💌",
    category: "Romantic",
  },
  {
    id: 49n,
    dare: "Tell someone you have feelings for: 'I think you're one of the most interesting people I've ever met' with zero explanation.",
    caption: "They stared. I walked away. I am a menace. 😏",
    category: "Romantic",
  },
  {
    id: 50n,
    dare: "Ask your crush: 'What's something you wish someone would do for you?' and actually remember the answer.",
    caption: "Information gathering disguised as flirting. Genius. 💕",
    category: "Romantic",
  },
  {
    id: 51n,
    dare: "Dedicate a song to your crush out loud in front of at least one other person. Announce the dedication.",
    caption: "My friend gasped. My crush blushed. I survived. Barely. 💕",
    category: "Romantic",
  },
  {
    id: 52n,
    dare: "Text your crush: 'Can I tell you something weird?' and when they say yes, say 'I just wanted to know if you'd say yes.'",
    caption: "They called me unhinged. They were smiling though. 😏",
    category: "Romantic",
  },
  {
    id: 53n,
    dare: "Walk into a store, look shocked, and slowly walk out.",
    caption: "The employees watched me leave. I gave no explanation. 🎭",
    category: "Social Prank",
  },
  {
    id: 54n,
    dare: "Enter a lift, and follow anyone who steps out.",
    caption: "I followed 4 people. None of them knew each other. 💀",
    category: "Social Prank",
  },
  {
    id: 55n,
    dare: "Say 'thank you' loudly to automatic doors.",
    caption: "The door said nothing back. Rude. 🎭",
    category: "Social Prank",
  },
  {
    id: 56n,
    dare: "Clap randomly in public and look around like something amazing just happened.",
    caption: "Two strangers joined in. Nobody knew why. 💀",
    category: "Social Prank",
  },
  {
    id: 57n,
    dare: "Pretend to talk on a TV remote in public like it's your phone.",
    caption: "Someone asked who makes my phone. I said Samsung. 🎭",
    category: "Social Prank",
  },
  {
    id: 58n,
    dare: "Wave enthusiastically at someone who isn't there.",
    caption: "The people nearby all turned to look. I kept waving. 💀",
    category: "Social Prank",
  },
  {
    id: 59n,
    dare: "Ask a stranger for directions to a place that doesn't exist.",
    caption:
      "They spent 3 minutes trying to figure it out. I felt bad. Slightly. 🎭",
    category: "Social Prank",
  },
  {
    id: 60n,
    dare: "Scream in public and act like absolutely nothing happened.",
    caption: "The silence after was deafening. I stared at my phone. 💀",
    category: "Social Prank",
  },
  {
    id: 61n,
    dare: "Play a loud funny song on speaker and confidently vibe like it's coming from your earbuds.",
    caption: "Everyone could hear it. I pretended they couldn't. 😭",
    category: "Social Prank",
  },
  {
    id: 62n,
    dare: "Play music on speaker and act confused and annoyed when others react to it.",
    caption: "'Why is everyone looking around?' — me, holding the speaker. 💀",
    category: "Social Prank",
  },
  {
    id: 63n,
    dare: "Play a weird song out loud and pretend only you can hear it — act like it's in your head.",
    caption:
      "I was humming along to full volume Shrek music. No one understood. 🎭",
    category: "Social Prank",
  },
  {
    id: 64n,
    dare: "Crack a bad joke loudly in public and laugh hard with your group.",
    caption:
      "The joke was terrible. The laughing was real. The strangers were concerned. 💀",
    category: "Social Prank",
  },
  // New Funny dares
  {
    id: 65n,
    dare: "Try to lick your elbow while explaining why it's totally possible.",
    caption: "Science says no. You say hold my drink. 💀",
    category: "Funny",
  },
  {
    id: 66n,
    dare: 'Call a random contact and start the conversation with "I know what you did."',
    caption: "The silence on the other end was deafening 😂",
    category: "Funny",
  },
  {
    id: 67n,
    dare: "Speak with a different accent every time someone asks you a question.",
    caption: "Australian. French. Confused. Repeat. 💀",
    category: "Funny",
  },
  {
    id: 68n,
    dare: "Announce your every movement like a sports commentator for 3 minutes.",
    caption: "'He reaches for the glass... incredible technique' 😂",
    category: "Funny",
  },
  {
    id: 69n,
    dare: "Pretend you don't know what a fork is and ask people to explain it seriously.",
    caption: "You looked at it with genuine confusion. Oscar-worthy. 💀",
    category: "Funny",
  },
  {
    id: 70n,
    dare: "Try to moonwalk in front of everyone. No excuses.",
    caption: "Michael is watching. He has concerns. 😂",
    category: "Funny",
  },
  {
    id: 71n,
    dare: "Do your best dramatic slow-motion entrance into the room.",
    caption: "The hair flip took 4 real seconds 💀",
    category: "Funny",
  },
  {
    id: 72n,
    dare: 'Say "per my last message" after everything you say for 5 minutes.',
    caption: "Corporate chaos has entered the group chat 😂",
    category: "Funny",
  },
  {
    id: 73n,
    dare: "Attempt to fold a piece of paper more than 7 times.",
    caption: "It's physically impossible and yet here you are trying 💀",
    category: "Funny",
  },
  {
    id: 74n,
    dare: 'Text someone "stop ignoring me" who hasn\'t messaged you in years.',
    caption: "They haven't messaged back yet. It's been 3 days. 😭",
    category: "Funny",
  },
  {
    id: 75n,
    dare: "Act out an entire argument in slow motion.",
    caption: "The dramatic pause lasted 12 seconds 💀",
    category: "Funny",
  },
  {
    id: 76n,
    dare: "Pretend you're auditioning for a cooking show while eating a plain biscuit.",
    caption: "'The notes of flour are simply divine' 😂",
    category: "Funny",
  },
  {
    id: 77n,
    dare: "Speak only in movie quotes for the next 3 minutes.",
    caption: "'Why so serious?' applies to everything apparently 💀",
    category: "Funny",
  },
  {
    id: 78n,
    dare: "Give a TED talk on why cereal is better than rice.",
    caption: "You had sources. Slides were implied. 😂",
    category: "Funny",
  },
  {
    id: 79n,
    dare: "Freestyle rap about what you ate today.",
    caption: "The rice verse was actually heat 💀",
    category: "Funny",
  },
  // New Awkward dares
  {
    id: 80n,
    dare: "Ask someone nearby if they've seen your invisible dog.",
    caption: "They looked around. They helped. They were concerned. 😬",
    category: "Awkward",
  },
  {
    id: 81n,
    dare: "Compliment a stranger's shoes in the most intense way possible.",
    caption: "'These shoes... changed my life. Where did you GET these.' 😬",
    category: "Awkward",
  },
  {
    id: 82n,
    dare: "Call someone's name wrong and confidently correct them when they correct you.",
    caption: "You doubled down. They questioned reality. 💀",
    category: "Awkward",
  },
  {
    id: 83n,
    dare: "Follow someone's exact walking pace behind them for 30 seconds.",
    caption: "They sped up. You matched it. 😬",
    category: "Awkward",
  },
  {
    id: 84n,
    dare: "Stare at the ceiling for 30 seconds while everyone watches.",
    caption: "Four people eventually looked up too 💀",
    category: "Awkward",
  },
  {
    id: 85n,
    dare: 'Ask the group "did you hear that?" when there was no sound.',
    caption: "Everyone went quiet. Nobody was brave enough to disagree. 😬",
    category: "Awkward",
  },
  {
    id: 86n,
    dare: "Put your hand up like you're in school every time you want to speak for 5 minutes.",
    caption: "Nobody called on you once. The power dynamics shifted. 💀",
    category: "Awkward",
  },
  {
    id: 87n,
    dare: "Start an applause for something totally ordinary happening in the room.",
    caption: "Someone put their cup down. You gave a standing ovation. 😬",
    category: "Awkward",
  },
  {
    id: 88n,
    dare: "Dramatically clear your throat before saying anything for the next 5 minutes.",
    caption: "You had everyone's attention. Always. 💀",
    category: "Awkward",
  },
  {
    id: 89n,
    dare: 'Ask your phone "are you listening to me?" out loud in public.',
    caption:
      "The phone said nothing. The stranger next to you looked concerned. 😬",
    category: "Awkward",
  },
  {
    id: 90n,
    dare: "Loudly whisper everything you say for 3 minutes.",
    caption: "The loudest quiet person in the room 💀",
    category: "Awkward",
  },
  {
    id: 91n,
    dare: "Stare at someone's food like you're starving until they notice.",
    caption:
      "They offered you some. You declined. It was never about the food. 😬",
    category: "Awkward",
  },
  {
    id: 92n,
    dare: "Shake everyone's hand in the room extremely formally like it's a job interview.",
    caption: "'Pleasure to meet you. Again. I've known you 6 years.' 💀",
    category: "Awkward",
  },
  {
    id: 93n,
    dare: "When someone talks to you, pause for 5 full seconds before responding.",
    caption: "The pauses carried more weight than the words 😬",
    category: "Awkward",
  },
  {
    id: 94n,
    dare: 'Announce "I have an announcement" then say something completely unimportant.',
    caption: "'I have an announcement. I prefer cold water.' Silence. 💀",
    category: "Awkward",
  },
  // New Emotional dares
  {
    id: 95n,
    dare: "Write a 3-line poem about the last meal you ate, right now, out loud.",
    caption: "The rice stanza was unexpectedly moving 😭",
    category: "Emotional",
  },
  {
    id: 96n,
    dare: "Tell the group one thing you're genuinely proud of this year.",
    caption: "Big or small — it counts 💛",
    category: "Emotional",
  },
  {
    id: 97n,
    dare: "Describe your current mood as a weather forecast.",
    caption: "'Partly cloudy with a chance of overthinking' hits different 😭",
    category: "Emotional",
  },
  {
    id: 98n,
    dare: "Apologize to someone in the group for something small you've been carrying.",
    caption: "The weight of tiny things is heavier than we admit 💙",
    category: "Emotional",
  },
  {
    id: 99n,
    dare: "Say out loud one thing you wish people understood about you.",
    caption: "They're listening. For real this time. 😭",
    category: "Emotional",
  },
  {
    id: 100n,
    dare: "Describe your biggest fear using only emojis — then explain each one.",
    caption: "The emoji breakdown was more emotional than expected 💙",
    category: "Emotional",
  },
  {
    id: 101n,
    dare: "Share the last dream you remember having, in full detail.",
    caption: "Nobody was ready for the lore 😭",
    category: "Emotional",
  },
  {
    id: 102n,
    dare: "Tell someone in the group something you genuinely appreciate about them.",
    caption: "They didn't know how to take a compliment. None of us do. 💛",
    category: "Emotional",
  },
  {
    id: 103n,
    dare: "Share the most recent time you cried and why.",
    caption: "There's no wrong answer. There's just honesty. 💙",
    category: "Emotional",
  },
  {
    id: 104n,
    dare: "If your life were a movie right now, what genre would it be and why?",
    caption:
      "'Unhinged coming-of-age thriller with comedic relief' is valid 😭",
    category: "Emotional",
  },
  {
    id: 105n,
    dare: "What's one thing you said to someone that you wish you could take back? Say it out loud.",
    caption: "Accountability hits different when you say it out loud 💙",
    category: "Emotional",
  },
  {
    id: 106n,
    dare: "Tell the group what your happiest memory from this year is.",
    caption: "We need this. Genuinely. 💛",
    category: "Emotional",
  },
  {
    id: 107n,
    dare: "Describe yourself in 3 words — but they can't all be positive.",
    caption: "Honest self-description is the hardest dare on this app 😭",
    category: "Emotional",
  },
  {
    id: 108n,
    dare: "What's something you've been putting off that you know you should do? Say it out loud.",
    caption: "Saying it makes it real. That's the point. 💙",
    category: "Emotional",
  },
  {
    id: 109n,
    dare: "Share something that used to scare you but doesn't anymore.",
    caption: "Growth is the best glow-up 💛",
    category: "Emotional",
  },
  // New School dares
  {
    id: 110n,
    dare: "Explain what you actually do during group projects. Be honest.",
    caption: "'I send the final message asking if anyone's started' 🎒",
    category: "School",
  },
  {
    id: 111n,
    dare: "Rank the school subjects by how much you pretend to understand them.",
    caption: "Maths was in last place by a wide margin 💀",
    category: "School",
  },
  {
    id: 112n,
    dare: "Act out the moment you realized you forgot to do the homework.",
    caption: "The face. The panic. The spiral. 🎒",
    category: "School",
  },
  {
    id: 113n,
    dare: "Describe your actual study method — bonus points for honesty.",
    caption: "'I read the title and manifested a pass' is a method 💀",
    category: "School",
  },
  {
    id: 114n,
    dare: "Who in class did you copy notes off most? Don't lie.",
    caption: "Their pen never stopped. Yours never started. 🎒",
    category: "School",
  },
  {
    id: 115n,
    dare: "Do your best impression of a teacher trying to be relatable.",
    caption: "'Okay so imagine the atom is like... a TikTok' 💀",
    category: "School",
  },
  {
    id: 116n,
    dare: "Explain your exam strategy with the confidence of someone who definitely studied.",
    caption: "The confidence was impressive. The result was not. 🎒",
    category: "School",
  },
  {
    id: 117n,
    dare: "Act out the walk from getting your test back when you failed.",
    caption: "The slow shuffle back to your seat deserves an award 💀",
    category: "School",
  },
  {
    id: 118n,
    dare: "Recreate the moment you raised your hand and immediately regretted it.",
    caption: "The teacher called on you. You had nothing. 🎒",
    category: "School",
  },
  {
    id: 119n,
    dare: "What's your most creative excuse for not submitting work on time? Perform it.",
    caption: "It had layers. It had lore. It almost worked. 💀",
    category: "School",
  },
  {
    id: 120n,
    dare: "If you had to teach one subject, what would it be — and why is that terrifying?",
    caption: "The students would learn nothing but chaos 🎒",
    category: "School",
  },
  {
    id: 121n,
    dare: "Describe the most chaotic group chat your class has ever had.",
    caption: "Lives were changed. Screenshots were taken. 💀",
    category: "School",
  },
  {
    id: 122n,
    dare: "What's the most confident wrong answer you've given a teacher? Reenact it.",
    caption: "You said it with your chest. It was absolutely wrong. 🎒",
    category: "School",
  },
  {
    id: 123n,
    dare: "Act out the moment you walked into class and realized there was a test today.",
    caption: "The face said everything the voice couldn't 💀",
    category: "School",
  },
  {
    id: 124n,
    dare: "What's the best thing about your school that you'd never admit to liking?",
    caption: "You love it. You will deny this forever. 🎒",
    category: "School",
  },
  // New Romantic dares
  {
    id: 125n,
    dare: "Rate your own rizz out of 10 and explain your score with evidence.",
    caption: "The self-assessment was humbling 💕",
    category: "Romantic",
  },
  {
    id: 126n,
    dare: "Act out your most embarrassing 'they didn't text back' spiral.",
    caption: "You checked the app 47 times. The receipt was blue. 💀",
    category: "Romantic",
  },
  {
    id: 127n,
    dare: "Describe your type... then describe your actual relationship history.",
    caption: "The gap between these two things is a canyon 💕",
    category: "Romantic",
  },
  {
    id: 128n,
    dare: "What's the most unhinged thing you've done for someone you liked? No filter.",
    caption: "Love makes everyone a little feral 💀",
    category: "Romantic",
  },
  {
    id: 129n,
    dare: "Share a time you misread the signs so badly it should be a case study.",
    caption: "There were no signs. You made them up. 💕",
    category: "Romantic",
  },
  {
    id: 130n,
    dare: "Act out your exact reaction when someone you like texts you first.",
    caption: "The full range of emotions in 4 seconds 💀",
    category: "Romantic",
  },
  {
    id: 131n,
    dare: "Describe your ideal date without using any clichés.",
    caption: "No sunsets, no restaurants, no 'vibes' — go 💕",
    category: "Romantic",
  },
  {
    id: 132n,
    dare: "What's the fastest you've caught feelings for someone? Time it from when you met.",
    caption: "'Day 1. It was day 1.' is a valid answer 💀",
    category: "Romantic",
  },
  {
    id: 133n,
    dare: "Act out the exact moment you realized you were friendzoned.",
    caption: "The 'you're like a sibling to me' speech hits different live 💕",
    category: "Romantic",
  },
  {
    id: 134n,
    dare: "What's the most cringe thing you said trying to be smooth? Reenact it.",
    caption: "The delivery was confident. The words were not. 💀",
    category: "Romantic",
  },
  {
    id: 135n,
    dare: "Share the last time you checked someone's social media for absolutely no reason.",
    caption: "Three years deep. Zoom in. Regret. 💕",
    category: "Romantic",
  },
  {
    id: 136n,
    dare: "What song is on your secret 'feelings' playlist that you'd never admit to?",
    caption: "It's a ballad. From 2009. You know every word. 💀",
    category: "Romantic",
  },
  {
    id: 137n,
    dare: "Rate your most recent crush out of 10 and justify every point.",
    caption: "The breakdown was thorough. The bias was clear. 💕",
    category: "Romantic",
  },
  {
    id: 138n,
    dare: "Describe the worst relationship advice someone ever gave you.",
    caption: "'Just be yourself' from someone who had never been themselves 💀",
    category: "Romantic",
  },
  {
    id: 139n,
    dare: "What would you do differently if you could replay your last crush situation?",
    caption: "Hindsight is the cruelest thing 💕",
    category: "Romantic",
  },
  // New Social Prank dares
  {
    id: 140n,
    dare: "Walk into a crowded place, dramatically gasp, then refuse to explain.",
    caption: "You left 12 people with unresolved anxiety 💀",
    category: "Social Prank",
  },
  {
    id: 141n,
    dare: 'Stand next to an ATM and say "excuse me, I need to use the machine" to the machine itself.',
    caption: "The machine did not respond. You waited. 💀",
    category: "Social Prank",
  },
  {
    id: 142n,
    dare: "Point at the sky in a busy place and watch how many people look up.",
    caption: "14 people looked. You pointed at nothing. 😂",
    category: "Social Prank",
  },
  {
    id: 143n,
    dare: "Narrate your walk through a store like a nature documentary.",
    caption: "'Here we observe the shopper approaching the frozen aisle...' 💀",
    category: "Social Prank",
  },
  {
    id: 144n,
    dare: 'Ask a shopkeeper if they have "a medium but make it large."',
    caption: "They looked at you for a very long time 😂",
    category: "Social Prank",
  },
  {
    id: 145n,
    dare: 'Pick up a random object in a store and say "finally" out loud.',
    caption: "You've been searching for this all your life apparently 💀",
    category: "Social Prank",
  },
  {
    id: 146n,
    dare: 'Walk past someone, stop, and say "wait... you look exactly like someone I hate" and walk away.',
    caption: "The pause before walking was cinematic 😂",
    category: "Social Prank",
  },
  {
    id: 147n,
    dare: "Pretend your coffee cup is too heavy to lift and ask someone for help.",
    caption: "They helped. They were confused. You thanked them sincerely. 💀",
    category: "Social Prank",
  },
  {
    id: 148n,
    dare: "Answer your phone (while it's not ringing) in a quiet place and have a full loud conversation.",
    caption: "You hung up and nodded seriously. Nobody questioned it. 😂",
    category: "Social Prank",
  },
  {
    id: 149n,
    dare: 'Walk into a store, browse for 5 minutes, pick nothing, and say "not yet" on the way out.',
    caption: "The staff watched you leave with genuine concern 💀",
    category: "Social Prank",
  },
  {
    id: 150n,
    dare: "Stand in front of an elevator and let 3 go without getting in, then take the stairs.",
    caption: "Every person on those elevators is still thinking about you 😂",
    category: "Social Prank",
  },
  {
    id: 151n,
    dare: 'Walk past someone eating and say "that smells amazing, what IS that?" then leave immediately.',
    caption: "They started explaining. You were already gone. 💀",
    category: "Social Prank",
  },
  {
    id: 152n,
    dare: "Walk through a shopping centre narrating what you see like a museum tour.",
    caption:
      "'And here we have the escalator. A marvel of modern engineering.' 😂",
    category: "Social Prank",
  },
  {
    id: 153n,
    dare: "When someone holds a door for you, completely miss it and open it yourself anyway.",
    caption: "They held it with intention. You ignored that intention. 💀",
    category: "Social Prank",
  },
  {
    id: 154n,
    dare: "High five someone you don't know with full confidence, then keep walking.",
    caption: "They high fived back. Zero hesitation. Mutual respect. 😂",
    category: "Social Prank",
  },
  {
    id: 155n,
    dare: "Record a 5-second funny video and show it to your friends",
    caption: "The director's cut nobody asked for 😂",
    category: "Funny",
  },
  {
    id: 156n,
    dare: "Send a random emoji to your last chat and don't explain",
    caption: "Let them figure it out 💀",
    category: "Awkward",
  },
  {
    id: 157n,
    dare: "Put your status: 'I just lost a dare 😭' for 10 minutes",
    caption: "The walk of shame hits different 😭",
    category: "Social Prank",
  },
  {
    id: 158n,
    dare: "Take a weird selfie and show it to the group",
    caption: "New profile pic just dropped 😂",
    category: "Funny",
  },
  {
    id: 159n,
    dare: "Say 'I'm famous' loudly in public",
    caption: "The confidence is unmatched 💀",
    category: "Social Prank",
  },
  {
    id: 160n,
    dare: "Pretend you're vlogging your life for 30 seconds",
    caption: "Today on my vlog... this disaster 😂",
    category: "Funny",
  },
  {
    id: 161n,
    dare: "Send 'I know your secret 👀' to a friend (then explain)",
    caption: "Their panic? Priceless 💀",
    category: "Awkward",
  },
  {
    id: 162n,
    dare: "Act like an influencer promoting water",
    caption: "Hydration has never been this cringe 😂",
    category: "Funny",
  },
  {
    id: 163n,
    dare: "Do a dramatic slow-motion walk",
    caption: "Main character energy activated 💀",
    category: "Funny",
  },
  {
    id: 164n,
    dare: "Say a cringe pickup line to a friend",
    caption: "Rizz level: negative 100 😬",
    category: "Romantic",
  },
  {
    id: 165n,
    dare: "Send 'Guess what?' and reply 'nothing' 😈",
    caption: "They were NOT happy 💀",
    category: "Awkward",
  },
  {
    id: 166n,
    dare: "Make a funny face and keep it for 20 seconds",
    caption: "Your face got stuck fr 😂",
    category: "Funny",
  },
  {
    id: 167n,
    dare: "Say something random confidently",
    caption: "The random era has begun 💀",
    category: "Awkward",
  },
  {
    id: 168n,
    dare: "Record yourself laughing for no reason",
    caption: "Unhinged behavior unlocked 😂",
    category: "Funny",
  },
  {
    id: 169n,
    dare: "Pretend you're in a music video",
    caption: "Billboard Hot 100? Probably not 💀",
    category: "Funny",
  },
  {
    id: 170n,
    dare: "Change your phone wallpaper to something funny for 10 minutes",
    caption: "Every time you unlock it 😭",
    category: "Funny",
  },
  {
    id: 171n,
    dare: "Do a fake angry rant about something silly",
    caption: "Oscar-worthy performance honestly 😂",
    category: "Funny",
  },
  {
    id: 172n,
    dare: "Act like a celebrity being chased by fans",
    caption: "No paparazzi were harmed 💀",
    category: "Social Prank",
  },
  {
    id: 173n,
    dare: "Pretend you're giving an award speech",
    caption: "I'd like to thank... everyone who dared me 😂",
    category: "Funny",
  },
  {
    id: 174n,
    dare: "Walk like you own the place for 1 minute",
    caption: "CEO energy, zero credentials 💀",
    category: "Social Prank",
  },
];

// ─── Truth Questions ──────────────────────────────────────────────────────────
const TRUTHS: Dare[] = [
  // Funny
  {
    id: 1001n,
    dare: "What's the most embarrassing thing you've searched on Google this week?",
    caption: "Their camera roll knows everything 💀",
    category: "Funny",
  },
  {
    id: 1002n,
    dare: "Have you ever blamed a fart on someone else? Who was it?",
    caption: "A legend in cowardice 😂",
    category: "Funny",
  },
  {
    id: 1003n,
    dare: "What's the worst lie you told your parents and actually got away with?",
    caption: "Please don't let their parents see this 💀",
    category: "Funny",
  },
  {
    id: 1004n,
    dare: "Have you ever eaten food that fell on the floor? How long was the 5-second rule?",
    caption: "'The floor is basically clean' — everyone, always 😭",
    category: "Funny",
  },
  {
    id: 1005n,
    dare: "What's the most cringe thing on your camera roll right now?",
    caption: "We need to see it. Now. 💀",
    category: "Funny",
  },
  {
    id: 1006n,
    dare: "Have you ever laughed so hard you peed a little? Where were you?",
    caption: "This question has ruined friendships 😂",
    category: "Funny",
  },
  {
    id: 1007n,
    dare: "What song do you secretly know ALL the words to but would never admit?",
    caption: "*internally screams the chorus* 🎵",
    category: "Funny",
  },
  {
    id: 1008n,
    dare: "What's the most embarrassing thing you did on a first impression?",
    caption: "It haunts them to this day 💀",
    category: "Funny",
  },
  {
    id: 1009n,
    dare: "Have you ever waved back at someone who wasn't waving at you and fully committed?",
    caption: "The commitment. The walk-away. Iconic. 😂",
    category: "Funny",
  },
  {
    id: 1010n,
    dare: "What's the last thing you googled that you'd be embarrassed if people saw?",
    caption: "'It was for research' — nobody ever 💀",
    category: "Funny",
  },
  // Awkward
  {
    id: 1011n,
    dare: "Who was your most recent situationship and how long did you pretend it wasn't one?",
    caption: "Situationship survivor checking in 😬",
    category: "Awkward",
  },
  {
    id: 1012n,
    dare: "Have you ever stalked an ex's profile and accidentally liked a 3-year-old post?",
    caption: "The fastest unfollow in history 💀",
    category: "Awkward",
  },
  {
    id: 1013n,
    dare: "What's the most awkward thing you've done to avoid talking to someone?",
    caption:
      "Pretending to be on the phone? Ducking behind a shelf? Relatable. 😬",
    category: "Awkward",
  },
  {
    id: 1014n,
    dare: "Have you ever pretended to be on a call to avoid a conversation?",
    caption: "A classic survival strategy 💀",
    category: "Awkward",
  },
  {
    id: 1015n,
    dare: "What's the longest you've gone without replying to a text you definitely saw?",
    caption: "It's been three business weeks... 😬",
    category: "Awkward",
  },
  {
    id: 1016n,
    dare: "Have you ever walked into a room, forgotten why, and pretended you knew the whole time?",
    caption: "'Yes I definitely came in here for this' 💀",
    category: "Awkward",
  },
  {
    id: 1017n,
    dare: "What's the most cringe nickname someone has ever given you?",
    caption: "They still use it. At family dinners. 😬",
    category: "Awkward",
  },
  {
    id: 1018n,
    dare: "Have you ever laughed at the wrong moment at something that wasn't funny?",
    caption: "The silence after. The SILENCE. 💀",
    category: "Awkward",
  },
  {
    id: 1019n,
    dare: "What's something you overheard about yourself that you weren't supposed to hear?",
    caption: "And yet you carry it everywhere 😬",
    category: "Awkward",
  },
  {
    id: 1020n,
    dare: "Have you ever shown up somewhere and immediately wanted to leave?",
    caption: "'I just remembered I have somewhere to be' 💀",
    category: "Awkward",
  },
  // Romantic
  {
    id: 1021n,
    dare: "Who was the last person you liked before you realized you liked them?",
    caption: "That realization hits different 💕",
    category: "Romantic",
  },
  {
    id: 1022n,
    dare: "Have you ever sent a risky text and immediately regretted it?",
    caption: "The read receipt appeared instantly 💀",
    category: "Romantic",
  },
  {
    id: 1023n,
    dare: "What's the most dramatic thing you've done to get someone's attention?",
    caption: "We're not judging. We're taking notes. 💕",
    category: "Romantic",
  },
  {
    id: 1024n,
    dare: "Have you ever friendzoned someone who clearly liked you and felt zero guilt?",
    caption: "Chaos energy. Respected. 😏",
    category: "Romantic",
  },
  {
    id: 1025n,
    dare: "What's your biggest 'I can't believe I said that' moment with a crush?",
    caption: "The brain-to-mouth filter just... left. 💀",
    category: "Romantic",
  },
  {
    id: 1026n,
    dare: "Have you ever made up an excuse to text your crush?",
    caption: "'Just wanted to check if you're alive' is a normal text. 💕",
    category: "Romantic",
  },
  {
    id: 1027n,
    dare: "What's the most embarrassing thing you've done because you liked someone?",
    caption: "Love makes us do unhinged things 💀",
    category: "Romantic",
  },
  {
    id: 1028n,
    dare: "Do you currently have a crush? How obvious do you think you are about it?",
    caption: "Spoiler: everyone already knows 😂",
    category: "Romantic",
  },
  {
    id: 1029n,
    dare: "What's the worst flirting attempt you've ever made?",
    caption: "The cringe lives rent-free in their head 💀",
    category: "Romantic",
  },
  {
    id: 1030n,
    dare: "Have you ever caught feelings for someone you swore you'd never like?",
    caption: "'Not my type' lasts exactly 3 weeks 💕",
    category: "Romantic",
  },
  // School
  {
    id: 1031n,
    dare: "Have you ever copied someone's homework and pretended it was yours?",
    caption: "An education in creativity 🎒",
    category: "School",
  },
  {
    id: 1032n,
    dare: "What's the biggest thing you've gotten away with in school?",
    caption: "The statute of limitations has passed. Spill. 💀",
    category: "School",
  },
  {
    id: 1033n,
    dare: "Have you ever fallen asleep in class and woken up to the whole class watching?",
    caption: "The snore heard around the classroom 😭",
    category: "School",
  },
  {
    id: 1034n,
    dare: "What's the most random excuse you gave a teacher that actually worked?",
    caption: "A masterclass in negotiation 🎒",
    category: "School",
  },
  {
    id: 1035n,
    dare: "Have you ever panicked and blurted out a completely wrong answer with full confidence?",
    caption: "'The mitochondria is the president of France' energy 💀",
    category: "School",
  },
  {
    id: 1036n,
    dare: "What's the biggest drama you witnessed in school that you were lowkey involved in?",
    caption: "'I had nothing to do with it' — them, definitely involved 😬",
    category: "School",
  },
  {
    id: 1037n,
    dare: "Have you ever blamed a group project failure on someone else?",
    caption: "The group chat receipts say otherwise 🎒",
    category: "School",
  },
  {
    id: 1038n,
    dare: "What's the most embarrassing thing that's happened to you in front of your whole class?",
    caption: "It still comes up at reunions 💀",
    category: "School",
  },
  {
    id: 1039n,
    dare: "Have you ever failed a test and lied to your parents about the grade?",
    caption: "'Yeah the class average was a 40' 🎒",
    category: "School",
  },
  {
    id: 1040n,
    dare: "What's the most ridiculous reason you were late to class?",
    caption: "The excuse was technically true 💀",
    category: "School",
  },
  // Emotional
  {
    id: 1041n,
    dare: "What's something you're genuinely afraid people will find out about you?",
    caption: "And now 6 people know 😭",
    category: "Emotional",
  },
  {
    id: 1042n,
    dare: "Who in this group do you trust the most and why?",
    caption: "Choose wisely. They're all watching. 💙",
    category: "Emotional",
  },
  {
    id: 1043n,
    dare: "What's one thing you wish you could change about how others see you?",
    caption: "This hit harder than expected 😭",
    category: "Emotional",
  },
  {
    id: 1044n,
    dare: "When was the last time you cried and what caused it?",
    caption: "It's okay. This is a safe space. 💙",
    category: "Emotional",
  },
  {
    id: 1045n,
    dare: "What's something you've never told anyone in this room?",
    caption: "The 'I can't believe they said that' energy is real 😭",
    category: "Emotional",
  },
  {
    id: 1046n,
    dare: "What's the nicest thing someone's ever said to you that you still think about?",
    caption: "Words outlive the moment 💛",
    category: "Emotional",
  },
  {
    id: 1047n,
    dare: "What's one thing you pretend not to care about but actually really do?",
    caption: "We see through you. Lovingly. 😭",
    category: "Emotional",
  },
  {
    id: 1048n,
    dare: "Who was the last person you apologized to and did you mean it?",
    caption: "The pause before answering said everything 💙",
    category: "Emotional",
  },
  {
    id: 1049n,
    dare: "What's a compliment you've received that you still hold onto on bad days?",
    caption: "Write it down. Keep it. 💛",
    category: "Emotional",
  },
  {
    id: 1050n,
    dare: "What's something you're working on about yourself that nobody knows?",
    caption: "Growth is quiet before it's loud 💙",
    category: "Emotional",
  },
  // Social Prank
  {
    id: 1051n,
    dare: "Have you ever done a social prank that went too far? What happened?",
    caption: "The apology tour lasted weeks 🎭",
    category: "Social Prank",
  },
  {
    id: 1052n,
    dare: "What's the most embarrassing public moment you've had that strangers witnessed?",
    caption: "They walked away. They remember. 💀",
    category: "Social Prank",
  },
  {
    id: 1053n,
    dare: "Have you ever been caught talking to yourself in public?",
    caption: "'I was on a call' is no longer an excuse 🎭",
    category: "Social Prank",
  },
  {
    id: 1054n,
    dare: "What's the most chaotic thing you've done for a laugh in public?",
    caption: "Worth it every time 💀",
    category: "Social Prank",
  },
  {
    id: 1055n,
    dare: "Have you ever done something weird in public and then acted completely normal?",
    caption: "Commitment to the bit is an art form 🎭",
    category: "Social Prank",
  },
  {
    id: 1056n,
    dare: "What's the most attention you've accidentally attracted in a public place?",
    caption: "Every head turned. Simultaneously. 💀",
    category: "Social Prank",
  },
  {
    id: 1057n,
    dare: "Have you ever done something spontaneous in public that you immediately regretted?",
    caption: "The action and the regret were 0.3 seconds apart 🎭",
    category: "Social Prank",
  },
  {
    id: 1058n,
    dare: "What's the funniest reaction you've gotten from a stranger?",
    caption: "A moment preserved in memory forever 💀",
    category: "Social Prank",
  },
  {
    id: 1059n,
    dare: "Have you ever pretended to know a stranger because the situation was too awkward to correct?",
    caption: "You shook their hand. You still don't know their name. 🎭",
    category: "Social Prank",
  },
  {
    id: 1060n,
    dare: "What's the most out-of-character thing you've ever done in public?",
    caption: "Who even WAS that person 💀",
    category: "Social Prank",
  },
  // New Funny truths
  {
    id: 1061n,
    dare: "What's the most embarrassing text you've sent to the wrong person?",
    caption: "The read receipt appeared before you could explain 💀",
    category: "Funny",
  },
  {
    id: 1062n,
    dare: "What's the weirdest thing you've ever done when you were home alone?",
    caption: "No witnesses. But now 6 people know. 😭",
    category: "Funny",
  },
  {
    id: 1063n,
    dare: "Have you ever rehearsed an argument in your head that never actually happened?",
    caption: "Full script. Props. Blocking. Nobody showed up. 💀",
    category: "Funny",
  },
  {
    id: 1064n,
    dare: "What app would you be most embarrassed by if someone scrolled through it?",
    caption: "The screen time report does not lie 😂",
    category: "Funny",
  },
  {
    id: 1065n,
    dare: "Have you ever talked to yourself out loud and someone heard you?",
    caption: "And you pretended it was a phone call 💀",
    category: "Funny",
  },
  {
    id: 1066n,
    dare: "What's your most irrational food opinion that you'll defend to the death?",
    caption: "Controversial. Unhinged. Non-negotiable. 😂",
    category: "Funny",
  },
  {
    id: 1067n,
    dare: "Have you ever laughed at your own joke before finishing it?",
    caption: "Comedian and audience. One person. 💀",
    category: "Funny",
  },
  {
    id: 1068n,
    dare: "What's the weirdest thing you've ever googled at 2am?",
    caption: "'It was for research' never works 😭",
    category: "Funny",
  },
  {
    id: 1069n,
    dare: "What's the most embarrassing thing your phone's autocorrect has done to you?",
    caption: "Technology betrayal is real 💀",
    category: "Funny",
  },
  {
    id: 1070n,
    dare: "Have you ever done something embarrassing and then looked around to see if anyone saw?",
    caption: "Made full eye contact. Still denied it. 😂",
    category: "Funny",
  },
  // New Awkward truths
  {
    id: 1071n,
    dare: "What's the most socially awkward thing you do that you thought was normal?",
    caption: "You've been doing it your whole life. It's not normal. 😬",
    category: "Awkward",
  },
  {
    id: 1072n,
    dare: "Have you ever ghosted someone and then run into them in person?",
    caption: "The eye contact lasted 0.4 seconds 💀",
    category: "Awkward",
  },
  {
    id: 1073n,
    dare: "What's the longest you've avoided replying to something without officially ghosting?",
    caption: "It's been 3 months. The message is still unread. 😬",
    category: "Awkward",
  },
  {
    id: 1074n,
    dare: "Have you ever faked being busy to avoid doing something with someone?",
    caption: "'Sorry I have plans' — the plans were your bed 💀",
    category: "Awkward",
  },
  {
    id: 1075n,
    dare: "What's the most awkward thing you've done in front of someone you were trying to impress?",
    caption: "It lives rent-free forever 😬",
    category: "Awkward",
  },
  {
    id: 1076n,
    dare: "Have you ever said 'you too' to something that didn't apply to you at all?",
    caption: "'Enjoy your meal!' 'You too.' Waiter does not work there. 💀",
    category: "Awkward",
  },
  {
    id: 1077n,
    dare: "What's the most embarrassing thing you've done on public transport?",
    caption: "Fellow passengers will never forget 😬",
    category: "Awkward",
  },
  {
    id: 1078n,
    dare: "Have you ever laughed to avoid an awkward silence and made it worse?",
    caption: "The laugh echoed. Nothing was funny. 💀",
    category: "Awkward",
  },
  {
    id: 1079n,
    dare: "What's something you've said confidently that you immediately knew was wrong?",
    caption: "Zero chance of recovery 😬",
    category: "Awkward",
  },
  {
    id: 1080n,
    dare: "Have you ever pretended to know someone's name when you've totally forgotten it?",
    caption: "The whole conversation was a maze 💀",
    category: "Awkward",
  },
  // New Romantic truths
  {
    id: 1081n,
    dare: "Have you ever had a dream about someone here and refused to tell them?",
    caption: "Their name will not be said today 💕",
    category: "Romantic",
  },
  {
    id: 1082n,
    dare: "What's the most desperate thing you've done to look good for someone you liked?",
    caption: "The effort was unmatched. The result was questionable. 💀",
    category: "Romantic",
  },
  {
    id: 1083n,
    dare: "Have you ever had feelings for someone your friend also liked?",
    caption: "The group chat survived. Barely. 💕",
    category: "Romantic",
  },
  {
    id: 1084n,
    dare: "What's the meanest thing you've done while having feelings for someone?",
    caption: "Love makes people unhinged 💀",
    category: "Romantic",
  },
  {
    id: 1085n,
    dare: "Have you ever broken someone's heart, even a little?",
    caption: "Even unintentionally counts 💕",
    category: "Romantic",
  },
  {
    id: 1086n,
    dare: "What's the biggest 'L' you've ever taken while trying to flirt?",
    caption: "There was no recovery. Only walking away. 💀",
    category: "Romantic",
  },
  {
    id: 1087n,
    dare: "Who in your contacts would you most want to receive a random 'I miss you' from?",
    caption: "Do not say it out loud. Oh no you said it. 💕",
    category: "Romantic",
  },
  {
    id: 1088n,
    dare: "Have you ever liked someone but pretended you didn't because they felt out of your league?",
    caption: "Standards and self-preservation, in one move 💀",
    category: "Romantic",
  },
  {
    id: 1089n,
    dare: "What's the most embarrassing thing you've done on a date?",
    caption: "It still comes up. In your head. At 3am. 💕",
    category: "Romantic",
  },
  {
    id: 1090n,
    dare: "Have you ever told someone you were 'just friends' when you knew you weren't?",
    caption: "The denial was strong but the vibes were stronger 💀",
    category: "Romantic",
  },
  // New School truths
  {
    id: 1091n,
    dare: "Have you ever convinced yourself you studied enough but opened the exam and knew nothing?",
    caption: "The paper looked like abstract art 🎒",
    category: "School",
  },
  {
    id: 1092n,
    dare: "What's the most dramatic thing that's happened in a school group chat?",
    caption: "Lives were changed. Friendships ended. 💀",
    category: "School",
  },
  {
    id: 1093n,
    dare: "Have you ever had a full conversation with a teacher to avoid them asking you a question?",
    caption: "The ultimate misdirection 🎒",
    category: "School",
  },
  {
    id: 1094n,
    dare: "What's the most 'main character' moment you've had in school?",
    caption: "Everyone was watching. You delivered. 💀",
    category: "School",
  },
  {
    id: 1095n,
    dare: "Have you ever started a rumour by accident and let it run?",
    caption: "You watched it grow. You said nothing. 🎒",
    category: "School",
  },
  // New Emotional truths
  {
    id: 1096n,
    dare: "What's the hardest thing you've had to pretend was okay?",
    caption: "Held it together publicly. Different story privately. 😭",
    category: "Emotional",
  },
  {
    id: 1097n,
    dare: "What's something you've wanted to say to someone but haven't?",
    caption: "Write it down if you need to. We're here. 💙",
    category: "Emotional",
  },
  {
    id: 1098n,
    dare: "What's a moment you were genuinely proud of yourself for?",
    caption: "Big or small — it counts 😭",
    category: "Emotional",
  },
  {
    id: 1099n,
    dare: "Who in your life do you think about but rarely talk to?",
    caption: "Send them something after this 💙",
    category: "Emotional",
  },
  {
    id: 1100n,
    dare: "What's something you've forgiven someone for but never told them?",
    caption: "That's peace. That's growth. 😭",
    category: "Emotional",
  },
  {
    id: 1101n,
    dare: "Who in this group would survive a zombie attack?",
    caption: "Choose wisely — your life depends on it 💀",
    category: "Funny",
  },
  {
    id: 1102n,
    dare: "Who is the funniest here?",
    caption: "The court is now in session 😂",
    category: "Funny",
  },
  {
    id: 1103n,
    dare: "Who would you trust with a secret?",
    caption: "Think carefully before you answer 👀",
    category: "Emotional",
  },
  {
    id: 1104n,
    dare: "Who is most likely to go viral?",
    caption: "Fame is calling someone's name 💀",
    category: "Funny",
  },
  {
    id: 1105n,
    dare: "Who would you swap lives with?",
    caption: "No take-backs on this one 😬",
    category: "Emotional",
  },
  {
    id: 1106n,
    dare: "What is your most recent cringe moment?",
    caption: "We're all judging just a little 😭",
    category: "Awkward",
  },
  {
    id: 1107n,
    dare: "Who do you talk to the most?",
    caption: "The receipts don't lie 💕",
    category: "Romantic",
  },
  {
    id: 1108n,
    dare: "What is something you never say out loud?",
    caption: "Today is the day apparently 💀",
    category: "Emotional",
  },
  {
    id: 1109n,
    dare: "What is your biggest fear right now?",
    caption: "We promise not to laugh... maybe 😂",
    category: "Emotional",
  },
  {
    id: 1110n,
    dare: "Who here knows you best?",
    caption: "The real ones vs the ones who think they do 💕",
    category: "Emotional",
  },
  {
    id: 1111n,
    dare: "Have you ever sent a message and regretted it instantly?",
    caption: "The unsend button wasn't fast enough 😭",
    category: "Awkward",
  },
  {
    id: 1112n,
    dare: "What is something you pretend to like?",
    caption: "The performance has been Oscar-level 😂",
    category: "Awkward",
  },
  {
    id: 1113n,
    dare: "Who would you text right now without thinking?",
    caption: "Your fingers already know 💕",
    category: "Romantic",
  },
  {
    id: 1114n,
    dare: "What is your guilty pleasure?",
    caption: "No judgment zone... kind of 😬",
    category: "Funny",
  },
  {
    id: 1115n,
    dare: "What is something funny you did recently?",
    caption: "Story time, don't leave out the details 😂",
    category: "Funny",
  },
];

// ─── Situation Cards ──────────────────────────────────────────────────────────
const SITUATIONS: Dare[] = [
  // Funny
  {
    id: 2001n,
    dare: "You're in an elevator and someone walks in playing music on full speaker. You make eye contact. Silence. Act it out.",
    caption: "The tension was PALPABLE 💀",
    category: "Funny",
  },
  {
    id: 2002n,
    dare: "You're at a restaurant and you confidently order something... but mispronounce it so badly the waiter doesn't understand. Keep going.",
    caption: "I said what I said and I'm COMMITTED 😂",
    category: "Funny",
  },
  {
    id: 2003n,
    dare: "You trip in public, totally eat it, and 5 people saw. You must play it off like it was intentional. Go.",
    caption: "'I choreographed this' — only option 💀",
    category: "Funny",
  },
  {
    id: 2004n,
    dare: "You're singing along to a song in the car. The car stops. People outside heard everything. React.",
    caption: "The light turned red at the exact wrong moment 😭",
    category: "Funny",
  },
  {
    id: 2005n,
    dare: "Your phone goes off in the middle of a quiet moment with the most embarrassing ringtone. You can't silence it fast enough.",
    caption: "The ringtone was 'All Star' by Smash Mouth 💀",
    category: "Funny",
  },
  {
    id: 2006n,
    dare: "You're telling a story and totally forget the point halfway through. Keep going like it still makes sense.",
    caption: "'Anyway. The point is... vibes' 😂",
    category: "Funny",
  },
  {
    id: 2007n,
    dare: "You accidentally call your teacher 'mom' in front of the whole class. React.",
    caption: "The class went SILENT. Then SCREAMED. 💀",
    category: "Funny",
  },
  {
    id: 2008n,
    dare: "You walk confidently in the wrong direction and someone points it out. Recover gracefully.",
    caption: "'I was testing the route' is a valid answer 😂",
    category: "Funny",
  },
  {
    id: 2009n,
    dare: "You laugh at a joke nobody else found funny. Now everyone's looking at you. Justify it.",
    caption: "You had to be there. In your head. 💀",
    category: "Funny",
  },
  {
    id: 2010n,
    dare: "You accidentally send a voice note to the wrong person. It was about them. Act out your recovery.",
    caption: "The typing bubble appeared immediately 😭",
    category: "Funny",
  },
  // Awkward
  {
    id: 2011n,
    dare: "You're at a gathering and you wave at someone who isn't waving at you. They notice your mistake. Play it off.",
    caption: "Double down or die trying 😬",
    category: "Awkward",
  },
  {
    id: 2012n,
    dare: "You walk up and start talking to someone thinking they're your friend. They're not. It's a stranger. Keep going.",
    caption: "You're in it now. Finish the story. 💀",
    category: "Awkward",
  },
  {
    id: 2013n,
    dare: "You hold the door for someone who is way too far away. They have to awkwardly jog. Maintain eye contact the whole time.",
    caption: "You created a hostage situation with a door 😬",
    category: "Awkward",
  },
  {
    id: 2014n,
    dare: "You confidently tell a story... then realize the person you're talking to was there and you got it wrong. Improvise.",
    caption: "'And then you said— actually wait— I meant—' 💀",
    category: "Awkward",
  },
  {
    id: 2015n,
    dare: "You overhear something about yourself. You're not supposed to know. Someone asks why you're acting weird. Respond.",
    caption: "'I'm fine' has never been less convincing 😬",
    category: "Awkward",
  },
  {
    id: 2016n,
    dare: "You're on a phone call, laugh too loud, and the entire room goes quiet. Everyone's looking. What do you do?",
    caption: "You become one with the wall 💀",
    category: "Awkward",
  },
  {
    id: 2017n,
    dare: "You walk into a conversation and laugh at the punchline without knowing the joke. They all look at you. Keep going.",
    caption: "'Haha yeah' — you, with zero context 😬",
    category: "Awkward",
  },
  {
    id: 2018n,
    dare: "You're introduced to someone you've already met 3 times. Do you admit it or fake the first meeting again?",
    caption: "The eternal dilemma of the socially awkward 💀",
    category: "Awkward",
  },
  {
    id: 2019n,
    dare: "Your stomach growls loudly in complete silence. Multiple people heard it. React accordingly.",
    caption: "The whole room became very polite very fast 😬",
    category: "Awkward",
  },
  {
    id: 2020n,
    dare: "You're texting on your phone, walk into something, and people saw. Full commitment to playing it off.",
    caption: "'I was testing the structural integrity' 💀",
    category: "Awkward",
  },
  // Romantic
  {
    id: 2021n,
    dare: "Your crush just walked in while you're mid-impression of them for your friends. They heard at least part of it. Handle it.",
    caption: "The floor is made of lava but worse 💕",
    category: "Romantic",
  },
  {
    id: 2022n,
    dare: "You accidentally like a photo from 3 years ago on your crush's profile. You have 5 seconds before they notice. Go.",
    caption: "Every phone in the world should have an undo button 💀",
    category: "Romantic",
  },
  {
    id: 2023n,
    dare: "You told your friends you don't like someone. That someone just walked up and hugged you like you're close. React.",
    caption: "Your friends are looking. Your face is betraying you. 💕",
    category: "Romantic",
  },
  {
    id: 2024n,
    dare: "Your crush just asked who you like. Your friends are all watching. You have 5 seconds to answer.",
    caption: "The countdown is real 💀",
    category: "Romantic",
  },
  {
    id: 2025n,
    dare: "You're trying to play it cool but you literally trip in front of your crush. Full recovery mode. Go.",
    caption: "'That was my signature move' — say it with confidence 💕",
    category: "Romantic",
  },
  {
    id: 2026n,
    dare: "You sent your crush a message meant for your best friend that says 'okay but they're actually kinda cute.' They reply instantly. Act it out.",
    caption: "The reply was a heart. What does that MEAN 😭",
    category: "Romantic",
  },
  {
    id: 2027n,
    dare: "Your crush just introduced you to their new 'friend' and something feels off. Act out the next 30 seconds.",
    caption: "Performing calm while internally screaming 💕",
    category: "Romantic",
  },
  {
    id: 2028n,
    dare: "You're hanging out with your crush. Your ringtone goes off. It's their name you set as a contact name out loud. React.",
    caption: "You set it as 'Do Not Answer (Crush)' 💀",
    category: "Romantic",
  },
  {
    id: 2029n,
    dare: "You accidentally reply 'love you too' to your crush instead of your parent. You see them read it. Handle it.",
    caption: "They're typing. You're spiraling. 💕",
    category: "Romantic",
  },
  {
    id: 2030n,
    dare: "Your crush just caught you staring. You made full eye contact. They're waiting for your move. Go.",
    caption: "Look away? Too late. Commit. 💀",
    category: "Romantic",
  },
  // School
  {
    id: 2031n,
    dare: "You're presenting in class, you blank on the most basic fact, and the teacher is waiting. Keep going.",
    caption: "'The answer is... yes. Definitely yes.' 🎒",
    category: "School",
  },
  {
    id: 2032n,
    dare: "You're copying notes off someone next to you. The teacher notices and makes direct eye contact. React.",
    caption: "Maintain eye contact. Write faster. 💀",
    category: "School",
  },
  {
    id: 2033n,
    dare: "You walk into the wrong classroom, take a seat, and the teacher starts calling attendance. How long do you stay?",
    caption: "You got a B+ in a class you've never taken 🎒",
    category: "School",
  },
  {
    id: 2034n,
    dare: "Your phone dies mid-presentation. Your whole presentation was on it. The class waits. Improvise.",
    caption: "'And now for the unscripted portion' 💀",
    category: "School",
  },
  {
    id: 2035n,
    dare: "You walk in late to class and trip on the step. 30 people saw. Find your seat like nothing happened.",
    caption: "The walk of shame but make it athletic 🎒",
    category: "School",
  },
  {
    id: 2036n,
    dare: "You raise your hand with a confident answer. You realize it's completely wrong before you finish the sentence. Keep going.",
    caption: "Commit to the wrong answer with your whole chest 💀",
    category: "School",
  },
  {
    id: 2037n,
    dare: "You just sent a group project message to the teacher instead of your group chat. It had complaints about the project. React.",
    caption:
      "The 'this teacher is so annoying' went directly to the teacher 🎒",
    category: "School",
  },
  {
    id: 2038n,
    dare: "The teacher calls on you right after you were clearly not paying attention. You have 3 seconds to guess the topic.",
    caption: "Say something. Anything. Now. 💀",
    category: "School",
  },
  {
    id: 2039n,
    dare: "You laugh at something on your phone during a quiet test. The teacher stares at you. Everyone looks. Handle it.",
    caption: "Cough. Cough again. Pretend it was a cough. 🎒",
    category: "School",
  },
  {
    id: 2040n,
    dare: "You eat something in class thinking the teacher won't notice. They stop mid-sentence and stare at you. React.",
    caption: "The crunch echoed off every wall 💀",
    category: "School",
  },
  // Emotional
  {
    id: 2041n,
    dare: "A friend calls you crying but you're in a room full of people. You have to be comforting but subtle. Act it out.",
    caption: "'mm yeah totally... same... I agree...' 😭",
    category: "Emotional",
  },
  {
    id: 2042n,
    dare: "Someone gives you a sincere compliment in front of a group and you have absolutely no idea how to handle it. React.",
    caption: "The self-destruct sequence has initiated 💙",
    category: "Emotional",
  },
  {
    id: 2043n,
    dare: "You're trying to apologize to someone but every time you start, something interrupts you. Keep trying.",
    caption: "The universe does not want this apology delivered 😭",
    category: "Emotional",
  },
  {
    id: 2044n,
    dare: "You just found out your best friend knew a secret about you and didn't tell you. They're right in front of you. React.",
    caption: "The betrayal. The love. The BETRAYAL. 💙",
    category: "Emotional",
  },
  {
    id: 2045n,
    dare: "Someone's clearly upset at you but won't say why. You have 60 seconds to figure it out with only yes/no answers.",
    caption: "You have 60 seconds and a shrinking list of possibilities 😭",
    category: "Emotional",
  },
  {
    id: 2046n,
    dare: "You cry accidentally in front of your whole friend group at something stupid. They're all watching. Own it.",
    caption: "'That commercial was MOVING and you know it' 💙",
    category: "Emotional",
  },
  {
    id: 2047n,
    dare: "A stranger on the street randomly thanks you for something you don't remember doing. React appropriately.",
    caption: "You're a hero and you don't even know how 😭",
    category: "Emotional",
  },
  {
    id: 2048n,
    dare: "You try to comfort a friend but everything you say comes out wrong. Keep trying anyway.",
    caption: "'At least you have your health—' no wait 💙",
    category: "Emotional",
  },
  {
    id: 2049n,
    dare: "You get a heartfelt birthday message from someone you forgot to wish happy birthday. React in real time.",
    caption: "Type 'happy birthday'... delete... type again... 😭",
    category: "Emotional",
  },
  {
    id: 2050n,
    dare: "You're in a deep emotional conversation and your stomach growls loudly. Carry on.",
    caption: "The body speaks its truth regardless of timing 💙",
    category: "Emotional",
  },
  // Social Prank
  {
    id: 2051n,
    dare: "You walk into a shop, look absolutely horrified at the prices, turn to the nearest stranger, and must get them to agree with you.",
    caption: "Economic solidarity achieved through vibes 🎭",
    category: "Social Prank",
  },
  {
    id: 2052n,
    dare: "You're pretending to talk on a remote control as your phone. Someone asks to borrow your 'phone'. Keep going.",
    caption: "'Sorry, low battery' — you, holding a remote 💀",
    category: "Social Prank",
  },
  {
    id: 2053n,
    dare: "You thank the automatic door loudly. It doesn't open on the first try. You have to keep thanking it until it does.",
    caption: "Persistence. Gratitude. Victory. 🎭",
    category: "Social Prank",
  },
  {
    id: 2054n,
    dare: "You start clapping in public and must get at least one stranger to clap with you without explaining why.",
    caption: "The stranger who joined is a hero 💀",
    category: "Social Prank",
  },
  {
    id: 2055n,
    dare: "You follow someone out of an elevator completely unintentionally but they think you're following them. Resolve it.",
    caption: "'Oh I also live on every floor' isn't working 🎭",
    category: "Social Prank",
  },
  {
    id: 2056n,
    dare: "You accidentally wave at someone who didn't wave at you. They look confused. You must commit to the wave having a reason.",
    caption: "'I was waving at the bird behind you' 💀",
    category: "Social Prank",
  },
  {
    id: 2057n,
    dare: "You asked a stranger for directions to a fake place. They're trying really hard to help. You have to keep the bit going.",
    caption: "They called a friend to ask. You've gone too far. 🎭",
    category: "Social Prank",
  },
  {
    id: 2058n,
    dare: "You scream in public and then immediately act normal. Someone asks if you're okay. Explain yourself.",
    caption: "'I saw a bug' buys you exactly 4 seconds 💀",
    category: "Social Prank",
  },
  {
    id: 2059n,
    dare: "You're vibing to music no one else can 'hear' (but they definitely can). Someone asks what you're listening to. Respond.",
    caption: "'My original composition' — you, playing Shrek music 🎭",
    category: "Social Prank",
  },
  {
    id: 2060n,
    dare: "You crack a bad joke publicly. Nobody laughs. You must explain why it was funny until someone agrees.",
    caption: "You will not move until someone laughs genuinely 💀",
    category: "Social Prank",
  },
  // New situations
  {
    id: 2061n,
    dare: "If you are in a store and accidentally knock over an entire display... do you fix it or pretend it wasn't you?",
    caption: "The shelf fell. The camera saw. The question is rhetorical. 💀",
    category: "Funny",
  },
  {
    id: 2062n,
    dare: "If you are at a restaurant and the waiter asks how the food is but it's terrible... what do you say?",
    caption: "'It's great!' — the lie that keeps society running 😂",
    category: "Funny",
  },
  {
    id: 2063n,
    dare: "If you are mid-laugh at someone's joke and realize it wasn't a joke... how do you recover?",
    caption: "The silence that followed was career-ending 💀",
    category: "Funny",
  },
  {
    id: 2064n,
    dare: "If you are in a group and everyone is quiet but you're the one who can't stop laughing... what do you do?",
    caption: "Your brain chose violence 😭",
    category: "Funny",
  },
  {
    id: 2065n,
    dare: "If you are doing a presentation and your fly is open and someone tells you halfway through... do you fix it or finish first?",
    caption: "The professionalism vs. the situation 💀",
    category: "Funny",
  },
  {
    id: 2066n,
    dare: "If you are in a lift with someone you've ghosted... who presses the close button first?",
    caption: "The longest 30 seconds of your life 😬",
    category: "Awkward",
  },
  {
    id: 2067n,
    dare: "If you are waving at someone across the street who didn't wave at you and three people saw... do you walk over or disappear?",
    caption: "Commitment is key. Walk away is valid. 💀",
    category: "Awkward",
  },
  {
    id: 2068n,
    dare: "If you are at a party and you forget someone's name you definitely should know... do you admit it or navigate the whole night without saying it?",
    caption: "Six hours of pronoun gymnastics 😬",
    category: "Awkward",
  },
  {
    id: 2069n,
    dare: "If you are in line and someone cuts in front of you and looks right at you... do you say something or let it happen?",
    caption: "The inner monologue vs. the actual response 💀",
    category: "Awkward",
  },
  {
    id: 2070n,
    dare: "If you are reading a message and someone catches you in the act of leaving them on read... what do you do?",
    caption: "You looked them in the eye. You kept scrolling. 😬",
    category: "Awkward",
  },
  {
    id: 2071n,
    dare: "If you are on a first date and you realize too early that it's not going well... do you stay or fake an emergency?",
    caption: "The fake call app was invented for this moment 💕",
    category: "Romantic",
  },
  {
    id: 2072n,
    dare: "If you are confessing your feelings and the person says 'aw that's sweet' and nothing else... what's your next move?",
    caption: "That response carries no information and maximum pain 💀",
    category: "Romantic",
  },
  {
    id: 2073n,
    dare: "If you are in a group and someone asks who you like and your crush is right there... do you answer or deflect?",
    caption: "Every eye in the room is on your face 💕",
    category: "Romantic",
  },
  {
    id: 2074n,
    dare: "If you are texting your crush and you're both typing at the same time for 3 minutes but no message sends... what's yours?",
    caption: "Parallel spiraling at its finest 💀",
    category: "Romantic",
  },
  {
    id: 2075n,
    dare: "If you are hanging out with someone you like and their ex shows up uninvited... what do you do?",
    caption: "The plot twist was not in the itinerary 💕",
    category: "Romantic",
  },
  {
    id: 2076n,
    dare: "If you are in class and the teacher reads out your wrong answer to the whole class... how do you play it off?",
    caption: "Confidence is the only option 🎒",
    category: "School",
  },
  {
    id: 2077n,
    dare: "If you are doing a group project and nobody else has done anything 1 hour before the deadline... what's your move?",
    caption: "Do it all yourself or watch it burn 💀",
    category: "School",
  },
  {
    id: 2078n,
    dare: "If you are called on to answer a question you definitely don't know... what's your strategy?",
    caption: "'Can you repeat the question?' buys 4 seconds max 🎒",
    category: "School",
  },
  {
    id: 2079n,
    dare: "If you are late to class and the teacher asks why in front of everyone... what's your answer?",
    caption: "Truth: traffic. Actual truth: you were in bed. 💀",
    category: "School",
  },
  {
    id: 2080n,
    dare: "If you are in an exam and the person next to you is clearly copying you but getting answers wrong... do you let them or move your paper?",
    caption: "Protecting your grade or protecting the relationship 🎒",
    category: "School",
  },
  {
    id: 2081n,
    dare: "If you are alone and get a notification that someone you used to be close with is thinking of you... do you reply or leave it?",
    caption: "Some doors are easier kept closed 💙",
    category: "Emotional",
  },
  {
    id: 2082n,
    dare: "If you are in a group and someone says something that upsets you but everyone else laughs... do you say something?",
    caption: "Your reaction in that moment says a lot 😭",
    category: "Emotional",
  },
  {
    id: 2083n,
    dare: "If you are going through something hard and someone asks 'are you okay?' with genuine care... what do you actually say?",
    caption: "The real answer takes courage 💙",
    category: "Emotional",
  },
  {
    id: 2084n,
    dare: "If you are watching a movie alone and start crying... do you let yourself or pull it together immediately?",
    caption: "The permission to feel is radical 😭",
    category: "Emotional",
  },
  {
    id: 2085n,
    dare: "If you are given the chance to apologize to someone from your past... do you take it?",
    caption: "Some apologies are for them. Some are for you. 💙",
    category: "Emotional",
  },
  {
    id: 2086n,
    dare: "If you are in a busy café and the barista gets your name completely wrong on the cup... do you correct them or just own it?",
    caption: "'Blork' is a name now 💀",
    category: "Social Prank",
  },
  {
    id: 2087n,
    dare: "If you are in a lift and it stops but nobody's getting on or off... do you hold the door or let it close?",
    caption: "The social contract is being tested 😂",
    category: "Social Prank",
  },
  {
    id: 2088n,
    dare: "If you are standing in a queue and someone behind you is breathing way too close... what do you do?",
    caption: "Diplomacy vs. the body's natural response 💀",
    category: "Social Prank",
  },
  {
    id: 2089n,
    dare: "If you are at a checkout and your card declines but you definitely have money... how do you handle the next 30 seconds?",
    caption: "You become a performance artist 😂",
    category: "Social Prank",
  },
  {
    id: 2090n,
    dare: "If you are in public and someone calls out a name that sounds exactly like yours but isn't... do you respond?",
    caption: "You turned around. Now commit. 💀",
    category: "Social Prank",
  },
  {
    id: 2091n,
    dare: "If you are in the middle of a story and completely forget where it's going... do you wrap it up or admit the loss?",
    caption: "'And that's basically it' — the universal escape hatch 💀",
    category: "Funny",
  },
  {
    id: 2092n,
    dare: "If you are confidently wrong about a fact in public and someone pulls out their phone to check... what's your face doing?",
    caption: "The phone is loading. You have 3 seconds to backtrack. 😂",
    category: "Funny",
  },
  {
    id: 2093n,
    dare: "If you are in an elevator and someone says 'have a good day' as they leave but you're staying on... what do you say?",
    caption: "'You too' as the doors close is the only option 💀",
    category: "Awkward",
  },
  {
    id: 2094n,
    dare: "If you are with your crush and your phone keeps blowing up from someone and they notice... how do you play it?",
    caption: "Who you say it is vs. who it actually is 💕",
    category: "Romantic",
  },
  {
    id: 2095n,
    dare: "If you are in a class discussion and you realize you've been pronouncing a word wrong your whole life... mid-sentence... what do you do?",
    caption: "Pivot. Commit. Never acknowledge it. 🎒",
    category: "School",
  },
  {
    id: 2096n,
    dare: "If you are having a bad day and someone asks what's wrong but you don't know how to explain it... what do you say?",
    caption: "The answer is somewhere but words aren't cooperating 💙",
    category: "Emotional",
  },
  {
    id: 2097n,
    dare: "If you are trying to make a dramatic exit from a room and you walk into a closed door... what happens next?",
    caption: "The drama died at the door. Literally. 💀",
    category: "Funny",
  },
  {
    id: 2098n,
    dare: "If you are telling a story and realize the person you're talking about is standing right behind you... what's your move?",
    caption: "Their face is right there. They heard everything. 😬",
    category: "Awkward",
  },
  {
    id: 2099n,
    dare: "If you are vibing with someone and your friend interrupts and starts flirting with them... what do you do?",
    caption: "Loyalty test. Unintentional. Real. 💕",
    category: "Romantic",
  },
  {
    id: 2100n,
    dare: "If you are in a public place and you sneeze so loudly everyone turns to look at you... what do you do?",
    caption: "Take a bow or become invisible. Choose now. 💀",
    category: "Social Prank",
  },
];

// ─── Anti-repeat picker ───────────────────────────────────────────────────────
function pickSmartItem(
  pool: Dare[],
  storageKeyPrefix: string,
  category: string,
): Dare {
  const storageKey = `${storageKeyPrefix}${category}`;
  let seenIds: string[] = [];
  try {
    const raw = localStorage.getItem(storageKey);
    seenIds = raw ? JSON.parse(raw) : [];
  } catch {
    seenIds = [];
  }
  let unseen = pool.filter((d) => !seenIds.includes(d.id.toString()));
  if (unseen.length === 0) {
    seenIds = [];
    unseen = pool;
  }
  const picked = unseen[Math.floor(Math.random() * unseen.length)];
  seenIds.push(picked.id.toString());
  try {
    localStorage.setItem(storageKey, JSON.stringify(seenIds));
  } catch {
    /* ignore */
  }
  return picked;
}

// ─── Spin Wheel Component ─────────────────────────────────────────────────────
const WHEEL_SEGMENTS: {
  type: ContentType;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
}[] = [
  {
    type: "truth",
    label: "TRUTH",
    emoji: "🤔",
    color: "oklch(0.63 0.28 335)",
    textColor: "#fff",
  },
  {
    type: "dare",
    label: "DARE",
    emoji: "🔥",
    color: "oklch(0.55 0.22 15)",
    textColor: "#fff",
  },
  {
    type: "situation",
    label: "SITUATION",
    emoji: "😱",
    color: "oklch(0.45 0.2 290)",
    textColor: "#fff",
  },
];

function SpinWheel({ onResult }: { onResult: (type: ContentType) => void }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const currentRotation = useRef(0);
  const lastWinIndex = useRef<number>(-1);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    // Each segment = 120 degrees. Pointer is at top (0 deg).
    // Segment assignments (starting from 0): 0-120 = Truth, 120-240 = Dare, 240-360 = Situation
    // Pick a random segment but never repeat the last one
    const options = [0, 1, 2].filter((i) => i !== lastWinIndex.current);
    const winningIndex = options[Math.floor(Math.random() * options.length)];
    lastWinIndex.current = winningIndex;
    // Center of each segment (offset by 60 deg from start)
    // But our CSS rotation goes the other way — let's think:
    // The wheel rotates. The pointer is fixed at top.
    // After rotation of R degrees, the section at the top is: (360 - R % 360)
    // We want winningIndex segment to be at top.
    // Segment starts: Truth=0, Dare=120, Situation=240
    // Center of segment i = i*120 + 60
    // We want (360 - R % 360) to land in segment i's range
    // So R % 360 should be: (360 - (i*120 + 60)) % 360 => 300 - i*120
    // Add randomness within segment: random offset in [-50, 50]
    const centerAngle = (300 - winningIndex * 120 + 360) % 360;
    const jitter = Math.random() * 80 - 40; // -40 to +40 degrees within segment
    const targetAngle = centerAngle + jitter;
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * 360; // 6-9 full rotations
    const totalRotation =
      currentRotation.current +
      fullSpins +
      targetAngle -
      (currentRotation.current % 360);

    currentRotation.current = totalRotation;
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult(WHEEL_SEGMENTS[winningIndex].type);
    }, 3200);
  }, [spinning, onResult]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Wheel container */}
      <div className="relative" style={{ width: 290, height: 290 }}>
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.7))" }}
        >
          <svg
            width="28"
            height="36"
            viewBox="0 0 28 36"
            fill="none"
            aria-label="Spin wheel pointer"
            role="img"
          >
            <polygon points="14,36 0,0 28,0" fill="white" />
            <polygon points="14,36 2,4 26,4" fill="oklch(0.97 0.008 230)" />
          </svg>
        </div>

        {/* Wheel outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(oklch(0.63 0.28 335), oklch(0.55 0.22 15), oklch(0.45 0.2 290), oklch(0.63 0.28 335))",
            filter: "blur(8px)",
            opacity: spinning ? 0.9 : 0.5,
            transition: "opacity 0.3s",
          }}
        />

        {/* The spinning wheel */}
        <div
          className="absolute inset-2 rounded-full overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 3.1s cubic-bezier(0.17, 0.67, 0.12, 1)"
              : "none",
            willChange: "transform",
          }}
        >
          {/* SVG wheel */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 286 286"
            aria-label="Spin wheel"
            role="img"
          >
            {WHEEL_SEGMENTS.map((seg, i) => {
              const startAngle = i * 120 - 90; // start at top
              const endAngle = startAngle + 120;
              const toRad = (d: number) => (d * Math.PI) / 180;
              const cx = 143;
              const cy = 143;
              const r = 143;

              const x1 = cx + r * Math.cos(toRad(startAngle));
              const y1 = cy + r * Math.sin(toRad(startAngle));
              const x2 = cx + r * Math.cos(toRad(endAngle));
              const y2 = cy + r * Math.sin(toRad(endAngle));
              const midAngle = startAngle + 60;
              const textR = r * 0.6;
              const tx = cx + textR * Math.cos(toRad(midAngle));
              const ty = cy + textR * Math.sin(toRad(midAngle));
              return (
                <g key={seg.type}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                  />
                  {/* Divider line */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x1}
                    y2={y1}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="2"
                  />
                  {/* Label group */}
                  <g
                    transform={`translate(${tx},${ty}) rotate(${midAngle + 90})`}
                  >
                    <text
                      x="0"
                      y="-8"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="900"
                      fill="white"
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        letterSpacing: 1,
                      }}
                    >
                      {seg.label}
                    </text>
                    <text x="0" y="10" textAnchor="middle" fontSize="18">
                      {seg.emoji}
                    </text>
                  </g>
                </g>
              );
            })}
            {/* Center circle */}
            <circle
              cx="143"
              cy="143"
              r="28"
              fill="oklch(0.1 0.012 230)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
            <text x="143" y="149" textAnchor="middle" fontSize="20">
              🎲
            </text>
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: spinning ? 1 : 1.05 }}
        onClick={spin}
        disabled={spinning}
        data-ocid="wheel.spin.primary_button"
        className="px-12 py-4 rounded-full text-white font-black text-2xl tracking-wide disabled:opacity-60 transition-all"
        style={{
          background: spinning
            ? "oklch(0.22 0.015 230)"
            : "linear-gradient(135deg, oklch(0.63 0.28 335), oklch(0.55 0.22 15))",
          boxShadow: spinning
            ? "none"
            : "0 0 30px oklch(0.63 0.28 335 / 0.6), 0 0 60px oklch(0.55 0.22 15 / 0.3)",
        }}
      >
        {spinning ? "Spinning..." : "SPIN! 🎰"}
      </motion.button>

      <p className="text-muted-foreground text-sm text-center">
        Spin to find out — Truth, Dare, or Situation? 🎯
      </p>
    </div>
  );
}

// ─── Result Flash ─────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  ContentType,
  { label: string; emoji: string; color: string; desc: string }
> = {
  truth: {
    label: "TRUTH",
    emoji: "🤔",
    color: "oklch(0.63 0.28 335)",
    desc: "Time to be honest...",
  },
  dare: {
    label: "DARE",
    emoji: "🔥",
    color: "oklch(0.55 0.22 15)",
    desc: "You better do it!",
  },
  situation: {
    label: "SITUATION",
    emoji: "😱",
    color: "oklch(0.45 0.2 290)",
    desc: "Act it out!",
  },
};

function ResultFlash({
  type,
  onContinue,
}: { type: ContentType; onContinue: () => void }) {
  const cfg = TYPE_CONFIG[type];
  useEffect(() => {
    const timer = setTimeout(onContinue, 1600);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="flex flex-col items-center justify-center gap-6 py-16 cursor-pointer"
      onClick={onContinue}
      data-ocid="result.flash.panel"
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="text-8xl"
      >
        {cfg.emoji}
      </motion.div>
      <div className="text-center">
        <p className="text-muted-foreground text-lg font-semibold mb-2">
          You got:
        </p>
        <motion.h2
          className="text-6xl font-black tracking-tight"
          style={{ color: cfg.color, textShadow: `0 0 40px ${cfg.color}` }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
        >
          {cfg.label}!
        </motion.h2>
        <p className="text-muted-foreground text-base mt-3 font-medium">
          {cfg.desc}
        </p>
      </div>
      <p className="text-muted-foreground text-xs mt-2">
        Tap to pick a category
      </p>
    </motion.div>
  );
}

// ─── Category Selection ───────────────────────────────────────────────────────
function CategorySelection({
  type,
  onSelect,
}: {
  type: ContentType;
  onSelect: (category: string) => void;
}) {
  const cfg = TYPE_CONFIG[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 py-4 w-full"
    >
      <div className="text-center">
        <span className="text-4xl">{cfg.emoji}</span>
        <h2 className="text-2xl font-black mt-2" style={{ color: cfg.color }}>
          {cfg.label}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Pick a category to continue
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {CATEGORY_LIST.map((cat, i) => (
          <motion.button
            key={cat.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
            data-ocid={`category.${cat.label.toLowerCase().replace(" ", "_")}.tab`}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card font-bold text-foreground transition-all"
            style={{}}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                cfg.color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "";
            }}
          >
            <span className="text-3xl">{cat.emoji}</span>
            <span className="text-sm font-bold">{cat.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({
  item,
  type,
  category: _category,
  onNew,
  onNextPlayer,
  onFavoriteToggle,
  isFavorited,
  onCopy,
  onShare,
  cardKey,
}: {
  item: Dare;
  type: ContentType;
  category: string;
  onNew: () => void;
  onNextPlayer: () => void;
  onFavoriteToggle: () => void;
  isFavorited: boolean;
  onCopy: () => void;
  onShare: () => void;
  cardKey: number;
}) {
  const cfg = TYPE_CONFIG[type];
  const catEmoji =
    CATEGORY_LIST.find((c) => c.id === item.category)?.emoji ?? "🔥";

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-4"
      data-ocid="content.card"
    >
      {/* Type badge */}
      <div className="flex items-center justify-center gap-2">
        <span
          className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest text-white"
          style={{
            backgroundColor: cfg.color,
            boxShadow: `0 0 20px ${cfg.color}80`,
          }}
        >
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Card */}
      <div className="dare-card-border dare-card-glow rounded-2xl">
        <div className="bg-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: "oklch(0.22 0.02 230)" }}
            >
              {catEmoji} {item.category}
            </span>
          </div>

          <p className="text-foreground text-xl font-extrabold leading-snug">
            {item.dare}
          </p>

          <p className="text-muted-foreground text-sm font-medium">
            💬 {item.caption}
          </p>

          <p
            className="text-xs font-semibold"
            style={{ color: "oklch(0.83 0.14 210)" }}
          >
            {getHashtags(item.category)}
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 border-border font-semibold gap-2 text-sm"
              onClick={onCopy}
              data-ocid="content.copy_caption.button"
            >
              <Copy className="w-4 h-4" />
              Copy Caption
            </Button>

            <button
              type="button"
              data-ocid="content.favorite.toggle"
              onClick={onFavoriteToggle}
              aria-label={
                isFavorited ? "Remove from favorites" : "Save to favorites"
              }
              className="px-4 rounded-xl border border-border bg-card transition-all duration-200 hover:scale-110 active:scale-95"
              style={
                isFavorited
                  ? {
                      borderColor: "oklch(0.63 0.28 335)",
                      color: "oklch(0.63 0.28 335)",
                    }
                  : {}
              }
            >
              <Heart
                className="w-5 h-5 transition-all duration-200"
                fill={isFavorited ? "oklch(0.63 0.28 335)" : "none"}
                strokeWidth={isFavorited ? 0 : 2}
              />
            </button>

            <Button
              variant="outline"
              className="flex-1 font-semibold gap-2 text-sm"
              style={{ borderColor: cfg.color, color: cfg.color }}
              onClick={onNew}
              data-ocid="content.new_item.button"
            >
              <RefreshCw className="w-4 h-4" />
              New {cfg.label}
            </Button>
          </div>

          {/* Share this dare */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={onShare}
            data-ocid="content.share.button"
            className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.06 290 / 0.8), oklch(0.22 0.06 15 / 0.8))",
              borderColor: "oklch(0.65 0.22 290)",
              color: "oklch(0.85 0.18 290)",
            }}
          >
            <Share2 className="w-4 h-4" />
            Share this
          </motion.button>
        </div>
      </div>

      {/* Next Player button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        onClick={onNextPlayer}
        data-ocid="content.next_player.primary_button"
        className="w-full py-4 rounded-full text-white font-black text-lg flex items-center justify-center gap-3 transition-all"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.2 290), oklch(0.55 0.22 15))",
          boxShadow:
            "0 0 24px oklch(0.45 0.2 290 / 0.5), 0 0 48px oklch(0.55 0.22 15 / 0.2)",
        }}
      >
        <RotateCcw className="w-5 h-5" />
        Next Player 🔄
      </motion.button>
    </motion.div>
  );
}

// ─── Favorite Card ────────────────────────────────────────────────────────────
function FavoriteCard({
  dare,
  index,
  onRemove,
  onCopy,
}: {
  dare: Dare;
  index: number;
  onRemove: (dare: Dare) => void;
  onCopy: (dare: Dare) => void;
}) {
  const catEmoji =
    CATEGORIES.find((c) => c.id === dare.category)?.emoji ?? "🔥";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      data-ocid={`favorites.item.${index + 1}`}
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
        >
          {catEmoji} {dare.category}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            data-ocid={`favorites.copy_button.${index + 1}`}
            onClick={() => onCopy(dare)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy caption"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-ocid={`favorites.delete_button.${index + 1}`}
            onClick={() => onRemove(dare)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
            aria-label="Remove from favorites"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-foreground text-base font-bold leading-snug">
        {dare.dare}
      </p>
      <p className="text-muted-foreground text-xs">{dare.caption}</p>
      <p
        className="text-xs font-semibold"
        style={{ color: "oklch(0.83 0.14 210)" }}
      >
        {getHashtags(dare.category)}
      </p>
    </motion.div>
  );
}

// ─── Player Setup ─────────────────────────────────────────────────────────────
function PlayerSetup({
  onStart,
}: { onStart: (names: string[], rounds: number) => void }) {
  const [count, setCount] = useState(2);
  const [rounds, setRounds] = useState(3);
  const [names, setNames] = useState<{ id: string; value: string }[]>(
    Array.from({ length: 8 }, (_, i) => ({
      id: `player-slot-${i}`,
      value: `Player ${i + 1}`,
    })),
  );

  const handleStart = () => {
    const activeNames = names
      .slice(0, count)
      .map((n, idx) => n.value.trim() || `Player ${idx + 1}`);
    onStart(activeNames, rounds);
  };

  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
      data-ocid="setup.panel"
    >
      <div className="text-center">
        <div className="text-5xl mb-2">🎮</div>
        <h2 className="text-2xl font-black text-foreground">Who's Playing?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Add up to 8 players to get started
        </p>
      </div>

      {/* Player count selector */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-foreground font-bold text-center mb-3">
          Number of Players
        </p>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            data-ocid="setup.decrease.button"
            onClick={() => setCount((c) => Math.max(2, c - 1))}
            className="w-12 h-12 rounded-full border-2 border-border text-foreground text-xl font-black flex items-center justify-center active:scale-95 transition-transform"
            style={{
              borderColor: count <= 2 ? undefined : "oklch(0.63 0.28 335)",
            }}
          >
            −
          </button>
          <span className="text-5xl font-black text-foreground w-16 text-center">
            {count}
          </span>
          <button
            type="button"
            data-ocid="setup.increase.button"
            onClick={() => setCount((c) => Math.min(8, c + 1))}
            className="w-12 h-12 rounded-full border-2 text-white text-xl font-black flex items-center justify-center active:scale-95 transition-transform"
            style={{
              backgroundColor: "oklch(0.63 0.28 335)",
              borderColor: "oklch(0.63 0.28 335)",
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Round selector */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-foreground font-bold text-center mb-3">
          How many rounds? 🔄
        </p>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            data-ocid="setup.decrease_rounds.button"
            onClick={() => setRounds((r) => Math.max(1, r - 1))}
            className="w-12 h-12 rounded-full border-2 border-border text-foreground text-xl font-black flex items-center justify-center active:scale-95 transition-transform"
            style={{
              borderColor: rounds <= 1 ? undefined : "oklch(0.63 0.28 335)",
            }}
          >
            −
          </button>
          <span className="text-5xl font-black text-foreground w-16 text-center">
            {rounds}
          </span>
          <button
            type="button"
            data-ocid="setup.increase_rounds.button"
            onClick={() => setRounds((r) => Math.min(10, r + 1))}
            className="w-12 h-12 rounded-full border-2 text-white text-xl font-black flex items-center justify-center active:scale-95 transition-transform"
            style={{
              backgroundColor: "oklch(0.63 0.28 335)",
              borderColor: "oklch(0.63 0.28 335)",
            }}
          >
            +
          </button>
        </div>
        <p className="text-muted-foreground text-xs text-center mt-2">
          1 round = everyone gets one turn
        </p>
      </div>

      {/* Player name inputs */}
      <div className="flex flex-col gap-2">
        {names.slice(0, count).map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2"
          >
            <span
              className="text-lg font-black"
              style={{ color: "oklch(0.63 0.28 335)", minWidth: 28 }}
            >
              {i + 1}
            </span>
            <input
              type="text"
              data-ocid={`setup.player_input.${i + 1}`}
              value={player.value}
              onChange={(e) => {
                const next = names.map((p, idx) =>
                  idx === i ? { ...p, value: e.target.value } : p,
                );
                setNames(next);
              }}
              placeholder={`Player ${i + 1}`}
              className="flex-1 bg-transparent text-foreground font-semibold text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleStart}
        data-ocid="setup.start.primary_button"
        className="w-full py-4 rounded-full text-white font-black text-lg flex items-center justify-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.63 0.28 335), oklch(0.55 0.22 15))",
          boxShadow: "0 0 24px oklch(0.63 0.28 335 / 0.5)",
        }}
      >
        <Users className="w-5 h-5" />
        Let's Go! 🔥
      </motion.button>
    </motion.div>
  );
}

// ─── Rating Phase ─────────────────────────────────────────────────────────────
function RatingPhase({
  players,
  currentPlayerIndex,
  currentItem,
  contentType,
  onSubmit,
}: {
  players: string[];
  currentPlayerIndex: number;
  currentItem: Dare | null;
  contentType: ContentType;
  onSubmit: (avgScore: number) => void;
}) {
  const otherPlayers = players.filter((_, i) => i !== currentPlayerIndex);
  const [ratings, setRatings] = useState<number[]>(
    new Array(otherPlayers.length).fill(0),
  );

  const allRated = ratings.every((r) => r > 0);

  const handleSubmit = () => {
    const rated = ratings.filter((r) => r > 0);
    const avg =
      rated.length > 0 ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
    onSubmit(avg);
  };

  return (
    <motion.div
      key="rating"
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-5"
      data-ocid="rating.panel"
    >
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-1">⭐</div>
        <h2 className="text-xl font-black text-foreground">
          Rate{" "}
          <span style={{ color: "oklch(0.63 0.28 335)" }}>
            {players[currentPlayerIndex]}
          </span>
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          How well did they do?
        </p>
      </div>

      {/* What they had to do */}
      {currentItem && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Their {contentType}
          </p>
          <p className="text-foreground font-semibold text-sm leading-snug">
            {currentItem.dare}
          </p>
        </div>
      )}

      {/* Raters */}
      <div className="flex flex-col gap-3">
        {otherPlayers.map((name, idx) => (
          <div
            key={name}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-foreground font-bold text-sm mb-2">{name}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  data-ocid={`rating.star.${star}`}
                  onClick={() => {
                    const next = [...ratings];
                    next[idx] = star;
                    setRatings(next);
                  }}
                  className="transition-transform active:scale-90 hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className="w-8 h-8"
                    fill={ratings[idx] >= star ? "oklch(0.85 0.18 85)" : "none"}
                    stroke={
                      ratings[idx] >= star
                        ? "oklch(0.85 0.18 85)"
                        : "oklch(0.5 0.02 230)"
                    }
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleSubmit}
        disabled={!allRated}
        data-ocid="rating.submit.primary_button"
        className="w-full py-4 rounded-full text-white font-black text-lg flex items-center justify-center gap-3 transition-opacity"
        style={{
          background: allRated
            ? "linear-gradient(135deg, oklch(0.63 0.28 335), oklch(0.55 0.22 15))"
            : "oklch(0.3 0.02 230)",
          opacity: allRated ? 1 : 0.6,
        }}
      >
        Submit Ratings 🎯
      </motion.button>
    </motion.div>
  );
}

// ─── Confetti Particle ────────────────────────────────────────────────────────
function ConfettiParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: [
      "oklch(0.63 0.28 335)",
      "oklch(0.85 0.18 85)",
      "oklch(0.55 0.22 15)",
      "oklch(0.45 0.2 290)",
      "oklch(0.7 0.25 180)",
    ][i % 5],
    x: Math.random() * 300 - 150,
    y: Math.random() * -400 - 50,
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.3 }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// ─── End Game ─────────────────────────────────────────────────────────────────
function EndGame({
  players,
  scores,
  onPlayAgain,
}: {
  players: string[];
  scores: number[];
  onPlayAgain: () => void;
}) {
  const sorted = players
    .map((name, i) => ({ name, score: scores[i] ?? 0, originalIndex: i }))
    .sort((a, b) => b.score - a.score);

  const handleShare = async () => {
    const winner = sorted[0];
    const topScores = sorted
      .slice(0, 5)
      .map(
        (p, i) =>
          `${i === 0 ? "👑" : `${i + 1}.`} ${p.name}: ${p.score.toFixed(1)} pts`,
      )
      .join("\n");
    const text = `👑 ${winner.name} won DareMe with ${winner.score.toFixed(1)} pts! 🎉\n\nTop scores:\n${topScores}\n\nThink you can beat them? Play DareMe! #DareMe`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DareMe Results", text });
      } catch (_) {}
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Results copied to clipboard! 📋"));
    }
  };

  return (
    <motion.div
      key="endgame"
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-5 relative"
      data-ocid="endgame.panel"
    >
      <ConfettiParticles />

      <div className="text-center">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-black text-foreground">Game Over!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here are the final scores
        </p>
      </div>

      {/* Leaderboard */}
      <div className="flex flex-col gap-2">
        {sorted.map((player, idx) => {
          const isWinner = idx === 0;
          return (
            <motion.div
              key={player.originalIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              data-ocid={`endgame.item.${idx + 1}`}
              className="flex items-center gap-3 rounded-xl p-4 border"
              style={{
                backgroundColor: isWinner
                  ? "oklch(0.85 0.18 85 / 0.1)"
                  : "oklch(0.15 0.02 230)",
                borderColor: isWinner
                  ? "oklch(0.85 0.18 85)"
                  : "oklch(0.25 0.02 230)",
              }}
            >
              <span className="text-2xl w-8 text-center">
                {isWinner ? "👑" : `${idx + 1}.`}
              </span>
              <span
                className="flex-1 font-black text-lg"
                style={{
                  color: isWinner ? "oklch(0.85 0.18 85)" : "var(--foreground)",
                }}
              >
                {player.name}
              </span>
              <span
                className="font-black text-xl"
                style={{
                  color: isWinner
                    ? "oklch(0.85 0.18 85)"
                    : "oklch(0.63 0.28 335)",
                }}
              >
                {player.score.toFixed(1)}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleShare}
          data-ocid="endgame.share.button"
          className="w-full py-4 rounded-full font-black text-lg flex items-center justify-center gap-3 text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.22 85), oklch(0.65 0.25 55))",
            boxShadow: "0 0 24px oklch(0.55 0.22 85 / 0.5)",
          }}
        >
          <Share2 className="w-5 h-5" />
          Share Results 📤
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          onClick={onPlayAgain}
          data-ocid="endgame.play_again.primary_button"
          className="w-full py-4 rounded-full text-white font-black text-lg flex items-center justify-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.63 0.28 335), oklch(0.55 0.22 15))",
            boxShadow: "0 0 24px oklch(0.63 0.28 335 / 0.5)",
          }}
        >
          Play Again 🔄
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Difficulty Helpers ───────────────────────────────────────────────────────
function getLevelForRound(
  currentRound: number,
  totalRounds: number,
): DifficultyLevel {
  if (totalRounds <= 1) return "easy";
  if (currentRound === totalRounds) return "extreme";
  if (totalRounds === 2) return currentRound === 1 ? "easy" : "extreme";
  const progress = (currentRound - 1) / (totalRounds - 1);
  if (progress < 0.4) return "easy";
  if (progress < 0.75) return "medium";
  return "extreme";
}

function assignItemLevel(index: number, total: number): DifficultyLevel {
  const progress = index / total;
  if (progress < 0.34) return "easy";
  if (progress < 0.67) return "medium";
  return "extreme";
}

// ─── DifficultyPicker ─────────────────────────────────────────────────────────
function DifficultyPicker({
  playerName,
  totalRounds,
  usage,
  extremeUnlocked,
  onSelect,
  onUnlockExtreme,
}: {
  playerName: string;
  totalRounds: number;
  usage: { easy: number; medium: number; extreme: number };
  extremeUnlocked: boolean;
  onSelect: (level: "easy" | "medium" | "extreme") => void;
  onUnlockExtreme: () => void;
}) {
  const easyLimit = Math.ceil(totalRounds * 0.5);
  const mediumLimit = Math.ceil(totalRounds * 0.4);
  const extremeLimit = Math.max(1, Math.ceil(totalRounds * 0.3));

  const levels = [
    {
      id: "easy" as const,
      label: "Easy",
      emoji: "😄",
      desc: "Chill vibes, no cringe",
      used: usage.easy,
      limit: easyLimit,
      bg: "oklch(0.25 0.06 145)",
      border: "oklch(0.55 0.18 145)",
      text: "oklch(0.82 0.2 145)",
      badge: "oklch(0.45 0.16 145)",
    },
    {
      id: "medium" as const,
      label: "Medium",
      emoji: "😎",
      desc: "Getting spicy 🔥",
      used: usage.medium,
      limit: mediumLimit,
      bg: "oklch(0.25 0.07 80)",
      border: "oklch(0.65 0.18 80)",
      text: "oklch(0.88 0.18 80)",
      badge: "oklch(0.5 0.16 80)",
    },
    {
      id: "extreme" as const,
      label: "Extreme",
      emoji: "😈",
      desc: "Full send, no regrets",
      used: usage.extreme,
      limit: extremeLimit,
      bg: "oklch(0.22 0.07 25)",
      border: "oklch(0.6 0.22 25)",
      text: "oklch(0.82 0.22 25)",
      badge: "oklch(0.45 0.2 25)",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-5 pt-2 pb-4">
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-1">Your turn</p>
        <h2 className="text-2xl font-black text-foreground">{playerName}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Pick your difficulty 👇
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {levels.map((lvl) => {
          const exhausted = lvl.used >= lvl.limit;
          const isLocked = lvl.id === "extreme" && !extremeUnlocked;
          const disabled = exhausted && !isLocked;

          return (
            <button
              type="button"
              key={lvl.id}
              data-ocid={`difficulty.${lvl.id}.button`}
              onClick={() => {
                if (isLocked) {
                  onUnlockExtreme();
                  return;
                }
                if (!disabled) {
                  onSelect(lvl.id);
                }
              }}
              disabled={disabled && !isLocked}
              className="w-full rounded-2xl p-4 text-left transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: lvl.bg,
                border: `2px solid ${disabled ? "oklch(0.35 0.03 0)" : lvl.border}`,
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {isLocked ? "🔒" : lvl.emoji}
                  </span>
                  <div>
                    <div
                      className="font-black text-lg leading-tight"
                      style={{
                        color: disabled ? "oklch(0.5 0.02 0)" : lvl.text,
                      }}
                    >
                      {lvl.label}
                      {isLocked && (
                        <span
                          className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "oklch(0.63 0.28 335 / 0.25)",
                            color: "oklch(0.78 0.2 335)",
                            border: "1px solid oklch(0.63 0.28 335)",
                          }}
                        >
                          Unlock ₹19
                        </span>
                      )}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{
                        color: disabled
                          ? "oklch(0.4 0.02 0)"
                          : "oklch(0.65 0.04 0)",
                      }}
                    >
                      {lvl.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {!isLocked && (
                    <>
                      <div
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: disabled
                            ? "oklch(0.3 0.02 0)"
                            : lvl.badge,
                          color: disabled
                            ? "oklch(0.5 0.02 0)"
                            : "oklch(0.95 0.02 0)",
                        }}
                      >
                        {lvl.used}/{lvl.limit}
                      </div>
                      {disabled && (
                        <div
                          className="text-xs mt-1"
                          style={{ color: "oklch(0.5 0.02 0)" }}
                        >
                          Maxed out
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [phase, setPhase] = useState<AppPhase>("wheel");
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [extremeUnlocked, setExtremeUnlocked] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);
  const [playerDifficultyUsage, setPlayerDifficultyUsage] = useState<
    Array<{ easy: number; medium: number; extreme: number }>
  >([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("dare");
  const [selectedCategory, setSelectedCategory] = useState<string>("Funny");
  const [currentItem, setCurrentItem] = useState<Dare | null>(null);
  const [itemKey, setItemKey] = useState(0);

  const { data: dares } = useDaresByCategory(null);
  const { favorites, isFavorite, toggleFavorite, removeFavorite } =
    useFavorites();

  const getPool = useCallback(
    (type: ContentType, category: string, level?: DifficultyLevel): Dare[] => {
      let pool: Dare[];
      if (type === "truth") {
        pool = TRUTHS.filter((t) => t.category === category);
      } else if (type === "situation") {
        pool = SITUATIONS.filter((s) => s.category === category);
      } else {
        const backendPool = dares?.filter((d) => d.category === category);
        pool =
          backendPool && backendPool.length > 0
            ? backendPool
            : FALLBACK_DARES.filter((d) => d.category === category);
      }
      if (level) {
        const levelPool = pool.filter(
          (_, i) => assignItemLevel(i, pool.length) === level,
        );
        return levelPool.length > 0 ? levelPool : pool;
      }
      return pool;
    },
    [dares],
  );

  const pickItem = useCallback(
    (type: ContentType, category: string) => {
      const level =
        selectedDifficulty ??
        (gameActive ? getLevelForRound(currentRound, totalRounds) : undefined);
      const pool = getPool(type, category, level ?? undefined);
      if (pool.length === 0) {
        toast.error("No content for this category!");
        return;
      }
      const prefix =
        type === "truth"
          ? "dareme_truth_"
          : type === "situation"
            ? "dareme_situation_"
            : "dareme_seen_";
      const picked = pickSmartItem(pool, prefix, category);
      setCurrentItem(picked);
      setItemKey((k) => k + 1);
    },
    [getPool, currentRound, totalRounds, selectedDifficulty, gameActive],
  );

  const handleSpinResult = useCallback((type: ContentType) => {
    setContentType(type);
    setPhase("result");
  }, []);

  const handleResultContinue = useCallback(() => {
    if (gameActive) {
      setPhase("difficulty");
    } else {
      setSelectedDifficulty("easy");
      setPhase("categories");
    }
  }, [gameActive]);

  const handleCategorySelect = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      pickItem(contentType, category);
      setPhase("content");
    },
    [contentType, pickItem],
  );

  const handleNewItem = useCallback(() => {
    pickItem(contentType, selectedCategory);
  }, [contentType, selectedCategory, pickItem]);

  const handleNextPlayer = useCallback(() => {
    if (gameActive) {
      setPhase("rating");
    } else {
      setPhase("wheel");
      setCurrentItem(null);
    }
  }, [gameActive]);

  const handleRatingSubmit = useCallback(
    (avgScore: number) => {
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayerIndex] = (next[currentPlayerIndex] ?? 0) + avgScore;
        return next;
      });
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      const completedRound = nextIndex === 0;
      const newRound = completedRound ? currentRound + 1 : currentRound;
      setCurrentPlayerIndex(nextIndex);
      setCurrentItem(null);
      setSelectedDifficulty(null);
      if (completedRound && newRound > totalRounds) {
        setCurrentRound(newRound);
        setPhase("endgame");
      } else {
        if (completedRound) setCurrentRound(newRound);
        setPhase("wheel");
      }
    },
    [currentPlayerIndex, players.length, currentRound, totalRounds],
  );

  const handleStartGame = useCallback((names: string[], rounds: number) => {
    setPlayers(names);
    setScores(new Array(names.length).fill(0));
    setCurrentPlayerIndex(0);
    setTotalRounds(rounds);
    setCurrentRound(1);
    setGameActive(true);
    setPlayerDifficultyUsage(
      names.map(() => ({ easy: 0, medium: 0, extreme: 0 })),
    );
    setPhase("wheel");
  }, []);

  const handleEndGame = useCallback(() => {
    setPhase("endgame");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setScores(new Array(players.length).fill(0));
    setCurrentPlayerIndex(0);
    setCurrentItem(null);
    setCurrentRound(1);
    setPhase("setup");
    setGameActive(false);
  }, [players.length]);

  const copyCaption = useCallback((item: Dare) => {
    const text = `${item.caption} ${getHashtags(item.category)}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard! 📋");
    });
  }, []);

  const sharePrompt = useCallback(async (item: Dare, type: ContentType) => {
    const label =
      type === "truth" ? "Truth" : type === "dare" ? "Dared" : "Situation'd";
    const shareText = `I just got ${label}: "${item.dare}" on DareMe 💀 Think you can handle this? #DareMe`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DareMe", text: shareText });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success("Copied to clipboard! 📋");
      });
    }
  }, []);

  const handleFavoriteToggle = useCallback(() => {
    if (!currentItem) return;
    const wasAdded = !isFavorite(currentItem);
    toggleFavorite(currentItem);
    toast(wasAdded ? "Saved to favorites! 💖" : "Removed from favorites");
  }, [currentItem, isFavorite, toggleFavorite]);

  const currentYear = new Date().getFullYear();

  const currentLevel = getLevelForRound(currentRound, totalRounds);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Flame
            className="w-7 h-7"
            style={{ color: "oklch(0.63 0.28 335)" }}
          />
          <h1 className="text-3xl font-black tracking-tight gradient-text">
            DareMe
          </h1>
          <Zap className="w-6 h-6" style={{ color: "oklch(0.83 0.14 210)" }} />
        </div>
        <p className="text-muted-foreground text-sm mt-0.5">
          Truth · Dare · Situation 🎰
        </p>
      </header>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "discover" ? (
          <motion.main
            key="discover"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col items-center px-4 pb-28 pt-2 gap-4 max-w-lg mx-auto w-full"
          >
            <AnimatePresence mode="wait">
              {phase === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <PlayerSetup onStart={handleStartGame} />
                </motion.div>
              )}

              {phase === "wheel" && (
                <motion.div
                  key="wheel"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center pt-4 gap-4"
                >
                  {gameActive && players.length > 0 && (
                    <div
                      className="px-5 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: "oklch(0.63 0.28 335 / 0.25)",
                        border: "1.5px solid oklch(0.63 0.28 335)",
                      }}
                      data-ocid="wheel.player.badge"
                    >
                      🎯 {players[currentPlayerIndex]}'s Turn
                    </div>
                  )}
                  {gameActive && (
                    <div
                      className="px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: "oklch(0.83 0.14 210 / 0.2)",
                        border: "1.5px solid oklch(0.83 0.14 210)",
                        color: "oklch(0.83 0.14 210)",
                      }}
                      data-ocid="wheel.round.badge"
                    >
                      Round {currentRound} / {totalRounds}
                    </div>
                  )}
                  {gameActive && (
                    <div
                      className="px-4 py-1.5 rounded-full text-sm font-black"
                      style={{
                        backgroundColor:
                          currentLevel === "easy"
                            ? "oklch(0.55 0.2 140 / 0.2)"
                            : currentLevel === "medium"
                              ? "oklch(0.75 0.18 85 / 0.2)"
                              : "oklch(0.55 0.28 20 / 0.25)",
                        border: `1.5px solid ${currentLevel === "easy" ? "oklch(0.55 0.2 140)" : currentLevel === "medium" ? "oklch(0.75 0.18 85)" : "oklch(0.55 0.28 20)"}`,
                        color:
                          currentLevel === "easy"
                            ? "oklch(0.55 0.2 140)"
                            : currentLevel === "medium"
                              ? "oklch(0.75 0.18 85)"
                              : "oklch(0.55 0.28 20)",
                      }}
                      data-ocid="wheel.level.badge"
                    >
                      {currentLevel === "easy"
                        ? "😄 Easy"
                        : currentLevel === "medium"
                          ? "😎 Medium"
                          : "😈 Extreme"}
                    </div>
                  )}
                  <SpinWheel onResult={handleSpinResult} />
                  {gameActive ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={handleEndGame}
                      data-ocid="wheel.end_game.button"
                      className="w-full py-3 rounded-full font-black text-base flex items-center justify-center gap-2 border-2"
                      style={{
                        color: "oklch(0.85 0.18 85)",
                        borderColor: "oklch(0.85 0.18 85)",
                        backgroundColor: "oklch(0.85 0.18 85 / 0.08)",
                      }}
                    >
                      <Trophy className="w-5 h-5" />
                      End Game 🏆
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setPhase("setup")}
                      data-ocid="wheel.play_with_friends.button"
                      className="w-full py-3 rounded-full font-black text-base flex items-center justify-center gap-2 border-2 text-foreground"
                      style={{
                        borderColor: "oklch(0.35 0.05 230)",
                        backgroundColor: "oklch(0.18 0.02 230)",
                      }}
                    >
                      <Users className="w-5 h-5" />
                      Play with Friends 🎮
                    </motion.button>
                  )}
                </motion.div>
              )}

              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <ResultFlash
                    type={contentType}
                    onContinue={handleResultContinue}
                  />
                </motion.div>
              )}

              {phase === "difficulty" && (
                <motion.div
                  key="difficulty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <DifficultyPicker
                    playerName={players[currentPlayerIndex] ?? "Player"}
                    totalRounds={totalRounds}
                    usage={
                      playerDifficultyUsage[currentPlayerIndex] ?? {
                        easy: 0,
                        medium: 0,
                        extreme: 0,
                      }
                    }
                    extremeUnlocked={extremeUnlocked}
                    onSelect={(level) => {
                      setSelectedDifficulty(level);
                      setPlayerDifficultyUsage((prev) => {
                        const updated = [...prev];
                        updated[currentPlayerIndex] = {
                          ...updated[currentPlayerIndex],
                          [level]:
                            (updated[currentPlayerIndex]?.[level] ?? 0) + 1,
                        };
                        return updated;
                      });
                      setPhase("categories");
                    }}
                    onUnlockExtreme={() => setShowPaywall(true)}
                  />
                </motion.div>
              )}

              {phase === "categories" && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <CategorySelection
                    type={contentType}
                    onSelect={handleCategorySelect}
                  />
                </motion.div>
              )}

              {phase === "content" && currentItem && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <ContentCard
                    item={currentItem}
                    type={contentType}
                    category={selectedCategory}
                    onNew={handleNewItem}
                    onNextPlayer={handleNextPlayer}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorited={isFavorite(currentItem)}
                    onCopy={() => copyCaption(currentItem)}
                    onShare={() => sharePrompt(currentItem, contentType)}
                    cardKey={itemKey}
                  />
                </motion.div>
              )}

              {phase === "rating" && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <RatingPhase
                    players={players}
                    currentPlayerIndex={currentPlayerIndex}
                    currentItem={currentItem}
                    contentType={contentType}
                    onSubmit={handleRatingSubmit}
                  />
                </motion.div>
              )}

              {phase === "endgame" && (
                <motion.div
                  key="endgame"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <EndGame
                    players={players}
                    scores={scores}
                    onPlayAgain={handlePlayAgain}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        ) : (
          /* ── Favorites Tab ───────────────────────────────────────── */
          <motion.main
            key="favorites"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col items-center px-4 pb-28 gap-4 max-w-lg mx-auto w-full"
          >
            <div className="w-full pt-2">
              <p className="text-foreground font-bold text-lg">
                Saved Dares
                {favorites.length > 0 && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
                  >
                    {favorites.length}
                  </span>
                )}
              </p>
            </div>
            <AnimatePresence>
              {favorites.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center"
                  data-ocid="favorites.empty_state"
                >
                  <div className="text-6xl">💔</div>
                  <p className="text-foreground font-bold text-xl">
                    No favorites yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Save items you love!
                    <br />
                    Tap the{" "}
                    <Heart
                      className="inline w-4 h-4"
                      style={{ color: "oklch(0.63 0.28 335)" }}
                    />{" "}
                    on any card to save it here.
                  </p>
                  <button
                    type="button"
                    data-ocid="favorites.discover.button"
                    onClick={() => setActiveTab("discover")}
                    className="mt-2 px-6 py-3 rounded-full font-bold text-white pink-glow transition-all"
                    style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
                  >
                    Spin the Wheel!
                  </button>
                </motion.div>
              ) : (
                <div className="w-full flex flex-col gap-3">
                  <AnimatePresence>
                    {favorites.map((dare, i) => (
                      <FavoriteCard
                        key={dare.id.toString()}
                        dare={dare}
                        index={i}
                        onRemove={(d) => {
                          removeFavorite(d);
                          toast("Removed from favorites");
                        }}
                        onCopy={copyCaption}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <button
          type="button"
          data-ocid="nav.discover.tab"
          onClick={() => setActiveTab("discover")}
          className={[
            "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors relative",
            activeTab === "discover" ? "" : "text-muted-foreground",
          ].join(" ")}
          style={
            activeTab === "discover" ? { color: "oklch(0.63 0.28 335)" } : {}
          }
        >
          <Dices className="w-5 h-5" />
          Discover
          {activeTab === "discover" && (
            <span
              className="absolute bottom-0 w-12 h-0.5 rounded-full"
              style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
            />
          )}
        </button>

        <button
          type="button"
          data-ocid="nav.favorites.tab"
          onClick={() => setActiveTab("favorites")}
          className={[
            "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors relative",
            activeTab === "favorites" ? "" : "text-muted-foreground",
          ].join(" ")}
          style={
            activeTab === "favorites" ? { color: "oklch(0.63 0.28 335)" } : {}
          }
        >
          <Heart
            className="w-5 h-5"
            fill={activeTab === "favorites" ? "oklch(0.63 0.28 335)" : "none"}
            strokeWidth={activeTab === "favorites" ? 0 : 2}
          />
          Favorites
          {favorites.length > 0 && (
            <span
              className="absolute top-2 right-1/4 translate-x-2 -translate-y-0.5 w-4 h-4 rounded-full text-white text-[10px] font-black flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
            >
              {favorites.length > 9 ? "9+" : favorites.length}
            </span>
          )}
          {activeTab === "favorites" && (
            <span
              className="absolute bottom-0 w-12 h-0.5 rounded-full"
              style={{ backgroundColor: "oklch(0.63 0.28 335)" }}
            />
          )}
        </button>
      </nav>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
            onClick={() => setShowPaywall(false)}
            data-ocid="paywall.modal"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
              style={{
                background: "oklch(0.14 0.02 270)",
                border: "1.5px solid oklch(0.63 0.28 335 / 0.5)",
              }}
            >
              <div className="text-5xl">😈</div>
              <h2 className="text-2xl font-black text-white">Extreme Dares</h2>
              <p className="text-muted-foreground text-sm">
                Unlock the wildest, most share-worthy dares that will make
                everyone scream 💀
              </p>
              <div className="flex flex-col gap-2 w-full text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  ✅ 100+ Extreme dares across all categories
                </div>
                <div className="flex items-center gap-2">
                  ✅ Viral-worthy moments guaranteed
                </div>
                <div className="flex items-center gap-2">
                  ✅ Unlock once, play forever
                </div>
              </div>
              <button
                type="button"
                data-ocid="paywall.confirm_button"
                onClick={() => {
                  setExtremeUnlocked(true);
                  setShowPaywall(false);
                  toast.success("Extreme Dares unlocked! 😈");
                }}
                className="w-full py-4 rounded-full font-black text-lg text-white"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.28 20), oklch(0.45 0.25 340))",
                  boxShadow: "0 0 30px oklch(0.55 0.28 20 / 0.5)",
                }}
              >
                🔥 Unlock for ₹19
              </button>
              <button
                type="button"
                data-ocid="paywall.cancel_button"
                onClick={() => setShowPaywall(false)}
                className="text-muted-foreground text-sm underline"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-4 text-center pb-28">
        <p className="text-muted-foreground text-xs">
          © {currentYear}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
