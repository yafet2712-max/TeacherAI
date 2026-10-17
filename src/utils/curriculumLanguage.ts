/**
 * Ethiopian Ministry of Education (MoE) & Regional Education Bureaus Medium of Instruction:
 * 
 * 1. Afaan Oromoo (Oromic Curriculum / Barnoota Afaan Oromoo):
 *    - Barnoota Afaan Oromoo as subject across all grades (1–8).
 *    - In Oromia and bilingual schools, primary subjects (Herrega, Saayinsii, Barnoota Lammummaa, etc.)
 *      are instructed in Afaan Oromoo.
 * 
 * 2. Amharic (አማርኛ ሥርዓተ-ትምህርት):
 *    - Amharic Language across Grades 1–8.
 *    - Grades 1–6: Math, General Science, Environmental Science, Citizenship, HPE, PVA in Amharic.
 * 
 * 3. English (እንግሊዝኛ ሥርዓተ-ትምህርት):
 *    - English subject across Grades 1–8.
 *    - Grades 7 & 8: Math, Science, Social Studies, IT in English.
 */

export type SupportedCurriculumLanguage = 'Amharic' | 'English' | 'Afaan Oromoo';

export interface CurriculumLanguageRule {
  language: SupportedCurriculumLanguage;
  ruleDescriptionAm: string;
  ruleDescriptionEn: string;
  ruleDescriptionOro: string;
  badgeText: string;
  isGrade1to6AmharicSubject: boolean;
  isGrade7or8EnglishSubject: boolean;
  isAfaanOromooSubject: boolean;
}

