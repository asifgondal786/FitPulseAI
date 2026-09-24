# FITPULSE AI — THE COMPLETE MASTER PLAN

**Version 2.0 — Unified Intelligence Architecture & Build Roadmap**

> This is the governing product and architecture plan, reproduced verbatim from the document
> provided on 2026-09-23. It is the authority for phasing decisions; `PROJECT.md` records what
> has actually been built against it.

---

## PREAMBLE: WHAT THIS DOCUMENT IS

This is the **single source of truth** for building FitPulse AI. It merges:
- Your original FitPulse AI Master Specification
- Your Voice Interaction & Smart Notification Add-On
- Your two market research/roadmap PDFs
- The strategic insights from our conversation (unified coach, ML/DL reduction of API dependency)

**The core thesis:** FitPulse is **one coach, one mind, one relationship** — powered primarily by **proprietary on-device ML/DL models**, with external LLMs reserved for complex reasoning only.

---

# SECTION 1: PRODUCT IDENTITY

## 1.1 The One-Sentence Definition

> **FitPulse AI is a cross-platform intelligent fitness and wellness ecosystem that combines on-device computer vision, proprietary ML/DL models, wearable data, nutrition intelligence, health and recovery guidance, deterministic calculations, and selective LLM reasoning to create a single, continuously personalized AI coach.**

## 1.2 The Wedge: One Coach, Not Three

**The mistake to avoid:** Building three separate coaches (fitness, nutrition, recovery) that talk to each other.

**The right approach:** One coach with three knowledge domains, one voice, one relationship. The user never selects a "mode." They just talk to their coach.

**The architecture:**
- One Reasoning Engine
- One Unified Knowledge Layer
- One Safety Layer
- One Voice

## 1.3 The User Promise

For the initial wedge user — **the busy professional who has quit 3+ fitness apps before**:

> *"FitPulse is the AI coach that notices when you're about to quit — before you do. It remembers you, adapts to your life, and never makes you feel guilty."*

## 1.4 The Magic Differentiators (Ranked by Impact)

| Rank | Differentiator | Why It's Magic | Buildability |
|---|---|---|---|
| 1 | **On-Device Intelligence** | Rep counting, food logging, intent classification all run locally — $0 API cost, works offline, private | High |
| 2 | **Unified Coach with Memory** | One coach remembers everything across all domains | High |
| 3 | **Predictive Intervention** | Notices quit patterns 3-5 days early, intervenes personally | Medium |
| 4 | **Urdu/Roman Urdu Voice** | Unserved market globally | Medium |
| 5 | **Cross-Domain Reasoning** | Connects sleep → nutrition → training in one insight | High |
| 6 | **"Bad Day" Mode** | One tap removes guilt, offers alternative | Low |
| 7 | **Sunday Letter** | Personal letter, not stats report | Low |

---

# SECTION 2: THE UNIFIED COACH ARCHITECTURE

## 2.1 Architectural Principle

**There are no "modules" or "modes." There is one reasoning engine with access to three knowledge sources.**

```
User Input (text/voice)
         ↓
┌─────────────────────────────────────┐
│  INTENT CLASSIFIER (On-Device)      │
│  Routes to appropriate handler      │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  RETRIEVAL LAYER                    │
│  1. User's personal data (priority)  │
│  2. User's history (priority)        │
│  3. Domain knowledge base            │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  REASONING ENGINE                   │
│  One mind. Three knowledge domains. │
│  - Fitness science                  │
│  - Nutrition science                │
│  - Recovery & injury knowledge      │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  SAFETY LAYER (Silent)              │
│  Constrains output. Never surfaces  │
│  as a "mode."                       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  RESPONSE GENERATOR                 │
│  One voice. One personality.        │
│  Text + Voice output                │
└─────────────────────────────────────┘
```

## 2.2 The Reasoning Engine

**Single prompt architecture** — not three prompts stitched together. The engine receives:
- User query
- Retrieved user data
- Retrieved domain knowledge
- Safety constraints

And generates **one coherent response**.

