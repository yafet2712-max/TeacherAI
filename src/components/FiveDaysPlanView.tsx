import React, { useState } from 'react';
import { FiveDaysPlanData, DayPlanItem, LessonPlanStageRow } from '../types';
import { Printer, Copy, Check, Bookmark, Edit3, Eye, Download, Calendar, Layers, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { exportFiveDaysPlanToDocx } from '../utils/docxExport';
import { copyTextSafe } from '../utils/clipboard';

interface FiveDaysPlanViewProps {
  plan: FiveDaysPlanData;
  onUpdatePlan?: (updated: FiveDaysPlanData) => void;
  onSave?: () => void;
  isSaved?: boolean;
  onConvertToDailyPlan?: (day: DayPlanItem) => void;
}

const BlankLine: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <span
    aria-hidden="true"
    className={`inline-block border-b border-stone-400 align-bottom ${
      wide ? 'w-44 sm:w-64 max-w-full' : 'w-28 sm:w-40 max-w-full'
    }`}
  >
    &nbsp;
  </span>
);

// Normalizes day stages into the exact 3-row, 9-column Ethiopian MoE format
function getDayStages(day: DayPlanItem, isAmharic: boolean, isOromic?: boolean): LessonPlanStageRow[] {
  if (day.stages && day.stages.length >= 3) {
    return day.stages;
  }
  return [
    {
      stage: isOromic
        ? 'Starter (Qophii fi Ka\'umsa)'
        : isAmharic
        ? 'Starter (ማነሳሳትና መከለስ)'
        : 'Starter (Motivation & Introduction)',
      timeAllotment: isOromic ? '5 daq' : isAmharic ? '5 ደቂቃ' : '5 min',
      learningContents: day.lessonTopic || day.subTopic || '',
      page: '1-5',
      teacherActivities: day.starterActivities || (
        isOromic
          ? 'Barsiisaan nagaa gaafata, kaka\'umsa uuma, mata duree har\'aa beeksisa.'
          : isAmharic
          ? 'ሰላምታ ይሰጣል፣ የቀደመ ትምህርት ይከልሳል፣ የዛሬውን ርዕስ ያስተዋውቃል።'
          : 'Greets learners, reviews previous lesson, and introduces today\'s topic.'
      ),
      studentActivities: isOromic
        ? 'Barattoonni nagaa deebisu, gaaffiiwwan ka\'umsaa deebisu.'
        : isAmharic
        ? 'ሰላምታ ይመልሳሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ።'
        : 'Greet the teacher, answer warm-up questions, and listen actively.',
      assessmentTechniques: day.assessmentTechniques || (isOromic ? 'Gaaffii afaanii' : isAmharic ? 'የቃል ጥያቄ' : 'Oral question'),
      teachingAids: day.teachingAids || (isOromic ? 'Kaardii fiilashii, kitaaba' : isAmharic ? 'ፍላሽ ካርድ፣ መጽሐፍ' : 'Flashcards, Textbook'),
      remarks: day.remarks || '-',
    },
    {
      stage: isOromic
        ? 'Main Activities (Gochaalee Gurguddoo)'
        : isAmharic
        ? 'Main Activities (ዋና ተግባራት)'
        : 'Main Activities (Lesson Presentation)',
      timeAllotment: isOromic ? '25-30 daq' : isAmharic ? '25-30 ደቂቃ' : '25-30 min',
      learningContents: day.lessonTopic || day.subTopic || '',
      page: '1-5',
      teacherActivities: day.mainActivities || (
        isOromic
          ? 'Qabiyyee barnootaa fakkeenyaan ibsa, barattoota hirmaachisa, hojii daree hordofa.'
          : isAmharic
          ? 'ዋናውን ጽንሰ-ሀሳብ በምሳሌዎች ያስረዳል፣ የተማሪዎችን የክፍል ስራ ይከታተላል።'
          : 'Explains core concepts, models examples, and guides student activities.'
      ),
      studentActivities: isOromic
        ? 'Xiyyeeffannoon dhaggeeffatu, daftara irratti qabatu, hojii daree hojjatu.'
        : isAmharic
        ? 'ያዳምጣሉ፣ በደብተራቸው ይጽፋሉ፣ የክፍል ስራ ይሰራሉ።'
        : 'Listen attentively, take notes, and complete class work exercises.',
      assessmentTechniques: day.assessmentTechniques || (isOromic ? 'Hojii daree, hordoffii' : isAmharic ? 'የክፍል ስራ፣ ምልከታ' : 'Class work, observation'),
      teachingAids: day.teachingAids || (isOromic ? 'Kitaaba barataa, gabatee' : isAmharic ? 'የተማሪው መጽሐፍ፣ ሰሌዳ' : 'Student textbook, chalkboard'),
      remarks: '-',
    },
    {
      stage: isOromic
        ? 'Concluding Activities (Gochaalee Xumuraa)'
        : isAmharic
        ? 'Concluding Activities (ማጠቃለያና የቤት ስራ)'
        : 'Concluding Activities & Homework',
      timeAllotment: isOromic ? '5 daq' : isAmharic ? '5 ደቂቃ' : '5 min',
      learningContents: day.homework || (isOromic ? 'Cuunfaa fi Hojii Manaa' : isAmharic ? 'ማጠቃለያ እና የቤት ስራ' : 'Summary & Homework'),
      page: '-',
      teacherActivities: day.concludingActivities
        ? `${day.concludingActivities} ${day.homework ? `| ${isOromic ? 'Hojii manaa:' : isAmharic ? 'የቤት ስራ:' : 'Homework:'} ${day.homework}` : ''}`
        : (isOromic ? 'Qabxiilee guguddoo cuunfa, hojii manaa kenna.' : isAmharic ? 'ዋና ዋና ነጥቦችን ያጠቃልላል፣ የቤት ስራ ይሰጣል።' : 'Summarizes key points and assigns homework.'),
      studentActivities: isOromic
        ? 'Cuunfaa hubatu, hojii manaa galmeeffatu.'
        : isAmharic
        ? 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ ይመዘግባሉ።'
        : 'Answer review questions and record homework.',
      assessmentTechniques: isOromic ? 'Gaaffii afaanii' : isAmharic ? 'የቃል ጥያቄ' : 'Oral question',
      teachingAids: '-',
      remarks: '-',
    },
  ];
}

