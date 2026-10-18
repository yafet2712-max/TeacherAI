import React, { useState } from 'react';
import { Crown, CheckCircle2, Phone, ShieldCheck, Sparkles, X, AlertCircle } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceName: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSuccess, serviceName }) => {
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !phoneNumber.trim()) {
      setError('እባክዎ የቴሌብር ቁጥር እና የግብይት መለያ (Transaction ID) ያስገቡ።');
      return;
    }
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
    }, 1500);
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
              👑
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                Premium Service Locked
              </span>
              <h3 className="text-lg font-black">{serviceName}</h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>የባለቤትነት መብት እና የፕሪሚየም አገልግሎት (Copyright © Owner)</span>
            </div>
            <p className="leading-relaxed">
              ይህንን አገልግሎት (<strong className="text-amber-900">{serviceName}</strong>) ለመጠቀም የአንድ ጊዜ የ <strong>50 ብር</strong> የቴሌብር ክፍያ መፈጸም ይጠበቅብዎታል።
            </p>
            <div className="bg-white p-3 rounded-xl border border-amber-300 font-mono font-bold text-sm text-stone-900 flex items-center justify-between">
              <span>Telebirr: +251956263882</span>
              <span className="text-emerald-700 text-xs font-sans">አማኑኤል (ባለቤት)</span>
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
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl transition shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>ክፍያው እየጣራ ነው... (Verifying...)</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>ክፍያ አረጋግጥ እና አገልግሎቱን ክፈት (Confirm Payment)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Contact Support */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1 font-medium text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ህጋዊ እና ደህንነቱ የተጠበቀ</span>
            </span>
            <a
              href="tel:+251956263882"
              className="flex items-center gap-1 font-bold text-amber-700 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>ስልክ: +251956263882</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
