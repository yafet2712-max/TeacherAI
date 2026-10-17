import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini Client instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_PROMPT_EDUCATOR = `You are the master AI pedagogical assistant for Ethiopian primary school teachers, educators, and students ("የኢትዮጵያ የመጀመሪያ ደረጃ መምህራን ረዳት").
You have native-level pedagogical expertise in the Ethiopian Ministry of Education (MoE) primary curriculum (Grades 1–8) across all subjects:
- Amharic Language (አማርኛ ቋንቋ) & Ge'ez Fidel script
- English Language (listening, speaking, reading, writing, phonics, and grammar)
- Mathematics (ሒሳብ - arithmetic, fractions, geometry, measurement, algebra)
- Environmental Science (አካባቢ ሳይንስ - Grades 1-4)
- General Science (አጠቃላይ ሳይንስ - Grades 5-8: biology, chemistry, physics fundamentals)
- Social Studies (ህብረተሰብ ሳይንስ - Ethiopian history, geography, rivers, culture, heritage)
- Citizenship Education (የስነ-ዜጋና ስነ-ምግባር ትምህርት - ethics, human rights, democracy, community)
- Performing & Visual Arts (PVA - የስነ-ጥበብ ትምህርት)
- Information Technology (IT - መረጃና ተግባቦት ቴክኖሎጂ)
- Physical & Health Education (HPE - የአካል ማጎልመሻ ትምህርት)

You always structure lesson plans and assessments according to the official Ethiopian Ministry of Education primary guidelines:
- Clear Behavioral Objectives ("ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ..." / "By the end of this lesson, students will be able to...")
- 5 Standard Teaching Phases: Introduction, Presentation, Learning Activities, Stabilization/Summary, Assessment/Homework.
- Authentic school and workplace headers with teacher name, grade, period, and date.
- Clear, age-appropriate, encouraging language with answer keys for teachers.`;

// Resilient content generator with model fallback and retry
async function generateGeminiContent(options: {
  contents: any;
  temperature?: number;
  systemInstruction?: string;
}): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction || SYSTEM_PROMPT_EDUCATOR,
            temperature: options.temperature ?? 0.7,
          },
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt} failed:`, err?.message || err);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  throw lastError || new Error('Failed to generate content with available models');
}

// Helper function to resolve curriculum language according to Ethiopian Ministry of Education policy:
// - Grades 1–6: Amharic, General Science, Environmental Science, Citizenship, HPE, Visual Arts, and Mathematics are in Amharic. (English subject in English)
// - Grades 7 & 8 (above Grade 6): All subjects without Amharic are in English.
// Helper function to resolve curriculum language according to Ethiopian Ministry of Education & regional policy:
// - Afaan Oromoo (Oromic): For Barnoota Afaan Oromoo subject or when Oromia Regional / Afaan Oromoo curriculum is requested.
// - Grades 1–6 Amharic: General Science, Environmental Science, Citizenship, HPE, Visual Arts, Math in Amharic.
// - Grades 7 & 8: English medium for subjects except Amharic & Afaan Oromoo.
function resolveCurriculumLanguage(subject?: string, gradeLevel?: string, requestedLanguage?: string): 'Amharic' | 'English' | 'Afaan Oromoo' {
  const req = (requestedLanguage || '').toLowerCase().trim();
  if (req.includes('orom') || req.includes('ኦሮሞ')) return 'Afaan Oromoo';
  if (req === 'amharic' || req === 'አማርኛ') return 'Amharic';
  if (req === 'english' || req === 'እንግሊዝኛ') return 'English';

  const s = (subject || '').toLowerCase().trim();
  if (s.includes('orom') || s.includes('ኦሮሞ')) return 'Afaan Oromoo';
  if (s.includes('amharic') || s.includes('አማርኛ')) return 'Amharic';
  if (s.includes('english') || s.includes('እንግሊዝኛ')) return 'English';

  const gradeMatch = (gradeLevel || '').match(/\d+/);
  const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  // Grades 1–6: Amharic medium for Math, Science, Citizenship, HPE, Visual Arts
  if (gradeNum <= 6) {
    return 'Amharic';
  }
  // Grades 7 & 8: English medium for all subjects except Amharic & Afaan Oromoo
  return 'English';
}

// 1. Comprehensive Lesson Plan Generator (Following the Official Ethiopian Primary Daily Lesson Plan Format)
app.post('/api/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      subject,
      gradeLevel,
      duration,
      languageMode,
      specificFocus,
      customNotes,
      schoolProfile,
      customDate,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || '';
    const teacherName = schoolProfile?.teacherName || '';

    const effectiveLanguage = resolveCurriculumLanguage(subject, gradeLevel, languageMode);
    const isOromic = effectiveLanguage === 'Afaan Oromoo';
    const isAmharic = effectiveLanguage === 'Amharic';

    let languageInstructions = '';
    if (isOromic) {
      languageInstructions = `[AFAAN OROMOO (OROMIC) MEDIUM INSTRUCTION - ETHIOPIAN / OROMIA REGIONAL CURRICULUM]:
All pedagogical content MUST BE GENERATED IN NATURAL, GRAMMATICALLY ACCURATE AFAAN OROMOO (using Latin Qubee Afaan Oromoo script).
This includes:
- unitAndTopic: in Afaan Oromoo (e.g., "Boqonnaa 1 - ...")
- lessonTopic: in Afaan Oromoo (e.g., "Mata Duree Barnootaa...")
- rationale: in Afaan Oromoo (e.g., "Barnoonni kun barattoonni ... akka hubatanii fi jireenya isaanii keessatti itti fayyadaman isaan gargaara.")
- prerequisiteKnowledge: in Afaan Oromoo (e.g., "Barattoonni kanaan dura waa'ee ... barataniru.")
- competencies: in Afaan Oromoo (e.g., "Dhuma barnoota kanaatti barattoonni: 1. ... 2. ... danda'u.")
- stages (Starter, Main Activities, Concluding Activities):
  * learningContents: in Afaan Oromoo
  * teacherActivities: in Afaan Oromoo (e.g., "Barsiisaan nagaa gaafata, barnoota darbe yaadachiisa, mata duree har'aa beeksisa...")
  * studentActivities: in Afaan Oromoo (e.g., "Barattoonni nagaa deebisu, gaaffii ka'umsaa deebisu, xiyyeeffannoon dhaggeeffatu...")
  * assessmentTechniques: in Afaan Oromoo (e.g., "Gaaffii afaanii, hojii daree, hordoffii")
  * teachingAids: in Afaan Oromoo (e.g., "Kitaaba barataa, kaardii fiilashii, fakkiiwwan, gabatee")
- specialNeedsSupport (slowLearners, mediumLearners, fastLearners): in Afaan Oromoo.`;
    } else if (isAmharic) {
      languageInstructions = `[AMHARIC MEDIUM INSTRUCTION - GRADES 1-6 (Or Amharic Subject)]:
