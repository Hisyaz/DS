(import.meta as any).glob = () => ({});

import { Window } from 'happy-dom';

const win = new Window();
for (const key of Object.getOwnPropertyNames(win)) {
  if (key in globalThis) continue;
  try {
    Object.defineProperty(globalThis, key, {
      value: (win as any)[key],
      configurable: true,
      writable: true,
    });
  } catch {}
}
(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 16);
(globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);

(globalThis as any).AudioContext = class {
  currentTime = 0;
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
      connect() {},
      start() {},
      stop() {},
    };
  }
  createGain() {
    return {
      gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
      connect() {},
    };
  }
  get destination() { return {}; }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
};
(globalThis as any).webkitAudioContext = (globalThis as any).AudioContext;

const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem(k: string) { return store[k] || null; },
  setItem(k: string, v: string) { store[k] = String(v); },
  removeItem(k: string) { delete store[k]; },
  clear() { for (const k in store) delete store[k]; }
};

import React from 'react';
import { createRoot } from 'react-dom/client';
import { PRESET_PLAYERS } from '../src/constants';
import { INITIAL_STORE_ITEMS } from '../src/data/storeItems';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AudioProvider } from '../src/context/AudioContext';

async function testComponent(name: string, Component: any, props: any) {
  console.log(`\nTesting ${name}...`);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let depthError = null;
  const origError = console.error;
  console.error = (...args: any[]) => {
    origError(...args);
    const msg = args.map(a => (a?.stack ? a.stack : String(a))).join(' ');
    if (msg.includes('Maximum update depth exceeded') || msg.includes('depth')) {
      depthError = msg;
    }
  };

  root.render(
    React.createElement(
      LanguageProvider,
      null,
      React.createElement(
        AudioProvider,
        null,
        React.createElement(Component, props)
      )
    )
  );

  // Wait 500ms
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (depthError) {
      console.error(`🚨 DEPTH ERROR DETECTED IN ${name}:`, depthError);
      process.exit(1);
    }
  }

  root.unmount();
  container.remove();
  console.log(`✓ ${name} passed!`);
}

async function main() {
  console.log('Loading complex modals and panels...');

  const { TranslationInspector } = await import('../src/components/TranslationInspector');
  await testComponent('TranslationInspector', TranslationInspector, {
    onToast: () => {},
    externalOpenReport: false,
  });

  const { TranslationInspectorModal } = await import('../src/components/TranslationInspectorModal');
  await testComponent('TranslationInspectorModal (Open)', TranslationInspectorModal, {
    isOpen: true,
    onClose: () => {},
    isInspectModeActive: false,
    onToggleInspectMode: () => {},
    showToast: () => {},
  });

  const { SaveSlotSelectionModal } = await import('../src/components/SaveSlotSelectionModal');
  await testComponent('SaveSlotSelectionModal (Open)', SaveSlotSelectionModal, {
    isOpen: true,
    mode: 'new_career',
    onClose: () => {},
    onSelectSlot: () => {},
    showToast: () => {},
  });

  const { CareerSecondaryMenuModal } = await import('../src/components/CareerSecondaryMenuModal');
  await testComponent('CareerSecondaryMenuModal (Open)', CareerSecondaryMenuModal, {
    isOpen: true,
    onClose: () => {},
    player: PRESET_PLAYERS[0],
    accounting: {} as any,
    manager: {} as any,
    storeItems: INITIAL_STORE_ITEMS,
    onUpdatePlayer: () => {},
    onUpdateAccounting: () => {},
    showToast: () => {},
  });

  const { ContinentalDashboardModal } = await import('../src/components/ContinentalDashboardModal');
  await testComponent('ContinentalDashboardModal (Open)', ContinentalDashboardModal, {
    isOpen: true,
    onClose: () => {},
    player: PRESET_PLAYERS[0],
    currentSeasonYear: 2026,
    showToast: () => {},
  });

  const { WorldResultsModal } = await import('../src/components/WorldResultsModal');
  await testComponent('WorldResultsModal (Open)', WorldResultsModal, {
    isOpen: true,
    onClose: () => {},
    player: PRESET_PLAYERS[0],
  });

  const { YouthSeasonDashboardModal } = await import('../src/components/YouthSeasonDashboardModal');
  await testComponent('YouthSeasonDashboardModal (Open)', YouthSeasonDashboardModal, {
    isOpen: true,
    player: PRESET_PLAYERS[0],
    onUpdatePlayer: () => {},
    onAdvanceSeason: () => {},
    showToast: () => {},
    accounting: {} as any,
    manager: {} as any,
    storeItems: INITIAL_STORE_ITEMS,
    championCoins: 10,
    onUpdateChampionCoins: () => {},
  });

  const { default: App } = await import('../src/App');
  await testComponent('App Root (Full Mount & Startup Flow)', App, {});

  console.log('\n🎉 ALL ADVANCED MODALS, PANELS & APP ROOT PASSED TEST CLEANLY!');
  process.exit(0);
}

main().catch(err => {
  console.error('MAIN TEST CAUGHT ERROR:', err);
  process.exit(1);
});
