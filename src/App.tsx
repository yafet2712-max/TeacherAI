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
import { OfflineIndicator } from './components/OfflineIndicator';
import { AppTab, SavedMaterial, SchoolProfile } from './types';
import { ShieldCheck, School, Sparkles, BookOpen, Zap } from 'lucide-react';

const STORAGE_KEY = 'amharic_teacher_helper_saved_v2';
const SCHOOL_PROFILE_KEY = 'amharic_teacher_helper_school_profile_v1';

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Dil-Betigl Primary School',
  amharicSchoolName: 'ድል-በትግል የመጀመሪያ ደረጃ ትምህርት ቤት',
  woredaSubcity: 'Yeka Sub-City, Woreda 08',
  cityRegion: 'Addis Ababa',
  teacherName: '',
  department: 'Primary Education Department',
  motto: 'Striving for Quality Education / ለላቀ የትምህርት ጥራት እንተጋለን',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('lesson-planner');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Premium Subscriptions State for the 5 Requested Features
  // 1. School Name Settings (የትምህርት ቤት ስም ቀይር)
  // 2. Worksheet Maker / Quizzes (ፈተና መልመጃ)
  // 3. Assignment Grader (ጽሁፍ ገምጋሚ)
  // 4. AI Mentor Chat (መምህር አማካሪ)
  // 5. 5-Days Weekly Plan (የ5 ቀናት ሳምንታዊ እቅድ - 1 free trial allowed)
  const [unlockedFeatures, setUnlockedFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const data = localStorage.getItem('teacher_helper_unlocked_features_v1');
      return data ? JSON.parse(data) : { school: false, worksheet: false, grader: false, mentor: false, fiveDays: false };
    } catch {
      return { school: false, worksheet: false, grader: false, mentor: false, fiveDays: false };
    }
  });

  const [fiveDaysTrialUsed, setFiveDaysTrialUsed] = useState<boolean>(() => {
    return localStorage.getItem('teacher_helper_5days_trial') === 'true';
  });

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [activeServiceName, setActiveServiceName] = useState('');
  const [pendingFeatureKey, setPendingFeatureKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('teacher_helper_unlocked_features_v1', JSON.stringify(unlockedFeatures));
    } catch (e) {
      console.warn('Failed to save unlocked features', e);
    }
  }, [unlockedFeatures]);

  const requirePremium = (featureKey: string, serviceTitle: string, onProceed: () => void) => {
    if (unlockedFeatures[featureKey]) {
      onProceed();
      return;
    }

    // Special rule for 5th option (5-days plan): 1 free trial allowed
    if (featureKey === 'fiveDays' && !fiveDaysTrialUsed) {
      setFiveDaysTrialUsed(true);
      localStorage.setItem('teacher_helper_5days_trial', 'true');
      showToast('🎁 የነጻ ሙከራዎ (Free Trial) ተሳክቷል! የመጀመሪያውን የ5 ቀናት እቅድ በነጻ ይጠቀሙ።');
      onProceed();
      return;
    }

    // Otherwise require 50 ETB Telebirr payment
    setActiveServiceName(serviceTitle);
    setPendingFeatureKey(featureKey);
    setPremiumModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (pendingFeatureKey) {
      setUnlockedFeatures((prev) => ({ ...prev, [pendingFeatureKey]: true }));
      showToast(`🎉 እንኳን ደስ አሎት! "${activeServiceName}" አገልግሎት በቴሌብር ክፍያ ተከፍቷል። (Unlocked!)`);
    }
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
      return data ? JSON.parse(data) : DEFAULT_SCHOOL_PROFILE;
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

  const handleInsertChar = (char: string) => {
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const val = activeEl.value;
      activeEl.value = val.substring(0, start) + char + val.substring(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + char.length;
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      navigator.clipboard.writeText(char);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
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
        publishedUrl="https://ais-pre-ggmao2jh2kg5djgbq7rjc7-389524282416.europe-west2.run.app"
      />

      {/* Teacher Workplace Welcome Strip */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white py-2.5 px-4 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-amber-200" />
            <span>
              የትምህርት ቤትዎ ስም: <strong className="text-amber-100 font-bold">{schoolProfile.schoolName}</strong>
              {schoolProfile.amharicSchoolName ? ` (${schoolProfile.amharicSchoolName})` : ''}
            </span>
            <span className="hidden lg:inline bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-400/40">
              ✓ .Docx Download Active
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-amber-200 hidden md:inline">
              {schoolProfile.woredaSubcity || schoolProfile.cityRegion}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(PUBLISHED_URL);
                showToast('🔗 የተጋራው የድረ-ገጽ ሊንክ ተቀድቷል! (Published app link copied to clipboard!)');
              }}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition font-bold shadow-sm flex items-center gap-1.5"
              title="Copy published link to share with other teachers"
            >
              <span>🔗 ሊንኩን ቅዳ (Copy Published Link)</span>
            </button>
            <button
              onClick={handleOpenSchoolModal}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold"
            >
              የትምህርት ቤት ስም ቀይር (Edit School)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
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
        onSuccess={handlePaymentSuccess}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-8 text-xs text-stone-600 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-amharic font-bold text-stone-800 text-sm">
                {schoolProfile.schoolName || 'የአማርኛ እና የመጀመሪያ ደረጃ መምህር ረዳት'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ነጻ እና ገደብ የሌለው (Free & Unlimited)
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-500">
              <span>Ethiopian MoE Curriculum Standards (Grade 1–8)</span>
              <span>•</span>
              <span>All Primary Subjects</span>
              <span>•</span>
              <span>Print-Ready Classroom Materials</span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <span>Copyright ©️ {new Date().getFullYear()}</span>
              <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Zenaneh Tsegaye
              </span>
              <span>• All rights reserved. • የቅጂ መብት ©️ ዜናነህ ፀጋዬ</span>
            </div>
            <div className="text-stone-400">
              ለኢትዮጵያ መምህራን እና ተማሪዎች በክብር የተዘጋጀ
            </div>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-bounce duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