All pedagogical content MUST BE GENERATED IN NATURAL, FLUENT AMHARIC SCRIPT (በግዕዝ ፊደላትና በአማርኛ ቋንቋ).
This includes:
- unitAndTopic: in Amharic (e.g., "ምዕራፍ ፩ - ...")
- lessonTopic: in Amharic (e.g., "የትምህርቱ ርዕስ")
- rationale: in Amharic (e.g., "ትምህርቱ ተማሪዎች ... እንዲገነዘቡና እንዲተገብሩ ይረዳል...")
- prerequisiteKnowledge: in Amharic (e.g., "ተማሪዎች ቀደም ሲል ስለ ... ተምረዋል...")
- competencies: in Amharic (e.g., "ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ: 1. ... 2. ... ይችላሉ።")
- stages (Starter, Main Activities, Concluding Activities):
  * learningContents: in Amharic
  * teacherActivities: in Amharic (e.g., "መምህሩ ሰላምታ ይሰጣል፣ የቀደመውን ትምህርት ይከልሳል...")
  * studentActivities: in Amharic (e.g., "ተማሪዎች ሰላምታ ይመልሳሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ...")
  * assessmentTechniques: in Amharic (e.g., "የቃል ጥያቄ፣ የክፍል ስራ፣ ምልከታ")
  * teachingAids: in Amharic (e.g., "የተማሪው መማሪያ መጽሐፍ፣ ፍላሽ ካርዶች፣ ስዕሎች")
- specialNeedsSupport (slowLearners, mediumLearners, fastLearners): in Amharic.`;
    } else {
      languageInstructions = `[ENGLISH MEDIUM INSTRUCTION - GRADES 7 & 8 (Or English Subject)]:
All pedagogical content MUST BE GENERATED IN CLEAR, PROFESSIONAL PEDAGOGICAL ENGLISH.
All stages, teacher activities, student activities, rationale, prerequisite knowledge, and competencies must be in English.`;
    }

    const prompt = `You must generate a Daily Lesson Plan for an Ethiopian Primary School teacher following the EXACT official 9-column format from the Ethiopian Ministry of Education.

CRITICAL ETHIOPIAN CURRICULUM LANGUAGE POLICY:
Subject: "${subject || 'General'}"
Grade Level: "${gradeLevel || 'Grade 1'}"
Determined Medium of Instruction: "${effectiveLanguage.toUpperCase()}"
${languageInstructions}

Details:
- Name of School: "${schoolName}"
- Name of teacher: "${teacherName}"
- Subject: "${subject || (isOromic ? 'Barnoota Afaan Oromoo' : isAmharic ? 'አማርኛ / ሒሳብ / ሳይንስ' : 'English / Science')}"
- Unit and topic: "${topic || (isOromic ? 'Boqonnaa 1' : isAmharic ? 'ምዕራፍ ፩' : 'Unit One')}"
- Lesson topic: "${specificFocus || topic || 'Key concept and practice'}"
- Grade and Section: "${gradeLevel || 'Grade 1'}"
- Date: "${customDate || (isOromic ? 'Fulbaana 06, 2017 A.L.I' : isAmharic ? 'መስከረም 06 ቀን 2017 ዓ.ም' : 'Meskerem 06, 2017 E.C (Wednesday)')}"
- Duration: "${duration || '35-40 min'}"
- Language Mode: "${effectiveLanguage}"
- Additional Notes: "${customNotes || ''}"