**Prompt structure:**
```
[SYSTEM: You are FitPulse, a unified fitness coach. You have access to the user's complete data across fitness, nutrition, and recovery. Respond as ONE person. Never say "switching to nutrition mode" or "my fitness module says..."]

[USER CONTEXT: {retrieved_profile}]
[RECENT HISTORY: {last_7_days}]
[USER MEMORY: {vector_memories}]
[DOMAIN KNOWLEDGE: {retrieved_knowledge}]

[SAFETY: {constraints}]

[USER QUERY: {query}]
```

## 2.3 Cross-Domain Reasoning Examples

**What the unified coach can say that no competitor can:**

| User Situation | Unified Coach Response |
|---|---|
| Squat stalled 3 weeks | *"Your squat hasn't moved in 3 weeks. I looked at your nutrition — protein is 40g short most days. And your sleep dropped 90 minutes. This isn't a training problem. It's fuel-and-recovery. Let's fix those for 10 days, then retest."* |
| Knee pain + poor sleep + 4 hard sessions | *"Normally I'd say train today. But your knee's been off, sleep was 5.2 hours, and you've done 4 hard sessions. Today is rest. Not because you're weak — because you're smart."* |
| Frustrated with slow progress | *"Three weeks ago you couldn't do 8 push-ups. Today you did 12. Your scale hasn't moved, but your strength has. That's not slow. That's real."* |

---

# SECTION 3: THE ML/DL ARCHITECTURE (REDUCING API DEPENDENCY)

## 3.1 The Strategy

**Replace tasks, not intelligence.** External LLMs handle only what they uniquely do well: flexible natural language reasoning. Everything deterministic or classifiable moves on-device.

**Target: 70-80% API dependency reduction.**

## 3.2 Layer 1: On-Device Computer Vision

### Pose Estimation for Rep Counting

**Recommended: MediaPipe Pose** — validated clinically, 33 keypoints, runs at >30 FPS on mobile GPU .

**Alternative: YOLOv8-pose** — 17 keypoints, faster on CPU (9.2 GFLOPs vs 30+ for MediaPipe), supports ONNX/OpenVINO export for 1.3-1.8x CPU speedup .

**Recommendation:** MediaPipe for accuracy (33 keypoints include hands), YOLO for speed-constrained devices.

**Pipeline:**
1. Camera frame → Pose model → Keypoints
2. State machine tracks movement cycles
3. Rep counted on full cycle completion
4. Exercise classified via small classifier on keypoint sequences

**Exercises supported:** Push-ups, squats, lunges, sit-ups, jumping jacks, burpees, planks.

### Food Recognition

**Recommended: `nextvit_small_384`** — 92.2% accuracy, 30.7M params, CoreML deployable (iPhone/iPad) .

**Alternative: `csatv2_11m`** — fastest throughput (4639 img/s), 92.2% accuracy, 10.7M params .

**For full nutrition:** `boba-0.8b-food` — on-device food VLM, outputs per-ingredient nutrition JSON, 505 MB quantized .

**Integration:** Use ML Kit's custom model support to deploy TensorFlow Lite models with high-level APIs .

### Exercise Classification

**Train a small classifier** on keypoint sequences. Input: pose keypoints over 2-second windows. Output: exercise label.

**Training data:** Use existing datasets like "Gym Gesture Classification Using IMU Sensor Dataset" (1,500 labeled reps across 5 exercises)  or RepDB exercise dataset (250 exercises, images + MET values) .

## 3.3 Layer 2: Intent Classification (On-Device)

**Train a small classifier** (tiny neural network or fine-tuned BERT) mapping user input → intent category:
- `workout_request`
- `nutrition_question`
- `recovery_concern`
- `progress_check`
- `motivation_needed`
- `general_chat`

**Only `general_chat` and complex multi-domain queries need external LLM.**

## 3.4 Layer 3: Small Language Models (On-Device)

### What Works in 2026

| Model | Params | Device | Performance | Use Case |
|---|---|---|---|---|
| **SignalFit-SLM 1.7B** | 1.7B | iPhone 15 Pro | 29-33 tok/s, 1.03 GB peak | Fitness-specific, grounded in wearable data  |
| **MiniCPM 1B** | 1B | Any (GGUF) | Ultra-lightweight | Basic chat  |
| **Gemma 4 E2B/E4B** | 2-4B | iPhone | 40+ tok/s | General reasoning  |
| **Bharat-Tiny-LLM** | 1.5B | $80 Android | Offline | Hindi/Hinglish  |

