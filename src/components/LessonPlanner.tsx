import React, { useState } from 'react';
import { BookOpen, Sparkles, Printer, Copy, Check, Bookmark, Loader2, Volume2, School, Eye, FileSpreadsheet, RefreshCw, Calendar, Layers } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';
import { DailyLessonPlanData, FiveDaysPlanData, DayPlanItem, SavedMaterial, SchoolProfile } from '../types';
import { ETHIOPIAN_PRIMARY_SUBJECTS, PRIMARY_GRADES, QUICK_SAMPLE_TOPICS_BY_SUBJECT } from '../data/subjects';
import { DailyLessonPlanView } from './DailyLessonPlanView';
import { FiveDaysPlanView } from './FiveDaysPlanView';
import { getEthiopianCurriculumLanguage } from '../utils/curriculumLanguage';

export const EMPTY_LESSON_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: '',
  unitAndTopic: '',
  gradeAndSection: '',
  lessonTopic: '',
  date: '',
  rationale: '',
  prerequisiteKnowledge: '',
  competencies: '',
  stages: [
    {
      stage: 'Starter (ማነሳሳትና መከለስ)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
    {
      stage: 'Main Activities (ዋና ተግባራት)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
    {
      stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
  ],
  specialNeedsSupport: {
    slowLearners: '',
    mediumLearners: '',
    fastLearners: '',
  },
  deptHeadName: '',
  vicePrincipalName: '',
  postLessonAssessment: '',
};

export const SAMPLE_IMAGE_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'English',
  unitAndTopic: 'Unit One - My Family',
  gradeAndSection: 'Grade 1',
  lessonTopic: 'Vocabulary Practice: Class room Objects',
  date: 'Meskerem 06, 2017 E.C (Wednesday)',
  rationale: 'The lesson helps learners talk about classroom objects and their family.',
  prerequisiteKnowledge: 'Learners have learned family and basic greetings.',
  competencies: 'At the end of the lesson, the students will be able to identify and name classroom objects in English.',
  stages: [
    {
      stage: 'Starter (Motivation & Introduction)',
      timeAllotment: '5 min',
      learningContents: 'Warm-up related to Classroom Objects',
      page: '1-5',
      teacherActivities: 'Greets students, reviews previous lesson, and introduces today\'s topic: Classroom Objects.',
      studentActivities: 'Greet the teacher, answer warm-up questions, and listen to the introduction.',
      assessmentTechniques: 'Oral question',
      teachingAids: '-',
      remarks: '-',
    },
    {
      stage: 'Main Activities',
      timeAllotment: '25 min',
      learningContents: 'Practice and drill \'Classroom Objects\'',
      page: '1-5',
      teacherActivities: 'Explanation: guides students through \'Classroom Objects\' using Textbook, Pictures, Posters, and Flashcards.',
      studentActivities: 'Participate in vocabulary practice activities, practice naming objects, and respond to the teacher.',
      assessmentTechniques: 'Class work, oral questions',
      teachingAids: 'Textbook, Pictures, Posters, Flashcards',
      remarks: '-',
    },
    {
      stage: 'Concluding Activities',
      timeAllotment: '5 min',
      learningContents: 'Summary and homework',
      page: '-',
      teacherActivities: 'Summarizes the lesson, asks review questions, and assigns follow-up work.',
      studentActivities: 'Answer review questions and note down the homework/assignment.',
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

export const SAMPLE_AMHARIC_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'አጠቃላይ ሳይንስ (General Science)',
  unitAndTopic: 'ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው',
  gradeAndSection: '፭ኛ ክፍል (Grade 5)',
  lessonTopic: 'የቅጠል ተግባር እና የብርሃን አስተፃምሮ (Photosynthesis)',
  date: 'መስከረም 06 ቀን 2017 ዓ.ም',
  rationale: 'ይህ ትምህርት ተማሪዎች እጽዋት በቅጠላቸው አማካኝነት እንዴት ምግብ እንደሚያዘጋጁና ለሰው ልጅ ያላቸውን ጥቅም እንዲገነዘቡ ያግዛል።',
  prerequisiteKnowledge: 'ተማሪዎች በ4ኛ ክፍል ስለ እጽዋት ዋና ዋና ክፍሎች (ስር፣ ግንድ፣ ቅጠል) ተምረዋል።',
  competencies: 'ይህ ትምህርት ሲጠናቀቅ ተማሪዎች፡ 1. የቅጠልን ዋና ዋና ክፍሎች ይለያሉ፤ 2. የብርሃን አስተፃምሮ (Photosynthesis) ሂደትን ያብራራሉ፤ 3. እጽዋትን የመንከባከብ አስፈላጊነትን ይገልጻሉ።',
  stages: [
    {
      stage: 'Starter (ማነሳሳትና መከለስ)',
      timeAllotment: '5 ደቂቃ',
      learningContents: 'የቀደመ እውቀት መከለስና የቅጠሎችን ቅርጽ መመልከት',
      page: '34-36',
      teacherActivities: 'መምህሩ ሰላምታ ይሰጣል፣ አረንጓዴ ቅጠል ለክፍሉ በማሳየት "እጽዋት ምግባቸውን የሚያዘጋጁት የት ይመስላችኋል?" በማለት ይጠይቃል፣ የዛሬውን ርዕስ ያስተዋውቃል።',
      studentActivities: 'ተማሪዎች ሰላምታ ይመልሳሉ፣ የማነሳሻ ጥያቄዎችን ይመልሳሉ፣ የመማሪያ መጽሐፋቸውን ገጽ 34 ይከፍታሉ።',
      assessmentTechniques: 'የቃል ጥያቄ (Oral Questions)',
      teachingAids: 'የተፈጥሮ እጽዋት ቅጠል ናሙና፣ ፍላሽ ካርድ',
      remarks: '-',
    },
    {
      stage: 'Main Activities (ዋና ተግባራት)',
      timeAllotment: '25 ደቂቃ',
      learningContents: 'የቅጠል አወቃቀርና የብርሃን አስተፃምሮ ሂደት',
      page: '35-37',
      teacherActivities: 'መምህሩ የብርሃን አስተፃምሮ ንጥረ ነገሮችን (የፀሐይ ብርሃን፣ ውሃ፣ ካርቦን ዳይኦክሳይድ፣ ክሎሮፊል) በሰሌዳ ላይ በስዕላዊ መግለጫ ያስረዳል፤ ተማሪዎችን በ4 ቡድን በመክፈል በገጽ 36 ላይ ያለውን ጥያቄ እንዲወያዩ ያደርጋል።',
      studentActivities: 'ማብራሪያውን በትኩረት ያዳምጣሉ፣ በቡድን ሆነው የቅጠልን ተግባር ይወያያሉ፣ የክፍል ስራውን በደብተራቸው ይመዘግባሉ።',
      assessmentTechniques: 'የክፍል ስራ ምልከታ፣ የቡድን ውይይት ተሳትፎ',
      teachingAids: 'የተማሪው መማሪያ መጽሐፍ፣ የብርሃን አስተፃምሮ ቻርት/ፖስተር፣ ሰሌዳ',
      remarks: '-',
    },
    {
      stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
      timeAllotment: '5 ደቂቃ',
      learningContents: 'የትምህርቱ ማጠቃለያ እና የቤት ስራ',
      page: '38',
      teacherActivities: 'ዋና ዋና ነጥቦችን ያጠቃልላል፣ 3 የማጠቃለያ ጥያቄዎችን ይጠይቃል፣ በገጽ 38 ላይ ያሉትን ጥያቄዎች በቤት ስራ መልክ ይሰጣል።',
      studentActivities: 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራውን በደብተራቸው ይጽፋሉ።',
      assessmentTechniques: 'የቃል ጥያቄ',
      teachingAids: 'የተማሪው መጽሐፍ',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'ተጨማሪ ምስሎችንና ፍላሽ ካርዶችን በመጠቀም በአቻ ተማሪ እንዲታገዙ ማድረግ።',
    mediumLearners: 'በመደበኛው የማስተማሪያ እቅድና ፍጥነት መሰረት ማስተማር።',
    fastLearners: 'እጽዋት ባይኖሩ በከባቢ አየር ላይ ምን ሊፈጠር እንደሚችል አጭር ድርሰት እንዲጽፉ ተጨማሪ ተግባር መስጠት።',
  },
  deptHeadName: '',
  vicePrincipalName: '',
  postLessonAssessment: '',
};

export const SAMPLE_OROMIC_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'Barnoota Afaan Oromoo (Oromic)',
  unitAndTopic: 'Boqonnaa 3 - Maqaalee fi Ibsa Maqaa',
  gradeAndSection: 'Kutaa 4ffaa (Grade 4)',
  lessonTopic: 'Fayyadama Ibsa Maqaa Hima Keessatti (Using Adjectives in Sentences)',
  date: 'Fulbaana 06, 2017 A.L.I',
  rationale: 'Barnoonni kun barattoonni maqaalee fi ibsa maqaa adda baasanii hima sirrii akka ijaaran isaan gargaara.',
  prerequisiteKnowledge: 'Barattoonni kanaan dura maqaalee beekamoo fi himoota gabaaboo ijaaruu barataniiru.',
  competencies: 'Dhuma barnoota kanaatti barattoonni: 1. Maqaa fi Ibsa maqaa adda baasanii ni beeku; 2. Ibsa maqaa fayyadamuun hima sirrii ni ijaaru; 3. Shaakala kitaaba irratti dhiyaate dhuunfaan ni hojjatu.',
  stages: [
    {
      stage: 'Starter (Qophii fi Yaada Ka\'umsaa)',
      timeAllotment: '5 daqiiqaa',
      learningContents: 'Beekumsa duraanii qoruu fi kaka\'umsa uumuu',
      page: '28-29',
      teacherActivities: 'Barsiisaan nagaa gaafata, wantoota daree keessa jiran agarsiisuun "Barsiisaa dheeraa, mana bareedaa" jechuun maalummaa ibsa maqaa gaafata.',
      studentActivities: 'Barattoonni nagaa deebisu, gaaffii ka\'umsaa deebisu, kitaaba isaanii fuula 28 banatu.',
      assessmentTechniques: 'Gaaffii afaanii (Oral Questions)',
      teachingAids: 'Kaardii fiilashii jechootaa, fakkiiwwan',
      remarks: '-',
    },
    {
      stage: 'Main Activities (Gochaalee Gurguddoo)',
      timeAllotment: '25 daqiiqaa',
      learningContents: 'Hiika Ibsa Maqaa fi Hima keessatti Fayyadamuu',
      page: '29-31',
      teacherActivities: 'Barsiisaan ibsa maqaa gabatee irratti fakkeenya wajjin barreessa; barattoota garee 4tti qooduun hima akka ijaaran qajeelcha kenna.',
      studentActivities: 'Barattoonni ibsa dhaggeeffatu, daftara isaanii irratti barreessu, gareen mari\'atanii himoota fakkeenyaa ijaaru.',
      assessmentTechniques: 'Hojii daree, hordoffii garee',
      teachingAids: 'Kitaaba barataa, gabatee gurraacha, kaardii jechootaa',
      remarks: '-',
    },
    {
      stage: 'Concluding Activities (Gochaalee Xumuraa)',
      timeAllotment: '5 daqiiqaa',
      learningContents: 'Cuunfaa barnootichaa fi Hojii Manaa',
      page: '32',
      teacherActivities: 'Qabxiilee gurguddoo cuunfa, barattoota 3 gaaffii gaafata, gilgaala fuula 32 irratti argamu hojii manaa kenna.',
      studentActivities: 'Gaaffii cuunfaa deebisu, hojii manaa daftara isaanii irratti galmeeffatu.',
      assessmentTechniques: 'Gaaffii afaanii',
      teachingAids: 'Kitaaba barataa',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'Fakkiiwwan gargaaramuun ibsa dabalataa kennuu fi hiriyaa daree wajjin akka hojjatan gochuu.',
    mediumLearners: 'Haala karoora idileetiin hordoffii barbaachisaa gochuu.',
    fastLearners: 'Hima walxaxaa ibsa maqaa lama of keessaa qabu akka barreessan gochuu.',
  },
  deptHeadName: '',
  vicePrincipalName: '',
  postLessonAssessment: '',
};

export const EMPTY_FIVE_DAYS_PLAN: FiveDaysPlanData = {
  schoolName: '',
  teacherName: '',
  subject: '',
  gradeAndSection: '',
  unitAndTopic: '',
  weekRangeOrDates: 'ከሰኞ እስከ አርብ (Monday - Friday)',
  generalCompetencies: '',
  rationale: '',
  days: [
    {
      dayNumber: 1,
      dayName: 'ቀን 1 (ሰኞ / Monday)',
      date: 'ሰኞ',
      lessonTopic: '',
      subTopic: '',
      competencies: '',
      stages: [],
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    },
    {
      dayNumber: 2,
      dayName: 'ቀን 2 (ማክሰኞ / Tuesday)',
      date: 'ማክሰኞ',
      lessonTopic: '',
      subTopic: '',
      competencies: '',
      stages: [],
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    },
    {
      dayNumber: 3,
      dayName: 'ቀን 3 (ረቡዕ / Wednesday)',
      date: 'ረቡዕ',
      lessonTopic: '',
      subTopic: '',
      competencies: '',
      stages: [],
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    },
    {
      dayNumber: 4,
      dayName: 'ቀን 4 (ሐሙስ / Thursday)',
      date: 'ሐሙስ',
      lessonTopic: '',
      subTopic: '',
      competencies: '',
      stages: [],
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    },
    {
      dayNumber: 5,
      dayName: 'ቀን 5 (አርብ / Friday)',
      date: 'አርብ',
      lessonTopic: '',
      subTopic: '',
      competencies: '',
      stages: [],
      starterActivities: '',
      mainActivities: '',
      concludingActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      homework: '',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: '',
    mediumLearners: '',
    fastLearners: '',
  },
  deptHeadName: '',
  vicePrincipalName: '',
};

export const SAMPLE_FIVE_DAYS_AMHARIC: FiveDaysPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'አጠቃላይ ሳይንስ (General Science)',
  gradeAndSection: '፭ኛ ክፍል (Grade 5)',
  unitAndTopic: 'ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው',
  weekRangeOrDates: 'መስከረም 06 - 10 ቀን 2017 ዓ.ም (ከሰኞ እስከ አርብ)',
  generalCompetencies: 'ተማሪዎች በዚህ ሳምንት የእጽዋትን ዋና ዋና ክፍሎች፣ የቅጠል ተግባር፣ የብርሃን አስተፃምሮ ሂደት እና የእጽዋት እንክብካቤን ተረድተው ይተገብራሉ።',
  rationale: 'ይህ የ5 ቀናት ሳምንታዊ እቅድ ተማሪዎች ጽንሰ-ሀሳቡን ደረጃ በደረጃ ከቀላል ወደ ረቂቅ በመማር የንድፈ-ሀሳብና ተግባራዊ ክህሎት እንዲያገኙ ያስችላቸዋል።',
  days: [
    {
      dayNumber: 1,
      dayName: 'ቀን 1 (ሰኞ)',
      date: 'ሰኞ',
      subTopic: 'የእጽዋት ዋና ዋና ክፍሎች (ስር፣ ግንድ፣ ቅጠል)',
      competencies: 'የእጽዋት 3 ዋና ዋና ክፍሎችን ይለያሉ፣ ተግባራቸውን ይዘረዝራሉ።',
      starterActivities: 'ሰላምታ፣ የቀደመ ትምህርት መከለስ እና የክፍሉን እጽዋት ማስተዋወቅ።',
      mainActivities: 'የእጽዋት ክፍሎችን በስዕል ማሳየት፣ የመማሪያ መጽሐፍ ገጽ 30 ማንበብ እና ክፍሎቹን በደብተር መመደብ።',
      concludingActivities: 'የቃል ጥያቄዎች እና ዋና ነጥቦችን ማጠቃለል።',
      assessmentTechniques: 'የቃል ጥያቄ፣ ምልከታ',
      teachingAids: 'የእጽዋት ናሙና፣ ቻርት፣ ሰሌዳ',
      homework: 'በገጽ 32 ላይ ያሉትን 3 ጥያቄዎች በደብተር መስራት።',
      remarks: '-',
    },
    {
      dayNumber: 2,
      dayName: 'ቀን 2 (ማክሰኞ)',
      date: 'ማክሰኞ',
      subTopic: 'የቅጠል አወቃቀርና ተግባር',
      competencies: 'የቅጠል ክፍሎችን (ስቶማታ፣ ክሎሮፊል) እና ዋና ተግባሩን ያብራራሉ።',
      starterActivities: 'የሰኞ የቤት ስራን ማረም እና የተለያዩ ቅጠሎችን ቅርጽ ማወዳደር።',
      mainActivities: 'ስለ ቅጠል አወቃቀር ማብራሪያ መስጠት፣ አጉሊ መነጽር (ማጉያ) በመጠቀም ቅጠልን መመርመር።',
      concludingActivities: 'የተማሪዎችን ምልከታ በጋራ ማጠቃለልና ማስታወሻ መያዝ።',
      assessmentTechniques: 'የክፍል ስራ፣ የተግባር ምልከታ',
      teachingAids: 'የተለያዩ ቅጠሎች፣ አጉሊ መነጽር፣ የተማሪው መጽሐፍ',
      homework: 'የቅጠል ስዕል በደብተር ላይ ስለው ክፍሎቹን መሰየም።',
      remarks: '-',
    },
    {
      dayNumber: 3,
      dayName: 'ቀን 3 (ረቡዕ)',
      date: 'ረቡዕ',
      subTopic: 'የብርሃን አስተፃምሮ (Photosynthesis) ሂደት',
      competencies: 'እጽዋት በፀሐይ ብርሃን፣ ውሃና ካርቦን ዳይኦክሳይድ ምግብ የሚያዘጋጁበትን ሂደት ይገልጻሉ።',
      starterActivities: '"እጽዋት ምግባቸውን የሚያዘጋጁት እንዴት ነው?" በሚል ጥያቄ ማነሳሳት።',
      mainActivities: 'የብርሃን አስተፃምሮ እኩልዮሽን (ውሃ + CO2 + ብርሃን → ምግብ + ኦክስጅን) በሰሌዳ ላይ በምሳሌ ማስረዳት፤ የቡድን ውይይት።',
      concludingActivities: 'የቡድን ተወካዮች ማብራሪያ ማዳመጥና ማጠቃለያ መስጠት።',
      assessmentTechniques: 'የቡድን ውይይት ምዘና፣ የቃል ጥያቄ',
      teachingAids: 'ስዕላዊ ፖስተር፣ ሰሌዳ፣ የተማሪው መጽሐፍ',
      homework: 'እጽዋት ለሰው ልጅ የሚሰጡትን 2 ጥቅሞች መጻፍ።',
      remarks: '-',
    },
    {
      dayNumber: 4,
      dayName: 'ቀን 4 (ሐሙስ)',
      date: 'ሐሙስ',
      subTopic: 'እጽዋት ለአካባቢና ለሰው ልጅ ያላቸው ፋይዳ',
      competencies: 'እጽዋት ለአየር ንብረት፣ ለምግብ እና ለኦክስጅን ያላቸውን ሚና ይዘረዝራሉ።',
      starterActivities: 'የረቡዕ የቡድን ስራን ማስታወስና የዛሬውን ርዕስ ማስተዋወቅ።',
      mainActivities: 'የደን መጨፍጨፍ ጉዳትና የችግኝ ተከላ አስፈላጊነትን በምሳሌ ማስረዳት፤ ጥንድ ጥንድ በመሆን መወያየት።',
      concludingActivities: 'ዋና ዋና ነጥቦችን ማጠቃለልና የነገውን አጭር ፈተና ይዘት ማሳወቅ።',
      assessmentTechniques: 'የክፍል ስራ ደብተር ማረም፣ ምልከታ',
      teachingAids: 'የተማሪው መጽሐፍ፣ ፎቶግራፎች',
      homework: 'ለነገው የሳምንቱ አጭር ፈተና (Quiz) ከገጽ 30-38 መከለስ።',
      remarks: '-',
    },
    {
      dayNumber: 5,
      dayName: 'ቀን 5 (አርብ)',
      date: 'አርብ',
      subTopic: 'የሳምንቱ አጠቃላይ ክለሳ እና አጭር ምዘና (Weekly Quiz)',
      competencies: 'የሳምንቱን 4 ዋና ዋና ነጥቦች አጠቃለው ይረዳሉ፣ 5ቱን የፈተና ጥያቄዎች በትክክል ይመልሳሉ።',
      starterActivities: 'የሳምንቱን ዋና ዋና ነጥቦች በጨዋታ መልክ ፈጣን ጥያቄና መልስ መከለስ (5 ደቂቃ)።',
      mainActivities: 'የ15 ደቂቃ አጭር ፈተና (10 ነጥብ) መስጠት፤ ፈተናውን በጋራ ማረምና ግብረ-መልስ መስጠት።',
      concludingActivities: 'ፈተናውን ማጠቃለል፣ ጎበዝ ተማሪዎችን ማበረታታትና የሳምንቱን ትምህርት ማጠቃለል።',
      assessmentTechniques: 'አጭር ፈተና (Quiz)፣ የጋራ እርማት',
      teachingAids: 'የፈተና ወረቀት፣ ሰሌዳ',
      homework: 'የሚቀጥለውን ምዕራፍ ፬ መግቢያ ማንበብ።',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'ተጨማሪ ምስሎችንና ፍላሽ ካርዶችን በመጠቀም በአቻ ተማሪ እንዲታገዙ ማድረግ።',
    mediumLearners: 'በመደበኛው የማስተማሪያ እቅድና ፍጥነት መሰረት ማስተማር።',
    fastLearners: 'እጽዋት ባይኖሩ በከባቢ አየር ላይ ምን ሊፈጠር እንደሚችል አጭር ድርሰት እንዲጽፉ ተጨማሪ ተግባር መስጠት።',
  },
  deptHeadName: '',
  vicePrincipalName: '',
};

export const SAMPLE_FIVE_DAYS_ENGLISH: FiveDaysPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'English',
  gradeAndSection: 'Grade 7',
  unitAndTopic: 'Unit 2 - Environmental Protection & Trees',
  weekRangeOrDates: 'Week 2 (Monday to Friday)',
  generalCompetencies: 'By the end of this 5-day cycle, students will master environmental vocabulary, practice reading comprehension, apply conditional sentences, and synthesize learning through writing.',
  rationale: 'This weekly instructional plan sequences learning from receptive vocabulary acquisition to active comprehension, grammar application, and weekly formative assessment.',
  days: [
    {
      dayNumber: 1,
      dayName: 'Day 1 (Monday)',
      date: 'Monday',
      subTopic: 'Vocabulary Building: Ecology & Nature',
      competencies: 'Students identify and use 8 target environmental vocabulary words in context.',
      starterActivities: 'Warm-up game: brainstorm classroom and natural environment words.',
      mainActivities: 'Introduce words via flashcards; choral reading; contextual sentence matching.',
      concludingActivities: 'Rapid exit-ticket vocabulary oral check.',
      assessmentTechniques: 'Exit ticket, oral drill',
      teachingAids: 'Flashcards, textbook, chalkboard',
      homework: 'Write 4 original sentences using the new vocabulary words.',
      remarks: '-',
    },
    {
      dayNumber: 2,
      dayName: 'Day 2 (Tuesday)',
      date: 'Tuesday',
      subTopic: 'Reading Comprehension: "Our Green Heritage"',
      competencies: 'Students read the passage fluently and answer 5 comprehension questions correctly.',
      starterActivities: 'Review Day 1 sentences; prediction from passage title and illustrations.',
      mainActivities: 'Teacher modeled reading; silent student reading; guided reading comprehension questions.',
      concludingActivities: 'Check answers on board; clarify unfamiliar phrases.',
      assessmentTechniques: 'Comprehension exercise check',
      teachingAids: 'Student textbook page 24-26',
      homework: 'Read passage aloud once at home to family or guardian.',
      remarks: '-',
    },
    {
      dayNumber: 3,
      dayName: 'Day 3 (Wednesday)',
      date: 'Wednesday',
      subTopic: 'Grammar in Context: First Conditional (If + Present, Will)',
      competencies: 'Students construct accurate conditional sentences relating to environment protection.',
      starterActivities: 'Problem prompt: "What happens if we do not plant trees?"',
      mainActivities: 'Grammar structure explanation; guided substitution drill; pair-work practice.',
      concludingActivities: 'Pairs share one original conditional sentence to class.',
      assessmentTechniques: 'Pair observation, notebook checking',
      teachingAids: 'Grammar chart, textbook',
      homework: 'Complete exercise 3 on page 28.',
      remarks: '-',
    },
    {
      dayNumber: 4,
      dayName: 'Day 4 (Thursday)',
      date: 'Thursday',
      subTopic: 'Guided Paragraph Writing: Protecting Our School Compound',
      competencies: 'Students write a cohesive 5-sentence paragraph applying vocabulary and conditional clauses.',
      starterActivities: 'Brainstorm school compound improvement ideas on chalkboard.',
      mainActivities: 'Teacher models topic sentence; students draft individual paragraphs with teacher roving support.',
      concludingActivities: 'Peer-editing checklist and teacher feedback.',
      assessmentTechniques: 'Paragraph rubric evaluation',
      teachingAids: 'Writing template, sample paragraph',
      homework: 'Finalize paragraph draft and review for Friday quiz.',
      remarks: '-',
    },
    {
      dayNumber: 5,
      dayName: 'Day 5 (Friday)',
      date: 'Friday',
      subTopic: 'Weekly Synthesis, Revision & 15-Minute Quiz',
      competencies: 'Students demonstrate mastery of vocabulary, reading facts, and grammar on the weekly quiz.',
      starterActivities: 'Rapid 5-minute quiz preparation review.',
      mainActivities: 'Administer 10-item weekly formative quiz (15 min); peer correction & teacher explanation.',
      concludingActivities: 'Praise achievement, address common mistakes, and wrap up unit.',
      assessmentTechniques: '10-item Formative Quiz, self-correction',
      teachingAids: 'Quiz sheets, answer key',
      homework: 'Preview next unit vocabulary.',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'Provide bilingual glossary support, sentence starters, and peer buddy assistance.',
    mediumLearners: 'Standard curriculum pace with scaffolded sentence frames.',
    fastLearners: 'Ask them to write an extension paragraph arguing for green school policies.',
  },
  deptHeadName: '',
  vicePrincipalName: '',
};

export const SAMPLE_FIVE_DAYS_OROMIC: FiveDaysPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'Barnoota Afaan Oromoo (Oromic Curriculum)',
  gradeAndSection: 'Kutaa 4ffaa (Grade 4)',
  unitAndTopic: 'Boqonnaa 3 - Maqaalee fi Ibsa Maqaa Afaan Oromoo',
  weekRangeOrDates: 'Fulbaana 06 - 10, 2017 A.L.I (Wiixata - Jimaata)',
  generalCompetencies: 'Dhuma torban kanaatti barattoonni maqaalee fi ibsa maqaa adda baasuu, hima keessatti itti fayyadamuu fi barreeffama gabaabaa qopheessuu danda\'u.',
  rationale: 'Karoorri torbee kun barattoonni seerluga bu\'uuraa Afaan Oromoo akka gabbifataniifi ogummaa barreessuufi dubbachuu akka cimsatan gargaara.',
  days: [
    {
      dayNumber: 1,
      dayName: 'Guyyaa 1 (Wiixata / Monday)',
      date: 'Fulbaana 06, 2017 A.L.I',
      subTopic: 'Seensa: Maalummaa Maqaa fi Ibsa Maqaa',
      lessonTopic: 'Maalummaa Maqaa fi Ibsa Maqaa',
      competencies: 'Barattoonni maqaalee fi ibsa maqaa adda baasanii ni hubatu.',
      starterActivities: 'Barsiisaan nagaa gaafata, fakkeenyota daree keessaa eeruun maalummaa ibsa maqaa beeksisa.',
      mainActivities: 'Ibsa maqaa gabatee irratti fakkeenya waliin ibsuu fi barattoota hirmaachisuu.',
      concludingActivities: 'Qabxii ijoo cuunfuu fi gaaffii ka\'umsaa deebisiisuu.',
      assessmentTechniques: 'Gaaffii afaanii, hordoffii',
      teachingAids: 'Kitaaba barataa, kaardii jechootaa',
      homework: 'Ibsa maqaa 5 barreeffatanii dhufuu',
      remarks: '-',
    },
    {
      dayNumber: 2,
      dayName: 'Guyyaa 2 (Kibxata / Tuesday)',
      date: 'Fulbaana 07, 2017 A.L.I',
      subTopic: 'Gosoota Ibsa Maqaa (Amala, Halluu, Baay\'ina)',
      lessonTopic: 'Gosoota Ibsa Maqaa',
      competencies: 'Barattoonni gosoota ibsa maqaa adda baasanii ni tarreessu.',
      starterActivities: 'Barnoota Wiixataa irra deebi\'uun gaaffii gaafachuu.',
      mainActivities: 'Gosoota ibsa maqaa halluu, amalaafi baay\'ina fakkeenyaan dhiyeessuu.',
      concludingActivities: 'Barattoonni fakkeenya akka kennan gochuu fi cuunfuu.',
      assessmentTechniques: 'Hojii daree, gaaffii afaanii',
      teachingAids: 'Fakkiiwwan halluu qaban, gabatee',
      homework: 'Gilgaala fuula 30 irratti jiru hojjachuu',
      remarks: '-',
    },
    {
      dayNumber: 3,
      dayName: 'Guyyaa 3 (Roobii / Wednesday)',
      date: 'Fulbaana 08, 2017 A.L.I',
      subTopic: 'Hojii Garee: Hima Ijaaruu fi Shaakala Waloo',
      lessonTopic: 'Hima Ijaaruu fi Shaakala Waloo',
      competencies: 'Barattoonni gareen ta\'uun himoota sirrii ni ijaaru.',
      starterActivities: 'Barattoota garee afuritti qooduu fi waraqaa hojii raabsuu.',
      mainActivities: 'Gareewwan jechoota walitti fiduun hima akka ijaaran hordofuu fi deeggaruu.',
      concludingActivities: 'Bakka bu\'aan garee tokkoon tokkoon himoota ijaaran dareef dubbisuu.',
      assessmentTechniques: 'Madaallii garee, hordoffii hirmaannaa',
      teachingAids: 'Waraqaa hojii garee, daftara',
      homework: 'Himoota gareen ijaarame daftara irratti qulqulleessanii barreessuu',
      remarks: '-',
    },
    {
      dayNumber: 4,
      dayName: 'Guyyaa 4 (Kamisa / Thursday)',
      date: 'Fulbaana 09, 2017 A.L.I',
      subTopic: 'Shaakala Dhuunfaa fi Barreeffama Keessatti Fayyadamuu',
      lessonTopic: 'Shaakala Dhuunfaa fi Barreeffama',
      competencies: 'Barataan hundi dhuunfaan keeyyata gabaabaa ibsa maqaa of keessaa qabu ni barreessa.',
      starterActivities: 'Qabxiilee gurguddoo Wiixata hanga Roobii baratan yaadachiisuu.',
      mainActivities: 'Barattoonni waa\'ee mana isaanii yookiin mana barumsaa ibsa maqaa fayyadamuun akka barreessan gochuu.',
      concludingActivities: 'Daftara barattoota muraasaa ilaaluun sirreeffama kennuu.',
      assessmentTechniques: 'Hojii dhuunfaa, daawwannaa barreeffamaa',
      teachingAids: 'Kitaaba barataa, daftara',
      homework: 'Keeyyata barreeffame manatti sirreessanii qopheessuu',
      remarks: '-',
    },
    {
      dayNumber: 5,
      dayName: 'Guyyaa 5 (Jimaata / Friday)',
      date: 'Fulbaana 10, 2017 A.L.I',
      subTopic: 'Cuunfaa Torbee fi Madaallii Gabaabaa (Weekly Quiz)',
      lessonTopic: 'Cuunfaa Torbee fi Madaallii',
      competencies: 'Barattoonni beekumsa torban kana argatan qormaataan ni mirkaneeffatu.',
      starterActivities: 'Cuunfaa qabiyyee torbee gabaabinaan dhiyeessuu fi qajeelfama qormaataa kennuu.',
      mainActivities: 'Qormaata gabaabaa gaaffii 5 qabu (Quiz) gaggeessuu fi madaaluu.',
      concludingActivities: 'Deebii qormaataa waloof dhiyeessuu fi hojii boqonnaa torbee kennuu.',
      assessmentTechniques: 'Qormaata gabaabaa (Weekly Quiz), gaaffii afaanii',
      teachingAids: 'Waraqaa qormaataa, gabatee',
      homework: 'Boqonnaa itti aanuuf qophaa\'uu',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'Deeggarsa dhuunfaa, ibsa dabalataa fi hiriyaa dareetiin akka deeggaraman gochuu.',
    mediumLearners: 'Hojii daree idilee fi hordoffii walirraa hin cinne taasisuu.',
    fastLearners: 'Keeyyata dheeraa fi himoota walxaxaa akka barreessan gochuu.',
  },
  deptHeadName: '',
  vicePrincipalName: '',
};

interface LessonPlannerProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
  onOpenSchoolSettings: () => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({
  schoolProfile,
  onSaveToLibrary,
  onOpenKeyboard,
  onOpenSchoolSettings,
}) => {
  const [planMode, setPlanMode] = useState<'1-day' | '5-days'>('1-day');
  const [subject, setSubject] = useState('general_science');
  const [topic, setTopic] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 1');
  const [duration, setDuration] = useState('35-40 min');
  const [customDate, setCustomDate] = useState('መስከረም 06 ቀን 2017 ዓ.ም');
  const [weekRange, setWeekRange] = useState('ከሰኞ እስከ አርብ (Monday - Friday)');
  const [languageMode, setLanguageMode] = useState<string>('Amharic');
  const [specificFocus, setSpecificFocus] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingFiveDays, setLoadingFiveDays] = useState(false);
  const [structuredPlan, setStructuredPlan] = useState<DailyLessonPlanData>(EMPTY_LESSON_PLAN);
  const [fiveDaysPlan, setFiveDaysPlan] = useState<FiveDaysPlanData>(EMPTY_FIVE_DAYS_PLAN);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentSubjectObj = ETHIOPIAN_PRIMARY_SUBJECTS.find((s) => s.id === subject);
  const subjectPresets = QUICK_SAMPLE_TOPICS_BY_SUBJECT[subject] || [];

  // Ethiopian Curriculum Language Rule based on selected subject, grade and language mode
  const curriculumRule = getEthiopianCurriculumLanguage(subject, gradeLevel, languageMode);
  const isOromic = languageMode === 'Afaan Oromoo';

  const handleSelectLanguage = (lang: 'Amharic' | 'Afaan Oromoo' | 'English') => {
    setLanguageMode(lang);
    if (lang === 'Afaan Oromoo') {
      setSubject('afaan_oromoo');
      setCustomDate('Fulbaana 06, 2017 A.L.I');
      setWeekRange('Fulbaana 06 - 10, 2017 A.L.I (Wiixata - Jimaata)');
      const presets = QUICK_SAMPLE_TOPICS_BY_SUBJECT['afaan_oromoo'];
      if (presets && presets[0]) {
        setTopic(presets[0].topic);
        setGradeLevel(presets[0].grade);
        setLessonTopic(presets[0].topic);
      }
    } else if (lang === 'Amharic') {
      setSubject('general_science');
      setCustomDate('መስከረም 06 ቀን 2017 ዓ.ም');
      setWeekRange('ከሰኞ እስከ አርብ (Monday - Friday)');
      const presets = QUICK_SAMPLE_TOPICS_BY_SUBJECT['general_science'];
      if (presets && presets[0]) {
        setTopic(presets[0].topic);
        setGradeLevel(presets[0].grade);
        setLessonTopic(presets[0].topic);
      }
    } else {
      setSubject('english');
      setCustomDate('Meskerem 06, 2017 E.C (Wednesday)');
      setWeekRange('Week 1 (Monday - Friday)');
      const presets = QUICK_SAMPLE_TOPICS_BY_SUBJECT['english'];
      if (presets && presets[0]) {
        setTopic(presets[0].topic);
        setGradeLevel(presets[0].grade);
        setLessonTopic(presets[0].topic);
      }
    }
  };


  const handleGenerate = async (overrideTopic?: string, overrideGrade?: string) => {
    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    const activeTopic = overrideTopic || topic;
    const activeGrade = overrideGrade || gradeLevel;

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel: activeGrade,
          duration,
          languageMode,
          specificFocus: lessonTopic || specificFocus,
          customNotes,
          schoolProfile,
          customDate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.plan) {
        setStructuredPlan(data.plan);
        setPlanMode('1-day');
      } else {
        throw new Error('No structured plan returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate lesson plan. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFiveDays = async (overrideTopic?: string, overrideGrade?: string) => {
    setLoadingFiveDays(true);
    setErrorMessage(null);
    setSaved(false);

    const activeTopic = overrideTopic || topic;
    const activeGrade = overrideGrade || gradeLevel;

    try {
      const res = await fetch('/api/generate-5-days-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel: activeGrade,
          languageMode,
          customNotes,
          schoolProfile,
          weekRangeOrDates: weekRange,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.plan) {
        setFiveDaysPlan(data.plan);
        setPlanMode('5-days');
      } else {
        throw new Error('No structured 5-days plan returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate 5-day lesson plan. Please retry.');
    } finally {
      setLoadingFiveDays(false);
    }
  };

  const handleLoadSample = (mode: 'Blank' | 'English' | 'Amharic' | 'Oromic' = 'Blank') => {
    setPlanMode('1-day');
    if (mode === 'Blank') {
      setStructuredPlan({
        ...EMPTY_LESSON_PLAN,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setTopic('');
      setLessonTopic('');
    } else if (mode === 'Oromic') {
      setStructuredPlan({
        ...SAMPLE_OROMIC_PLAN,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('afaan_oromoo');
      setTopic('Boqonnaa 3 - Maqaalee fi Ibsa Maqaa');
      setLessonTopic('Fayyadama Ibsa Maqaa Hima Keessatti');
      setGradeLevel('Grade 4');
      setLanguageMode('Afaan Oromoo');
    } else if (mode === 'Amharic') {
      setStructuredPlan({
        ...SAMPLE_AMHARIC_PLAN,
        schoolName: schoolProfile.amharicSchoolName || schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('general_science');
      setTopic('ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው');
      setLessonTopic('የቅጠል ተግባር እና የብርሃን አስተፃምሮ');
      setGradeLevel('Grade 5');
      setLanguageMode('Amharic');
    } else {
      setStructuredPlan({
        ...SAMPLE_IMAGE_PLAN,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('english');
      setTopic('Unit One - My Family');
      setLessonTopic('Vocabulary Practice: Class room Objects');
      setGradeLevel('Grade 1');
      setLanguageMode('English');
    }
  };

  const handleLoadFiveDaysSample = (mode: 'Blank' | 'English' | 'Amharic' | 'Oromic' = 'Amharic') => {
    setPlanMode('5-days');
    if (mode === 'Blank') {
      setFiveDaysPlan({
        ...EMPTY_FIVE_DAYS_PLAN,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setTopic('');
    } else if (mode === 'Oromic') {
      setFiveDaysPlan({
        ...SAMPLE_FIVE_DAYS_OROMIC,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('afaan_oromoo');
      setTopic('Boqonnaa 3 - Maqaalee fi Ibsa Maqaa Afaan Oromoo');
      setGradeLevel('Grade 4');
      setLanguageMode('Afaan Oromoo');
    } else if (mode === 'Amharic') {
      setFiveDaysPlan({
        ...SAMPLE_FIVE_DAYS_AMHARIC,
        schoolName: schoolProfile.amharicSchoolName || schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('general_science');
      setTopic('ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው');
      setGradeLevel('Grade 5');
      setLanguageMode('Amharic');
    } else {
      setFiveDaysPlan({
        ...SAMPLE_FIVE_DAYS_ENGLISH,
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || '',
      });
      setSubject('english');
      setTopic('Unit 2 - Environmental Protection & Trees');
      setGradeLevel('Grade 7');
      setLanguageMode('English');
    }
  };

  const handleConvertDayToDailyPlan = (day: DayPlanItem) => {
    const dlp: DailyLessonPlanData = {
      schoolName: fiveDaysPlan.schoolName,
      teacherName: fiveDaysPlan.teacherName,
      subject: fiveDaysPlan.subject,
      unitAndTopic: fiveDaysPlan.unitAndTopic,
      gradeAndSection: fiveDaysPlan.gradeAndSection,
      lessonTopic: `${day.dayName}: ${day.lessonTopic || day.subTopic || ''}`,
      date: day.date || customDate,
      rationale: day.rationale || fiveDaysPlan.rationale,
      prerequisiteKnowledge: day.prerequisiteKnowledge || day.starterActivities || '',
      competencies: day.competencies,
      stages: day.stages && day.stages.length >= 3
        ? day.stages
        : [
            {
              stage: 'Starter (ማነሳሳትና መከለስ)',
              timeAllotment: '5 min',
              learningContents: day.lessonTopic || day.subTopic || '',
              page: '1-5',
              teacherActivities: day.starterActivities || '',
              studentActivities: 'ያዳምጣሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: day.teachingAids || '',
              remarks: '-',
            },
            {
              stage: 'Main Activities (ዋና ተግባራት)',
              timeAllotment: '25 min',
              learningContents: day.lessonTopic || day.subTopic || '',
              page: '1-5',
              teacherActivities: day.mainActivities || '',
              studentActivities: 'የክፍል ስራ ይሰራሉ፣ በውይይት ይሳተፋሉ።',
              assessmentTechniques: day.assessmentTechniques || '',
              teachingAids: day.teachingAids || '',
              remarks: '-',
            },
            {
              stage: 'Concluding Activities (ማጠቃለያና የቤት ስራ)',
              timeAllotment: '5 min',
              learningContents: day.homework || 'ማጠቃለያ',
              page: '-',
              teacherActivities: `${day.concludingActivities || ''} | የቤት ስራ: ${day.homework || '-'}`,
              studentActivities: 'ማጠቃለያ ጥያቄ ይመልሳሉ፣ የቤት ስራ ይመዘግባሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: '-',
              remarks: '-',
            },
          ],
      specialNeedsSupport: fiveDaysPlan.specialNeedsSupport,
      deptHeadName: fiveDaysPlan.deptHeadName || '',
      vicePrincipalName: fiveDaysPlan.vicePrincipalName || '',
    };
    setStructuredPlan(dlp);
    setPlanMode('1-day');
  };

  const handleSave = () => {
    if (!structuredPlan) return;
    onSaveToLibrary({
      type: 'lesson-plan',
      title: `${structuredPlan.subject || 'Lesson Plan'}: ${structuredPlan.lessonTopic || structuredPlan.unitAndTopic || 'Untitled'}`,
      preview: `Teacher: ${structuredPlan.teacherName || 'Not specified'} • School: ${structuredPlan.schoolName || 'Not specified'} • ${structuredPlan.competencies.slice(0, 80)}...`,
      content: JSON.stringify(structuredPlan, null, 2),
      structuredPlan,
      gradeLevel: structuredPlan.gradeAndSection,
      subject: structuredPlan.subject,
      schoolName: structuredPlan.schoolName,
      tags: ['Daily Lesson Plan', structuredPlan.subject, structuredPlan.gradeAndSection],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveFiveDays = () => {
    onSaveToLibrary({
      type: 'lesson-plan',
      title: `5-Days Plan: ${fiveDaysPlan.subject || 'Weekly'} - ${fiveDaysPlan.unitAndTopic || 'Unit'}`,
      preview: `Teacher: ${fiveDaysPlan.teacherName || 'Teacher'} • ${fiveDaysPlan.weekRangeOrDates} • ${fiveDaysPlan.generalCompetencies.slice(0, 80)}...`,
      content: JSON.stringify(fiveDaysPlan, null, 2),
      gradeLevel: fiveDaysPlan.gradeAndSection,
      subject: fiveDaysPlan.subject,
      schoolName: fiveDaysPlan.schoolName,
      tags: ['5-Days Plan', 'Weekly Plan', fiveDaysPlan.subject, fiveDaysPlan.gradeAndSection],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Primary Plan Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlanMode('1-day')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              planMode === '1-day'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📄 1-Day Daily Plan (1 ቀን ዕቅድ)</span>
          </button>

          <button
            onClick={() => {
              setPlanMode('5-days');
              if (!fiveDaysPlan.unitAndTopic) {
                handleLoadFiveDaysSample('Amharic');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative ${
              planMode === '5-days'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>📅 5 Days Plan (የ5 ቀናት ሳምንታዊ ዕቅድ)</span>
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              5 Days
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium px-2">
          {planMode === '1-day' ? (
            <span className="hidden sm:inline">ዕለታዊ የ9-ዓምድ ሰንጠረዥ (9-Column Daily DLP)</span>
          ) : (
            <span className="hidden sm:inline">ከሰኞ እስከ አርብ ሙሉ የሳምንት እቅድ (Monday–Friday 5 Days)</span>
          )}
        </div>
      </div>

      {/* Format Notice Banner */}
      <div className={`p-5 rounded-3xl shadow-md no-print flex flex-col md:flex-row items-center justify-between gap-4 text-white ${
        planMode === '5-days'
          ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700'
          : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl shrink-0 border border-white/20">
            {planMode === '5-days' ? '📅' : '📋'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                {planMode === '5-days' ? 'Ethiopian MoE Weekly Standard' : 'Official Ethiopian Standard'}
              </span>
              <span className="bg-white/25 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-white/30">
                {planMode === '5-days' ? '5 Days Sequence (ሰኞ-አርብ)' : 'Exact Image Format (9 Columns)'}
              </span>
            </div>
            <h2 className="text-lg font-black mt-0.5">
              {planMode === '5-days'
                ? '5-Days Weekly Lesson Plan (የ5 ቀናት ሳምንታዊ የማስተማር እቅድ)'
                : 'Daily Lesson Plan (ዕለታዊ የትምህርት እቅድ ሰንጠረዥ)'}
            </h2>
            <p className="text-xs text-stone-100">
              {planMode === '5-days'
                ? 'Covers the full school week: Day 1 (ሰኞ), Day 2 (ማክሰኞ), Day 3 (ረቡዕ), Day 4 (ሐሙስ), Day 5 (አርብ) with starters, main activities, assessments, and homework.'
                : 'Generates the 9-column Ministry of Education table with Starter, Main Activities, Concluding Activities, Special Needs support, and signature boxes.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {planMode === '1-day' ? (
            <>
              <button
                onClick={() => handleLoadSample('Blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl transition shadow border border-emerald-200"
                title="Clean Blank Lesson Plan Table (ባዶ የትምህርት እቅድ ሰንጠረዥ)"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>ባዶ ቅጽ (Blank Template)</span>
              </button>

              <button
                onClick={() => handleLoadSample('Oromic')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition shadow border border-emerald-500"
                title="Load Afaan Oromoo (Oromic) Sample - Grade 4"
              >
                <span>🌳 Saamuda Afaan Oromoo</span>
              </button>

              <button
                onClick={() => handleLoadSample('Amharic')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-300 hover:bg-amber-400 text-stone-900 rounded-xl transition shadow font-amharic"
                title="Load Amharic Sample (Grade 5 Science in Amharic)"
              >
                <span>🇪🇹 የአማርኛ ናሙና</span>
              </button>

              <button
                onClick={() => handleLoadSample('English')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/90 text-emerald-900 hover:bg-white rounded-xl transition shadow"
                title="Load English Sample (Grade 1 English)"
              >
                <span>🇬🇧 English Sample</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleLoadFiveDaysSample('Blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-stone-900 hover:bg-stone-100 rounded-xl transition shadow"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-700" />
                <span>ባዶ 5 ቀናት (Blank)</span>
              </button>

              <button
                onClick={() => handleLoadFiveDaysSample('Oromic')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition shadow border border-emerald-500"
                title="Load Afaan Oromoo (Oromic) 5-Days Weekly Sample"
              >
                <span>🌳 5 Guyyaa Afaan Oromoo</span>
              </button>

              <button
                onClick={() => handleLoadFiveDaysSample('Amharic')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition shadow font-amharic"
              >
                <span>🇪🇹 የ5 ቀናት አማርኛ ናሙና</span>
              </button>

              <button
                onClick={() => handleLoadFiveDaysSample('English')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-800 hover:bg-blue-900 text-white rounded-xl transition shadow"
              >
                <span>🇬🇧 5-Days English</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 no-print">
        {/* Dedicated Language Curriculum Switcher with Prominent Oromic Button */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
              ቋንቋ / Afaan / Medium:
            </span>
            <span className="text-xs text-stone-500 hidden md:inline">
              Select curriculum language for the lesson:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* OROMIC LANGUAGE CURRICULUM BUTTON */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('Afaan Oromoo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs ${
                languageMode === 'Afaan Oromoo'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500 font-black'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
              title="Afaan Oromoo Curriculum / Barnoota Afaan Oromoo"
            >
              <span>🌳</span>
              <span>Afaan Oromoo (Oromic)</span>
              <span className="bg-emerald-800 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                Oromia
              </span>
            </button>

            {/* Amharic Curriculum Button */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('Amharic')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                languageMode === 'Amharic'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400 font-black'
                  : 'bg-white hover:bg-amber-50 text-stone-800 border border-stone-300'
              }`}
            >
              <span>🇪🇹</span>
              <span>አማርኛ (Amharic)</span>
            </button>

            {/* English Curriculum Button */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('English')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                languageMode === 'English'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 font-black'
                  : 'bg-white hover:bg-blue-50 text-stone-800 border border-stone-300'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Ethiopian Curriculum Language Policy Indicator */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          languageMode === 'Afaan Oromoo'
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : curriculumRule.language === 'Amharic'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-blue-50/90 border-blue-300 text-blue-950'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">
              {languageMode === 'Afaan Oromoo' ? '🌳' : curriculumRule.language === 'Amharic' ? '🇪🇹' : '🇬🇧'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  የሥርዓተ-ትምህርት ቋንቋ ደንብ / Sirna Barnootaa (Curriculum Rule)
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border shadow-xs ${
                  languageMode === 'Afaan Oromoo'
                    ? 'bg-emerald-200 border-emerald-400 text-emerald-900'
                    : curriculumRule.language === 'Amharic'
                    ? 'bg-amber-200 border-amber-400 text-amber-900'
                    : 'bg-blue-200 border-blue-400 text-blue-900'
                }`}>
                  {languageMode === 'Afaan Oromoo' ? 'Afaan Oromoo (Oromic Curriculum)' : curriculumRule.badgeText}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">
                {languageMode === 'Afaan Oromoo' ? curriculumRule.ruleDescriptionOro : curriculumRule.ruleDescriptionAm}
              </p>
              <p className="text-[11px] opacity-75 mt-0.5 italic">
                {curriculumRule.ruleDescriptionEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0 bg-white/90 px-3.5 py-1.5 rounded-xl border border-stone-200/90 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-stone-800">
              {languageMode === 'Afaan Oromoo' ? 'Afaan Oromoo' : languageMode === 'Amharic' ? 'አማርኛ' : 'English'}
            </span>
          </div>
        </div>

        {/* Subject Picker */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            የትምህርቱ አይነት ምረጡ (Subject):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ETHIOPIAN_PRIMARY_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSubject(s.id);
                  const presets = QUICK_SAMPLE_TOPICS_BY_SUBJECT[s.id];
                  if (presets && presets[0]) {
                    setTopic(presets[0].topic);
                    setGradeLevel(presets[0].grade);
                    setLessonTopic(presets[0].topic);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  subject === s.id
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.nameEn}</span>
                <span className="font-amharic text-[11px] opacity-80">
                  ({languageMode === 'Afaan Oromoo' && s.nameOro ? s.nameOro : s.nameAm})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              {languageMode === 'Afaan Oromoo'
                ? 'Unit and topic (Boqonnaa fi Mata Duree) *'
                : 'Unit and topic (ምዕራፍ እና ዋና ርዕስ) *'}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                languageMode === 'Afaan Oromoo'
                  ? 'e.g. Boqonnaa 3 - Maqaalee fi Ibsa Maqaa / Qubee fi Sagalee'
                  : 'e.g. Unit One - My Family / ምዕራፍ ፫ - የእጽዋት ክፍሎች'
              }
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              {planMode === '5-days'
                ? languageMode === 'Afaan Oromoo'
                  ? 'Week / Date Range (Torbee fi Guyyoota)'
                  : 'Week / Date Range (ሳምንት እና ቀናት)'
                : languageMode === 'Afaan Oromoo'
                ? 'Lesson topic (Mata Duree Barnootaa) *'
                : 'Lesson topic (የክፍለ-ጊዜው ንዑስ ርዕስ) *'}
            </label>
            {planMode === '5-days' ? (
              <input
                type="text"
                value={weekRange}
                onChange={(e) => setWeekRange(e.target.value)}
                placeholder={
                  languageMode === 'Afaan Oromoo'
                    ? 'e.g. Fulbaana 06 - 10, 2017 A.L.I (Wiixata hanga Jimaata)'
                    : 'e.g. መስከረም 06 - 10 ቀን 2017 ዓ.ም (ከሰኞ እስከ አርብ)'
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            ) : (
              <input
                type="text"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                placeholder={
                  languageMode === 'Afaan Oromoo'
                    ? 'e.g. Fayyadama Ibsa Maqaa Hima Keessatti'
                    : 'e.g. Vocabulary Practice: Class room Objects'
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Grade and Section (ክፍልና ሴክሽን)
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PRIMARY_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameEn} ({g.nameAm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Date (ቀን - Ethiopian Calendar)
            </label>
            <input
              type="text"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              placeholder="e.g. Meskerem 06, 2017 E.C (Wednesday)"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Time Allotment (ክፍለ-ጊዜ)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="35 min (5 min Starter, 25 min Main, 5 min Concluding)">35 min (5m Starter, 25m Main, 5m Concluding)</option>
              <option value="40 min (5 min Starter, 30 min Main, 5 min Concluding)">40 min (5m Starter, 30m Main, 5m Concluding)</option>
              <option value="45 min (10 min Starter, 25 min Main, 10 min Concluding)">45 min (Standard Period)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons: Both Daily DLP & 5-Days Plan Buttons clearly available! */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 self-start sm:self-center">
            Workplace: <strong>{schoolProfile.schoolName || 'Primary School'}</strong> • Teacher: <strong>{schoolProfile.teacherName || 'Teacher'}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
            {planMode === '5-days' ? (
              <>
                <button
                  onClick={() => setPlanMode('1-day')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
                >
                  {isOromic ? '← Gara Guyyaa 1tti' : '← ወደ 1 ቀን እቅድ'}
                </button>

                <button
                  onClick={() => handleGenerateFiveDays()}
                  disabled={loadingFiveDays || !topic.trim()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 font-black rounded-2xl transition shadow-lg text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 disabled:opacity-50"
                >
                  {loadingFiveDays ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {languageMode === 'Afaan Oromoo'
                          ? "Karoorri guyyaa 5 qophaa'aa jira..."
                          : 'የ5 ቀናት ሳምንታዊ እቅድ እየተዘጋጀ ነው...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>
                        {languageMode === 'Afaan Oromoo'
                          ? '📅 Karoora Guyyaa 5 Qopheessi (Generate 5-Days Plan)'
                          : '📅 Generate 5 Days Plan (የ5 ቀናት ሳምንታዊ ዕቅድ አዘጋጅ)'}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setPlanMode('5-days');
                    if (!fiveDaysPlan.unitAndTopic) {
                      handleLoadFiveDaysSample(languageMode === 'Afaan Oromoo' ? 'Oromic' : 'Amharic');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
                >
                  {isOromic ? 'Gara Guyyaa 5tti →' : 'ወደ 5 ቀናት እቅድ →'}
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={loading || !topic.trim()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 font-black rounded-2xl transition shadow-lg text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {languageMode === 'Afaan Oromoo'
                          ? "Karoorri guyyaa 1 qophaa'aa jira..."
                          : 'ዕለታዊ እቅድ እየተዘጋጀ ነው...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>
                        {languageMode === 'Afaan Oromoo'
                          ? '📄 Karoora Guyyaa 1 Qopheessi (Generate 1-Day Plan)'
                          : '📄 Generate Daily Lesson Plan (ዕለታዊ የትምህርት እቅድ አዘጋጅ)'}
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render Selected Plan Document: Either 5-Days View or 1-Day Daily DLP View */}
      {planMode === '5-days' ? (
        <FiveDaysPlanView
          plan={fiveDaysPlan}
          onUpdatePlan={(updated) => setFiveDaysPlan(updated)}
          onSave={handleSaveFiveDays}
          isSaved={saved}
          onConvertToDailyPlan={handleConvertDayToDailyPlan}
        />
      ) : (
        structuredPlan && (
          <DailyLessonPlanView
            plan={structuredPlan}
            onUpdatePlan={(updated) => setStructuredPlan(updated)}
            onSave={handleSave}
            isSaved={saved}
          />
        )
      )}
    </div>
  );
};
