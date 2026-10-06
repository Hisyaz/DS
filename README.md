# DRAWSTAR — CANONICAL UNIQUE CAREER & CORE ARCHITECTURE

> **SOURCE OF TRUTH**: Strict specification for Unique Career lifecycle, state transitions, and simulation compatibility. Existing engine mechanics remain authoritative.

---

# UNIQUE CAREER

Character Creation → City Choice → Position Choice → Parent Card Draw → Parent Card Cinematic → 4-Choice Career Start

## CHARACTER CREATION
- Use existing Unique Career character creation system.

## CITY
- City determines nationality via existing city system.

## POSITION
- Choose player's broad starting position via existing system.

## PARENT CARD
- Draw Parent Card via existing Parent Card system.
- Each Parent Card triggers unique short cinematic describing early life before age 10.

## CAREER START CHOICES
After Parent cinematic:
1. **Join Big Club**
2. **Join Local Club**
3. **Play on the Streets**
4. **Tryouts**

---

# YOUTH ACADEMY

Big Club / Local Club → Youth Academy

- Play seasons with assigned youth-league team.
- **Top 2 Finish**: International Youth League qualification.
- **Opportunities**: U17 national-team call-ups & U17 World Cup.
- Existing youth simulation/progression remains authoritative.

## AGE 16 GRADUATION
- Occurs at age 16.
- Trigger Graduation modal.
- Generate pro offers from existing: Fame, OVR, Potential, Club requirements, Eligibility.
- **Offer Count**: Min 0, Max 4.
- If >4 clubs qualify, select top 4:
  1. Highest Development Tier
  2. Highest Salary
  3. Highest Glory/Renown
  4. Best Local Club (if international offers exist) OR Highest-OVR eligible club (if only national offers exist)
- Player selects from presented offers.

---

# STREET-ONLY PATH

If player never joined Big/Local Youth Academy:
- **Before age 16**: Normal Street progression.
- **At age 16**:
  - Remove *Join Big Club* / *Join Local Club* choices.
  - Enter **FREE AGENT MODE**.

---

# FREE AGENT MODE

Persistent state: `Age >= 16` + `no professional contract` → **FREE_AGENT**

### Main Actions
1. **Agent**
2. **Tryouts**
3. **Play on Streets**

### Ancillary Hub Access
- Card + Card Preview
- Customization
- Unique Career Store (*Unique Career Store ≠ Card Store*)
- Economics
- Development
- Special Events

## POST-16 STREET PROGRESSION
Street roll distribution:
- **Low (1–15)**: 30%
- **Normal (15–20)**: 60%
- **High (21–50)**: 10%
- Use existing Street progression mechanics with these calibrated values.

---

# AGENTS

- **Card-Based**: Agents are Cards, NOT generic NPCs.
- Drawn as cards using existing card/odds framework.
- Each Agent Card possesses **3 Agent Stats**.
- Rarity/quality governed by existing Agent draw odds.
- Agent stats boost networking and Fame opportunities.

## AGENT NETWORKING
- **Calculation Formula**:
  $$\text{Networking Result} = 50\%\ \text{Player Fame} + 50\%\ \text{Agent Network}$$
- Use existing networking calculation across all modules.
- Agent stats determine Agent Network contribution (never flat generic bonuses).
- Agent Cards must maintain full compatibility with:
  - Card rarity & draw odds
  - Ownership & selection
  - Networking & Fame calculations
  - Free Agent Mode & pro contract opportunities
- **Action Flow**:
  - No Agent → *Find an Agent*
  - Has Agent → *Speak to Agent / Manage existing Agent*
- Do NOT create a separate or redundant Agent system.

---

# FREE AGENT EVENTS

Expandable event framework for unsigned players.

## SPECIAL TOURNAMENT
- Player receives invitation.
- Random team from existing leagues temporarily loans/selects player.
- Player participates in friendly preseason tournament (performance tracked).
- Strong performance (Top Scorer, MVP, Top Creator, High Rating) → Team may offer professional contract.
- Failure / no offer → Return to Free Agent Mode.

## FREESTYLE EVENT
- Player receives street invitation.
- Uses existing QTE/event framework.
- **Success**: Fame increase + cash reward.
- **Failure**: Standard resolution.
- Return to Free Agent Mode.