Return a valid JSON object strictly matching this schema (do NOT include backticks or markdown if possible, just the raw JSON object):
${isOromic ? `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'Barnoota Afaan Oromoo'}",
  "unitAndTopic": "Boqonnaa ... - ...",
  "gradeAndSection": "${gradeLevel || 'Kutaa 1ffaa'}",
  "lessonTopic": "${topic || 'Mata Duree Barnootaa'}",
  "date": "${customDate || 'Fulbaana 06, 2017 A.L.I'}",
  "rationale": "Barnoonni kun barattoonni ... akka hubataniif gargaara.",
  "prerequisiteKnowledge": "Barattoonni kanaan dura ... barataniiru.",
  "competencies": "Dhuma barnoota kanaatti barattoonni: 1. ... 2. ... danda'u.",
  "stages": [
    {
      "stage": "Starter (Qophii fi Yaada Ka'umsaa)",
      "timeAllotment": "5 daqiiqaa",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "Barsiisaan nagaa gaafata, barnoota darbe yaadachiisa, mata duree har'aa beeksisa...",
      "studentActivities": "Barattoonni nagaa deebisu, gaaffiiwwan ka'umsaa deebisu...",
      "assessmentTechniques": "Gaaffii afaanii",
      "teachingAids": "Kitaaba barataa, kaardii fiilashii",
      "remarks": "-"
    },
    {
      "stage": "Main Activities (Gochaalee Gurguddoo)",
      "timeAllotment": "25 daqiiqaa",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "Barsiisaan qabiyyee barnootaa fakkeenyaan ibsa, shaakala gaggeessa, hojii daree hordofa...",
      "studentActivities": "Barattoonni xiyyeeffannoon dhaggeeffatu, yaada kennu, hojii daree hojjatu...",
      "assessmentTechniques": "Hojii daree, hordoffii, gaaffii afaanii",
      "teachingAids": "Kitaaba barataa, fakkiiwwan, gabatee gurraacha",
      "remarks": "-"
    },
    {
      "stage": "Concluding Activities (Gochaalee Xumuraa)",
      "timeAllotment": "5 daqiiqaa",
      "learningContents": "Cuunfaa fi hojii manaa",
      "page": "-",
      "teacherActivities": "Qabxiilee gurguddoo cuunfa, gaaffii madaallii gaafata, hojii manaa kenna...",
      "studentActivities": "Cuunfaa qabatu, gaaffii xumuraa deebisu, hojii manaa galmeeffatu...",
      "assessmentTechniques": "Gaaffii afaanii",
      "teachingAids": "Kitaaba barataa",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "Deeggarsa dhuunfaa, ibsa dabalataa fi fakkeenya salphaa kennuu.",
    "mediumLearners": "Hojii daree idilee fi hordoffii walirraa hin cinne gochuu.",
    "fastLearners": "Gaaffiiwwan qormaataa fi hojiiwwan dabalataa kennuu."
  },
  "deptHeadName": "",
  "vicePrincipalName": "",
  "postLessonAssessment": ""
}` : isAmharic ? `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'ሒሳብ / ሳይንስ'}",
  "unitAndTopic": "ምዕራፍ ... - ...",
  "gradeAndSection": "${gradeLevel || '1ኛ ክፍል'}",
  "lessonTopic": "${topic || 'የትምህርቱ ርዕስ'}",
  "date": "${customDate || 'መስከረም 06 ቀን 2017 ዓ.ም'}",
  "rationale": "ትምህርቱ ተማሪዎች ... እንዲረዱ ያግዛል።",
  "prerequisiteKnowledge": "ተማሪዎች ቀደም ሲል ... ተምረዋል።",
  "competencies": "ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ: 1. ... 2. ... ይችላሉ።",
  "stages": [
    {
      "stage": "Starter (ማነሳሳትና መከለስ)",
      "timeAllotment": "5 ደቂቃ",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "መምህሩ ሰላምታ ይሰጣል፣ የቀደመውን ትምህርት ይከልሳል፣ የዛሬውን ርዕስ ያስተዋውቃል...",
      "studentActivities": "ሰላምታ ይመልሳሉ፣ የማነሳሻ ጥያቄዎችን ይመልሳሉ...",
      "assessmentTechniques": "የቃል ጥያቄ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ፍላሽ ካርድ",
      "remarks": "-"
    },
    {
      "stage": "Main Activities (ዋና ተግባራት)",
      "timeAllotment": "25 ደቂቃ",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "ጽንሰ-ሀሳቡን ያብራራል፣ ምሳሌዎችን ይሰራል፣ የተማሪዎችን የክፍል ስራ ይከታተላል...",
      "studentActivities": "ማብራሪያውን ያዳምጣሉ፣ በደብተራቸው ይጽፋሉ፣ የክፍል ስራ ይሰራሉ...",
      "assessmentTechniques": "የክፍል ስራ፣ ምልከታ፣ የቃል ጥያቄ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ስዕሎች፣ ሰሌዳ",
      "remarks": "-"
    },
    {
      "stage": "Concluding Activities (ማጠቃለያ ተግባራት)",
      "timeAllotment": "5 ደቂቃ",
      "learningContents": "ማጠቃለያ እና የቤት ስራ",
      "page": "-",
      "teacherActivities": "ዋና ዋና ነጥቦችን ያጠቃልላል፣ የማጠቃለያ ጥያቄዎችን ይጠይቃል እና የቤት ስራ ይሰጣል...",
      "studentActivities": "የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ በደብተራቸው ይመዘግባሉ...",
      "assessmentTechniques": "የቃል ጥያቄ",
      "teachingAids": "-",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "ተጨማሪ ማብራሪያ፣ ቀላል ምሳሌዎችና የአቻ ለአቻ ድጋፍ መስጠት።",
    "mediumLearners": "በመደበኛው የማስተማሪያ እቅድና ፍጥነት ማስተማር።",
    "fastLearners": "ተጨማሪ ፈታኝ ጥያቄዎችን እና የማስፋፊያ ተግባራትን መስጠት።"
  },
  "deptHeadName": "",
  "vicePrincipalName": "",
  "postLessonAssessment": ""
}` : `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'English'}",
  "unitAndTopic": "Unit ... - ...",
  "gradeAndSection": "${gradeLevel || 'Grade 7'}",
  "lessonTopic": "${topic || 'Specific topic'}",
  "date": "${customDate || 'Meskerem 06, 2017 E.C (Wednesday)'}",
  "rationale": "The lesson helps learners understand...",
  "prerequisiteKnowledge": "Students have previously learned...",
  "competencies": "At the end of the lesson, the students will be able to: 1. ... 2. ...",
  "stages": [
    {
      "stage": "Starter (Motivation & Introduction)",
      "timeAllotment": "5 min",
      "learningContents": "Warm-up related to...",
      "page": "1-5",
      "teacherActivities": "Greets students, reviews previous lesson, and introduces today's topic...",
      "studentActivities": "Greet the teacher, answer warm-up questions, and listen to the introduction.",
      "assessmentTechniques": "Oral question",
      "teachingAids": "Flashcards, Textbook",
      "remarks": "-"
    },
    {
      "stage": "Main Activities",
      "timeAllotment": "25 min",
      "learningContents": "Practice and drill...",
      "page": "1-5",
      "teacherActivities": "Guides students through concept presentation, exercises, and interactive group work.",
      "studentActivities": "Participate actively, take notes, solve exercises in exercise books.",
      "assessmentTechniques": "Class work, oral questions",
      "teachingAids": "Textbook, Blackboard, Pictures",
      "remarks": "-"
    },
    {
      "stage": "Concluding Activities",
      "timeAllotment": "5 min",
      "learningContents": "Summary and homework",
      "page": "-",
      "teacherActivities": "Summarizes key points, asks review questions, and assigns follow-up homework.",
      "studentActivities": "Answer review questions and record homework assignment.",
      "assessmentTechniques": "Oral question",
      "teachingAids": "-",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "Provide extra practice, repetition, simplified tasks, and peer tutoring.",
    "mediumLearners": "Standard pace activities as planned above.",
    "fastLearners": "Provide extension tasks, enrichment problems, and leadership roles."
  },
  "deptHeadName": "",
  "vicePrincipalName": "",
  "postLessonAssessment": ""
}`}`;

    let rawResponse = '';
    let planData: any = null;
    try {
      rawResponse = await generateGeminiContent({
        contents: prompt,
        temperature: 0.4,
      });

      const cleanJson = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      planData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse JSON directly from Gemini, using structured fallback regex');
      // Create fallback structure populated according to language
      if (isAmharic) {
        planData = {
          schoolName,
          teacherName,
          subject: subject || 'ሒሳብ / ሳይንስ',
          unitAndTopic: topic || 'ምዕራፍ አንድ',
          gradeAndSection: gradeLevel || 'ክፍል 1',
          lessonTopic: topic || 'የትምህርቱ ዋና ርዕስ',
          date: customDate || 'መስከረም 06 ቀን 2017 ዓ.ም',
          rationale: `ትምህርቱ ተማሪዎች ስለ ${topic} በቂ ግንዛቤ እንዲያገኙ ይረዳል።`,
          prerequisiteKnowledge: 'ተማሪዎች ቀደም ሲል የተማሩትን መሰረታዊ ጽንሰ-ሀሳብ ያውቃሉ።',
          competencies: `ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ ስለ ${topic} በግልጽ ማስረዳትና መተግበር ይችላሉ።`,
          stages: [
            {
              stage: 'Starter (ማነሳሳትና መከለስ)',
              timeAllotment: '5 ደቂቃ',
              learningContents: `ከ${topic} ጋር የተያያዘ የማነሳሻ ጥያቄ`,
              page: '1-5',
              teacherActivities: 'ሰላምታ ይሰጣል፣ ያለፈውን ትምህርት ይከልሳል፣ የዛሬውን ርዕስ ያስተዋውቃል።',
              studentActivities: 'ሰላምታ ይመልሳሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: 'የተማሪው መጽሐፍ፣ ፍላሽ ካርድ',
              remarks: '-',
            },
            {
              stage: 'Main Activities (ዋና ተግባራት)',
              timeAllotment: '25 ደቂቃ',
              learningContents: `ስለ '${topic}' ዝርዝር ማብራሪያና ልምምድ`,
              page: '1-5',
              teacherActivities: `ስለ '${topic}' በመማሪያ መጽሐፍና በምሳሌዎች በመታገዝ ያስረዳል፣ የክፍል ስራ ይሰጣል።`,
              studentActivities: 'ያዳምጣሉ፣ በደብተራቸው ይጽፋሉ፣ የክፍል ስራ ይሰራሉ።',
              assessmentTechniques: 'የክፍል ስራ፣ የቃል ጥያቄዎች',
              teachingAids: 'የመማሪያ መጽሐፍ፣ ስዕሎች፣ ሰሌዳ',
              remarks: '-',
            },
            {
              stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
              timeAllotment: '5 ደቂቃ',
              learningContents: 'ማጠቃለያ እና የቤት ስራ',
              page: '-',
              teacherActivities: 'ዋና ዋና ነጥቦችን ያጠቃልላል፣ የቤት ስራ ይሰጣል።',
              studentActivities: 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ ይመዘግባሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: '-',
              remarks: '-',
            },
          ],
          specialNeedsSupport: {
            slowLearners: 'ተጨማሪ ጊዜና የአቻ ለአቻ ድጋፍ መስጠት።',
            mediumLearners: 'በመደበኛው እቅድ መሰረት ማስተማር።',
            fastLearners: 'ተጨማሪ ፈታኝ መልመጃዎችን መስጠት።',
          },
          deptHeadName: '',
          vicePrincipalName: '',
          postLessonAssessment: '',
        };
      } else {
        planData = {
          schoolName,
          teacherName,
          subject: subject || 'English',
          unitAndTopic: topic || 'Unit One',
          gradeAndSection: gradeLevel || 'Grade 7',
          lessonTopic: topic || 'Core Lesson Topic',
          date: customDate || 'Meskerem 06, 2017 E.C (Wednesday)',
          rationale: `The lesson helps learners understand ${topic}.`,
          prerequisiteKnowledge: 'Previous grade foundational concepts.',
          competencies: `At the end of the lesson, the students will be able to apply and master ${topic}.`,
          stages: [
            {
              stage: 'Starter (Motivation & Introduction)',
              timeAllotment: '5 min',
              learningContents: `Warm-up related to ${topic}`,
              page: '1-5',
              teacherActivities: 'Greets students, reviews previous lesson, and introduces today\'s topic.',
              studentActivities: 'Greet the teacher, answer warm-up questions, and listen to the introduction.',
              assessmentTechniques: 'Oral question',
              teachingAids: 'Flashcards',
              remarks: '-',
            },
            {
              stage: 'Main Activities',
              timeAllotment: '25 min',
              learningContents: `Practice and drill '${topic}'`,
              page: '1-5',
              teacherActivities: `Guides students through '${topic}' using textbook, illustrations, and realia.`,
              studentActivities: 'Participate in learning activities, class work exercises, and teacher drills.',
              assessmentTechniques: 'Class work, oral questions',
              teachingAids: 'Text book, Pictures, Posters',
              remarks: '-',
            },
            {
              stage: 'Concluding Activities',
              timeAllotment: '5 min',
              learningContents: 'Summary and homework',
              page: '-',
              teacherActivities: 'Summarizes key points, asks review questions, and assigns homework.',
              studentActivities: 'Answer review questions and copy homework in their exercise books.',
              assessmentTechniques: 'Oral question',
              teachingAids: '-',
              remarks: '-',
            },
          ],
          specialNeedsSupport: {
            slowLearners: 'Provide extra practice, repetition, and simplified tasks with peer support.',
            mediumLearners: 'Standard pace activities as planned above.',
            fastLearners: 'Provide enrichment tasks such as extra vocabulary or short extension exercises.',
          },
          deptHeadName: '',
          vicePrincipalName: '',
          postLessonAssessment: '',
        };
      }
    }

    res.json({
      plan: planData,
      content: rawResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-lesson-plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate lesson plan' });
  }
});

// 1B. 5-Days Weekly Lesson Plan Generator (Monday to Friday sequence for Ethiopian Schools)
app.post('/api/generate-5-days-plan', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      subject,
      gradeLevel,
      languageMode,
      customNotes,
      schoolProfile,
      weekRangeOrDates,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || '';
    const teacherName = schoolProfile?.teacherName || '';

    const effectiveLanguage = resolveCurriculumLanguage(subject, gradeLevel, languageMode);
    const isOromic = effectiveLanguage === 'Afaan Oromoo';
    const isAmharic = effectiveLanguage === 'Amharic';

    let weeklyLanguageInstructions = '';
    if (isOromic) {
      weeklyLanguageInstructions = `[AFAAN OROMOO (OROMIC) MEDIUM INSTRUCTION - ETHIOPIAN / OROMIA REGIONAL CURRICULUM]:
