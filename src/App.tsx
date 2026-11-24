import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LessonPlanner } from './components/LessonPlanner';
import { QuickQuizGenerator } from './components/QuickQuizGenerator';
import { WorksheetMaker } from './components/WorksheetMaker';
import { FidelChart } from './components/FidelChart';
import { GrammarLab } from './components/GrammarLab';
import { StoryGenerator } from './components/StoryGenerator';
import { AssignmentGrader } from './components/AssignmentGrader';
import { CulturalTranslator } from './components/CulturalTranslator';
import { EducatorChat } from './components/EducatorChat';
import { SavedLibrary } from './components/SavedLibrary';
import { FidelKeyboard } from './components/FidelKeyboard';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { TelebirrModal } from './components/TelebirrModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MarkListTools } from './components/MarkListTools';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { AppTab, SavedMaterial, SchoolProfile } from './types';
import { School, Sparkles, BookOpen } from 'lucide-react';
import { copyTextSafe } from './utils/clipboard';

const STORAGE_KEY = 'amharic_teacher_helper_saved_v2';
const SCHOOL_PROFILE_KEY = 'amharic_teacher_helper_school_profile_v1';

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Meskerem pre-primary , primary and medium school',
  amharicSchoolName: 'መስከረም ቅድመ-መጀመሪያ፣ መጀመሪያ እና መካከለኛ ደረጃ ትምህርት ቤት',
  woredaSubcity: 'Addis Ababa',
  cityRegion: 'Ethiopia',
  teacherName: '',
  department: 'Pre-Primary, Primary & Medium Education',
  motto: 'Striving for Quality Education / ለላቀ የትምህርት ጥራት እንተጋለን',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('lesson-planner');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Premium Subscriptions State + 30-Day Expiration Tracking
  const [unlockedFeatures, setUnlockedFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const data = localStorage.getItem('teacher_helper_unlocked_features_v1');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  const [featureExpirations, setFeatureExpirations] = useState<Record<string, number>>(() => {
    try {
      const data = localStorage.getItem('teacher_helper_feature_expirations_v1');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  const [expiredNotice, setExpiredNotice] = useState<string | null>(null);

  const [fiveDaysTrialUsed, setFiveDaysTrialUsed] = useState<boolean>(() => {
    return localStorage.getItem('teacher_helper_5days_trial') === 'true';
  });

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeServiceName, setActiveServiceName] = useState('');
  const [pendingFeatureKey, setPendingFeatureKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('teacher_helper_unlocked_features_v1', JSON.stringify(unlockedFeatures));
    } catch (e) {
      console.warn('Failed to save unlocked features', e);
    }
  }, [unlockedFeatures]);

  useEffect(() => {
    try {
      localStorage.setItem('teacher_helper_feature_expirations_v1', JSON.stringify(featureExpirations));
    } catch (e) {
      console.warn('Failed to save feature expirations', e);
    }
  }, [featureExpirations]);

  // Check 30-day subscription expirations on load
  useEffect(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];
    Object.keys(unlockedFeatures).forEach((key) => {
      if (unlockedFeatures[key] && featureExpirations[key] && now > featureExpirations[key]) {
        expiredKeys.push(key);
      }
    });
    if (expiredKeys.length > 0) {
      setUnlockedFeatures((prev) => {
        const next = { ...prev };
        expiredKeys.forEach((k) => {
          next[k] = false;
        });
        return next;
      });
      setExpiredNotice(
        `⏰ የ1 ወር (30 ቀናት) የደንበኝነት አገልግሎት ጊዜዎ አብቅቷል (${expiredKeys.join(', ')})። ለማደስ በቴሌብር (+251956263882) ከፍለው ለ @zenayafet ይላኩ።`
      );
    }
  }, []);

  const requirePremium = (featureKey: string, serviceTitle: string, onProceed: () => void) => {
    const exp = featureExpirations[featureKey];
    if (unlockedFeatures[featureKey]) {
      if (exp && Date.now() > exp) {
        setUnlockedFeatures((prev) => ({ ...prev, [featureKey]: false }));
        setExpiredNotice(
          `⏰ የ"${serviceTitle}" የ1 ወር (30 ቀናት) አገልግሎት ጊዜ አብቅቷል። ለመቀጠል በቴሌብር 50 ብር በመክፈል ያድሱ።`
        );
      } else {
        onProceed();
        return;
      }
    }

    // Special rule for 5th option (5-days plan): 1 free trial allowed
    if (featureKey === 'fiveDays' && !fiveDaysTrialUsed) {
      setFiveDaysTrialUsed(true);
      localStorage.setItem('teacher_helper_5days_trial', 'true');
      showToast('🎁 የነጻ ሙከራዎ (Free Trial) ተሳክቷል! የመጀመሪያውን የ5 ቀናት እቅድ በነጻ ይጠቀሙ።');
      onProceed();
      return;
    }

    // Otherwise require 50 ETB Telebirr payment & Owner Admin approval
    setActiveServiceName(serviceTitle);
    setPendingFeatureKey(featureKey);
    setPremiumModalOpen(true);
  };

  const handlePaymentSubmitted = (req: { id: string; serviceTitle: string }) => {
    showToast(`📩 ጥያቄ (${req.id}) ተልኳል! የክፍያ Screenshot በቴሌግራም @zenayafet ይላኩ። ባለቤቱ ሲያጸድቀው ይከፈታል።`);
    setPendingFeatureKey(null);
  };

  const PUBLISHED_URL = 'https://ais-pre-ggmao2jh2kg5djgbq7rjc7-389524282416.europe-west2.run.app';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const data = localStorage.getItem(SCHOOL_PROFILE_KEY);
      if (!data) return DEFAULT_SCHOOL_PROFILE;
      const parsed: SchoolProfile = JSON.parse(data);
      if (
        !parsed.schoolName ||
        parsed.schoolName === 'Dil-Betigl Primary School'
      ) {
        const migrated: SchoolProfile = {
          ...DEFAULT_SCHOOL_PROFILE,
          ...parsed,
          schoolName: DEFAULT_SCHOOL_PROFILE.schoolName,
          amharicSchoolName:
            parsed.amharicSchoolName === 'ድል-በትግል የመጀመሪያ ደረጃ ትምህርት ቤት' || !parsed.amharicSchoolName
              ? DEFAULT_SCHOOL_PROFILE.amharicSchoolName
              : parsed.amharicSchoolName,
        };
        localStorage.setItem(SCHOOL_PROFILE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
    } catch {
      return DEFAULT_SCHOOL_PROFILE;
    }
  });

  const [savedItems, setSavedItems] = useState<SavedMaterial[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Failed to save materials to localStorage', e);
    }
  }, [savedItems]);

  const handleSaveSchoolProfile = (profile: SchoolProfile) => {
    setSchoolProfile(profile);
    try {
      localStorage.setItem(SCHOOL_PROFILE_KEY, JSON.stringify(profile));
      showToast('የትምህርት ቤት መረጃ በተሳካ ሁኔታ ተቀምጧል (School profile updated)');
    } catch (e) {
      console.warn('Failed to save school profile', e);
    }
  };

  const handleSaveToLibrary = (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => {
    const newItem: SavedMaterial = {
      ...item,
      id: 'mat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      schoolName: schoolProfile.schoolName,
    };
    setSavedItems((prev) => [newItem, ...prev]);
    showToast('በትምህርት ቤት ቤተ-መጻሕፍት ተቀምጧል (Saved to Library)');
  };

  const handleDeleteItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    showToast('ትምህርቱ ተሰርዟል (Item deleted)');
  };

  const handleClearAll = () => {
    setSavedItems([]);
    showToast('ሁሉም የተቀመጡ ትምህርቶች ተሰርዘዋል (Library cleared)');
  };

  const handleTabChange = (tab: AppTab) => {
    if (tab === 'quick-quiz' || tab === 'worksheet-maker') {
      requirePremium('worksheet', 'ፈተና መልመጃ እና ጥያቄ ማዘጋጀት (Quiz & Worksheet Maker)', () => setCurrentTab(tab));
      return;
    }
    if (tab === 'assignment-grader') {
      requirePremium('grader', 'ጽሁፍ ገምጋሚ (Assignment & Essay Reviewer)', () => setCurrentTab(tab));
      return;
    }
    if (tab === 'chat') {
      requirePremium('mentor', 'መምህር አማካሪ (AI Teacher Advisor & Mentor)', () => setCurrentTab(tab));
      return;
    }
    setCurrentTab(tab);
  };

  const handleOpenSchoolModal = () => {
    requirePremium('school', 'የትምህርት ቤት ስም ቀይር (School Name Customization)', () => setIsSchoolModalOpen(true));
  };

  const handleInsertChar = async (char: string) => {
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const val = activeEl.value;
      activeEl.value = val.substring(0, start) + char + val.substring(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + char.length;
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      await copyTextSafe(char);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Ethiopian Tricolor Accent Ribbon */}
      <div className="h-1.5 w-full flex no-print">
        <div className="flex-1 bg-emerald-600"></div>
        <div className="flex-1 bg-amber-400"></div>
        <div className="flex-1 bg-rose-600"></div>
      </div>

      {/* Main Header with Workplace Branding */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        savedCount={savedItems.length}
        onToggleKeyboard={() => setIsKeyboardOpen((prev) => !prev)}
        isKeyboardOpen={isKeyboardOpen}
        schoolProfile={schoolProfile}
        onOpenSchoolSettings={handleOpenSchoolModal}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        publishedUrl={PUBLISHED_URL}
      />

      {/* Teacher Workplace Welcome Strip */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-2 px-3 sm:px-6 lg:px-8 shadow-sm no-print">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left min-w-0">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">
              School: <strong className="text-amber-200 font-bold">{schoolProfile.schoolName}</strong>
              {schoolProfile.amharicSchoolName ? (
                <span className="hidden xl:inline text-emerald-100/90 font-amharic">
                  {' '}({schoolProfile.amharicSchoolName})
                </span>
              ) : null}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            <PWAInstallButton variant="strip" publishedUrl={PUBLISHED_URL} />
            <button
              onClick={async () => {
                if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                  try {
                    await navigator.share({
                      title: 'Meskerem school ai',
                      text: 'Ethiopian Teachers Daily & 5-Day Lesson Plans, Quizzes & Mark List Tools',
                      url: PUBLISHED_URL,
                    });
                    return;
                  } catch {
                    // Fallback to copy
                  }
                }
                const ok = await copyTextSafe(PUBLISHED_URL);
                showToast(
                  ok
                    ? '🔗 የተጋራው የድረ-ገጽ ሊንክ ተቀድቷል! (App link copied to clipboard)'
                    : '🔗 ከላይ ያለውን "Share" ቁልፍ ተጭነው ሊንኩን ይላኩ (Use Share button in header)'
                );
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg transition font-bold shadow-xs whitespace-nowrap"
              title="Share published link with other teachers"
            >
              🔗 Share App Link
            </button>
            <button
              onClick={handleOpenSchoolModal}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg transition font-semibold whitespace-nowrap border border-white/20"
            >
              ✏️ Edit School
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Subscription Expiration Notification */}
      {expiredNotice && (
        <div className="bg-rose-600 text-white px-4 py-3 text-xs font-bold no-print">
          <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-3">
            <span>{expiredNotice}</span>
            <button
              onClick={() => setExpiredNotice(null)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] shrink-0"
            >
              ዝጋ (Dismiss)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24">
        {currentTab === 'lesson-planner' && (
          <LessonPlanner
            schoolProfile={schoolProfile}
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
            onOpenSchoolSettings={handleOpenSchoolModal}
            onRequireFiveDays={(onProceed) => requirePremium('fiveDays', 'የ5 ቀናት ሳምንታዊ እቅድ (5-Days Weekly Plan)', onProceed)}
          />
        )}

        {currentTab === 'quick-quiz' && (
          <QuickQuizGenerator
            schoolProfile={schoolProfile}
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
            onOpenSchoolSettings={() => setIsSchoolModalOpen(true)}
          />
        )}

        {currentTab === 'worksheet-maker' && (
          <WorksheetMaker
            schoolProfile={schoolProfile}
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
            onOpenSchoolSettings={() => setIsSchoolModalOpen(true)}
          />
        )}

        {currentTab === 'fidel-chart' && <FidelChart />}

        {currentTab === 'grammar-lab' && (
          <GrammarLab
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
          />
        )}

        {currentTab === 'stories' && (
          <StoryGenerator
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
          />
        )}

        {currentTab === 'assignment-grader' && (
          <AssignmentGrader
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
          />
        )}

        {currentTab === 'translator' && (
          <CulturalTranslator
            onSaveToLibrary={handleSaveToLibrary}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <EducatorChat onOpenKeyboard={() => setIsKeyboardOpen(true)} />
        )}

        {currentTab === 'mark-list-tools' && (
          <MarkListTools
            schoolProfile={schoolProfile}
            onSaveToLibrary={handleSaveToLibrary}
            unlockedFeatures={unlockedFeatures}
            onRequirePremium={requirePremium}
            onOpenKeyboard={() => setIsKeyboardOpen(true)}
          />
        )}

        {currentTab === 'library' && (
          <SavedLibrary
            items={savedItems}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
          />
        )}
      </main>

      {/* Virtual Fidel Keyboard (Floating Bar) */}
      <FidelKeyboard
        isOpen={isKeyboardOpen}
        onClose={() => setIsKeyboardOpen(false)}
        onInsertText={handleInsertChar}
      />

      {/* School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        profile={schoolProfile}
        onSaveProfile={handleSaveSchoolProfile}
      />

      {/* Telebirr Premium Subscription Modal */}
      <TelebirrModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSubmitted={handlePaymentSubmitted}
        serviceTitle={activeServiceName}
        featureKey={pendingFeatureKey || 'general'}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onUpdateStatus={(_id, status, updatedReq) => {
          if (updatedReq) {
            if (status === 'approved') {
              setUnlockedFeatures((prev) => ({ ...prev, [updatedReq.featureKey]: true }));
              if (updatedReq.expiresAt) {
                setFeatureExpirations((prev) => ({ ...prev, [updatedReq.featureKey]: updatedReq.expiresAt! }));
              }
              showToast(`✅ "${updatedReq.serviceTitle}" ለ30 ቀናት በባለቤቱ ተፈቅዷል! (Approved for 30 days)`);
            } else if (status === 'rejected') {
              setUnlockedFeatures((prev) => ({ ...prev, [updatedReq.featureKey]: false }));
              showToast(`⛔ "${updatedReq.serviceTitle}" ጥያቄ በባለቤቱ ታግዷል። (Blocked)`);
            }
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-6 text-xs text-stone-600 no-print">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-stone-900 text-sm">
                Meskerem school ai
              </span>
              <span className="text-stone-300">•</span>
              <span className="font-amharic font-semibold text-emerald-800">
                {schoolProfile.schoolName}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Ethiopian MoE Curriculum (Pre-Primary – Grade 8)
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Print & Export Ready</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="font-semibold text-stone-800 flex flex-wrap items-center justify-center gap-1.5">
              <span>Copyright ©️ {new Date().getFullYear()}</span>
              <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Zenaneh Tsegaye
              </span>
              <span>• የቅጂ መብት ©️ ዜናነህ ፀጋዬ</span>
            </div>
            <div className="text-stone-500">
              ለኢትዮጵያ መምህራን እና ተማሪዎች በክብር የተዘጋጀ
            </div>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 transition-all duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
