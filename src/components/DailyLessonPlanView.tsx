import React, { useState } from 'react';
import { DailyLessonPlanData } from '../types';
import { Printer, Copy, Check, Bookmark, Edit3, Eye, Download, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { exportLessonPlanToDocx } from '../utils/docxExport';
import { copyTextSafe } from '../utils/clipboard';

interface DailyLessonPlanViewProps {
  plan: DailyLessonPlanData;
  onUpdatePlan?: (updated: DailyLessonPlanData) => void;
  onSave?: () => void;
  isSaved?: boolean;
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

export const DailyLessonPlanView: React.FC<DailyLessonPlanViewProps> = ({
  plan: initialPlan,
  onUpdatePlan,
  onSave,
  isSaved,
}) => {
  const [plan, setPlan] = useState<DailyLessonPlanData>(initialPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const isOromic =
    plan.subject?.toLowerCase().includes('orom') ||
    plan.subject?.includes('ኦሮሞ') ||
    plan.unitAndTopic?.toLowerCase().includes('boqonnaa') ||
    plan.competencies?.toLowerCase().includes('barattoonni');

  const isAmharic =
    !isOromic &&
    (plan.subject?.includes('አማርኛ') ||
      plan.subject?.includes('ሳይንስ') ||
      plan.subject?.includes('ሒሳብ') ||
      plan.unitAndTopic?.includes('ምዕራፍ') ||
      plan.competencies?.includes('ተማሪዎች'));

  const handleChange = (field: keyof DailyLessonPlanData, value: any) => {
    const updated = { ...plan, [field]: value };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleStageChange = (idx: number, field: string, value: string) => {
    const updatedStages = [...plan.stages];
    updatedStages[idx] = { ...updatedStages[idx], [field]: value };
    const updated = { ...plan, stages: updatedStages };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleSpecialNeedsChange = (key: 'slowLearners' | 'mediumLearners' | 'fastLearners', value: string) => {
    const updated = {
      ...plan,
      specialNeedsSupport: {
        ...plan.specialNeedsSupport,
        [key]: value,
      },
    };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleMainIdeaChange = (idx: number, value: string) => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    current[idx] = value;
    handleChange('mainIdeas', current);
  };

  const handleAddMainIdea = () => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    handleChange('mainIdeas', [...current, '']);
  };

  const handleRemoveMainIdea = (idx: number) => {
    const current = Array.isArray(plan.mainIdeas) ? [...plan.mainIdeas] : [];
    handleChange(
      'mainIdeas',
      current.filter((_, i) => i !== idx)
    );
  };

  const handleCopyText = async () => {
    const ideasBlock =
      Array.isArray(plan.mainIdeas) && plan.mainIdeas.length > 0
        ? `\nKey Lesson Main Ideas:\n${plan.mainIdeas.map((m) => `• ${m}`).join('\n')}\n`
        : '';

    const textRepresentation = `Daily Lesson Plan (Landscape Format)

Name of teacher:- ${plan.teacherName}    Name of School:- ${plan.schoolName}
Subject:- ${plan.subject}    Unit and topic:- ${plan.unitAndTopic}
Grade and Section:- ${plan.gradeAndSection}    Lesson topic:- ${plan.lessonTopic}
Date:- ${plan.date}

Rationale of the topic:- ${plan.rationale}
Pre-requisite knowledge:- ${plan.prerequisiteKnowledge}
Competencies (Learning objectives):- ${plan.competencies}${ideasBlock}

Stages | Time | Contents | Page | Teacher's activities | Student's activities | Assessment | Aids | Remarks
${plan.stages
  .map(
    (s) =>
      `${s.stage} | ${s.timeAllotment} | ${s.learningContents} | ${s.page} | ${s.teacherActivities} | ${s.studentActivities} | ${s.assessmentTechniques} | ${s.teachingAids} | ${s.remarks}`
  )
  .join('\n')}

Support for learners of special needs:-
- Slow learners: ${plan.specialNeedsSupport.slowLearners}
- Medium learners: ${plan.specialNeedsSupport.mediumLearners}
- Fast learners: ${plan.specialNeedsSupport.fastLearners}

Teacher's Name:- ${plan.teacherName}    Signature:-
Dept. Head's Name:- ${plan.deptHeadName || ''}    Signature:-
Name of the Vice - principal:- ${plan.vicePrincipalName || ''}    Signature:-
Post lesson teacher's self-assessment:- ${plan.postLessonAssessment || ''}
`;

    const ok = await copyTextSafe(textRepresentation);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive main ideas for display if the plan has content
  const hasContent = Boolean(plan.lessonTopic || plan.unitAndTopic || plan.competencies);
  const effectiveMainIdeas: string[] =
    Array.isArray(plan.mainIdeas) && plan.mainIdeas.length > 0
      ? plan.mainIdeas
      : hasContent
      ? [
          plan.rationale,
          plan.competencies,
          ...plan.stages.map((s) => s.learningContents).filter(Boolean),
        ]
          .filter((v): v is string => Boolean(v && v.trim()))
          .slice(0, 4)
      : [];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area landscape-print">
      {/* Actions Bar (hidden in print) */}
      <div className="bg-stone-100/90 border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-stone-800 text-sm">
            {isOromic
              ? 'Karoora Barnoota Guyyaa (Daily Lesson Plan)'
              : 'ዕለታዊ የትምህርት እቅድ (Daily Lesson Plan)'}
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Landscape A4
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isEditing
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'View Mode (Ilaali)' : 'Edit Cells (Gulaali)'}</span>
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
            onClick={() => exportLessonPlanToDocx(plan)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-600/20"
            title="Download formatted Microsoft Word .docx file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .Docx (Word)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Plan</span>
          </button>
        </div>
      </div>

      {/* Official Landscape Paper Canvas */}
      <div className="p-4 sm:p-6 md:p-10 text-stone-900 font-sans text-xs sm:text-sm leading-relaxed max-w-[1360px] mx-auto">
        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-bold italic tracking-wide text-stone-900">
            {isOromic
              ? 'KAROORA BARNOOTA GUYYAA'
              : isAmharic
              ? 'ዕለታዊ የትምህርት እቅድ'
              : 'Daily Lesson Plan'}
          </h1>
          <div className="text-xs font-semibold text-stone-500 mt-1">
            {isOromic
              ? 'Sirna Barnoota Oromiyaa fi Itoophiyaa (Landscape Format)'
              : isAmharic
              ? 'የኢትዮጵያ ትምህርት ሚኒስቴር ይፋዊ የ9-ዓምድ ሰንጠረዥ (Landscape)'
              : 'Official Ministry of Education Primary 9-Column Table (Landscape)'}
          </div>
        </div>

        {/* Top Two-Column Information Fields */}
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
                  onChange={(e) => handleChange('teacherName', e.target.value)}
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
                  onChange={(e) => handleChange('schoolName', e.target.value)}
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
                  onChange={(e) => handleChange('subject', e.target.value)}
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
                  onChange={(e) => handleChange('unitAndTopic', e.target.value)}
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
                  onChange={(e) => handleChange('gradeAndSection', e.target.value)}
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
                  value={plan.lessonTopic}
                  onChange={(e) => handleChange('lessonTopic', e.target.value)}
                  className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-60 focus:outline-none"
                />
              ) : (
                <span className="font-semibold">{plan.lessonTopic || <BlankLine wide />}</span>
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
                value={plan.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="border-b border-amber-500 px-1 py-0.5 w-full sm:w-64 focus:outline-none"
              />
            ) : (
              <span>{plan.date || <BlankLine wide />}</span>
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
                  value={plan.rationale}
                  onChange={(e) => handleChange('rationale', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.rationale || <BlankLine wide />}</span>
              )}
            </p>

            <p>
              <span className="italic font-medium">
                {isOromic ? 'Beekumsa Duraan Qaban:- ' : isAmharic ? 'ቀድሞ የነበረ እውቀት (Pre-requisite):- ' : 'Pre-requisite knowledge:- '}
              </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.prerequisiteKnowledge}
                  onChange={(e) => handleChange('prerequisiteKnowledge', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.prerequisiteKnowledge || <BlankLine wide />}</span>
              )}
            </p>

            <p>
              <span className="italic font-medium">
                {isOromic ? 'Bu\'aalee Barachuu (Competencies):- ' : isAmharic ? 'የመማር ማስተማር ዓላማዎች (Competencies):- ' : 'Competencies (Learning objectives):- '}
              </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.competencies}
                  onChange={(e) => handleChange('competencies', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.competencies || <BlankLine wide />}</span>
              )}
            </p>
          </div>
        </div>

        {/* Main Ideas Described Card */}
        {(effectiveMainIdeas.length > 0 || isEditing) && (
          <div className="my-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 print:bg-white print:border-stone-400 print:rounded-none">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs sm:text-sm">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 no-print" />
                <span>
                  {isOromic
                    ? 'Yaadawwan Ijoo Barnootichaa (Main Ideas Described)'
                    : isAmharic
                    ? 'የትምህርቱ ዋና ዋና ሃሳቦች (Main Ideas Described)'
                    : 'Key Lesson Main Ideas Described'}
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

        {/* 9-Column Daily Lesson Plan Table */}
        <div className="overflow-x-auto my-6 border border-stone-800">
          <table className="w-full border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-stone-200/90 border-b border-stone-800 text-stone-900 font-bold italic text-center text-[10px] sm:text-xs">
                <th className="border-r border-stone-800 p-2 min-w-[90px]">
                  <div>Stages</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ደረጃዎች)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[55px]">
                  <div>Time</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ጊዜ)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[95px]">
                  <div>Learning Contents</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የትምህርት ይዘት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[40px]">
                  <div>Page</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ገጽ)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[150px]">
                  <div>Teacher's activities</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የመምህሩ ተግባራት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[140px]">
                  <div>Student's activities</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የተማሪው ተግባራት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[90px]">
                  <div>Assessment</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የምዘና ዘዴዎች)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[85px]">
                  <div>Teaching Aids</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ማስተማሪያ መርጃ)</div>
                </th>
                <th className="p-2 min-w-[55px]">
                  <div>Remarks</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(አስተያየት)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 align-top">
              {plan.stages.map((row, idx) => (
                <tr key={idx} className="divide-x divide-stone-800">
                  <td className="p-2 font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.stage}
                        onChange={(e) => handleStageChange(idx, 'stage', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'timeAllotment', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'learningContents', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'page', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'teacherActivities', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'studentActivities', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'assessmentTechniques', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.assessmentTechniques}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={row.teachingAids}
                        onChange={(e) => handleStageChange(idx, 'teachingAids', e.target.value)}
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
                        onChange={(e) => handleStageChange(idx, 'remarks', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded text-center"
                      />
                    ) : (
                      <span>{row.remarks}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Support for learners of special needs */}
        <div className="my-6 space-y-1.5">
          <h4 className="italic font-bold">Support for learners of special needs:-</h4>
          <p className="pl-4">
            <span className="font-medium">- Slow learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.slowLearners}
                onChange={(e) => handleSpecialNeedsChange('slowLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.slowLearners}</span>
            )}
          </p>

          <p className="pl-4">
            <span className="font-medium">- Medium learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.mediumLearners}
                onChange={(e) => handleSpecialNeedsChange('mediumLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.mediumLearners}</span>
            )}
          </p>

          <p className="pl-4">
            <span className="font-medium">- Fast learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.fastLearners}
                onChange={(e) => handleSpecialNeedsChange('fastLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.fastLearners}</span>
            )}
          </p>
        </div>

        {/* Bottom Signatures Table */}
        <div className="my-6 border border-stone-800">
          <table className="w-full border-collapse text-xs">
            <tbody className="divide-y divide-stone-800">
              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Teacher's Name:- </span>
                  <span className="font-bold">{plan.teacherName || <BlankLine />}</span>
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- </span>
                  <BlankLine />
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Dept. Head's Name:- </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.deptHeadName || ''}
                      onChange={(e) => handleChange('deptHeadName', e.target.value)}
                      placeholder="Name..."
                      className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                    />
                  ) : (
                    <span>{plan.deptHeadName || <BlankLine />}</span>
                  )}
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- </span>
                  <BlankLine />
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Name of the Vice - principal:- </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.vicePrincipalName || ''}
                      onChange={(e) => handleChange('vicePrincipalName', e.target.value)}
                      placeholder="Name..."
                      className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                    />
                  ) : (
                    <span>{plan.vicePrincipalName || <BlankLine />}</span>
                  )}
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- </span>
                  <BlankLine />
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Post lesson teacher's self-assessment:- </span>
                </td>
                <td className="p-2 w-1/2 min-h-[40px]">
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={plan.postLessonAssessment || ''}
                      onChange={(e) => handleChange('postLessonAssessment', e.target.value)}
                      placeholder="Teacher's reflection..."
                      className="w-full border border-amber-300 p-1 rounded"
                    />
                  ) : (
                    <span>{plan.postLessonAssessment || ''}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