---

# PROFESSIONAL CAREER

Pro contract signed: **FREE_AGENT → PROFESSIONAL_CAREER**

- Reuses existing Professional Career engine (never create a duplicate career loop).
- Integrates existing:
  - Calendar & fixtures
  - Match simulation & ratings
  - World Results
  - Transfers & contract negotiations
  - Competitions & records
  - Career statistics & annual awards
  - Career Hub & league-specific UI

## WORLD RESULTS
- **Authoritative**: World Results engine governs all background and league match results.
- Never independently simulate a match already in World Results.
- Prevent duplicate matches, goals, assists, ratings, club standings, or stats.
- Key Matches continue using existing pause / interruption / resume system.

## CONTRACT END
- **Contract expires + new contract signed** → Continue Professional Career.
- **Contract expires + no contract** → **FREE_AGENT**.
- Free Agent Mode can occur multiple times across a player's lifetime.

---

# CANONICAL STATE FLOW

### 1. Academy Route (Big / Local)
Character → City → Position → Parent → Youth Academy → Age 16 Graduation → Pro Offers → Professional Career

### 2. Street-Only Route
Character → City → Position → Parent → Streets → Age 16 → Free Agent → Agent / Tryouts / Streets / Events → Pro Contract → Professional Career

### 3. Professional Lifecycle & Free Agency
Professional Career → Contract End →
  - **Renew / Sign** → Professional Career
  - **Unsigned** → Free Agent Mode (re-enters cycle)

*Existing engine mechanics remain authoritative unless explicitly changed.*

---

# GRAPHIC QUALITY PRESETS & ARCHITECTURE SPECIFICATION

> **SOURCE OF TRUTH FOR VISUAL PRESENTATION MODES**: Governs the 3 rendering modes selectable in Settings (`Balanced`, `Performance`, `High Quality`).
> **CRITICAL RULE**: Quality presets change **ONLY visual presentation, DOM styles, shaders, rendering pipelines, and asset density**. Quality presets **MUST NEVER alter, skip, or modify gameplay logic, math, RNG, state transitions, save files, or career progression**.

---

## 1. QUALITY PRESET COMPARISON MATRIX

| Preset | Target Platform | Visual Paradigm | Progress | Core Technique |
| :--- | :--- | :--- | :--- | :--- |
| **Balanced** | Standard PCs, Laptops, Mainstream Phones | **32-Bit Retro Arcade (SNES / Neo Geo / GBA)** | **65% Complete** | Pixel bevels, stepped borders (`pixel-corners`), scanlines, arcade typography (`Press Start 2P`, `Silkscreen`, `Chakra Petch`). |
| **Performance** | Low-End Android, Budget iOS, Chromebooks, Old PCs | **Ultra-Simplistic Flat Minimalist** | **0% Complete** (Stubbed / Inactive) | Complete removal of all heavy shaders, blurs, scanlines, drop-shadows, glow filters, and complex borders. Pure solid colors (`rgb/hex`), zero border bevels, native system font scaling, maximum DOM compositing speed. |
| **High Quality** | High-End PCs, Flagship iOS/Android, Ultra Displays | **Modern Next-Gen Cyber-Arcade Glass** | **0% Complete** (Stubbed / Inactive) | Photorealistic stadium atmospheres, multi-layered mesh gradients, dynamic holographic glassmorphism, GPU particle emitters, 3D card tilt & parallax depth, high-res vector typography, ambient neon bloom. |

---

## 2. PRESET SPECIFICATIONS & IMPLEMENTATION GUIDELINES