### Fine-Tuning Strategy

**Use LoRA** — cheap, fast, effective for domain adaptation. IBM Research findings: larger batch sizes + lower learning rates improve performance; early-stage training dynamics predict final quality; stacked training is simpler and more sample-efficient than phased .

**Data:** Collect coaching conversations (with consent), create synthetic fitness Q&A datasets .

**Deployment:** MLX for Apple Silicon, GGUF/llama.cpp for cross-platform .

## 3.5 Layer 4: Knowledge Base (RAG)

**The intelligence isn't the model — it's the knowledge.**

**Build:**
- Exercise Science Database: 500+ exercises, muscle mappings, progressions, contraindications
- Nutrition Database: Local foods (Pakistani/Indian), meal templates, restaurant alternatives
- User Memory: Vector store of preferences, injuries, patterns

**RAG pattern:** User query → retrieve → SLM reasons over retrieved facts.

---

# SECTION 4: THE COMPLETE FEATURE SPECIFICATION

## 4.1 Onboarding: "5 Minutes to First Workout"

**The Magic Onboarding:**

1. **One question:** "What's your #1 goal?" (5 options, 1 tap)
2. **One promise:** "Here's a 12-minute workout you can do right now."
3. **One action:** User does workout *before* account creation.
4. **One reveal:** "Want me to remember this so I can coach you better?" → Sign up.

**Progressive profiling over first 7 days:**
- After Workout 1: "How was that?"
- After Workout 2: "Where do you work out?"
- After Workout 3: "What equipment do you have?"
- Day 3: "When can you realistically work out?"
- Day 5: "Any injuries to be careful with?"
- Day 7: "Let's set up nutrition — snap a photo."

## 4.2 Core Workout System

**Tracks (start with 3):**
- Fat Loss
- Muscle Building
- General Health

**Features:**
- Equipment-aware generation
- Time-adaptive ("I have 20 minutes")
- Progressive overload tracking
- Exercise substitution engine
- RPE/RIR autoregulation
- Offline mode

## 4.3 Nutrition System

**Logging methods (in order of ease):**
1. AI Photo Log (on-device classifier) — <15 seconds
2. Barcode Scan
3. Voice Log
4. Manual Entry

**Features:**
- Adaptive macro targets (auto-adjust based on progress)
- Meal timing recommendations
- Grocery lists
- Local cuisine recognition (biryani, daal, roti, chai)
- Ramadan fasting mode

## 4.4 Recovery & Health

**Features:**
- Recovery score (sleep + HRV + soreness)
- Training readiness (Green/Yellow/Red)
- Auto-adjustment (reduce volume if recovery <40)
- User-reported injury tracking
- Conservative guidance (never diagnosis)

**Safety layer:**
- Red-flag detection (chest pain, breathing difficulty, etc.)
- Professional referral prompts
- Evidence-based information only

## 4.5 Voice Interaction

**Voice pipeline:**
```
User Speech → STT → Intent Classification → Reasoner → Response → TTS → Natural Voice
```

**Voice personalities (4, not 8):**
- Friendly & Warm
- Professional & Calm
- Energetic & Motivational
- Child-Friendly (1 option)

**Languages (v1):**
- English
- Urdu
- Roman Urdu

**Hands-free workout mode:**
- "Start workout" → "Workout started"
- "12 reps completed" → "Three more"
- "Rest for 45 seconds" → "Next: lunges"
- Interruption/barge-in supported

## 4.6 Smart Notifications

**Primary:** In-app notifications
**Secondary:** Email (opt-in)
**Optional/Future:** WhatsApp (only with official API)

**Notification types:**
- Workout reminder / completion / missed
- Meal reminder / hydration
- Recovery reminder
- Weekly report / milestone
- AI coach recommendations

**Anti-spam:** Intelligent, user-controlled frequency.

## 4.7 Reports

**Daily AI Report:**
- Activity, Nutrition, Recovery, Progress, AI Summary

**Weekly AI Report:**
- Workouts, Activity, Running, Nutrition adherence, Weight trend, AI observations