All pedagogical content for all 5 days MUST BE GENERATED IN NATURAL, ACCURATE AFAAN OROMOO (using Qubee Afaan Oromoo script).
Days sequence in Afaan Oromoo:
- Day 1: Guyyaa 1 (Wiixata) - Seensa, yaada bu'uuraa fi jechoota haaraa
- Day 2: Kibxata - Ibsa qabatamaa, fakkeenyota fi hirmaannaa barattootaa
- Day 3: Roobii - Hojii garee, shaakala waloofi marii daree
- Day 4: Kamisa - Hojii dhuunfaa, shaakala dabalataafi qajeelcha
- Day 5: Jimaata - Cuunfaa torbee, madaallii fi qormaata gabaabaa
All subTopic, competencies, starterActivities, mainActivities, concludingActivities, assessmentTechniques, teachingAids, homework, and specialNeedsSupport MUST BE IN AFAAN OROMOO.`;
    } else if (isAmharic) {
      weeklyLanguageInstructions = `[AMHARIC MEDIUM INSTRUCTION - GRADES 1-6 (Or Amharic Subject)]:
All pedagogical content for all 5 days MUST BE IN NATURAL, RICH AMHARIC SCRIPT (በግዕዝ ፊደላትና በአማርኛ ቋንቋ).
Days sequence:
Day 1: ሰኞ (መግቢያ፣ መሰረታዊ ጽንሰ-ሀሳብና ቃላት)
Day 2: ማክሰኞ (ጽንሰ-ሀሳብ ማዳበርና ምሳሌዎችን መስራት)
Day 3: ረቡዕ (የቡድን ስራ፣ የጋራ ልምምድና ውይይት)
Day 4: ሐሙስ (የግል ስራ፣ የተግባር ልምምድና ማጠናከሪያ)
Day 5: አርብ (የትምህርቱ ማጠቃለያ፣ ክለሳ፣ የሳምንቱ አጭር ምዘና/ፈተና)
All subTopic, competencies, starterActivities, mainActivities, concludingActivities, assessmentTechniques, teachingAids, homework, and specialNeedsSupport MUST BE IN AMHARIC.`;
    } else {
      weeklyLanguageInstructions = `[ENGLISH MEDIUM INSTRUCTION - GRADES 7 & 8 (Or English Subject)]:
All pedagogical content for all 5 days MUST BE IN CLEAR, PROFESSIONAL PEDAGOGICAL ENGLISH.
Days sequence:
Day 1: Monday (Introduction, vocabulary, and foundation)
Day 2: Tuesday (Concept modeling, guided instruction, and examples)
Day 3: Wednesday (Collaborative practice, pair work, and interactive tasks)
Day 4: Thursday (Independent practice, real-world application, and problem solving)
Day 5: Friday (Weekly synthesis, review, and formative assessment/quiz)
All fields in English.`;
    }

    const prompt = `You must generate a comprehensive 5-Day Weekly Lesson Plan for an Ethiopian Primary School teacher following the Ethiopian Ministry of Education curriculum.

CRITICAL ETHIOPIAN CURRICULUM LANGUAGE POLICY:
Subject: "${subject || 'General'}"
Grade Level: "${gradeLevel || 'Grade 1'}"
Determined Medium of Instruction: "${effectiveLanguage.toUpperCase()}"
${weeklyLanguageInstructions}

Details:
- School: "${schoolName}"
- Teacher: "${teacherName}"
- Subject: "${subject || (isOromic ? 'Barnoota Afaan Oromoo' : isAmharic ? 'አማርኛ / ሒሳብ / ሳይንስ' : 'English / Science')}"
- Unit & Topic: "${topic || (isOromic ? 'Boqonnaa 1' : isAmharic ? 'ምዕራፍ ፩' : 'Unit Topic')}"
- Grade Level: "${gradeLevel || 'Grade 1'}"
- Week / Dates: "${weekRangeOrDates || (isOromic ? 'Torbee 1 (Wiixata hanga Jimaata)' : isAmharic ? 'ሳምንት ፩ (ከሰኞ እስከ አርብ)' : 'Week 1 (Monday to Friday)')}"
- Teacher's Custom Notes: "${customNotes || ''}"

