import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { AudioProvider } from './context/AudioContext.tsx';
import { setupGlobalErrorListeners } from './utils/crashReportSystem.ts';
import { getGraphicSettings, applyGraphicSettingsToDOM } from './utils/graphicSettingsSystem.ts';
import './index.css';

setupGlobalErrorListeners();
applyGraphicSettingsToDOM(getGraphicSettings());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AudioProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AudioProvider>
    </ErrorBoundary>
  </StrictMode>,
);