**Report Center:**
- Today, Yesterday, This Week, Last Week, This Month, Custom range

---

# SECTION 5: DEVELOPMENT ROADMAP

## Phase 0: Wedge Decision (Weeks 1-2)
- Define the ONE user
- Write 1-page User Promise
- No code

## Phase 1: "First 5 Minutes" (Weeks 3-8)
**Build:** Onboarding → static workout → signup
**Do NOT build:** AI, CV, voice, nutrition, wearables

## Phase 2: Memory Engine (Weeks 9-16)
**Build:** User Genome, Vector Memory, "Coach Remembers" demo
**Magic moment:** Week 4: "I've been avoiding lunges since you mentioned your knee."

## Phase 3: Predictive Intervention (Weeks 17-28)
**Build:** Churn model (rules first), personalized interventions
**Why:** No fitness app does this.

## Phase 4: Voice + Hands-Free (Weeks 29-40)
**Build:** Voice workout mode, 4 voices, English + Urdu
**Why wait:** Voice is a multiplier on a good product.

## Phase 5: Ecosystem (Months 10+)
**Build:** Wearables, reports, email, social, gamification
**Rule:** Every feature justified by retention data or user requests.

---

# SECTION 6: THE ML/DL BUILD PLAN

## 6.1 What to Build First

| Component | Difficulty | Timeline | API Reduction |
|---|---|---|---|
| Pose estimation + rep counting | Medium | 2-3 months | Eliminates vision API for workouts |
| Food classifier | Medium | 2-3 months | Eliminates vision API for nutrition |
| Intent classifier | Low | 1 month | Reduces LLM routing calls |
| Knowledge base + RAG | Medium | 3-4 months | Enables SLM grounding |
| SLM fine-tuning | High | 4-6 months | Handles 70% of conversations |

## 6.2 Technology Stack

**Mobile:** React Native or Flutter (cross-platform) / Native for max performance

**Backend:** Node.js (TypeScript) or Go / GraphQL or REST

**Database:** PostgreSQL + Redis + TimescaleDB + Pinecone/Weaviate

**On-Device ML:**
- MediaPipe Pose (CV)
- nextvit_small_384 (food)
- SignalFit-SLM 1.7B or MiniCPM 1B (conversation)

**External LLM (selective):** Claude/GPT-4o for complex multi-domain reasoning

**Voice:** Whisper (STT) + ElevenLabs/Amazon Polly (TTS)

**Cloud:** AWS/GCP, serverless for event-driven tasks

## 6.3 Cost Control Architecture

```
User Input
    ↓
Intent Classifier (local)
    ↓
┌─────────────────────────────────────┐
│ IF simple/deterministic:             │
│   → Local engine → $0                │
│                                      │
│ IF domain-specific:                  │
│   → RAG + SLM → $0                   │
│                                      │
│ IF complex/cross-domain:             │
│   → External LLM → paid              │
└─────────────────────────────────────┘
```

**Result:** 70-80% fewer API calls.

---

# SECTION 7: SAFETY & PRIVACY

## 7.1 Safety Layer (Silent)

**Never surfaces as a mode.** Always constrains output.

**Rules:**
- No diagnosis — only "conditions that can cause similar symptoms"
- Red-flag detection → urgent care prompt
- Evidence hierarchy (Tier 1-5)
- Uncertainty handling
- Professional referral when warranted

**Red flags:** Severe chest pain, breathing difficulty, loss of consciousness, major trauma, sudden neurological symptoms, severe bleeding.

## 7.2 Privacy

- Encryption at rest (AES-256) and in transit (TLS 1.3)
- On-device processing where possible
- Granular consent per data type
- Data export and true deletion
- No data selling
- Anonymize before ML training

---

# SECTION 8: BUSINESS MODEL

## 8.1 Tiers

| Tier | Price | Features |
|---|---|---|
| Free | $0 | 3 AI workouts/week, basic nutrition, progress tracking |
| Pro | $14.99/mo or $99/yr | Unlimited workouts, full nutrition AI, voice, advanced analytics |
| Elite | $29.99/mo or $199/yr | Everything + monthly human coach check-in, family sharing |

## 8.2 Additional Revenue
- Premium programs ($9.99)
- Affiliate (equipment, supplements)
- Corporate wellness ($10/employee/month)