Return a valid JSON object strictly matching this schema:
${isOromic ? `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'Barnoota Afaan Oromoo'}",
  "gradeAndSection": "${gradeLevel || 'Kutaa 1ffaa'}",
  "unitAndTopic": "${topic || 'Boqonnaa 1'}",
  "weekRangeOrDates": "${weekRangeOrDates || 'Wiixata hanga Jimaata'}",
  "generalCompetencies": "Dhuma torban kanaatti barattoonni qabiyyee ${topic || 'barnootichaa'} sirriitti hubachuun itti fayyadamuu danda'u.",
  "rationale": "Karoorri torbee kun barattoonni beekumsa bu'uuraa irraa eegalanii hanga shaakala dhuunfaafi madaalliitti akka gabbifatan taasisa.",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Guyyaa 1 (Wiixata)",
      "date": "Wiixata",
      "subTopic": "Seensa fi Yaada Bu'uuraa",
      "competencies": "Barattoonni yaada bu'uuraa fi jechoota haaraa ni hubatu.",
      "starterActivities": "Barsiisaan nagaa gaafata, kaka'umsa uuma, mata duree beeksisa.",
      "mainActivities": "Ibsa kennuu fi fakkeenyota qabatamaa dhiyeessuu.",
      "concludingActivities": "Qabxii ijoo cuunfuu fi gaaffii ka'umsaa gaafachuu.",
      "assessmentTechniques": "Gaaffii afaanii, hordoffii",
      "teachingAids": "Kitaaba barataa, kaardii fiilashii",
      "homework": "Jechoota haaraa barreeffatanii dubbisuu",
      "remarks": "-"
    },
    {
      "dayNumber": 2,
      "dayName": "Guyyaa 2 (Kibxata)",
      "date": "Kibxata",
      "subTopic": "Gabbisa Qabiyyee fi Fakkeenya",
      "competencies": "Barattoonni fakkeenya irratti hundaa'anii ni ibsu.",
      "starterActivities": "Barnoota Wiixataa gabaabinaan irra deebi'uu.",
      "mainActivities": "Qabiyyicha ballinaan ibsuu fi barattoota hirmaachisuu.",
      "concludingActivities": "Hojii daree xiinxaluu fi cuunfaa kennuu.",
      "assessmentTechniques": "Hojii daree, gaaffii afaanii",
      "teachingAids": "Kitaaba barataa, gabatee",
      "homework": "Gilgaala kitaaba irraa hojjechuu",
      "remarks": "-"
    },
    {
      "dayNumber": 3,
      "dayName": "Guyyaa 3 (Roobii)",
      "date": "Roobii",
      "subTopic": "Hojii Garee fi Shaakala Waloo",
      "competencies": "Barattoonni gareen mari'achuun yaada isaanii ibsu.",
      "starterActivities": "Barattoota gareetti qooduu fi qajeelfama kennuu.",
      "mainActivities": "Hojii garee hordofuu fi yaada barattootaa cimsuu.",
      "concludingActivities": "Gabaasa garee dhaggeeffachuu fi cuunfuu.",
      "assessmentTechniques": "Madaallii garee, hordoffii",
      "teachingAids": "Waraqaa hojii, kitaaba",
      "homework": "Gaaffii marii manatti xumuruu",
      "remarks": "-"
    },
    {
      "dayNumber": 4,
      "dayName": "Guyyaa 4 (Kamisa)",
      "date": "Kamisa",
      "subTopic": "Shaakala Dhuunfaa fi Qajeelcha",
      "competencies": "Barataan hundi dhuunfaan shaakalee hojjachuu danda'a.",
      "starterActivities": "Qabxiilee gurguddoo yaadachiisuu.",
      "mainActivities": "Barattoonni hojii dhuunfaa akka hojjatan gochuu fi deeggaruu.",
      "concludingActivities": "Hojii dhuunfaa qajeelchuu fi deebii waloof dhiyeessuu.",
      "assessmentTechniques": "Hojii dhuunfaa, daawwannaa",
      "teachingAids": "Daftara barataa, gabatee",
      "homework": "Qophii qormaata boruutiif qophaa'uu",
      "remarks": "-"
    },
    {
      "dayNumber": 5,
      "dayName": "Guyyaa 5 (Jimaata)",
      "date": "Jimaata",
      "subTopic": "Cuunfaa Torbee fi Madaallii Gabaabaa",
      "competencies": "Barattoonni qabiyyee torbichaa hunda ni mirkaneeffatu.",
      "starterActivities": "Cuunfaa qabiyyee torbee gabaabinaan dhiyeessuu.",
      "mainActivities": "Qormaata gabaabaa (Quiz) fi madaallii gaggeessuu.",
      "concludingActivities": "Qormaata sirreessuu fi hojii boqonnaa torbee kennuu.",
      "assessmentTechniques": "Qormaata gabaabaa (Quiz), gaaffii afaanii",
      "teachingAids": "Waraqaa qormaataa",
      "homework": "Boqonnaa itti aanuuf qophaa'uu",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "Deeggarsa dhuunfaa, ibsa dabalataa fi fakkeenya salphaa kennuu.",
    "mediumLearners": "Hojii daree idilee fi hordoffii walirraa hin cinne gochuu.",
    "fastLearners": "Gaaffiiwwan qormaataa fi hojiiwwan dabalataa kennuu."
  },
  "deptHeadName": "",
  "vicePrincipalName": ""
}` : isAmharic ? `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'ሒሳብ / ሳይንስ'}",
  "gradeAndSection": "${gradeLevel || '1ኛ ክፍል'}",
  "unitAndTopic": "${topic || 'ምዕራፍ ...'}",
  "weekRangeOrDates": "${weekRangeOrDates || 'ከሰኞ እስከ አርብ'}",
  "generalCompetencies": "ተማሪዎች በዚህ ሳምንት መጨረሻ ስለ ${topic || 'ርዕሱ'} የተሟላ ግንዛቤ አግኝተው በራሳቸው መተግበር ይችላሉ።",
  "rationale": "ይህ ሳምንታዊ እቅድ ተማሪዎች ጽንሰ-ሀሳቡን ደረጃ በደረጃ ተረድተው በተግባር እንዲለማመዱ ያስችላቸዋል።",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "ቀን 1 (ሰኞ)",
      "date": "ሰኞ",
      "subTopic": "...",
      "competencies": "...",
      "starterActivities": "...",
      "mainActivities": "...",
      "concludingActivities": "...",
      "assessmentTechniques": "የቃል ጥያቄ፣ ምልከታ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ፍላሽ ካርድ",
      "homework": "...",
      "remarks": "-"
    },
    {
      "dayNumber": 2,
      "dayName": "ቀን 2 (ማክሰኞ)",
      "date": "ማክሰኞ",
      "subTopic": "...",
      "competencies": "...",
      "starterActivities": "...",
      "mainActivities": "...",
      "concludingActivities": "...",
      "assessmentTechniques": "የክፍል ስራ፣ የቃል ጥያቄ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ስዕሎች",
      "homework": "...",
      "remarks": "-"
    },
    {
      "dayNumber": 3,
      "dayName": "ቀን 3 (ረቡዕ)",
      "date": "ረቡዕ",
      "subTopic": "...",
      "competencies": "...",
      "starterActivities": "...",
      "mainActivities": "...",
      "concludingActivities": "...",
      "assessmentTechniques": "የቡድን ስራ ምልከታ",
      "teachingAids": "የስራ ወረቀት፣ ሰሌዳ",
      "homework": "...",
      "remarks": "-"
    },
    {
      "dayNumber": 4,
      "dayName": "ቀን 4 (ሐሙስ)",
      "date": "ሐሙስ",
      "subTopic": "...",
      "competencies": "...",
      "starterActivities": "...",
      "mainActivities": "...",
      "concludingActivities": "...",
      "assessmentTechniques": "የግል ስራ፣ ደብተር ማረም",
      "teachingAids": "የተማሪው መጽሐፍ",
      "homework": "...",
      "remarks": "-"
    },
    {
      "dayNumber": 5,
      "dayName": "ቀን 5 (አርብ)",
      "date": "አርብ",
      "subTopic": "ክለሳ እና የሳምንቱ አጭር ምዘና",
      "competencies": "...",
      "starterActivities": "...",
      "mainActivities": "...",
      "concludingActivities": "...",
      "assessmentTechniques": "አጭር ፈተና (Quiz)፣ የቃል ማጠቃለያ",
      "teachingAids": "የፈተና ወረቀት፣ ሰሌዳ",
      "homework": "...",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "ተጨማሪ ማብራሪያ፣ ቀላል ምሳሌዎችና የአቻ ለአቻ ድጋፍ መስጠት።",
    "mediumLearners": "በመደበኛው የማስተማሪያ እቅድና ፍጥነት ማስተማር።",
    "fastLearners": "ተጨማሪ ፈታኝ ጥያቄዎችን እና የማስፋፊያ ተግባራትን መስጠት።"
  },
  "deptHeadName": "",
  "vicePrincipalName": ""
}` : `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'English'}",
  "gradeAndSection": "${gradeLevel || 'Grade 7'}",
  "unitAndTopic": "${topic || 'Unit Topic'}",
  "weekRangeOrDates": "${weekRangeOrDates || 'Week 1 (Monday to Friday)'}",
  "generalCompetencies": "By the end of this week, students will master key concepts of ${topic || 'the unit'} and apply them effectively.",
  "rationale": "This 5-day plan establishes clear progression from introduction to guided practice, collaborative tasks, and weekly mastery evaluation.",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 (Monday)",
      "date": "Monday",
      "subTopic": "Introduction & Key Concepts",
      "competencies": "...",
      "starterActivities": "Warm-up and prior knowledge activation...",
      "mainActivities": "Concept explanation, modeled examples, and structured note-taking...",
      "concludingActivities": "Summary questions and exit check...",
      "assessmentTechniques": "Oral questioning, observation",
      "teachingAids": "Textbook, whiteboard, flashcards",
      "homework": "Review notes and complete textbook exercise 1.",
      "remarks": "-"
    },
    {
      "dayNumber": 2,
      "dayName": "Day 2 (Tuesday)",
      "date": "Tuesday",
      "subTopic": "Concept Exploration & Modeling",
      "competencies": "...",
      "starterActivities": "Quick review of Day 1 concepts...",
      "mainActivities": "Teacher modeling followed by guided class exercises...",
      "concludingActivities": "Consolidation and clarification of misconceptions...",
      "assessmentTechniques": "Classroom work check",
      "teachingAids": "Textbook, charts",
      "homework": "Exercise 2 problems.",
      "remarks": "-"
    },
    {
      "dayNumber": 3,
      "dayName": "Day 3 (Wednesday)",
      "date": "Wednesday",
      "subTopic": "Collaborative Practice & Pair Work",
      "competencies": "...",
      "starterActivities": "Interactive challenge on board...",
      "mainActivities": "Small group problem solving and peer explanation...",
      "concludingActivities": "Group reporting and teacher feedback...",
      "assessmentTechniques": "Peer review, group task observation",
      "teachingAids": "Worksheet, charts",
      "homework": "Complete short paragraph / practice problem.",
      "remarks": "-"
    },
    {
      "dayNumber": 4,
      "dayName": "Day 4 (Thursday)",
      "date": "Thursday",
      "subTopic": "Independent Application & Extension",
      "competencies": "...",
      "starterActivities": "Bell-ringer exercise...",
      "mainActivities": "Independent work in exercise books with individualized teacher scaffolding...",
      "concludingActivities": "Self-check against board solution...",
      "assessmentTechniques": "Notebook inspection, individual check",
      "teachingAids": "Textbook, realia",
      "homework": "Prepare for Friday weekly synthesis & quiz.",
      "remarks": "-"
    },
    {
      "dayNumber": 5,
      "dayName": "Day 5 (Friday)",
      "date": "Friday",
      "subTopic": "Weekly Synthesis & Formative Quiz",
      "competencies": "...",
      "starterActivities": "Whole-week recap in 5 minutes...",
      "mainActivities": "Short 15-minute formative quiz followed by peer correction and teacher remediation...",
      "concludingActivities": "Celebration of learning and weekend reading assignment...",
      "assessmentTechniques": "Weekly quiz, oral debrief",
      "teachingAids": "Quiz copies, rubric",
      "homework": "Weekend reading / preview next unit.",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "Extra visual aids, simplified vocabulary, and targeted peer support.",
    "mediumLearners": "Standard progression with guided scaffolding.",
    "fastLearners": "Enrichment tasks, higher-order reasoning questions, and peer tutor roles."
  },
  "deptHeadName": "",
  "vicePrincipalName": ""
}`}`;

    let rawResponse = '';
    let planData: any = null;
    try {
      rawResponse = await generateGeminiContent({
        contents: prompt,
        temperature: 0.4,
      });

      const cleanJson = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      planData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse 5-day plan JSON from Gemini, generating curriculum fallback');
      const dayNames = isAmharic
        ? ['ቀን 1 (ሰኞ)', 'ቀን 2 (ማክሰኞ)', 'ቀን 3 (ረቡዕ)', 'ቀን 4 (ሐሙስ)', 'ቀን 5 (አርብ)']
        : ['Day 1 (Monday)', 'Day 2 (Tuesday)', 'Day 3 (Wednesday)', 'Day 4 (Thursday)', 'Day 5 (Friday)'];

      planData = {
        schoolName,
        teacherName,
        subject: subject || (isAmharic ? 'አማርኛ' : 'English'),
        gradeAndSection: gradeLevel || 'Grade 1',
        unitAndTopic: topic || (isAmharic ? 'ምዕራፍ አንድ' : 'Unit One'),
        weekRangeOrDates: weekRangeOrDates || (isAmharic ? 'ከሰኞ እስከ አርብ' : 'Monday to Friday'),
        generalCompetencies: isAmharic
          ? `ተማሪዎች በዚህ ሳምንት ስለ ${topic || 'ርዕሱ'} በቂ እውቀትና ክህሎት ያገኛሉ።`
          : `Students develop thorough understanding and practice of ${topic || 'the topic'} across 5 sequential lessons.`,
        rationale: isAmharic
          ? `የትምህርት እቅዱ ተማሪዎች ደረጃ በደረጃ እንዲማሩና እንዲለማመዱ ይረዳል።`
          : `The plan ensures systematic instructional scaffolding over the 5-day cycle.`,
        days: dayNames.map((name, idx) => ({
          dayNumber: idx + 1,
          dayName: name,
          date: name.split(' ')[1] || name,
          subTopic: isAmharic ? `ክፍል ${idx + 1}: የ${topic || 'ትምህርቱ'} ይዘት` : `Lesson ${idx + 1}: ${topic || 'Concept focus'}`,
          competencies: isAmharic ? `ተማሪዎች የዛሬውን ዋና ነጥብ ለይተው ይረዳሉ።` : `Students understand and apply core lesson objectives for Day ${idx + 1}.`,
          starterActivities: isAmharic ? 'ሰላምታ፣ የቀደመ ትምህርት ክለሳ እና ማነሳሳት።' : 'Greeting, warm-up review, and topic introduction.',
          mainActivities: isAmharic ? 'ማብራሪያ፣ ምሳሌዎች፣ የቡድን እና የግል ልምምዶች።' : 'Teacher explanation, modeling, guided drills, and class exercises.',
          concludingActivities: isAmharic ? 'ዋና ዋና ነጥቦችን ማጠቃለልና ጥያቄዎችን መመለስ።' : 'Key points summary and comprehension check.',
          assessmentTechniques: isAmharic ? 'የቃል ጥያቄ፣ የክፍል ስራ' : 'Oral questioning, notebook inspection',
          teachingAids: isAmharic ? 'የተማሪው መጽሐፍ፣ ፍላሽ ካርድ፣ ሰሌዳ' : 'Textbook, whiteboard, flashcards',
          homework: isAmharic ? `በገጽ ${10 + idx} ላይ ያለውን ጥያቄ መስራት።` : `Complete exercises on textbook page ${10 + idx}.`,
          remarks: '-',
        })),
        specialNeedsSupport: {
          slowLearners: isAmharic ? 'ተጨማሪ ጊዜና የአቻ ለአቻ ድጋፍ መስጠት።' : 'Extra scaffolding and peer assistance.',
          mediumLearners: isAmharic ? 'በመደበኛው እቅድ መሰረት ማስተማር።' : 'Standard instructional pace.',
          fastLearners: isAmharic ? 'ተጨማሪ ፈታኝ መልመጃዎችን መስጠት።' : 'Enrichment exercises.',
        },
        deptHeadName: '',
        vicePrincipalName: '',
      };
    }

    res.json({
      plan: planData,
      content: rawResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-5-days-plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate 5-day lesson plan' });
  }
});

// 2. Rapid "1 Word or Topic" Quiz & Worksheet Generator
app.post('/api/quick-quiz-generator', async (req: Request, res: Response) => {
  try {
    const {
      wordOrTopic,
      subject,
      gradeLevel,
      language,
      numQuestions,
      schoolProfile,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || 'Primary School / የመጀመሪያ ደረጃ ትምህርት ቤት';
    const teacherName = schoolProfile?.teacherName || 'Subject Teacher';
    const totalQ = numQuestions || 10;

    const effectiveLang = resolveCurriculumLanguage(subject, gradeLevel, language);
    const isAmharic = effectiveLang === 'Amharic';

    const prompt = `You are generating an instant classroom assessment based on a single word or topic for an Ethiopian primary school teacher.

