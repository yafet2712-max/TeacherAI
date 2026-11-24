import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  publishedUrl?: string;
  variant?: 'header' | 'strip';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  publishedUrl,
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone mode, do not show button
  if (isInstalled) {
    return null;
  }

  const installTargetUrl =
    publishedUrl || (typeof window !== 'undefined' ? window.location.origin : '/');

  // Direct 1-click browser install for Android, Chrome, Edge, and Desktop
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          variant === 'strip'
            ? 'flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg transition font-bold shadow-xs whitespace-nowrap'
            : 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors border border-emerald-500 whitespace-nowrap shrink-0'
        }
        title="Install Meskerem school ai on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow, iframe fallback, or manual install guide button
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className={
          variant === 'strip'
            ? 'flex items-center gap-1.5 px-3 py-1 bg-white/95 hover:bg-white text-emerald-950 rounded-lg transition font-bold shadow-xs whitespace-nowrap'
            : 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors whitespace-nowrap shrink-0'
        }
        title="How to install Meskerem school ai on your phone or computer"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
        <span>{variant === 'strip' ? 'Install App' : 'Install'}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print text-left">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 relative text-stone-800 space-y-4">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <img
                src="/assets/aistudio/learning-management-system-for-school-8663453-6967857_4c5fb857.png"
                alt="Meskerem school ai icon"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fb) {
                    e.currentTarget.dataset.fb = '1';
                    e.currentTarget.src = '/pwa-192x192.png';
                  }
                }}
                className="w-12 h-12 rounded-xl object-contain bg-white border border-stone-200 p-1 shadow-sm shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Install App (መተግበሪያ ይጫኑ)
                </h3>
                <p className="text-xs text-stone-500">
                  Meskerem school ai
                </p>
              </div>
            </div>

            {isInIframe && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 text-xs text-blue-950">
                <p className="font-bold">
                  Open in your main browser to install (በቀጥታ ለመጫን በአዲስ መስኮት ይክፈቱ):
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Embedded preview windows cannot trigger device installation directly. Open the app in a full Chrome, Edge, or Safari tab first, then tap Install.
                </p>
                <a
                  href={installTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open App to Install</span>
                </a>
              </div>
            )}

            <div className="space-y-3 pt-1 text-xs text-stone-700">
              {isIOS ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    For iPhone & iPad (Safari) ተጠቃሚዎች፦
                  </p>
                  <ol className="list-none space-y-2 text-stone-700 leading-relaxed pl-1">
                    <li className="flex flex-wrap items-center gap-1.5">
                      <span>1. ከስር ወይም ከላይ ያለውን የ Safari</span>
                      <strong className="inline-flex items-center gap-0.5 text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                        <Share2 className="w-3 h-3" /> Share
                      </strong>
                      <span>አዶ ይጫኑ።</span>
                    </li>
                    <li className="flex flex-wrap items-center gap-1.5">
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
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    Android / Chrome / Edge መመሪያ፦
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
                    <li>በብሮውዘሩ የላይኛው ቀኝ ጥግ ያሉትን <strong>3 ነጥቦች (⋮)</strong> ወይም የአድራሻ አሞሌውን <strong>Install</strong> ምልክት ይጫኑ።</li>
                    <li><strong>"Install App"</strong> ወይም <strong>"Add to Home Screen"</strong> የሚለውን ይምረጡ።</li>
                    <li>መተግበሪያው በስልክዎ ወይም ኮምፒውተርዎ ላይ ይጫናል፣ ዝመናዎችንም በራሱ ያገኛል!</li>
                  </ol>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900 text-[11px] flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  መተግበሪያውን መጫን ፈጣን ያደርገዋል፣ ያለ ብሮውዘር ፍሬም እንደ እውነተኛ መተግበሪያ እንዲሰራ እና የቅርብ ጊዜ ማሻሻያዎችን በራስ-ሰር እንዲይዝ ያስችለዋል።
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
