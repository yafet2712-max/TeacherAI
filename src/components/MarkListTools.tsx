import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Printer,
  CheckCircle2,
  Lock,
  UserCheck,
  BookOpen,
  Users,
  ClipboardList,
  ArrowLeft,
  AlertCircle,
  BookmarkCheck,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { SchoolProfile, SavedMaterial } from '../types';

interface MarkListToolsProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  unlockedFeatures: Record<string, boolean>;
  onRequirePremium: (featureKey: string, serviceTitle: string, onProceed: () => void) => void;
  onOpenKeyboard: () => void;
}

type ToolType = 'mark-list' | 'cpd' | 'mlc' | 'tutorial' | 'communication' | 'attendance' | null;
type LangMode = 'Amharic' | 'Afaan Oromoo' | 'English';

const INITIAL_MARKLIST_ROWS: string[][] = [
  ['No', 'Student Full Name', 'Sex', 'HW 5%', 'CW 5%', 'Part 5%', 'Test 5%', 'Sep Total', 'HW 5%', 'CW 5%', 'Prac 5%', 'Test 10%', 'Oct Total', 'HW 5%', 'CW 5%', 'Part 5%', 'Test 10%', 'Nov Total', 'Final 20%', 'Total 100%', 'Rank'],
  ['1', 'Abebe Kebede Tadesse', 'M', '4', '5', '4', '4', '17', '4', '4', '4', '8', '20', '4', '4', '4', '9', '21', '18', '76', '3'],
  ['2', 'Tigist Alemu Bekele', 'F', '5', '5', '5', '5', '20', '5', '4', '5', '9', '23', '5', '5', '4', '9', '23', '19', '85', '1'],
  ['3', 'Chaltu Gammachiis', 'F', '4', '4', '5', '4', '17', '5', '5', '4', '9', '23', '4', '5', '5', '9', '23', '18', '81', '2'],
];