ETHIOPIAN CURRICULUM MEDIUM OF INSTRUCTION:
- Subject: "${subject || 'General'}"
- Grade Level: "${gradeLevel || 'Grade 4'}"
- Required Language: "${effectiveLang.toUpperCase()}"
${isAmharic ? `[AMHARIC MEDIUM - GRADES 1-6 (Or Amharic Subject)]:
The ENTIRE quiz paper MUST be written in natural AMHARIC SCRIPT (በአማርኛ ቋንቋና በግዕዝ ፊደላት).
- Header in Amharic: "${schoolName}"
- Title: የ${subject} ምዘና ፈተና በርዕስ "${wordOrTopic}"
- Student Info: የተማሪው ስም፡ ______________ ክፍል፡ ${gradeLevel}  ክፍል ቁጥር፡ ___ ቀን፡ _________ [ ውጤት፡ _____ / 100 ]
- Clear Amharic instructions (መመሪያዎች)
- Part I: ባለብዙ ምርጫ (Multiple choice with choices ሀ, ለ, ሐ, መ)
- Part II: ክፍት ቦታ ሙላ (Fill in blanks)
- Part III: እውነት ወይም ሐሰት (True or False)
- Part IV: አዛምድ ወይም አጭር መልስ (Matching or Short answer)
- Complete Answer Key & Teacher Notes in Amharic under [የመልስ ቁልፍ (ANSWER KEY)] with explanations.` : `[ENGLISH MEDIUM - GRADES 7 & 8 (Or English Subject)]:
The ENTIRE quiz paper MUST be written in English.
- Header: "${schoolName}"
- Title: ${subject} Assessment / Quiz on "${wordOrTopic}"
- Student Info: Name: __________________________ Grade: ${gradeLevel} Section: ____ Date: _________ [ Score: _____ / 100 ]
- Clear English directions
- Part I: Multiple Choice Questions (choices A, B, C, D)
- Part II: Fill in the Blank / Short Answer
- Part III: True or False
- Part IV: Matching or Application Question
- Complete Answer Key & Teacher Notes under [ANSWER KEY] with clear explanations.`}

