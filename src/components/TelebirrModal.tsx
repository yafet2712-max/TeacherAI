import React, { useState } from 'react';
import { Crown, CheckCircle2, Phone, ShieldCheck, Sparkles, X, AlertCircle, ExternalLink, Send } from 'lucide-react';

interface TelebirrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceTitle?: string;
  featureKey?: string;
}

export const TelebirrModal: React.FC<TelebirrModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  serviceTitle = 'ፕሪሚየም አገልግሎት (Premium Service)',
  featureKey = 'general',
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !phoneNumber.trim()) {
      setError('እባክዎ የቴሌብር ስልክ ቁጥር እና የግብይት መለያ (Transaction ID) ያስገቡ።');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Save subscription request for admin approval
      const newReq = {
        id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        phoneNumber: phoneNumber.trim(),
        featureKey: featureKey || 'general',
        serviceTitle: serviceTitle || 'ፕሪሚየም አገልግሎት',
        transactionId: transactionId.trim(),
        timestamp: Date.now(),
        status: 'pending' as const,
      };

      const existing = localStorage.getItem('teacher_helper_subscription_requests_v1');
      const reqs = existing ? JSON.parse(existing) : [];
      localStorage.setItem('teacher_helper_subscription_requests_v1', JSON.stringify([newReq, ...reqs]));

      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('የጥያቄ መረጃ ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    }
  };

  const handleFinish = () => {
    setSubmitted(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-inner">
              ET
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                Telebirr 30-Day Subscription (50 ETB)
              </span>
              <h3 className="text-xl font-black">{serviceTitle}</h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!submitted ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>ኦፊሴላዊ የክፍያ እና ማረጋገጫ መመሪያ (Official Verification)</span>
                </div>
                <p className="leading-relaxed">
                  ይህንን አገልግሎት ለ <strong>1 ወር (30 ቀናት)</strong> ለመጠቀም በቴሌብር የ <strong>50 ብር</strong> ክፍያ ይፈጽሙ።
                </p>
                <div className="bg-white p-3 rounded-xl border border-amber-300 font-mono font-bold text-sm text-stone-900 flex items-center justify-between">
                  <span>Telebirr: +251956263882</span>
                  <span className="text-emerald-700 text-xs font-sans">ዜናነህ ፀጋዬ</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 font-medium flex items-center justify-between">
                  <span>የክፍያ ማረጋገጫ (Screenshot) ለመላክ:</span>
                  <a
                    href="https://t.me/zenayafet"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-100"
                  >
                    <span>@zenayafet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    የእርስዎ የቴሌብር ስልክ ቁጥር (Your Phone Number)
                  </label>
                  <input
                    type="text"
                    placeholder="09... / +2519..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    የቴሌብር ግብይት መለያ ቁጥር (Telebirr Transaction ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TBR89345210"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl transition shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>ጥያቄው በመላክ ላይ ነው... (Submitting...)</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-amber-300" />
                        <span>ክፍያ አስገባ እና ማረጋገጫ ላክ (Submit for Approval)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-inner animate-bounce">
                ✅
              </div>
              <h4 className="text-lg font-black text-stone-900">የክፍያ ጥያቄዎ በተሳካ ሁኔታ ተልኳል!</h4>
              <p className="text-xs text-stone-600 leading-relaxed px-2">
                እባክዎ የክፍያ ማረጋገጫ (Screenshot) በቴሌግራም <a href="https://t.me/zenayafet" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">@zenayafet</a> በመላክ ያስታውቁ። ባለቤቱ ሲያጸድቀው (Approved) የአንድ ወር (30 ቀናት) አገልግሎቱ ይከፈታል።
              </p>
              <button
                onClick={handleFinish}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl text-xs transition"
              >
                እሺ (OK)
              </button>
            </div>
          )}

          {/* Contact Support */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1 font-medium text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ባለቤት: ዜናነህ ፀጋዬ</span>
            </span>
            <a
              href="https://t.me/zenayafet"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-amber-700 hover:underline"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ቴሌግራም: @zenayafet</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