export function parseGradeNumber(gradeLevel: string): number {
  if (!gradeLevel) return 1;
  const match = gradeLevel.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

export function getEthiopianCurriculumLanguage(
  subjectIdOrName: string,
  gradeLevel: string,
  explicitLanguageMode?: string
): CurriculumLanguageRule {
  const gradeNum = parseGradeNumber(gradeLevel);
  const s = (subjectIdOrName || '').toLowerCase().trim();
  const explicit = (explicitLanguageMode || '').toLowerCase().trim();

  // If user explicitly chose Afaan Oromoo (Oromic)
  if (
    explicit === 'afaan oromoo' ||
    explicit === 'oromoo' ||
    explicit === 'oromic' ||
    explicit === 'oromo' ||
    explicit === 'አፋን ኦሮሞ'
  ) {
    return {
      language: 'Afaan Oromoo',
      badgeText: 'Afaan Oromoo (Oromic)',
      ruleDescriptionAm: 'የትምህርት እቅዱ በኦሮምኛ ቋንቋ ሥርዓተ-ትምህርት (Sirna Barnoota Oromiyaa) መሰረት ይዘጋጃል።',
      ruleDescriptionEn: 'The lesson plan follows the Afaan Oromoo (Oromic) curriculum standards.',
      ruleDescriptionOro: 'Karoorri barnootaa kun sirna barnoota Afaan Oromootiin qophaa\'a.',
      isGrade1to6AmharicSubject: false,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: true,
    };
  }

  // If user explicitly chose Amharic
  if (explicit === 'amharic' || explicit === 'አማርኛ') {
    return {
      language: 'Amharic',
      badgeText: 'አማርኛ (Amharic)',
      ruleDescriptionAm: 'የትምህርት እቅዱ በአማርኛ ቋንቋ ሥርዓተ-ትምህርት መሰረት ይዘጋጃል።',
      ruleDescriptionEn: 'The lesson plan follows the official Amharic curriculum standards.',
      ruleDescriptionOro: 'Karoorri barnootaa kun sirna barnoota Afaan Amaaraatiin qophaa\'a.',
      isGrade1to6AmharicSubject: true,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: false,
    };
  }

  // If user explicitly chose English
  if (explicit === 'english' || explicit === 'እንግሊዝኛ') {
    return {
      language: 'English',
      badgeText: 'English',
      ruleDescriptionAm: 'የትምህርት እቅዱ በእንግሊዝኛ ሥርዓተ-ትምህርት መሰረት ይዘጋጃል።',
      ruleDescriptionEn: 'The lesson plan follows the English medium curriculum standards.',
      ruleDescriptionOro: 'Karoorri barnootaa kun sirna barnoota Afaan Ingiliziitiin qophaa\'a.',
      isGrade1to6AmharicSubject: false,
      isGrade7or8EnglishSubject: true,
      isAfaanOromooSubject: false,
    };
  }

  const isAfaanOromoo =
    s.includes('oromoo') ||
    s.includes('oromo') ||
    s.includes('oromic') ||
    s.includes('ኦሮሞ') ||
    s === 'om';

  const isAmharic =
    s.includes('amharic') ||
    s.includes('አማርኛ') ||
    s === 'am';

  const isEnglish =
    s.includes('english') ||
    s.includes('እንግሊዝኛ') ||
    s === 'en';

  // 1. Afaan Oromoo Subject
  if (isAfaanOromoo) {
    return {
      language: 'Afaan Oromoo',
      badgeText: 'Afaan Oromoo (Barnoota Afaan Oromoo)',
      ruleDescriptionAm: 'የአፋን ኦሮሞ ቋንቋ ትምህርት በሁሉም ክፍሎች (1-8) በኦሮምኛ ይዘጋጃል።',
      ruleDescriptionEn: 'Afaan Oromoo language is instructed in Afaan Oromoo across all grades (1–8).',
      ruleDescriptionOro: 'Barnoonni Afaan Oromoo kutaa hunda (1-8) keessatti Afaan Oromootiin kennama.',
      isGrade1to6AmharicSubject: false,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: true,
    };
  }

  // 2. Amharic Subject is always Amharic across all primary grades (1–8)
  if (isAmharic) {
    return {
      language: 'Amharic',
      badgeText: 'አማርኛ (Amharic)',
      ruleDescriptionAm: 'የአማርኛ ቋንቋ ትምህርት በሁሉም ክፍሎች (1-8) በአማርኛ ይዘጋጃል።',
      ruleDescriptionEn: 'Amharic language is instructed in Amharic across all grades (1–8).',
      ruleDescriptionOro: 'Barnoonni Afaan Amaaraa kutaa hunda (1-8) keessatti Afaan Amaaraatiin kennama.',
      isGrade1to6AmharicSubject: gradeNum <= 6,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: false,
    };
  }

  // 3. English Subject is always English across all grades (1–8)
  if (isEnglish) {
    return {
      language: 'English',
      badgeText: 'እንግሊዝኛ (English)',
      ruleDescriptionAm: 'የእንግሊዝኛ ቋንቋ ትምህርት በሁሉም ክፍሎች (1-8) በእንግሊዝኛ ይዘጋጃል።',
      ruleDescriptionEn: 'English language subject is instructed in English across all grades (1–8).',
      ruleDescriptionOro: 'Barnoonni Afaan Ingilizii kutaa hunda (1-8) keessatti Afaan Ingiliziitiin kennama.',
      isGrade1to6AmharicSubject: false,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: false,
    };
  }

  // 4. Default by grade for other subjects:
  if (gradeNum <= 6) {
    return {
      language: 'Amharic',
      badgeText: 'አማርኛ (Amharic Medium: 1-6)',
      ruleDescriptionAm: `ከ1ኛ–6ኛ ክፍል (ክፍል ${gradeNum})፦ ሒሳብ፣ አጠቃላይ ሳይንስ፣ የዜግነት ትምህርት፣ ጤናና ሰውነት (HPE) እና ስነ-ጥበብ በስርአተ-ትምህርቱ መሰረት በአማርኛ ይዘጋጃሉ።`,
      ruleDescriptionEn: `Grades 1–6 (Grade ${gradeNum}): Math, Science, Citizenship, HPE, and Arts are officially instructed in Amharic (or Afaan Oromoo in Oromia).`,
      ruleDescriptionOro: `Kutaa 1–6 (Kutaa ${gradeNum}): Herregni, Saayinsiin fi Lammummaan Afaan Amaaraa yookiin Afaan Oromootiin kennama.`,
      isGrade1to6AmharicSubject: true,
      isGrade7or8EnglishSubject: false,
      isAfaanOromooSubject: false,
    };
  }

  // Grades 7 & 8:
  return {
    language: 'English',
    badgeText: 'እንግሊዝኛ (English Medium: 7-8)',
    ruleDescriptionAm: `ከ6ኛ ክፍል በላይ (7ኛ እና 8ኛ ክፍል)፦ ከአማርኛ በስተቀር ሁሉም የትምህርት አይነቶች በእንግሊዝኛ ይዘጋጃሉ።`,
    ruleDescriptionEn: `Grades 7 & 8 (above Grade 6): All subjects without Amharic are instructed in English.`,
    ruleDescriptionOro: `Kutaa 7 fi 8: Afaan Amaaraa malee barnoonni hundi Afaan Ingiliziitiin kennama.`,
    isGrade1to6AmharicSubject: false,
    isGrade7or8EnglishSubject: true,
    isAfaanOromooSubject: false,
  };
}