export const FiveDaysPlanView: React.FC<FiveDaysPlanViewProps> = ({
  plan: initialPlan,
  onUpdatePlan,
  onSave,
  isSaved,
  onConvertToDailyPlan,
}) => {
  const [plan, setPlan] = useState<FiveDaysPlanData>(initialPlan);
  const [activeDayIndex, setActiveDayIndex] = useState<number | 'all'>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const isOromic =
    plan.subject?.toLowerCase().includes('orom') ||
    plan.subject?.includes('ኦሮሞ') ||
    plan.unitAndTopic?.toLowerCase().includes('boqonnaa') ||
    plan.generalCompetencies?.toLowerCase().includes('barattoonni');

  const isAmharic =
    !isOromic &&
    (plan.subject?.includes('አማርኛ') ||
      plan.subject?.includes('ሳይንስ') ||
      plan.subject?.includes('ሒሳብ') ||
      plan.unitAndTopic?.includes('ምዕራፍ') ||
      plan.generalCompetencies?.includes('ተማሪዎች'));

  const handleFieldChange = (field: keyof FiveDaysPlanData, value: any) => {
    const updated = { ...plan, [field]: value };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleDayFieldChange = (dayIdx: number, field: keyof DayPlanItem, value: any) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIdx] = { ...updatedDays[dayIdx], [field]: value };
    const updated = { ...plan, days: updatedDays };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleStageFieldChange = (dayIdx: number, stageIdx: number, field: keyof LessonPlanStageRow, value: string) => {
    const updatedDays = [...plan.days];
    const currentStages = getDayStages(updatedDays[dayIdx], isAmharic, isOromic);
    const updatedStages = [...currentStages];
    updatedStages[stageIdx] = { ...updatedStages[stageIdx], [field]: value };
    updatedDays[dayIdx] = { ...updatedDays[dayIdx], stages: updatedStages };
    const updated = { ...plan, days: updatedDays };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleDaySpecialNeedsChange = (dayIdx: number, key: 'slowLearners' | 'mediumLearners' | 'fastLearners', value: string) => {
    const updatedDays = [...plan.days];
    const currentDay = updatedDays[dayIdx];
    const currentSpecial = currentDay.specialNeedsSupport || plan.specialNeedsSupport;
    updatedDays[dayIdx] = {
      ...currentDay,
      specialNeedsSupport: {
        ...currentSpecial,
        [key]: value,
      },
    };
    const updated = { ...plan, days: updatedDays };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleMainIdeaChange = (idx: number, value: string) => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    current[idx] = value;
    handleFieldChange('mainIdeas', current);
  };

  const handleAddMainIdea = () => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    handleFieldChange('mainIdeas', [...current, '']);
  };

  const handleRemoveMainIdea = (idx: number) => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    handleFieldChange(
      'mainIdeas',
      current.filter((_, i) => i !== idx)
    );
  };

  const handleAddDay = () => {
    const nextNum = plan.days.length + 1;
    const newDay: DayPlanItem = {
      dayNumber: nextNum,
      dayName: isOromic ? `Guyyaa ${nextNum}` : isAmharic ? `ቀን ${nextNum}` : `Day ${nextNum}`,
      date: '',
      lessonTopic: '',
      subTopic: '',
      competencies: plan.generalCompetencies || '',
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    };
    const updated = { ...plan, days: [...plan.days, newDay] };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
    setActiveDayIndex(updated.days.length - 1);
  };

  const handleRemoveDay = (dayIdx: number) => {
    if (plan.days.length <= 1) return;
    const updatedDays = plan.days.filter((_, idx) => idx !== dayIdx);
    const updated = { ...plan, days: updatedDays };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
    setActiveDayIndex((prev) =>
      prev === 'all' ? 'all' : Math.min(prev, Math.max(0, updatedDays.length - 1))
    );
  };

  const handleCopyText = async () => {
    let text = `${isOromic ? 'KAROORA BARNOOTA TORBEE (WEEKLY LESSON PLAN)' : isAmharic ? 'ሳምንታዊ የትምህርት እቅድ (WEEKLY LESSON PLAN)' : 'WEEKLY LESSON PLAN'} (Landscape Format)\n\n`;
    text += `Teacher: ${plan.teacherName}    School: ${plan.schoolName}\n`;
    text += `Subject: ${plan.subject}    Unit and topic: ${plan.unitAndTopic}\n`;
    text += `Grade & Section: ${plan.gradeAndSection}    Week: ${plan.weekRangeOrDates}\n`;
    if (Array.isArray(plan.mainIdeas) && plan.mainIdeas.length > 0) {
      text += `\nMain Ideas:\n${plan.mainIdeas.map((m) => `• ${m}`).join('\n')}\n`;
    }
    text += `\n`;

    plan.days.forEach((day) => {
      const stages = getDayStages(day, isAmharic, isOromic);
      text += `==========================================================\n`;
      text += `${day.dayName} - ${day.lessonTopic || day.subTopic || ''}\n`;
      text += `Date: ${day.date || day.dayName}\n`;
      text += `Competencies: ${day.competencies || plan.generalCompetencies}\n`;
      text += `Stages | Time | Contents | Page | Teacher activities | Student activities | Assessment | Aids | Remarks\n`;
      stages.forEach((s) => {
        text += `${s.stage} | ${s.timeAllotment} | ${s.learningContents} | ${s.page} | ${s.teacherActivities} | ${s.studentActivities} | ${s.assessmentTechniques} | ${s.teachingAids} | ${s.remarks}\n`;
      });
      text += `\n`;
    });

    const ok = await copyTextSafe(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const daysToRender =
    activeDayIndex === 'all'
      ? plan.days.map((d, i) => ({ day: d, index: i }))
      : [{ day: plan.days[activeDayIndex] || plan.days[0], index: typeof activeDayIndex === 'number' ? activeDayIndex : 0 }];

  const hasContent = Boolean(plan.unitAndTopic || plan.generalCompetencies || plan.days.some((d) => d.lessonTopic || d.subTopic));
  const effectiveMainIdeas: string[] =
    Array.isArray(plan.mainIdeas) && plan.mainIdeas.length > 0
      ? plan.mainIdeas
      : hasContent
      ? [
          plan.rationale,
          ...plan.days
            .map((d) => {
              const t = d.lessonTopic || d.subTopic;
              return t ? `${d.dayName}: ${t}` : '';
            })
            .filter(Boolean),
        ]
          .filter((v): v is string => Boolean(v && v.trim()))
          .slice(0, 6)
      : [];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area landscape-print">
      {/* Top Actions Bar (Hidden during print) */}
      <div className="bg-stone-100/90 border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Day Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {plan.days.map((day, idx) => (
            <button
              key={day.dayNumber || idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeDayIndex === idx
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{day.dayName}</span>
            </button>
          ))}

          <button
            onClick={() => setActiveDayIndex('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeDayIndex === 'all'
                ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-700'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isOromic ? `Guyyoota ${plan.days.length} Hunda` : isAmharic ? `ሙሉ ${plan.days.length} ቀናት (All)` : `All ${plan.days.length} Days`}</span>
          </button>

          <button
            type="button"
            onClick={handleAddDay}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
            title="Add another day to this weekly plan"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ቀን ጨምር' : 'Add Day'}</span>
          </button>

          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md whitespace-nowrap">
            Landscape A4
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onConvertToDailyPlan && activeDayIndex !== 'all' && plan.days[activeDayIndex] && (
            <button
              onClick={() => onConvertToDailyPlan(plan.days[activeDayIndex])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition"
              title="Open selected day as an editable 1-day lesson plan"
            >
              <span>📄 Open as 1-Day Plan</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isEditing
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? (isOromic ? 'View Mode (Ilaali)' : 'View Mode (አሳይ)') : (isOromic ? 'Edit Cells (Gulaali)' : 'Edit Cells (አስተካክል)')}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : 'Save Plan'}</span>
            </button>
          )}

          <button
            onClick={() => exportFiveDaysPlanToDocx(plan)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-600/20"
            title="Download formatted Microsoft Word .docx file matching daily format 100%"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .Docx</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Landscape Paper Canvas: 100% exact format of Daily Lesson Plan for every single day */}
      <div className="p-4 sm:p-6 md:p-10 text-stone-900 font-sans text-xs sm:text-sm leading-relaxed max-w-[1360px] mx-auto space-y-10">
        {/* Weekly Main Ideas Described Card */}
        {(effectiveMainIdeas.length > 0 || isEditing) && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 print:bg-white print:border-stone-400 print:rounded-none">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs sm:text-sm">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 no-print" />
                <span>
                  {isOromic
                    ? 'Yaadawwan Ijoo Torbee (Weekly Main Ideas Described)'
                    : isAmharic
                    ? 'የሳምንቱ ትምህርት ዋና ዋና ሃሳቦች (Weekly Main Ideas Described)'
                    : 'Weekly Key Lesson Main Ideas Described'}
                </span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddMainIdea}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Idea</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                {(plan.mainIdeas && plan.mainIdeas.length > 0 ? plan.mainIdeas : effectiveMainIdeas).map((idea, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={idea}
                      onChange={(e) => handleMainIdeaChange(idx, e.target.value)}
                      className="flex-1 bg-white border border-amber-400 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMainIdea(idx)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-xs text-stone-800">
                {effectiveMainIdeas.map((idea, idx) => (
                  <li key={idx}>{idea}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {daysToRender.map(({ day, index: dayIdx }, renderIdx) => {
          const stages = getDayStages(day, isAmharic, isOromic);
          const daySpecial = day.specialNeedsSupport || plan.specialNeedsSupport;

          return (
            <div
              key={day.dayNumber || dayIdx}
              className={renderIdx > 0 ? 'pt-8 border-t-2 border-dashed border-stone-300 print:break-before-page' : ''}
            >
              {/* Official Centered Title Header */}
              <div className="text-center mb-5 relative">
                {isEditing && plan.days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(dayIdx)}
                    className="no-print absolute right-0 top-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                    title="Remove this day"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Day</span>
                  </button>
                )}
                {isEditing ? (
                  <div className="inline-flex items-center gap-2 justify-center mb-1">
                    <span className="text-xs font-semibold text-stone-500">Day Label:</span>
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) => handleDayFieldChange(dayIdx, 'dayName', e.target.value)}
                      className="border-b border-amber-500 font-bold text-base sm:text-lg text-center px-2 py-0.5 focus:outline-none"
                    />
                  </div>
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold italic tracking-wide text-stone-900">
                    {isOromic
                      ? `KAROORA BARNOOTA GUYYAA (${day.dayName.toUpperCase()})`
                      : isAmharic
                      ? `ዕለታዊ የትምህርት እቅድ (${day.dayName})`
                      : `DAILY LESSON PLAN (${day.dayName.toUpperCase()})`}
                  </h1>
                )}
                <div className="text-xs font-semibold text-stone-500 mt-1">
                  {isOromic
                    ? `Sirna Barnoota Oromiyaa fi Itoophiyaa • Landscape • ${plan.weekRangeOrDates || 'Karoora Guyyaa'}`
                    : isAmharic
                    ? `የኢትዮጵያ ትምህርት ሚኒስቴር ይፋዊ የ9-ዓምድ ሰንጠረዥ (Landscape) • ${plan.weekRangeOrDates || 'ሳምንታዊ'}`
                    : `Official Ministry of Education Primary 9-Column Table (Landscape) • ${plan.weekRangeOrDates || 'Weekly'}`}
                </div>
              </div>

              {/* Top Two-Column Information Fields (Localized identically to DailyLessonPlanView) */}
              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Maqaa Barsiisaa:- ' : isAmharic ? 'የመምህሩ ስም:- ' : 'Name of teacher:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plan.teacherName}
                        onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                        className="border-b border-amber-500 font-semibold px-1 py-0.5 w-full sm:w-60 focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold">{plan.teacherName || <BlankLine />}</span>
                    )}
                  </div>

                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Maqaa Mana Barumsaa:- ' : isAmharic ? 'የማስተማሪያ ት/ቤት ስም:- ' : 'Name of School:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plan.schoolName}
                        onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                        className="border-b border-amber-500 font-semibold px-1 py-0.5 w-full sm:w-60 focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold uppercase">{plan.schoolName || <BlankLine wide />}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Gosa Barnootaa:- ' : isAmharic ? 'የትምህርት ዓይነት:- ' : 'Subject:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plan.subject}
                        onChange={(e) => handleFieldChange('subject', e.target.value)}
                        className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-48 focus:outline-none"
                      />
                    ) : (
                      <span>{plan.subject || <BlankLine />}</span>
                    )}
                  </div>

                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Boqonnaa fi Mata Duree:- ' : isAmharic ? 'ምዕራፍ እና ርዕስ:- ' : 'Unit and topic:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plan.unitAndTopic}
                        onChange={(e) => handleFieldChange('unitAndTopic', e.target.value)}
                        className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-60 focus:outline-none"
                      />
                    ) : (
                      <span>{plan.unitAndTopic || <BlankLine wide />}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Kutaa fi Sekshinii:- ' : isAmharic ? 'ክፍል እና ሴክሽን:- ' : 'Grade and Section:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plan.gradeAndSection}
                        onChange={(e) => handleFieldChange('gradeAndSection', e.target.value)}
                        className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-40 focus:outline-none"
                      />
                    ) : (
                      <span>{plan.gradeAndSection || <BlankLine />}</span>
                    )}
                  </div>

                  <div>
                    <span className="italic font-medium">
                      {isOromic ? 'Mata Duree Xiqqaa:- ' : isAmharic ? 'ንዑስ ርዕስ (የክፍለ-ጊዜው ርዕስ):- ' : 'Lesson topic:- '}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={day.lessonTopic || day.subTopic || ''}
                        onChange={(e) => handleDayFieldChange(dayIdx, 'lessonTopic', e.target.value)}
                        className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-60 focus:outline-none font-semibold text-amber-900"
                      />
                    ) : (
                      <span className="font-semibold text-amber-900">{day.lessonTopic || day.subTopic || <BlankLine wide />}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="italic font-medium">
                    {isOromic ? 'Guyyaa:- ' : isAmharic ? 'ቀን:- ' : 'Date:- '}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={day.date || day.dayName}
                      onChange={(e) => handleDayFieldChange(dayIdx, 'date', e.target.value)}
                      className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-64 focus:outline-none"
                    />
                  ) : (
                    <span>{day.date || day.dayName || <BlankLine wide />}</span>
                  )}
                </div>

                <div className="pt-2 space-y-1">
                  <p>
                    <span className="italic font-medium">
                      {isOromic ? 'Kaayyoo/Sababii Barichaa:- ' : isAmharic ? 'የትምህርቱ አስፈላጊነት (Rationale):- ' : 'Rationale of the topic:- '}
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={day.rationale || plan.rationale}
                        onChange={(e) => handleDayFieldChange(dayIdx, 'rationale', e.target.value)}
                        className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                      />
                    ) : (
                      <span>{day.rationale || plan.rationale || <BlankLine wide />}</span>
                    )}
                  </p>

                  <p>
                    <span className="italic font-medium">
                      {isOromic ? 'Beekumsa Duraan Qaban:- ' : isAmharic ? 'ቀድሞ የነበረ እውቀት (Pre-requisite):- ' : 'Pre-requisite knowledge:- '}
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={day.prerequisiteKnowledge || day.starterActivities || ''}
                        onChange={(e) => handleDayFieldChange(dayIdx, 'prerequisiteKnowledge', e.target.value)}
                        className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                      />
                    ) : (
                      <span>{day.prerequisiteKnowledge || day.starterActivities || <BlankLine wide />}</span>
                    )}
                  </p>

                  <p>
                    <span className="italic font-medium">
                      {isOromic ? 'Bu\'aalee Barachuu (Competencies):- ' : isAmharic ? 'የመማር ማስተማር ዓላማዎች (Competencies):- ' : 'Competencies (Learning objectives):- '}
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={day.competencies || plan.generalCompetencies}
                        onChange={(e) => handleDayFieldChange(dayIdx, 'competencies', e.target.value)}
                        className="w-full border border-amber-400 p-1 rounded focus:outline-none font-semibold text-emerald-900"
                      />
                    ) : (
                      <span className="font-semibold text-emerald-950">{day.competencies || plan.generalCompetencies || <BlankLine wide />}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Exact 9-Column Daily Lesson Plan Table */}
              <div className="overflow-x-auto my-6 border border-stone-800">
                <table className="w-full border-collapse text-[11px] sm:text-xs">
                  <thead>
                    <tr className="bg-stone-200/90 border-b border-stone-800 text-stone-900 font-bold italic text-center text-[10px] sm:text-xs">
                      <th className="border-r border-stone-800 p-2 min-w-[90px]">
                        <div>Stages</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Sadarkaa)' : '(ደረጃዎች)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[55px]">
                        <div>Time</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Yeroo)' : '(ጊዜ)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[95px]">
                        <div>Learning Contents</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Qabiyyee)' : '(የትምህርት ይዘት)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[40px]">
                        <div>Page</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Fuula)' : '(ገጽ)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[150px]">
                        <div>Teacher's activities</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Gocha Barsiisaa)' : '(የመምህሩ ተግባራት)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[140px]">
                        <div>Student's activities</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Gocha Barattootaa)' : '(የተማሪው ተግባራት)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[90px]">
                        <div>Assessment</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Madaallii)' : '(የምዘና ዘዴዎች)'}
                        </div>
                      </th>
                      <th className="border-r border-stone-800 p-2 min-w-[85px]">
                        <div>Teaching Aids</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Meeshaalee)' : '(ማስተማሪያ መርጃ)'}
                        </div>
                      </th>
                      <th className="p-2 min-w-[55px]">
                        <div>Remarks</div>
                        <div className="text-[9px] font-normal not-italic text-stone-600">
                          {isOromic ? '(Yaada)' : '(አስተያየት)'}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 align-top">
                    {stages.map((row, sIdx) => (
                      <tr key={sIdx} className="divide-x divide-stone-800">
                        <td className="p-2 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.stage}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'stage', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.stage}</span>
                          )}
                        </td>

                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.timeAllotment}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'timeAllotment', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded text-center"
                            />
                          ) : (
                            <span>{row.timeAllotment}</span>
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <textarea
                              rows={3}
                              value={row.learningContents}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'learningContents', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.learningContents}</span>
                          )}
                        </td>

                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.page}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'page', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded text-center"
                            />
                          ) : (
                            <span>{row.page}</span>
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <textarea
                              rows={4}
                              value={row.teacherActivities}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'teacherActivities', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.teacherActivities}</span>
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <textarea
                              rows={4}
                              value={row.studentActivities}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'studentActivities', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.studentActivities}</span>
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <textarea
                              rows={3}
                              value={row.assessmentTechniques}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'assessmentTechniques', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.assessmentTechniques}</span>
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.teachingAids}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'teachingAids', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded"
                            />
                          ) : (
                            <span>{row.teachingAids}</span>
                          )}
                        </td>

                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => handleStageFieldChange(dayIdx, sIdx, 'remarks', e.target.value)}
                              className="w-full border border-amber-300 p-1 rounded text-center"
                            />
                          ) : (
                            <span>{row.remarks || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Support for learners of special needs (100% identical per day) */}
              <div className="my-6 space-y-1.5">
                <h4 className="italic font-bold">
                  {isOromic
                    ? 'Support for learners of special needs (Barattoota Fedhii Addaa Qabaniif):-'
                    : isAmharic
                    ? 'Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-'
                    : 'Support for learners of special needs:-'}
                </h4>
                <p className="pl-4">
                  <span className="font-medium">
                    {isOromic ? '- Slow learners (Suuta barataniif): ' : '- Slow learners: '}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={daySpecial?.slowLearners || ''}
                      onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'slowLearners', e.target.value)}
                      className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <span>{daySpecial?.slowLearners || 'Deeggarsa dhuunfaa fi fakkeenya salphaa kennuu / Provide extra practice with peer support.'}</span>
                  )}
                </p>

                <p className="pl-4">
                  <span className="font-medium">
                    {isOromic ? '- Medium learners (Giddu-galeeyyii): ' : '- Medium learners: '}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={daySpecial?.mediumLearners || ''}
                      onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'mediumLearners', e.target.value)}
                      className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <span>{daySpecial?.mediumLearners || 'Hojii daree idilee fi hordoffii gochuu / Standard pace activities.'}</span>
                  )}
                </p>

                <p className="pl-4">
                  <span className="font-medium">
                    {isOromic ? '- Fast learners (Dafanii baratan): ' : '- Fast learners: '}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={daySpecial?.fastLearners || ''}
                      onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'fastLearners', e.target.value)}
                      className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <span>{daySpecial?.fastLearners || 'Hojiiwwan dabalataa fi gaaffii cimaa kennuu / Provide extension and enrichment exercises.'}</span>
                  )}
                </p>
              </div>

              {/* Bottom Official Signatures Table (100% identical per day) */}
              <div className="my-6 border border-stone-800">
                <table className="w-full border-collapse text-xs">
                  <tbody className="divide-y divide-stone-800">
                    <tr className="divide-x divide-stone-800">
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Maqaa Barsiisaa:- ' : isAmharic ? 'የመምህሩ ስም:- ' : "Teacher's Name:- "}
                        </span>
                        <span className="font-bold">{plan.teacherName || <BlankLine />}</span>
                      </td>
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Mallattoo:- ' : isAmharic ? 'ፊርማ:- ' : 'Signature:- '}
                        </span>
                        <BlankLine />
                      </td>
                    </tr>

                    <tr className="divide-x divide-stone-800">
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Maqaa Dura Taa\'aa Garee:- ' : isAmharic ? 'የክፍለ ትምህርት ኃላፊ ስም:- ' : "Dept. Head's Name:- "}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={plan.deptHeadName || ''}
                            onChange={(e) => handleFieldChange('deptHeadName', e.target.value)}
                            placeholder="Name..."
                            className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                          />
                        ) : (
                          <span>{plan.deptHeadName || <BlankLine />}</span>
                        )}
                      </td>
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Mallattoo:- ' : isAmharic ? 'ፊርማ:- ' : 'Signature:- '}
                        </span>
                        <BlankLine />
                      </td>
                    </tr>

                    <tr className="divide-x divide-stone-800">
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Maqaa Itti Aanaa Hojii Gaggeessaa:- ' : isAmharic ? 'የርዕሰ መምህር / ም/ርዕሰ መምህር ስም:- ' : 'Name of the Vice - principal:- '}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={plan.vicePrincipalName || ''}
                            onChange={(e) => handleFieldChange('vicePrincipalName', e.target.value)}
                            placeholder="Name..."
                            className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                          />
                        ) : (
                          <span>{plan.vicePrincipalName || <BlankLine />}</span>
                        )}
                      </td>
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Mallattoo:- ' : isAmharic ? 'ፊርማ:- ' : 'Signature:- '}
                        </span>
                        <BlankLine />
                      </td>
                    </tr>

                    <tr className="divide-x divide-stone-800">
                      <td className="p-2 w-1/2">
                        <span className="font-medium">
                          {isOromic ? 'Madaallii Barsiisaa Ofii Isaanii:- ' : isAmharic ? 'የትምህርት አሰጣጥ ራስ-ምዘና:- ' : "Post lesson teacher's self-assessment:- "}
                        </span>
                      </td>
                      <td className="p-2 w-1/2 min-h-[40px]">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={day.postLessonAssessment || ''}
                            onChange={(e) => handleDayFieldChange(dayIdx, 'postLessonAssessment', e.target.value)}
                            placeholder="Teacher's reflection..."
                            className="w-full border border-amber-300 p-1 rounded"
                          />
                        ) : (
                          <span>{day.postLessonAssessment || ''}</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
