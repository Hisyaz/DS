# Implementation Plan: Mobile Full-Screen Navigation, Global Top Bar, and In-Game Text Inspector

## Overview
This plan addresses the three core issues:
1. **In-Game Text Inspector & Translation Audit Tool**: A floating "magic inspect" overlay mode allowing you to tap any in-game UI element, capture its text, key, and context/screen, and add it to an in-memory/localStorage inspection list with instant export (JSON / CSV / Clipboard) for subsequent translations. Ensures unified vocabulary bindings for clubs, managers, stats, positions, perks, and playstyles so changing a name in the editor updates everywhere consistently.
2. **True Full-Screen Mobile Navigation (No Window-in-Window)**: Redesigning sub-menus—starting with the Player Development panel and career dashboards—so they render as true full-screen views on mobile devices (`fixed inset-0 z-50 flex flex-col w-full h-full`), removing layered nested containers, maximizing vertical thumb reachability, paginating long sections into clean sub-views or tabs, and guaranteeing fixed, prominent Back / Close header bars that never get pushed off-screen.
3. **Global Top Bar Redesign**: Updating the career header to feature:
   - An enlarged, crisp **DrawStar Logo mark** that acts as a direct button to return to the Main Menu (with confirmation if in an active career).
   - Removal of redundant text labels beside the logo since the mark already contains the branding.
   - Dedicated **Home** button (takes you directly back to the Career Hub / 32-bit console) and **Back** button (unwinds the navigation stack or active modal).

---

## Detailed Phases

### Phase 1: In-Game Text Inspector & Canonical Vocabulary Binding
- **Component**: Create `src/components/TranslationInspectorModal.tsx` & `src/utils/translationInspector.ts`.
- **Magic Inspector Button**:
  - Add a toggleable inspector mode icon (can be enabled via settings or top bar badge in review mode).
  - When active, clicking/tapping any UI element or phrase highlights it, captures:
    - Current rendered string
    - Translation key / module identifier
    - Current active language (e.g. Spanish `'es'`)
    - Source context (e.g. `PlayerDevelopmentPanel`, `CardTranslationsDatabase`, `WonderkidInitScreen`)
    - Untranslated flag (e.g., if rendering in English while language is set to `'es'`).
  - Stores captured items into a persistent checklist (`localStorage`) with:
    - View captured strings list
    - One-click "Copy for Assistant" or "Download JSON / CSV"
    - Clear list
- **Canonical Vocabulary Alignment**:
  - Ensure entity names (Clubs, Managers, Perks, Stats, Positions, Playstyles, Trophies) resolve through `src/utils/gameVocabulary.ts` and `src/utils/cardTranslationsDatabase.ts` so custom editor changes propagate universally across all career screens without orphaned hardcoded strings.

---

### Phase 2: True Full-Screen Mobile UI Overhaul (Player Development & Submenus)
- **Eliminate Window-in-Window Hierarchy**:
  - Refactor `PlayerDevelopmentPanel.tsx` container hierarchy:
    - Replace the desktop-centric modal frame (`max-w-4xl max-h-[85vh] p-6 rounded-2xl` inside overlay) with responsive conditional styling:
      - Mobile (`< sm`): `fixed inset-0 w-full h-[100dvh] rounded-none p-0 flex flex-col bg-slate-950 z-50` with sticky header, scrollable body with momentum scrolling (`-webkit-overflow-scrolling: touch`), and safe-area padding (`pb-safe`).
      - Desktop (`>= sm`): Retains spacious desktop modal or full-screen view.
  - **Paging / Segmentation for Mobile**:
    - Split overly long development tabs (Attributes, Training Drills, Skill Tree, Perk Unlocks) into clean segmented views so players do not have to endlessly scroll.
    - Ensure Attribute point allocation controls (+/- steppers) and confirmation buttons are sticky at the bottom of the viewport on mobile for easy one-thumb operation.
  - **Audit Other Career Sub-Panels**:
    - Audit modals in `PersistentUiPanel.tsx`, `YouthSeasonDashboardModal.tsx`, `WonderkidInitScreen.tsx`, and `OptionFileModal.tsx` to ensure their mobile views utilize `fixed inset-0` with sticky header bars and reachable close buttons.

---

### Phase 3: Global Top Navigation Bar & Logo Redesign
- **Top Bar Refactoring in `src/App.tsx` & `src/components/PersistentUiPanel.tsx`**:
  - **DrawStar Logo**:
    - Enlarge the logo icon (`size={40}` on mobile, `size={48}` on tablet/desktop) with subtle glow and tap feedback.
    - Remove the redundant text "DRAW STAR" / "CAREER" next to it.
    - Bind the logo click to trigger `handleReturnToMainMenu()` with an unsaved progress check/confirmation modal when appropriate.
  - **Navigation Controls**:
    - **Back Button (`<`)**: Appears whenever any submenu, modal, or sub-view is active; pressing it pops the current view back to the previous screen.
    - **Home Button (`🏠`)**: Always takes the user back to the primary Career Hub (32-bit Console).
  - **Responsive Layout**:
    - Keep energy, coins, week counter, and inspector toggle compactly organized without horizontal overflow on screens down to 360px width.

---

## Verification & Testing
1. **Mobile Emulation Testing**:
   - Test on 375px (iPhone SE/mini), 390px (iPhone 14/15), and 412px (Android Pixel/Galaxy) viewports.
   - Verify that opening Development opens edge-to-edge full screen with zero nested borders, zero horizontal overflow, and the close/back button is immediately reachable in the top app bar.
2. **Inspector Testing**:
   - Toggle Inspector Mode, tap on card descriptions, profile creator text, and development stats.
   - Verify the items appear in the Inspector Drawer and can be exported as structured JSON/CSV.
3. **Top Navigation Flow**:
   - Verify tapping the DrawStar logo opens the return-to-main-menu confirmation and navigates properly.
   - Verify tapping the Back button unwinds stacked panels step-by-step.
   - Verify tapping Home returns to the Career 32-bit menu from any sub-panel.