### A. BALANCED MODE (Current Baseline: 32-Bit Retro Arcade)
- **Current Status**: **65% Implemented across the codebase**.
- **Visual Identity**: Mid-90s Japanese arcade sports game (Capcom CPS-2, Neo Geo, SNES, early PS1 2D).
- **Mandatory Visual Rules**:
  1. **Borders & Corners**: Strictly stepped orthogonal pixel corners (`.pixel-corners` polygon clip-paths) and tactile directional highlights (`.pixel-bevel-raised`, `.pixel-bevel-gold`, `.pixel-bevel-cyan`, `.pixel-bevel-crimson`).
  2. **Typography**: Headings in `font-arcade` (`Silkscreen`), stat labels/chips in `font-pixel` (`Press Start 2P`), body narrative in `font-retro` (`Chakra Petch`).
  3. **Atmosphere**: Subtle CRT scanlines (`.pixel-scanlines`), halftone dither checkerboards (`.pixel-dither-pattern`).
  4. **Palette**: Deep void slate (`#020617`, `#0f172a`), arcade golds (`#f59e0b`), neon cyan (`#06b6d4`), and stadium pitch greens (`#052e16`).
- **Missing Elements**: See *Section 3: 32-Bit Scan & Migration Backlog*.

---

### B. PERFORMANCE MODE (Ultra-Simplistic Flat Minimalist)
- **Current Status**: **0% Implemented** (Flag defined in `graphicSettingsSystem.ts`; full UI conversion required).
- **Target Audience**: Low-end Android devices (Mali-G52, Adreno 5xx), budget tablets, legacy laptops, battery-saver execution.
- **Goal**: Absolute maximum fluidity (solid 60/120 FPS) by stripping every visual luxury while keeping colors distinguishable.
- **Architectural Rules for AI Implementation**:
  1. **Zero Backdrop Shaders**:
     - Replace all `backdrop-blur-*` with solid high-opacity backgrounds (e.g., `bg-slate-950` with no opacity or blur).
     - GPU compositors must NEVER sample the frame buffer behind modals or floating bars.
  2. **Zero Overdraw Shadows & Glows**:
     - Strip all `shadow-[0_0_...px]`, `drop-shadow-*`, and `pixel-text-shadow`.
     - Replace with 1px solid borders (`border border-slate-700`).
  3. **Zero Scanlines & Dither Overlays**:
     - Set `.pixel-scanlines` and `.pixel-dither-pattern` to `display: none !important`.
  4. **Flat Borders & Rectangles**:
     - Remove complex polygon `clip-path` calculations (`pixel-corners`).
     - Use square, unclipped corners or standard `rounded-none`.
  5. **Animation & Transition Halting**:
     - Disable ambient CSS pulse keyframes (`animate-pulse`, `animate-bounce`, continuous infinite rotations).
     - Modals and tabs snap into place instantly (0ms transition duration).
  6. **Color Differentiation Preserved**:
     - Rarity and archetypes still use distinctive solid accent colors (Gold `#eab308`, Iconic `#d97706`, Legendary `#a855f7`, Common `#94a3b8`) for quick identification.
  7. **Implementation Pattern in DOM**:
     - Root attribute: `html[data-quality="performance"]` or class `.perf-mode-active`.
     - Components should conditionally render simplified wrappers or rely on global CSS overrides that neutralize computationally expensive utility classes.

---

### C. HIGH QUALITY MODE (Modern Next-Gen Cyber-Arcade Glass)
- **Current Status**: **0% Implemented** (Flag defined in `graphicSettingsSystem.ts`; full visual upgrade required).
- **Target Audience**: High-end PCs, flagship phones (Apple A17/M-series, Snapdragon 8 Gen 2/3), dedicated gaming displays.
- **Goal**: Breathtaking visual luxury, dynamic depth, vibrant glassmorphism, responsive lighting, and cinematic fluidity.
- **Architectural Rules for AI Implementation**:
  1. **Advanced Glassmorphism & Depth**:
     - Deep multi-layer frosted glass panels (`backdrop-blur-2xl bg-slate-900/60 border border-white/10`).
     - Specular highlight gradients on top borders to simulate real glass edge refraction.
  2. **Volumetric Lighting & Neon Glows**:
     - Dynamic neon ambient underglows keyed to player tier and competition brand (`shadow-[0_8px_32px_rgba(brand,0.4)]`).
     - Animated iridescent border shimmers on Iconic and GOAT tier player cards.
  3. **Interactive 3D Gyro / Parallax Tilt**:
     - Player cards, match preview badges, and trophy showcases react to mouse cursor movement / device gyroscope with smooth spring physics (`transform: perspective(1000px) rotateX(...) rotateY(...)`).
  4. **Cinematic Micro-Particles & Atmosphere**:
     - Subtle floating dust motes and pitch floodlight light beams in match simulations and award ceremonies.
     - Confetti, fireworks, and gold foil shred effects on trophy lifts and contract signings.
  5. **Super Modern Typographic Hierarchy**:
     - High-definition geometric sans typography paired with glowing metallic accent fonts.
     - Smooth antialiased subpixel rendering with subtle glowing drop shadows.
  6. **Implementation Pattern in DOM**:
     - Root attribute: `html[data-quality="high_quality"]`.
     - Activate heavy canvas overlays, WebGL / Three.js card inspect layers where supported, and smooth bezier transition curves.