export const MarkListTools: React.FC<MarkListToolsProps> = ({
  schoolProfile,
  onSaveToLibrary,
  unlockedFeatures,
  onRequirePremium,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [lang, setLang] = useState<LangMode>('Amharic');
  const [fileName, setFileName] = useState<string>('');
  const [bannerMsg, setBannerMsg] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [rows, setRows] = useState<string[][]>(INITIAL_MARKLIST_ROWS);

  const recalculateMarkList = (updatedRows: string[][]): string[][] => {
    if (activeTool !== 'mark-list' || updatedRows.length <= 1) return updatedRows;
    const header = updatedRows[0];
    const dataRows = updatedRows.slice(1).map((row) => {
      const r = [...row];
      if (r.length >= 21) {
        const num = (idx: number) => parseFloat(r[idx]) || 0;
        const sep = num(3) + num(4) + num(5) + num(6);
        const oct = num(8) + num(9) + num(10) + num(11);
        const nov = num(13) + num(14) + num(15) + num(16);
        const fin = num(18);
        const total = sep + oct + nov + fin;
        r[7] = String(sep);
        r[12] = String(oct);
        r[17] = String(nov);
        r[19] = String(total);
      }
      return r;
    });

    // Compute ranks based on Total 100% (index 19)
    const totals = dataRows.map((r) => parseFloat(r[19]) || 0);
    const ranked = dataRows.map((r, i) => {
      if (r.length >= 21) {
        const myTotal = totals[i];
        const rank = 1 + totals.filter((t) => t > myTotal).length;
        const copy = [...r];
        copy[20] = String(rank);
        return copy;
      }
      return r;
    });

    return [header, ...ranked];
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileName(file.name);
    setBannerMsg(null);

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet')) {
      setBannerMsg({
        type: 'error',
        text:
          lang === 'Afaan Oromoo'
            ? 'Faayiliin Excel (.xlsx/.xls) kallattiin hin dubbifamu. Maaloo Excel keessaa "Save As -> CSV (Comma Delimited)" gootanii olkaa\'aa!'
            : lang === 'English'
            ? 'Binary Excel (.xlsx/.xls) cannot be parsed directly in browser. Please use Excel "Save As -> CSV (Comma Delimited)" and upload the .csv file.'
            : 'የ Excel (.xlsx/.xls) ፋይሎች በዚፕ (Binary) ስለሆኑ በቀጥታ ማንበብ አይቻልም። እባክዎ ከ Excel ውስጥ "Save As -> CSV (Comma Delimited)" በማድረግ .csv ፋይል ይጫኑ።',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text && text.startsWith('PK')) {
        setBannerMsg({
          type: 'error',
          text: 'ይህ የ Excel (.xlsx) ፋይል ነው። እባክዎ ፋይልዎን በ CSV ፎርማት አስቀምጠው ይጫኑ።',
        });
        return;
      }
      try {
        const lines = text
          .split(/\r?\n/)
          .map((l) => parseCsvLine(l))
          .filter((l) => l.length > 1 || (l[0] !== undefined && l[0] !== ''));
        if (lines.length > 0) {
          setRows(activeTool === 'mark-list' ? recalculateMarkList(lines) : lines);
          setBannerMsg({
            type: 'success',
            text: `✓ ${file.name} በተሳካ ሁኔታ ተጭኗል (${lines.length} ረድፎች)።`,
          });
        }
      } catch (err) {
        console.warn('Failed to parse file', err);
        setBannerMsg({ type: 'error', text: 'ፋይሉን ማንበብ አልተቻለም። እባክዎ ትክክለኛ CSV ፋይል ይምረጡ።' });
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadExcel = () => {
    const escapeHtml = (str: string) =>
      (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const titleText = toolsList.find((t) => t.id === activeTool)?.[lang === 'Afaan Oromoo' ? 'titleOr' : lang === 'English' ? 'titleEn' : 'titleAm'] || 'School Form';

    let tableHtml = '';
    if (activeTool === 'mark-list' && rows[0]?.length >= 21) {
      tableHtml = `
        <table border="1" style="border-collapse:collapse; font-family: Arial, sans-serif; font-size: 11pt;">
          <thead>
            <tr>
              <th colspan="21" style="background:#065f46; color:#ffffff; font-size:13pt; padding:8px;">
                ${escapeHtml(schoolProfile.schoolName)} - ${escapeHtml(titleText)}
              </th>
            </tr>
            <tr style="background:#fef3c7; font-weight:bold;">
              <th rowspan="2">No</th>
              <th rowspan="2">Student Full Name</th>
              <th rowspan="2">Sex</th>
              <th colspan="5">September (20%)</th>
              <th colspan="5">October (25%)</th>
              <th colspan="5">November (25%)</th>
              <th>Final (20%)</th>
              <th>Total</th>
              <th rowspan="2">Rank</th>
            </tr>
            <tr style="background:#f5f5f4; font-weight:bold;">
              <th>HW 5%</th><th>CW 5%</th><th>Part 5%</th><th>Test 5%</th><th>Total</th>
              <th>HW 5%</th><th>CW 5%</th><th>Prac 5%</th><th>Test 10%</th><th>Total</th>
              <th>HW 5%</th><th>CW 5%</th><th>Part 5%</th><th>Test 10%</th><th>Total</th>
              <th>Exam 20%</th>
              <th>100%</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .slice(1)
              .map(
                (r) =>
                  `<tr>${r.map((cell) => `<td style="text-align:center; padding:4px;">${escapeHtml(cell)}</td>`).join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else {
      tableHtml = `
        <table border="1" style="border-collapse:collapse; font-family: Arial, sans-serif; font-size: 11pt;">
          <thead>
            <tr>
              <th colspan="${rows[0]?.length || 1}" style="background:#065f46; color:#ffffff; font-size:13pt; padding:8px;">
                ${escapeHtml(schoolProfile.schoolName)} - ${escapeHtml(titleText)}
              </th>
            </tr>
            <tr style="background:#f5f5f4; font-weight:bold;">
              ${(rows[0] || []).map((cell) => `<th style="padding:6px;">${escapeHtml(cell)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .slice(1)
              .map(
                (r) =>
                  `<tr>${r.map((cell) => `<td style="padding:5px;">${escapeHtml(cell)}</td>`).join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    }

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8" /></head>
        <body>${tableHtml}</body>
      </html>`;

    const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTool || 'grading_sheet'}_${schoolProfile.schoolName || 'school'}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBannerMsg({ type: 'success', text: '📥 የኤክሴል ፋይል (.xls) በትክክለኛው ፎርማት ወርዷል።' });
  };

  const toolsList = [
    {
      id: 'mark-list' as ToolType,
      featureKey: 'mark_list',
      titleAm: '1. የውጤት መዝገብ እና ግሬዲንግ ሺት (Mark List)',
      titleOr: '1. Galmee Qabxii Barattootaa (Mark List)',
      titleEn: '1. Add Mark List (Grading Sheet)',
      descAm: 'የተማሪዎች ወርሃዊ ቀጣይነት ያለው ምዘና (September, October, November, Final Exam) የኤክሴል ፎርማት።',
      descOr: 'Galmee madaallii walitti fufaa (Fulbaana, Onkololeessa, Sadaasa, Qormaata Xumuraa) bifa Excel.',
      descEn: 'Continuous assessment grading sheet (Sep, Oct, Nov, Final Exam, auto Total & Rank) with Excel export.',
      icon: FileSpreadsheet,
    },
    {
      id: 'cpd' as ToolType,
      featureKey: 'cpd_format',
      titleAm: '2. የሲፒዲ ፎርማት (CPD Format)',
      titleOr: '2. Toora CPD Barsiisotaa',
      titleEn: '2. Add CPD Format',
      descAm: 'የመምህራን ቀጣይ ሙያዊ እድገት (CPD) እቅድ እና የፖርትፎሊዮ መሙያ ሰንጠረዥ።',
      descOr: 'Karoora guddina ogummaa walitti fufaa (CPD) barsiisotaafi galmee hordoffii.',
      descEn: 'Continuing Professional Development (CPD) teacher action plan and portfolio tracking sheet.',
      icon: ClipboardList,
    },
    {
      id: 'mlc' as ToolType,
      featureKey: 'mlc_students',
      titleAm: '3. የማስተማር ደረጃ ተማሪዎች (MLC Level)',
      titleOr: '3. Barattoota Sadarkaa MLC',
      titleEn: '3. Add MLC Level Students',
      descAm: 'Minimum Learning Competency (MLC) የብቃት ደረጃ መከታተያ እና መመዝገቢያ።',
      descOr: 'Galmee sadarkaa gahumsaa barnootaa (MLC) barattootaafi deeggarsa kennamu.',
      descEn: 'Minimum Learning Competency (MLC) student proficiency tracking and support register.',
      icon: Users,
    },
    {
      id: 'tutorial' as ToolType,
      featureKey: 'tutorial_format',
      titleAm: '4. የትምህርት ማጠናከሪያ (Tutorial Format)',
      titleOr: '4. Toora Qopheessaa Tutorial',
      titleEn: '4. Add Tutorial Formats',
      descAm: 'ደካማ ተማሪዎችን ለማብቃት የማጠናከሪያ ትምህርት መርሃ-ግብር እና ምዝገባ።',
      descOr: 'Sagantaa barnoota dabalataa (Tutorial) barattoota deeggarsa barbaadaniif.',
      descEn: 'Remedial tutorial schedule, topic planner, and student progress tracking sheet.',
      icon: BookOpen,
    },
    {
      id: 'communication' as ToolType,
      featureKey: 'communication_sheet',
      titleAm: '5. የግንኙነት ወረቀት (Communication Sheet)',
      titleOr: '5. Saphana Walqunnamtii Maatii',
      titleEn: '5. Add Communication Sheet',
      descAm: 'ከወላጆች እና ከትምህርት ቤት አስተዳደር ጋር የሚደረግ የግንኙነት ማስታወሻ።',
      descOr: 'Galmee qunnamtii maatii barattootaafi bulchiinsa mana barumsaa.',
      descEn: 'Parent-teacher and school administration communication log sheet.',
      icon: UserCheck,
    },
    {
      id: 'attendance' as ToolType,
      featureKey: 'attendance_sheet',
      titleAm: '6. የተማሪዎች ምዝገባ (Attendance Sheet)',
      titleOr: '6. Galmee Hordoffii Barattootaa (Attendance)',
      titleEn: '6. Add Attendance',
      descAm: 'ዕለታዊ የተማሪዎች መገኘትና አለመገኘት መከታተያ ወርሃዊ ሠንጠረዥ።',
      descOr: 'Galmee hordoffii argamaafi hafinsa barattootaa guyyaa guyyaa.',
      descEn: 'Weekly and monthly classroom student attendance register.',
      icon: CheckCircle2,
    },
  ];

  const getDefaultRows = (toolId: ToolType): string[][] => {
    if (toolId === 'mark-list') {
      return INITIAL_MARKLIST_ROWS.map((r) => [...r]);
    }
    if (toolId === 'attendance') {
      return [
        ['No', 'Student Full Name', 'Sex', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Total Present', 'Total Absent'],
        ['1', 'Abebe Kebede', 'M', '5', '5', '5', '5', '20', '0'],
        ['2', 'Tigist Alemu', 'F', '5', '4', '5', '5', '19', '1'],
      ];
    }
    if (toolId === 'cpd') {
      return [
        ['No', 'Priority Need / የሙያ ፍላጎት', 'CPD Activity / ተግባር', 'Timeframe', 'Resources Needed', 'Evaluation / ማረጋገጫ'],
        ['1', 'Active Learning Methods', 'Peer Observation & Workshop', 'Q1-Q2', 'Handouts', 'Completed'],
      ];
    }
    if (toolId === 'mlc') {
      return [
        ['No', 'Student Full Name', 'Subject', 'MLC Level (Basic / Competent / Advanced)', 'Support Needed', 'Remarks'],
        ['1', 'Abebe Kebede', 'Mathematics', 'Competent', 'Peer tutoring', '-'],
      ];
    }
    if (toolId === 'tutorial') {
      return [
        ['No', 'Student Full Name', 'Tutorial Topic / Area', 'Schedule (Day/Time)', 'Attendance', 'Progress'],
        ['1', 'Abebe Kebede', 'Fraction Mathematics', 'Saturday 3:00 Local', 'Present', 'Improving'],
      ];
    }
    if (toolId === 'communication') {
      return [
        ['No', 'Student Full Name', 'Parent Name', 'Phone Number', 'Issue / Topic Discussed', 'Action Taken'],
        ['1', 'Abebe Kebede', 'Kebede Tadesse', '0911234567', 'Late attendance discussion', 'Agreed on punctual arrival'],
      ];
    }
    return INITIAL_MARKLIST_ROWS.map((r) => [...r]);
  };

  const handleSelectTool = (toolId: ToolType, featureKey: string, title: string) => {
    onRequirePremium(featureKey, title, () => {
      setBannerMsg(null);
      setFileName('');
      setActiveTool(toolId);
      setRows(getDefaultRows(toolId));
    });
  };

  const getTitle = (tool: (typeof toolsList)[number]) =>
    lang === 'Afaan Oromoo' ? tool.titleOr : lang === 'English' ? tool.titleEn : tool.titleAm;

  const getDesc = (tool: (typeof toolsList)[number]) =>
    lang === 'Afaan Oromoo' ? tool.descOr : lang === 'English' ? tool.descEn : tool.descAm;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner + Language Selector */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            📊
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              {lang === 'Afaan Oromoo'
                ? 'Galmee Qabxii fi Sanadoota Mana Barumsaa'
                : lang === 'English'
                ? 'Ethiopian School Mark List & Official Formats'
                : 'የውጤት መዝገብ እና የኤክሴል ሰነድ ፎርማቶች'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === 'Afaan Oromoo'
                ? 'Galmee Qabxii (Excel) fi Toora Sanadootaa 6'
                : lang === 'English'
                ? 'Mark List (Excel) & 6 School Document Formats'
                : 'የውጤት መዝገብ (Excel) እና 6 የትምህርት ቤት ፎርማቶች'}
            </h2>
            <p className="text-xs text-stone-200 mt-1">
              {lang === 'Afaan Oromoo'
                ? 'Tokkoon tokkoon tajaajilaa kophaa isaatti Telebirr (50 ETB) fi mirkaneessa abbaa appii (@zenayafet) gaafata.'
                : lang === 'English'
                ? 'Each standalone document tool supports CSV file upload, Excel (.xls) download, and requires individual Telebirr confirmation.'
                : 'እያንዳንዱ መሣሪያ ለብቻው ከዲቫይስ ፋይል መጫን፣ በኤክሴል (.xls) ማውረድ እና በቴሌብር (50 ብር) ማረጋገጫ የሚከፈት ነው።'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(['Amharic', 'Afaan Oromoo', 'English'] as LangMode[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                lang === l
                  ? 'bg-amber-400 text-stone-950 shadow'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              {l === 'Amharic' ? '🇪🇹 አማርኛ' : l === 'Afaan Oromoo' ? '🌳 Afaan Oromoo' : '🇬🇧 English'}
            </button>
          ))}

          {activeTool && (
            <button
              onClick={() => {
                setActiveTool(null);
                setBannerMsg(null);
              }}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'Afaan Oromoo' ? 'Deebi\'i' : lang === 'English' ? 'Back' : 'ተመለስ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View: 6 Standalone Tools Grid OR Active Workspace */}
      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isUnlocked = unlockedFeatures[tool.featureKey];
            const title = getTitle(tool);
            return (
              <div
                key={tool.id}
                onClick={() => handleSelectTool(tool.id, tool.featureKey, title)}
                className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>

                    {!isUnlocked ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-300 shrink-0">
                        <Lock className="w-3 h-3" /> 👑 50 ETB Telebirr
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked (30d)
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-stone-900">{title}</h3>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{getDesc(tool)}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>
                    {lang === 'Afaan Oromoo' ? 'Bani (Open Tool)' : lang === 'English' ? 'Open Tool' : 'ክፈት (Open Tool)'}
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standalone Tool Workspace */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 no-print">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {lang === 'Afaan Oromoo' ? 'Bakka Hojii Excel' : lang === 'English' ? 'Spreadsheet Workspace' : 'የኤክሴል ሰንጠረዥ መሥሪያ'}
              </span>
              <h3 className="text-xl font-black text-stone-900">
                {getTitle(toolsList.find((t) => t.id === activeTool)!)}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 cursor-pointer transition flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>
                  {lang === 'Afaan Oromoo' ? 'Faayilii CSV Olkaa\'i' : lang === 'English' ? 'Upload CSV' : 'CSV ፋይል ጫን'}
                </span>
                <input type="file" accept=".csv, .txt, .json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>
                  {lang === 'Afaan Oromoo' ? '📥 Excel Buusi (.xls)' : lang === 'English' ? '📥 Download Excel (.xls)' : '📥 ኤክሴል አውርድ (.xls)'}
                </span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'Afaan Oromoo' ? 'Maxxansi' : lang === 'English' ? 'Print' : 'አትም'}</span>
              </button>
            </div>
          </div>

          {bannerMsg && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start gap-3 border no-print ${
                bannerMsg.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : bannerMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bannerMsg.text}</span>
            </div>
          )}

          {fileName && !bannerMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between no-print">
              <span>ጫን የተደረገ ፋይል: <strong>{fileName}</strong></span>
              <span className="text-emerald-700">✓ loaded</span>
            </div>
          )}

          {/* School Header Preview */}
          <div className="text-center space-y-1 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h4 className="font-amharic font-black text-stone-900 text-base">
              {schoolProfile.schoolName} {schoolProfile.amharicSchoolName ? `(${schoolProfile.amharicSchoolName})` : ''}
            </h4>
            <p className="text-xs text-stone-600">
              {schoolProfile.woredaSubcity} • {schoolProfile.cityRegion} • {schoolProfile.department}
            </p>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-1">
              {getTitle(toolsList.find((t) => t.id === activeTool)!)}
            </p>
          </div>

          {/* Continuous Assessment Multi-Row Header OR Standard Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-300">
            <table className="w-full text-left text-xs border-collapse">
              {activeTool === 'mark-list' && rows[0]?.length >= 21 ? (
                <thead className="bg-stone-100 text-stone-900 font-bold">
                  <tr className="bg-amber-50 border-b border-stone-300 text-center">
                    <th rowSpan={2} className="p-2 border-r border-stone-300">No</th>
                    <th rowSpan={2} className="p-2 border-r border-stone-300 min-w-[160px]">Student Full Name</th>
                    <th rowSpan={2} className="p-2 border-r border-stone-300">Sex</th>
                    <th colSpan={5} className="p-2 border-r border-stone-300 bg-emerald-50 text-emerald-900">September (20%)</th>
                    <th colSpan={5} className="p-2 border-r border-stone-300 bg-sky-50 text-sky-900">October (25%)</th>
                    <th colSpan={5} className="p-2 border-r border-stone-300 bg-violet-50 text-violet-900">November (25%)</th>
                    <th className="p-2 border-r border-stone-300 bg-amber-100">Final (20%)</th>
                    <th className="p-2 border-r border-stone-300 bg-emerald-100">Total</th>
                    <th rowSpan={2} className="p-2 bg-stone-200">Rank</th>
                    <th rowSpan={2} className="p-2 bg-stone-200 no-print w-10"></th>
                  </tr>
                  <tr className="border-b border-stone-300 text-center bg-stone-100">
                    {rows[0].slice(3, 20).map((col, idx) => (
                      <th key={idx} className="p-2 border-r border-stone-300 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : (
                <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                  <tr>
                    {rows[0]?.map((header, idx) => (
                      <th key={idx} className="p-2.5 border-r border-stone-300 last:border-r-0 text-center">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[0][idx] = e.target.value;
                            setRows(newRows);
                          }}
                          className="w-full bg-transparent font-bold text-stone-900 text-center focus:bg-white focus:outline-none rounded px-1"
                        />
                      </th>
                    ))}
                    <th className="p-2 text-center w-10 no-print"></th>
                  </tr>
                </thead>
              )}

              <tbody>
                {rows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-stone-200 hover:bg-stone-50">
                    {row.map((cell, cIdx) => {
                      const isAutoComputed =
                        activeTool === 'mark-list' &&
                        row.length >= 21 &&
                        (cIdx === 7 || cIdx === 12 || cIdx === 17 || cIdx === 19 || cIdx === 20);
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border-r border-stone-200 last:border-r-0 text-center ${
                            isAutoComputed ? 'bg-emerald-50/50 font-bold text-emerald-900' : 'text-stone-700'
                          }`}
                        >
                          <input
                            type="text"
                            value={cell}
                            readOnly={isAutoComputed}
                            onChange={(e) => {
                              const newRows = rows.map((r) => [...r]);
                              newRows[rIdx + 1][cIdx] = e.target.value;
                              setRows(recalculateMarkList(newRows));
                            }}
                            className={`w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5 ${
                              cIdx === 1 ? 'text-left min-w-[140px]' : 'text-center'
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="p-1.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => {
                          if (rows.length <= 2) return;
                          const remaining = rows.filter((_, i) => i !== rIdx + 1);
                          setRows(activeTool === 'mark-list' ? recalculateMarkList(remaining) : remaining);
                        }}
                        disabled={rows.length <= 2}
                        title={lang === 'Afaan Oromoo' ? 'Toora Haqi' : lang === 'English' ? 'Delete Row' : 'ረድፍ አጥፋ'}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 no-print">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const colCount = rows[0]?.length || 6;
                  const newRow =
                    activeTool === 'mark-list' && colCount >= 21
                      ? [String(rows.length), 'አዲስ ተማሪ (New Student)', 'M', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', String(rows.length)]
                      : [String(rows.length), ...Array(Math.max(colCount - 1, 1)).fill('-')];
                  setRows(recalculateMarkList([...rows, newRow]));
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {lang === 'Afaan Oromoo' ? 'Toora Dabali (Add Row)' : lang === 'English' ? 'Add Row' : 'ረድፍ ጨምር (Add Row)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRows(getDefaultRows(activeTool));
                  setFileName('');
                  setBannerMsg({
                    type: 'info',
                    text:
                      lang === 'Afaan Oromoo'
                        ? 'Unkaan jalqabaa deebi\'ee jira.'
                        : lang === 'English'
                        ? 'Reset to default sample template.'
                        : 'ወደ መጀመሪያው ናሙና ሰንጠረዥ ተመልሷል።',
                  });
                }}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {lang === 'Afaan Oromoo' ? 'Jalqabaatti Deebisi' : lang === 'English' ? 'Reset Sample' : 'ናሙናውን መልስ'}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                onSaveToLibrary({
                  type: 'worksheet',
                  title: `${getTitle(toolsList.find((t) => t.id === activeTool)!)} - ${schoolProfile.schoolName}`,
                  preview: `Rows: ${rows.length - 1} • School: ${schoolProfile.schoolName}`,
                  content: JSON.stringify(rows, null, 2),
                  schoolName: schoolProfile.schoolName,
                  tags: ['Mark List', activeTool || 'tool'],
                });
                setBannerMsg({
                  type: 'success',
                  text: '💾 በትምህርት ቤት ቤተ-መጻሕፍት (Saved Library) ውስጥ በተሳካ ሁኔታ ተቀምጧል!',
                });
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>
                {lang === 'Afaan Oromoo' ? 'Kuusaa keessa Olkaa\'i' : lang === 'English' ? 'Save to Library' : 'በቤተ-መጻሕፍት አስቀምጥ'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
