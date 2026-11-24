import React, { useState } from 'react';
import { AppTab, SchoolProfile } from '../types';
import { 
  BookOpen, 
  FileText, 
  Grid, 
  Compass, 
  BookOpenText, 
  CheckCircle2, 
  Languages, 
  MessageSquare, 
  Bookmark, 
  Keyboard, 
  Printer, 
  School, 
  Zap,
  Share2,
  Check,
  X,
  ExternalLink,
  Copy,
  Crown,
  FileSpreadsheet,
  MessageCircle,
  Send
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { copyTextSafe } from '../utils/clipboard';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  savedCount: number;
  onToggleKeyboard: () => void;
  isKeyboardOpen: boolean;
  schoolProfile: SchoolProfile;
  onOpenSchoolSettings: () => void;
  onOpenAdminDashboard: () => void;
  publishedUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  onToggleKeyboard,
  isKeyboardOpen,
  schoolProfile,
  onOpenSchoolSettings,
  onOpenAdminDashboard,
  publishedUrl,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const tabs = [
    { id: 'lesson-planner' as AppTab, amharic: 'የ1 እና 5 ቀን እቅድ', english: 'Lesson Plans', icon: BookOpen },
    { id: 'quick-quiz' as AppTab, amharic: '⚡ 1-ቃል ፈተና', english: 'Quick Quiz', icon: Zap, highlight: true },
    { id: 'worksheet-maker' as AppTab, amharic: 'ፈተና እና መልመጃ', english: 'Worksheets', icon: FileText },
    { id: 'mark-list-tools' as AppTab, amharic: '📊 የውጤት መዝገብ', english: 'Mark List & Excel', icon: FileSpreadsheet, highlight: true },
    { id: 'fidel-chart' as AppTab, amharic: 'ፊደል ገበታ', english: 'Fidel Chart', icon: Grid },
    { id: 'grammar-lab' as AppTab, amharic: 'ሰዋሰው ላብ', english: 'Grammar Lab', icon: Compass },
    { id: 'stories' as AppTab, amharic: 'ተረቶች እና ምንባብ', english: 'Stories', icon: BookOpenText },
    { id: 'assignment-grader' as AppTab, amharic: 'ጽሁፍ ገምጋሚ', english: 'Grader', icon: CheckCircle2 },
    { id: 'translator' as AppTab, amharic: 'ባህል እና ትርጉም', english: 'Translator', icon: Languages },
    { id: 'chat' as AppTab, amharic: 'መምህር አማካሪ', english: 'AI Mentor', icon: MessageSquare },
    { id: 'library' as AppTab, amharic: 'ቤተ-መጻሕፍት', english: 'Saved', icon: Bookmark, badge: savedCount },
  ];

  const shareText = `Meskerem school ai — Ethiopian Teachers Daily & 5-Day Lesson Plans, Quizzes & Mark List Tools: ${publishedUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(publishedUrl)}&text=${encodeURIComponent('Meskerem school ai — Ethiopian Teachers AI Assistant')}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    const ok = await copyTextSafe(publishedUrl);
    if (ok) {
      setCopiedLink(true);
      setCopyFailed(false);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Meskerem school ai',
          text: 'Ethiopian Teachers Daily & 5-Day Lesson Plans, Quizzes & Mark List Tools',
          url: publishedUrl,
        });
        return;
      } catch {
        // User cancelled or Web Share blocked; fall back to clipboard
      }
    }
    await handleCopyLink();
  };

  return (
    <header className="bg-white/95 border-b border-stone-200/90 sticky top-0 z-40 backdrop-blur-md no-print">
      {/* Top Brand Banner */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2 sm:gap-4">
          {/* App Icon & Meskerem school ai Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img
              src="/assets/aistudio/learning-management-system-for-school-8663453-6967857_4c5fb857.png"
              alt="Meskerem school ai logo"
              onError={(e) => {
                if (!e.currentTarget.dataset.fb) {
                  e.currentTarget.dataset.fb = '1';
                  e.currentTarget.src = '/pwa-192x192.png';
                }
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-white border border-stone-200 p-0.5 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900 truncate">
                Meskerem school ai
              </h1>
              <p className="text-[11px] text-emerald-800 font-medium truncate max-w-[180px] sm:max-w-md">
                {schoolProfile.schoolName || 'Meskerem pre-primary , primary and medium school'}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenAdminDashboard}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 shadow-xs transition whitespace-nowrap shrink-0"
              title="Owner Admin Dashboard"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin</span>
            </button>

            <PWAInstallButton publishedUrl={publishedUrl} />

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition whitespace-nowrap shrink-0"
              title="View & copy published web link"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden lg:inline">Share</span>
            </button>

            <button
              onClick={onOpenSchoolSettings}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition whitespace-nowrap shrink-0"
              title="Change workplace / school name"
            >
              <School className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">School</span>
            </button>

            <button
              onClick={onToggleKeyboard}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                isKeyboardOpen
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Toggle Amharic On-Screen Fidel Keyboard"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ፊደል</span>
            </button>

            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition whitespace-nowrap shrink-0"
              title="Print current document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-t border-stone-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all select-none shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm font-bold'
                    : tab.highlight
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : tab.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
                <span className="font-amharic">{tab.amharic}</span>
                <span className={`text-[10px] hidden xl:inline ${isActive ? 'text-emerald-100' : 'text-stone-400'}`}>
                  ({tab.english})
                </span>

                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Published Link Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/learning-management-system-for-school-8663453-6967857_4c5fb857.png"
                  alt="Meskerem school ai logo"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fb) {
                      e.currentTarget.dataset.fb = '1';
                      e.currentTarget.src = '/pwa-192x192.png';
                    }
                  }}
                  className="w-10 h-10 rounded-xl object-contain bg-white border border-stone-200 p-0.5 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Meskerem school ai — Share Link
                  </h3>
                  <p className="text-xs text-stone-500">
                    Share with teachers, principals & students
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Share <strong>Meskerem school ai</strong> with educators and students so they can generate lesson plans, quizzes, worksheets, Fidel charts, and mark lists from any phone or computer.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-stone-800 break-all select-all">
                {publishedUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {copyFailed && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Clipboard access is restricted in this view — tap and hold the link above to copy manually, or share directly below.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Device</span>
              </button>
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab (በአዲስ መስኮት ክፈት)</span>
              </a>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
