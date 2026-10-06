<!-- DRAWSTAR_AI_CONTEXT_V1 -->
[SYSTEM_DIRECTIVE: DRAWSTAR FOOTBALL CAREER SIMULATION]
Identity: 32-bit retro football career-mode simulation. Fast-paced, pixel presentation, simple UX, deep underlying systems.
Rule 0: Existing code in /src is the SOURCE OF TRUTH. Do not recreate systems from scratch. Do not replace mechanics with generic stubs.
Rule 1: Edit ONLY what is explicitly requested. Preserve working mechanics.
Rule 2: If UI design conflicts with gameplay logic, preserve gameplay logic and fit UI around it.
Key Distinctions:
- Unique Career Store (`UniqueCareerStoreModal.tsx`) != Card Store (`CardStoreModal.tsx`). Distinct systems.
- World Results (`WorldResultsModal.tsx`): Authoritative world simulation for background club & league fixtures.
- Unique Career Hub (`CareerSecondaryMenuModal.tsx`): Controls Youth Academy, Pro Career, Training, Stats, Cards, Lifestyle, Contracts, Transfers.
- Visual Quality Presets: `Balanced` (32-Bit Arcade @ 65%), `Performance` (Ultra-Simplistic Flat @ 0%), `High Quality` (Next-Gen Cyber-Arcade Glass @ 0%). Presets govern visuals ONLY, never game mechanics. See README.md for full AI conversion backlog.
<!-- END_CONTEXT -->