---

# SECTION 9: THE SPRINKLE OF MAGIC

## 9.1 The Seven Magic Features

1. **Sunday Letter** — Personal letter, not stats. *"You struggled Thursday. Next week Wednesday is lighter. Also — your squat depth improved. I noticed."*

2. **Why Button** — Tap for explanation. *"Why 3 sets? Because your last 2 sessions declined in set 4."*

3. **Bad Day Mode** — One tap: *"5-minute mobility or rest day — your call."*

4. **Comeback Message** — After 7+ days away: *"You're back. That's the hard part. We start fresh today."*

5. **Local Food Edge** — Biryani, daal, roti, chai with real macros. Ramadan mode. **No global competitor will do this.**

6. **Voice Note Coach** — Send voice note in Urdu, get voice + text response.

7. **Progress Narrative** — *"Six weeks ago you couldn't do a full push-up. Today you did 8. That's not a number — that's a change."*

## 9.2 The Magic Principle

> **"Your magic is not in what you add. It's in what you refuse to add."**

---

# SECTION 10: SUCCESS METRICS

| Metric | Target | Industry Benchmark |
|---|---|---|
| Day-1 activation | >70% complete first workout | ~30% |
| Day-7 retention | >25% | ~10% |
| Day-30 retention | >15% | 3% |
| Workouts/user/week | >2 | ~1.2 |
| NPS | >40 | ~20 |
| API dependency | <30% of queries | 100% |

---

# SECTION 11: WHAT TO CUT (BE RUTHLESS)

| Feature | Why Cut (for v1) |
|---|---|
| Full CV form analysis | 6+ months; ship rep counting only |
| 8 voice personalities | 4 is enough |
| WhatsApp integration | Cost + approval burden |
| Child-friendly voices | Nice-to-have |
| AR coaching | No demand |
| 7 fitness tracks | Start with 3 |
| Social/community | Single-player first |
| Full medical triage | Legally risky |
| 8+ languages | English + Urdu only |

---

# SECTION 12: THE ONE-SENTENCE NORTH STAR

> **"FitPulse is the AI coach that remembers you, notices when you're about to quit, and adapts before you do — in your language, on your schedule, with no guilt."**

Every decision tested against this sentence. If a feature doesn't serve it, cut it.

---

# APPENDIX A: BUILD SEQUENCE SUMMARY

| Phase | Weeks | Deliverable | API Dependency |
|---|---|---|---|
| 0 | 1-2 | Wedge decision | 100% |
| 1 | 3-8 | First 5 Minutes | 100% |
| 2 | 9-16 | Memory Engine | 90% |
| 3 | 17-28 | Predictive Intervention | 80% |
| 4 | 29-40 | Voice + Urdu | 60% |
| 5 | 41-52 | Full ecosystem | 30% |
| 6 | Year 2+ | Advanced ML/DL | <20% |

---

# APPENDIX B: THE FINAL ARCHITECTURE DIAGRAM

```
                    USER
                      │
                      ▼
              ┌───────────────┐
              │  ONE COACH    │  ← One voice, one relationship
              │  (Reasoner)   │  ← One reasoning engine
              └───────┬───────┘
                      │
              ┌───────▼────────────────────────┐
              │  UNIFIED KNOWLEDGE LAYER       │
              │  • Fitness science             │
              │  • Nutrition science           │
              │  • Recovery & injury           │
              │  • User's personal history     │
              │  • Real-time biometric data    │
              └───────┬────────────────────────┘
                      │
              ┌───────▼────────┐
              │  SAFETY LAYER  │  ← Silent
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  ON-DEVICE ML  │  ← Pose, food, intent, SLM
              │  (70-80% of    │
              │   queries)     │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  EXTERNAL LLM  │  ← Only for complex
              │  (20-30%)      │     cross-domain reasoning
              └───────┬────────┘
                      │
                      ▼
              ┌───────────────┐
              │  ONE RESPONSE │
              └───────────────┘
```

---

**END OF MASTER PLAN**

This document preserves the full conceptual scope of your original specifications while providing a **doable, phased path** to build a distinctive product that is **less dependent on external AI**, **more personal**, and **harder to copy**.