---

## 3. 32-BIT SCAN & MIGRATION BACKLOG (FOR BALANCED MODE)

> **AUTOMATED AUDIT INSTRUCTION FOR AI AGENTS**:
> Any component containing modern rounded classes (`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`) or lacking retro arcade typography (`font-arcade`, `font-pixel`, `pixel-corners`) violates the 32-bit Balanced aesthetic.
> Refer to this categorized directory to convert elements without needing user pinpointing.

### CATEGORY A: Modals & Fullscreens Needing 32-Bit Conversion
- [ ] `src/components/Age16TransferOffersModal.tsx` — Uses modern rounded card containers; convert to `pixel-corners`, `pixel-bevel-raised`, and arcade headers.
- [ ] `src/components/ArabianMegaOfferModal.tsx` — Convert golden desert cards to `pixel-bevel-gold` and retro pixel currency icons.
- [ ] `src/components/AwardsCeremonyModal.tsx` — Redesign trophy stage with 32-bit pixel podium, retro banner ribbons, and pixel sparkles.
- [ ] `src/components/BuyBusinessModal.tsx` — Convert investment cards and cash flow charts into retro stock-market/sim-city style pixel boxes.
- [ ] `src/components/CareerEndingInjuryModal.tsx` — Convert medical scan graphics to retro ECG pixel monitor display.
- [ ] `src/components/CareerLifecycleMilestoneModal.tsx` — Convert timeline dots to stepped pixel badges and arcade milestone markers.
- [ ] `src/components/CareerStatisticsPanel.tsx` — Replace modern data tables with retro arcade high-score table formatting.
- [ ] `src/components/ChampionsCelebrationModal.tsx` — Upgrade celebration scene to 32-bit confetti sprite overlay and retro gold framing.
- [ ] `src/components/CompetitionStartModal.tsx` — Replace smooth badges with pixelated tournament bracket cards.
- [ ] `src/components/CompetitionsEditor.tsx` — Convert form controls, color pickers, and tables into retro arcade editor tools.
- [ ] `src/components/ContinentalDrawModal.tsx` & `ContinentalDrawsSummaryModal.tsx` — Convert draw pots and group tables into 32-bit broadcast graphics.
- [ ] `src/components/CustomizationModal.tsx` — Convert appearance controls, hairstyle grids, and color swatches to retro character creation cabinets.
- [ ] `src/components/FarewellMatchModal.tsx` — Convert retirement ceremony modal to retro testimonial board.
- [ ] `src/components/FigoBetrayalNewsModal.tsx` & `JudasBetrayalEventModal.tsx` — Convert newspaper headline clippings to authentic 32-bit dot-matrix newspaper texture.
- [ ] `src/components/FirstContractModal.tsx` — Convert contract signing quill and clauses to retro pixel parchment parchment.
- [ ] `src/components/FitToPlayModal.tsx` — Convert fitness gauges into retro health-meter HP blocks.
- [ ] `src/components/FreeAgentHubModal.tsx` — Convert unsigned player dashboard into retro classifieds/bulletin board format.
- [ ] `src/components/InternationalCallUpModal.tsx` — Convert national telegram into retro embossed federation letter.
- [ ] `src/components/InternationalTournamentModal.tsx` — Convert group stages and knockout tree to arcade tournament bracket.
- [ ] `src/components/LegendObjectiveTrackerModal.tsx` — Convert objective checklists to retro quest completion checkboxes.
- [ ] `src/components/ManagerActionsModal.tsx` & `ManagerPositionChangeModal.tsx` — Convert tactical boards to retro whiteboard pitch view.
- [ ] `src/components/OverflowChemistryExplainerModal.tsx` — Convert chemistry connection graphs to pixelated linked nodes.
- [ ] `src/components/PerkUnlockStoryModal.tsx` — Ensure story book presentation uses `pixel-corners` and pixel-bevel frame.
- [ ] `src/components/PositionSelectionModal.tsx` — Convert pitch map to stepped green pitch with 32-bit shirt sprites.
- [ ] `src/components/PostMatchInterviewModal.tsx` — Convert interview microphones and journalist bubbles to arcade dialogue balloons.
- [ ] `src/components/PreseasonFriendlyCupModal.tsx` — Convert friendly cup brackets to arcade tournament cards.
- [ ] `src/components/ProjectSyncModal.tsx` — Convert sync/cloud storage manager to retro memory card manager (PS1/Saturn style).
- [ ] `src/components/SeasonMatchesFullListModal.tsx` — Convert fixtures list to arcade scrolling roster.
- [ ] `src/components/ShadyPropositionModal.tsx` — Convert backroom bribe UI to retro noir trenchcoat dialogue scene.
- [ ] `src/components/SpecialClubSigningChainModal.tsx` & `SpecialClubChoiceModal.tsx` — Convert negotiations to retro arcade challenge prompts.
- [ ] `src/components/StartingCityModal.tsx` — Convert world map pins and city cards to 32-bit isometric atlas cards.
- [ ] `src/components/StreetDevelopmentEventModal.tsx` — Ensure street development rewards use retro arcade stat bonus popups.
- [ ] `src/components/TransferOfferInterruptionModal.tsx` — Convert incoming fax notification to retro dot-matrix fax machine printout.
- [ ] `src/components/YouthClubCinematicModal.tsx` — Ensure academy signing cinematic uses full retro stage presentation.
- [ ] `src/components/YouthManagerMeetingModal.tsx` — Convert manager desk scene to retro side-profile RPG conversation dialogue.
- [ ] `src/components/YouthSeasonDashboardModal.tsx` — Complete overhaul of sub-panels from rounded cards to `pixel-corners` and `pixel-bevel-raised`.