Word / Lesson Topic: "${wordOrTopic}"
Total Questions: ${totalQ}
Teacher: "${teacherName}"

Create a clean, ready-to-print assessment paper matching the language above.`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.5,
    });

    res.json({ content: text, language: effectiveLang });
  } catch (error: any) {
    console.error('Error in /api/quick-quiz-generator:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quick quiz' });
  }
});

// 3. Full Worksheet Generator with School Branding
app.post('/api/generate-worksheet', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      gradeLevel,
      questionTypes,
      numQuestions,
      topic,
      includeAnswerKey,
      includePhonetics,
      schoolProfile,
      language,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || 'Primary School';
    const teacherName = schoolProfile?.teacherName || '';

    const effectiveLang = resolveCurriculumLanguage(subject, gradeLevel, language);
    const isAmharic = effectiveLang === 'Amharic';

    const prompt = `Generate a classroom-ready student worksheet & exam paper for an Ethiopian primary school.

ETHIOPIAN CURRICULUM MEDIUM OF INSTRUCTION:
- Subject: ${subject || 'General Subject'}
- Grade Level: ${gradeLevel || 'Grade 5'}
- Language: ${effectiveLang.toUpperCase()}
${isAmharic ? `[AMHARIC MEDIUM - GRADES 1-6 (Or Amharic Subject)]:
The ENTIRE worksheet MUST be written in AMHARIC (በአማርኛ ቋንቋና በግዕዝ ፊደላት).
- Header: "${schoolName} - ${subject}"
- Student Info: "የተማሪው ስም፡ ______________ ክፍል፡ ${gradeLevel}  ቀን፡ ________ ውጤት፡ ___/100"
- Group by clean numbered Amharic sections:
  ክፍል ፩: ባለብዙ ምርጫ (ምርጫዎች ሀ፣ ለ፣ ሐ፣ መ)
  ክፍል ፪: ክፍት ቦታ ሙላ (Fill in blanks)
  ክፍል ፫: አዛምድ (Matching Columns)
  ክፍል ፬: እውነት ወይም ሐሰት (True/False)
  ክፍል ፭: አጭር መልስ (Short Answer)
- Answer Key at the end in Amharic under [የመልስ ቁልፍ (ANSWER KEY)].` : `[ENGLISH MEDIUM - GRADES 7 & 8 (Or English Subject)]:
The ENTIRE worksheet MUST be written in ENGLISH.
- Header: "${schoolName} - ${subject}"
- Student Info: "Student Name: ______________ Grade: ${gradeLevel}  Date: ________ Score: ___/100"
- Clean numbered sections (Part I: Multiple Choice, Part II: Fill in the blank, Part III: Matching, Part IV: True/False, Part V: Short Answer)
- Answer Key at the end under [ANSWER KEY].`}

