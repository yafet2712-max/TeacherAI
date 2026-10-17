export type AppTab = 
  | 'lesson-planner'
  | 'quick-quiz'
  | 'worksheet-maker'
  | 'fidel-chart'
  | 'grammar-lab'
  | 'stories'
  | 'assignment-grader'
  | 'translator'
  | 'chat'
  | 'library';

export interface SchoolProfile {
  schoolName: string;
  amharicSchoolName: string;
  woredaSubcity: string;
  cityRegion: string;
  teacherName: string;
  department: string;
  motto: string;
}

export interface LessonPlanStageRow {
  stage: string; // e.g. "Starter (Motivation & Introduction)"
  timeAllotment: string; // e.g. "5 min"
  learningContents: string; // e.g. "Warm-up related to My Family"
  page: string; // e.g. "1-5" or "-"
  teacherActivities: string;
  studentActivities: string;
  assessmentTechniques: string;
  teachingAids: string;
  remarks: string;
}

export interface DailyLessonPlanData {
  schoolName: string;
  teacherName: string;
  subject: string;
  unitAndTopic: string;
  gradeAndSection: string;
  lessonTopic: string;
  date: string;
  rationale: string;
  prerequisiteKnowledge: string;
  competencies: string;
  stages: LessonPlanStageRow[];
  specialNeedsSupport: {
    slowLearners: string;
    mediumLearners: string;
    fastLearners: string;
  };
  deptHeadName?: string;
  vicePrincipalName?: string;
  postLessonAssessment?: string;
}

export interface DayPlanItem {
  dayNumber: number; // 1 to 5
  dayName: string; // e.g. "Day 1 (ሰኞ / Monday)"
  date?: string;
  lessonTopic?: string;
  subTopic?: string;
  competencies: string;
  rationale?: string;
  prerequisiteKnowledge?: string;
  stages?: LessonPlanStageRow[];
  specialNeedsSupport?: {
    slowLearners: string;
    mediumLearners: string;
    fastLearners: string;
  };
  starterActivities?: string;
  mainActivities?: string;
  concludingActivities?: string;
  assessmentTechniques?: string;
  teachingAids?: string;
  homework?: string;
  remarks?: string;
  postLessonAssessment?: string;
}

export interface FiveDaysPlanData {
  schoolName: string;
  teacherName: string;
  subject: string;
  gradeAndSection: string;
  unitAndTopic: string;
  weekRangeOrDates: string;
  generalCompetencies: string;
  rationale: string;
  days: DayPlanItem[];
  specialNeedsSupport: {
    slowLearners: string;
    mediumLearners: string;
    fastLearners: string;
  };
  deptHeadName?: string;
  vicePrincipalName?: string;
}

export interface FidelRow {
  name: string;
  transliteration: string;
  order1: string; // ግዕዝ (ä)
  order2: string; // ካዕብ (u)
  order3: string; // ሳልስ (i)
  order4: string; // ራብዕ (a)
  order5: string; // ኃምስ (e)
  order6: string; // ሳድስ (ə)
  order7: string; // ሳብዕ (o)
}

export interface SavedMaterial {
  id: string;
  type: 'lesson-plan' | 'worksheet' | 'quick-quiz' | 'story' | 'grammar' | 'feedback' | 'translation';
  title: string;
  preview: string;
  content: string;
  structuredPlan?: DailyLessonPlanData;
  createdAt: number;
  gradeLevel?: string;
  subject?: string;
  schoolName?: string;
  tags?: string[];
}

export interface SubjectOption {
  id: string;
  nameEn: string;
  nameAm: string;
  nameOro?: string;
  icon: string;
  grades: string;
}