### CATEGORY B: Standalone UI Widgets Needing 32-Bit Conversion
- [ ] `src/components/CrashReportButton.tsx` & `CrashReportModal.tsx` — Convert modern button to retro arcade bug report console.
- [ ] `src/components/DeveloperTestDashboard.tsx` — Convert modern dev panel to retro arcade service test menu (like Neo Geo Test Mode).
- [ ] `src/components/SoundtrackControlWidget.tsx` — Replace remaining `rounded-full` pills with stepped retro media deck buttons.
- [ ] `src/components/CustomEmblem.tsx` — Provide crisp nearest-neighbor pixelated rendering mode.
- [ ] Toast Notifications (`toastMessage` in `App.tsx`) — Convert `rounded-xl` banner to retro arcade high-score ticker popup.

---

## 4. AI SYSTEM DIRECTIVE: HOW TO EXECUTE QUALITY CONVERSIONS

When instructed to work on graphic presets:
1. **Check the Current Active Preset**: Verify the target preset (`Balanced`, `Performance`, or `High Quality`).
2. **Consult the Matrix & Rules**:
   - If migrating toward **Balanced (32-Bit)**: Target files listed in the **Category A & B Backlogs**, eliminate `rounded-*` classes, introduce `pixel-corners`, `pixel-bevel-*`, and replace generic sans fonts with `font-arcade` and `font-pixel`.
   - If implementing **Performance Mode**: Inject global and component-level switches under `[data-quality="performance"]` that wipe all `backdrop-blur-*`, disable scanline animations, flatten shadows to solid 1px borders, and remove heavy SVG/Canvas loops.
   - If implementing **High Quality Mode**: Inject rich CSS glassmorphism, responsive tilt shaders, dynamic neon blooms, and 60fps micro-animations under `[data-quality="high_quality"]`.
3. **Validate Architecture**: Run `npm run lint` and `compile_applet`. Always verify that all game state transitions, stats, and match engines remain 100% untouched.
