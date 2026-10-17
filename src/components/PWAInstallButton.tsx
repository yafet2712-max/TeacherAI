import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone mode, do not show button
  if (isInstalled) {
    return null;
  }

  // Direct 1-click browser install for Android, Chrome, Edge, and Desktop
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors border border-emerald-500"
        title="Install as Phone/Desktop Application (መተግበሪያውን በስልክዎ/ኮምፒውተርዎ ላይ ይጫኑ)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App (መተግበሪያ ጫን)</span>
      </button>
    );
  }

  // iOS Safari flow or generic install guide button
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-200 transition-colors"
        title="How to install as App on your phone / desktop"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 relative text-stone-800 space-y-4">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <img src="/icon.svg" alt="App Icon" className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Install as Application (መተግበሪያ ይጫኑ)
                </h3>
                <p className="text-xs text-stone-500">
                  Ethiopian MoE Primary Assistant
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-stone-700">
              {isIOS ? (
                // iOS Safari Instructions
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    For iPhone & iPad (Safari) ተጠቃሚዎች፦
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-700 leading-relaxed pl-1">
                    <li className="flex items-center gap-1.5">
                      <span>1. ከስር ወይም ከላይ ያለውን የ Safari</span>
                      <strong className="inline-flex items-center gap-0.5 text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                        <Share2 className="w-3 h-3" /> Share
                      </strong>
                      <span>አዶ ይጫኑ።</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span>2. ዝርዝሩን ወደ ታች ዝቅ በማድረግ</span>
                      <strong className="inline-flex items-center gap-0.5 text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                        <PlusSquare className="w-3 h-3" /> Add to Home Screen
                      </strong>
                      <span>የሚለውን ይምረጡ።</span>
                    </li>
                    <li>3. በቀኝ በኩል <strong>Add</strong> በማለት ያጠናቁ።</li>
                  </ol>
                </div>
              ) : (
                // Android & Chrome / Edge instructions
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    Android / Chrome / Edge መመሪያ፦
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
                    <li>በብሮውዘሩ የላይኛው ቀኝ ጥግ ያሉትን <strong>3 ነጥቦች (⋮)</strong> ይጫኑ።</li>
                    <li><strong>"Install App"</strong> ወይም <strong>"Add to Home Screen"</strong> የሚለውን ይምረጡ።</li>
                    <li>አፑ ወዲያው በስልክዎ ወይም ኮምፒውተርዎ ላይ ይጫናል!</li>
                  </ol>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900 text-[11px] flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  መተግበሪያውን መጫን ፈጣን ያደርገዋል፣ ያለ ብሮውዘር ፍሬም ልክ እንደ እውነተኛ ሞባይል አፕሊኬሽን እንዲሰራ ያስችለዋል።
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition"
              >
                Close (ዝጋ)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