School: ${schoolName} ${teacherName ? `(Teacher: ${teacherName})` : ''}
Assessment Title: ${title || 'Classroom Assessment'}
Topic: ${topic || 'Core Subject Material'}
Total Questions: ${numQuestions || 8}
Question Types requested: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : 'Multiple choice, Fill in blanks, Matching'}
Include Latin Transliteration/Phonetics: ${includePhonetics ? 'Yes' : 'No'}
Include Answer Key: ${includeAnswerKey ? 'Yes' : 'No'}

Ensure all questions strictly match Ethiopian curriculum benchmarks.`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.6,
    });

    res.json({ content: text, language: effectiveLang });
  } catch (error: any) {
    console.error('Error in /api/generate-worksheet:', error);
    res.status(500).json({ error: error.message || 'Failed to generate worksheet' });
  }
});

// 3. Fidel & Grammar Explainer
app.post('/api/explain-grammar', async (req: Request, res: Response) => {
  try {
    const { query, category } = req.body;

    const prompt = `Explain the following Amharic grammar concept or Fidel script question for an educator and students:
Concept/Question: "${query}"
Category: ${category || 'General Grammar & Fidel'}

Provide:
1. ጽንሰ-ሀሳብ (Concept Overview in simple, clear terms)
2. ሕግጋት (The Golden Rules of this grammatical rule or spelling rule)
3. ምሳሌዎች (Rich authentic examples with English translations and grammatical breakdowns)
4. የተለመዱ ስህተቶች (Common pitfalls students make - e.g. confusing ሀ/ሐ/ኀ, ሠ/ሰ, አ/ዐ, ጸ/ፀ or irregular plural forms like ውሾች vs አህዮች)
5. የልምምድ ጥያቄዎች (3 quick mini-drills for the teacher to test the class immediately)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.5,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/explain-grammar:', error);
    res.status(500).json({ error: error.message || 'Failed to explain grammar' });
  }
});

// 4. Story & Reading Comprehension Creator
app.post('/api/generate-story', async (req: Request, res: Response) => {
  try {
    const { storyTheme, targetAudience, moralLesson, difficulty } = req.body;

    const prompt = `Write an engaging, authentic Ethiopian Amharic story for reading comprehension.
Parameters:
- Theme: ${storyTheme || 'የጥንቸልና የአንበሳ ተረት (Fable of Rabbit and Lion) or Modern Ethiopian school day'}
- Target Level: ${targetAudience || 'Children / Beginner-to-Intermediate Readers'}
- Moral Lesson / Message: ${moralLesson || 'Wisdom beats brute strength (ብልጠት ከጉልበት ይበልጣል)'}
- Difficulty: ${difficulty || 'Intermediate'}

Include:
1. ርዕስ (Catchy Title in Amharic & English)
2. ታሪኩ / ምንባቡ (The full story in captivating Amharic with paragraphs)
3. አዳዲስ ቃላት እና ፍቺ (Vocabulary Glossary with phonetic pronunciation and English definitions)
4. የይዘት መረዳት ጥያቄዎች (5 Reading Comprehension Questions testing recall, inference, and moral)
5. የውይይት መነሻ ነጥቦች (Discussion prompts for classroom debate)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.8,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/generate-story:', error);
    res.status(500).json({ error: error.message || 'Failed to generate story' });
  }
});

// 5. Student Assignment Grading & Feedback Assistant
app.post('/api/grade-student-work', async (req: Request, res: Response) => {
  try {
    const { studentText, assignmentPrompt, gradeLevel } = req.body;

    const prompt = `Review and grade the following student's Amharic submission.
Assignment Prompt / Context: "${assignmentPrompt || 'General writing assignment'}"
Target Grade Level: "${gradeLevel || 'Primary / Intermediate'}"

Student's Written Text:
"""
${studentText}
"""

Please provide a pedagogical teacher evaluation:
1. አጠቃላይ ግምገማ (Overall Impression & Encouraging Note)
2. የፊደል እና የሆሄያት እርማት (Spelling & Fidel Orthography corrections - highlight exact mistakes and the corrected forms)
3. የሰዋሰው እና የአረፍተ ነገር አወቃቀር (Grammar, Tense & Syntax feedback)
4. የታረመው ትክክለኛ ጽሁፍ (The polished, exemplary version of the student's text)
5. የሚሰጥ ነጥብ / ደረጃ (Estimated score out of 100 with rubric breakdown)
6. ለተማሪው የሚሰጥ ቀጣይ የልምምድ ምክር (Actionable next practice step)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/grade-student-work:', error);
    res.status(500).json({ error: error.message || 'Failed to grade work' });
  }
});

// 6. Bilingual Translator & Cultural Nuance Bridge
app.post('/api/translate-cultural', async (req: Request, res: Response) => {
  try {
    const { text, direction, includeProverbs } = req.body;

    const prompt = `Provide an educational translation and cultural breakdown:
Text to translate: "${text}"
Direction: ${direction || 'Amharic to English'}
Include related proverbs/idioms: ${includeProverbs ? 'Yes' : 'No'}

Please output:
1. ቀጥተኛ ትርጉም (Direct accurate translation)
2. የባህል አገባብ እና ማብራሪያ (Cultural context, respectful registers - e.g. እርሶ/አንተ/አንቺ, nuances)
3. የቃላት አፈታት (Key vocabulary breakdown with pronunciation)
4. ተዛማጅ ምሳሌያዊ አነጋገር (Equivalent Ethiopian proverb or English idiom if applicable)`;

    const result = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    res.json({ content: result });
  } catch (error: any) {
    console.error('Error in /api/translate-cultural:', error);
    res.status(500).json({ error: error.message || 'Failed to translate' });
  }
});

// 7. Text-to-Speech (Audio Pronunciation for Fidel and Amharic text)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Clean text up to 300 characters for high speed audio playback
    const cleanText = text.trim().slice(0, 400);

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, gentle, and articulated pronunciation for an Amharic language learner and teacher',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned from speech model' });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// 8. General AI Educator Chat / Consultation
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Format for generateContent
    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || '' }],
    }));

    const text = await generateGeminiContent({
      contents: formattedHistory,
      systemInstruction: SYSTEM_PROMPT_EDUCATOR + '\nBe an attentive, friendly, and deeply encouraging pedagogical advisor for teachers and students.',
      temperature: 0.7,
    });

    res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Amharic Teacher Helper AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
