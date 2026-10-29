import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, Printer, CheckCircle2, Lock, Sparkles, UserCheck, BookOpen, Users, ClipboardList, ShieldCheck, ArrowLeft } from 'lucide-react';
import { SchoolProfile, SavedMaterial } from '../types';

interface MarkListToolsProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  unlockedFeatures: Record<string, boolean>;
  onRequirePremium: (featureKey: string, serviceTitle: string, onProceed: () => void) => void;
  onOpenKeyboard: () => void;
}

type ToolType = 'mark-list' | 'cpd' | 'mlc' | 'tutorial' | 'communication' | 'attendance' | null;

export const MarkListTools: React.FC<MarkListToolsProps> = ({
  schoolProfile,
  onSaveToLibrary,
  unlockedFeatures,
  onRequirePremium,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<string[][]>([
    ['No', 'Student Full Name / Maqaa Barataa', 'Sex', 'Test (50%)', 'Assignment (50%)', 'Total (100%)', 'Grade'],
    ['1', 'Abebe Kebede', 'M', '42', '45', '87', 'A'],
    ['2', 'Tigist Alemu', 'F', '38', '40', '78', 'B'],
    ['3', 'Chaltu Gammachiis', 'F', '45', '48', '93', 'A+'],
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileData(text);
      try {
        const lines = text.split('\n').map((l) => l.split(','));
        if (lines.length > 0) {
          setRows(lines);
        }
      } catch (err) {
        console.warn('Failed to parse CSV', err);
      }
    };
    reader.readAsText(file);
  };

  const toolsList = [
    {
      id: 'mark-list' as ToolType,
      titleAm: '1. የውጤት መዝገብ (Mark List)',
      titleOr: '1. Galmee Qabxii Barattootaa',
      titleEn: '1. Add Mark List',
      desc: 'የተማሪዎችን ውጤት መመዝገቢያ፣ ከዲቫይስ ፋይል (Excel/CSV) መጫን እና ማስተዳደር።',
      icon: FileSpreadsheet,
      featureKey: 'worksheet',
    },
    {
      id: 'cpd' as ToolType,
      titleAm: '2. የሲፒዲ ፎርማት (CPD Format)',
      titleOr: '2. Toora CPD Barsiisotaa',
      titleEn: '2. Add CPD Format',
      desc: 'የመምህራን ቀጣይ ሙያዊ እድገት (CPD) እቅድ እና የፖርትፎሊዮ መሙያ ሰንጠረዥ።',
      icon: ClipboardList,
      featureKey: 'worksheet',
    },
    {
      id: 'mlc' as ToolType,
      titleAm: '3. የማስተማር ደረጃ ተማሪዎች (MLC Level)',
      titleOr: '3. Barattoota Sadarkaa MLC',
      titleEn: '3. Add MLC Level Students',
      desc: 'Minimum Learning Competency (MLC) የብቃት ደረጃ መከታተያ እና መመዝገቢያ።',
      icon: Users,
      featureKey: 'worksheet',
    },
    {
      id: 'tutorial' as ToolType,
      titleAm: '4. የትምህርት ማጠናከሪያ (Tutorial Format)',
      titleOr: '4. Toora Qopheessaa Tutorial',
      titleEn: '4. Add Tutorial Formats',
      desc: 'ደካማ ተማሪዎችን ለማብቃት የማጠናከሪያ ትምህርት መርሃ-ግብር እና ምዝገባ።',
      icon: BookOpen,
      featureKey: 'worksheet',
    },
    {
      id: 'communication' as ToolType,
      titleAm: '5. የግንኙነት ወረቀት (Communication Sheet)',
      titleOr: '5. Saphana Walqunnamtii Maatii',
      titleEn: '5. Add Communication Sheet',
      desc: 'ከወላጆች እና ከትምህርት ቤት አስተዳደር ጋር የሚደረግ የግንኙነት ማስታወሻ።',
      icon: UserCheck,
      featureKey: 'worksheet',
    },
    {
      id: 'attendance' as ToolType,
      titleAm: '6. የተማሪዎች ምዝገባ (Attendance Sheet)',
      titleOr: '6. Galmee Hordoffii Barattoota (Attendance)',
      titleEn: '6. Add Attendance',
      desc: 'ዕለታዊ የተማሪዎች መገኘትና አለመገኘት መከታተያ ወርሃዊ ሠንጠረዥ።',
      icon: CheckCircle2,
      featureKey: 'worksheet',
    },
  ];

  const handleSelectTool = (toolId: ToolType, featureKey: string, title: string) => {
    onRequirePremium(featureKey, title, () => {
      setActiveTool(toolId);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            📊
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Ethiopian Primary School Documents & Formats
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              የውጤት መዝገብ እና የሰነድ ፎርማቶች (Mark List & Formats)
            </h2>
            <p className="text-xs text-stone-200 mt-1">
              የተማሪዎችን ውጤት ከዲቫይስ ፋይል መጫን እና 6 የተለያዩ ኦፊሴላዊ የትምህርት ቤት ፎርማቶችን ማዘጋጀት።
            </p>
          </div>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveTool(null)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ወደ ዝርዝር ማውጫ ተመለስ (Back to Menu)</span>
          </button>
        )}
      </div>

      {/* Main View: Tool Selection Grid OR Specific Tool Workspace */}
      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isUnlocked = unlockedFeatures[tool.featureKey];
            return (
              <div
                key={tool.id}
                onClick={() => handleSelectTool(tool.id, tool.featureKey, tool.titleAm)}
                className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between relative group"
              >
                {!isUnlocked && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                    <Lock className="w-3 h-3" /> 👑 50 ETB Telebirr
                  </span>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-stone-900">{tool.titleAm}</h3>
                    <p className="text-xs font-semibold text-emerald-800">{tool.titleOr}</p>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>ክፈት (Open Tool)</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standalone Tool Workspace */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Active Workspace / Standalone Tool
              </span>
              <h3 className="text-xl font-black text-stone-900">
                {toolsList.find((t) => t.id === activeTool)?.titleAm}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 cursor-pointer transition flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>ከዲቫይስ ፋይል ጫን (Upload from Device)</span>
                <input type="file" accept=".csv, .txt, .json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>አትም / ፕሪንት (Print)</span>
              </button>
            </div>
          </div>

          {fileName && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between">
              <span>ጫን የተደረገ ፋይል: <strong>{fileName}</strong></span>
              <span className="text-emerald-700">✓ successfully loaded</span>
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
              {toolsList.find((t) => t.id === activeTool)?.titleEn} - Official Form
            </p>
          </div>

          {/* Table Data Viewer / Editor */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-200">
                <tr>
                  {rows[0]?.map((header, idx) => (
                    <th key={idx} className="p-3 border-r border-stone-200 last:border-r-0">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-stone-100 hover:bg-stone-50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border-r border-stone-200 last:border-r-0 text-stone-700">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[rIdx + 1][cIdx] = e.target.value;
                            setRows(newRows);
                          }}
                          className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              onClick={() => {
                const newRow = [String(rows.length), 'ተማሪ ስም ያስገቡ', 'M/F', '0', '0', '0', '-'];
                setRows([...rows, newRow]);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
            >
              + ረድፍ ጨምር (Add Row)
            </button>

            <button
              onClick={() => {
                onSaveToLibrary({
                  type: 'worksheet',
                  title: `${toolsList.find((t) => t.id === activeTool)?.titleAm} - ${schoolProfile.schoolName}`,
                  preview: `Rows: ${rows.length} • School: ${schoolProfile.schoolName}`,
                  content: JSON.stringify(rows, null, 2),
                  schoolName: schoolProfile.schoolName,
                  tags: ['Mark List', activeTool || 'tool'],
                });
                alert('በትምህርት ቤት ቤተ-መጻሕፍት ተቀምጧል!');
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              💾 በቤተ-መጻሕፍት አስቀምጥ (Save to Library)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
