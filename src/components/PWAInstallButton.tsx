import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, Info, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'banner' | 'compact' | 'menu' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  const buttonLabel = isAndroid
    ? 'Install APK / App'
    : isIOS
    ? 'Install on iOS'
    : 'Install App (Offline)';

  return (
    <>
      {variant === 'menu' ? (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-lg text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 transition-all text-xs font-medium cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-pixel text-[11px]">{buttonLabel}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-mono">
            OFFLINE
          </span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          title="Install DrawStar for 100% offline play on your phone or PC"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 transition-all text-xs font-medium cursor-pointer shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 group"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="font-pixel text-[10px] tracking-wide">{buttonLabel}</span>
          <Download className="w-3 h-3 text-emerald-400/80 ml-0.5" />
        </button>
      )}

      {/* Offline Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h3 className="font-pixel text-sm font-bold text-emerald-300">
                Offline Mobile App (APK)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              DrawStar runs 100% offline without needing internet. Install it directly onto your device:
            </p>

            <div className="space-y-2.5 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800 mb-4">
              {isAndroid || !isIOS ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      1
                    </span>
                    <span className="text-slate-300">
                      Tap the <strong>three dots (⋮)</strong> menu in Chrome or your browser.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      2
                    </span>
                    <span className="text-slate-300">
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      3
                    </span>
                    <span className="text-slate-300">
                      Android will generate a native <strong>WebAPK</strong> icon that opens fullscreen and plays offline anytime!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      1
                    </span>
                    <span className="text-slate-300">
                      Tap the <strong>Share</strong> button in Safari's bottom toolbar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      2
                    </span>
                    <span className="text-slate-300">
                      Scroll down and tap <strong>"Add to Home Screen"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      3
                    </span>
                    <span className="text-slate-300">
                      Tap <strong>"Add"</strong> in the top right to install the standalone game.
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
