import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
} from 'docx';
import { DailyLessonPlanData, FiveDaysPlanData, DayPlanItem, LessonPlanStageRow } from '../types';

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const tableBorder = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: '444444',
};

const cellBorders = {
  top: tableBorder,
  bottom: tableBorder,
  left: tableBorder,
  right: tableBorder,
};

export async function exportLessonPlanToDocx(plan: DailyLessonPlanData): Promise<void> {
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

  const titleText = isOromic
    ? 'KAROORA BARNOOTA GUYYAA (Daily Lesson Plan)'
    : isAmharic
    ? 'ዕለታዊ የትምህርት እቅድ (Daily Lesson Plan)'
    : 'Daily Lesson Plan';

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: titleText,
                bold: true,
                italics: true,
                size: 28, // 14pt
                font: 'Arial',
              }),
            ],
          }),

          // Metadata Grid (Two columns simulated with text runs)
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Name of teacher:- ', italics: true }),
              new TextRun({ text: `${plan.teacherName || '________________________'}       `, bold: true }),
              new TextRun({ text: 'Name of School:- ', italics: true }),
              new TextRun({ text: `${plan.schoolName || '________________________________'}`, bold: true }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Subject:- ', italics: true }),
              new TextRun({ text: `${plan.subject || '____________________'}       ` }),
              new TextRun({ text: 'Unit and topic:- ', italics: true }),
              new TextRun({ text: `${plan.unitAndTopic || '________________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Grade and Section:- ', italics: true }),
              new TextRun({ text: `${plan.gradeAndSection || '____________'}       ` }),
              new TextRun({ text: 'Lesson topic:- ', italics: true }),
              new TextRun({ text: `${plan.lessonTopic || '________________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'Date:- ', italics: true }),
              new TextRun({ text: `${plan.date || '____________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Rationale of the topic:- ', italics: true }),
              new TextRun({ text: `${plan.rationale || ''}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Pre-requisite knowledge:- ', italics: true }),
              new TextRun({ text: `${plan.prerequisiteKnowledge || ''}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: 'Competencies (Learning objectives):- ', italics: true }),
              new TextRun({ text: `${plan.competencies || ''}` }),
            ],
          }),

          // Main 9-column Stages Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // Header Row
              new TableRow({
                tableHeader: true,
                children: [
                  createHeaderCell('Stages\n(ደረጃዎች)', 14),
                  createHeaderCell('Time\n(ጊዜ)', 8),
                  createHeaderCell('Learning Contents\n(የትምህርት ይዘት)', 14),
                  createHeaderCell('Page\n(ገጽ)', 6),
                  createHeaderCell("Teacher's activities\n(የመምህሩ ተግባራት)", 20),
                  createHeaderCell("Student's activities\n(የተማሪው ተግባራት)", 18),
                  createHeaderCell('Assessment\n(የምዘና ዘዴዎች)', 10),
                  createHeaderCell('Teaching Aids\n(መርጃዎች)', 10),
                  createHeaderCell('Remarks\n(አስተያየት)', 5),
                ],
              }),

              // Dynamic Stages Rows
              ...plan.stages.map(
                (stage) =>
                  new TableRow({
                    children: [
                      createBodyCell(stage.stage, 14, true),
                      createBodyCell(stage.timeAllotment, 8, false, AlignmentType.CENTER),
                      createBodyCell(stage.learningContents, 14),
                      createBodyCell(stage.page, 6, false, AlignmentType.CENTER),
                      createBodyCell(stage.teacherActivities, 20),
                      createBodyCell(stage.studentActivities, 18),
                      createBodyCell(stage.assessmentTechniques, 10),
                      createBodyCell(stage.teachingAids, 10),
                      createBodyCell(stage.remarks, 5, false, AlignmentType.CENTER),
                    ],
                  })
              ),
            ],
          }),

          // Support for Learners of Special Needs
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [
              new TextRun({
                text: 'Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-',
                italics: true,
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Slow learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.slowLearners || 'Provide extra practice, repetition, and simplified tasks with peer support.' }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Medium learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.mediumLearners || 'Standard pace activities as planned above.' }),
            ],
          }),

          new Paragraph({
            spacing: { after: 240 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Fast learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.fastLearners || 'Provide enrichment tasks such as extra vocabulary or short extension exercises.' }),
            ],
          }),

          // Bottom Signatures Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  createSignatureCell(`Teacher's Name:- ${plan.teacherName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell(`Dept. Head's Name:- ${plan.deptHeadName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell(`Name of the Vice - principal:- ${plan.vicePrincipalName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell('Post lesson teacher\'s self-assessment:-'),
                  createSignatureCell(plan.postLessonAssessment || ''),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = (plan.lessonTopic || plan.unitAndTopic || 'Lesson_Plan')
    .replace(/[^a-zA-Z0-9_\u1200-\u137F]/g, '_')
    .slice(0, 30);
  saveBlob(blob, `Daily_Lesson_Plan_${sanitizedTitle}.docx`);
}

export async function exportTextOrQuizToDocx(
  title: string,
  content: string,
  schoolName?: string
): Promise<void> {
  const paragraphs = content.split('\n').map((line) => {
    const isHeading1 = line.startsWith('# ');
    const isHeading2 = line.startsWith('## ');
    const isHeading3 = line.startsWith('### ');

    const cleanText = line.replace(/^#+\s*/, '');
    const isBold = line.startsWith('**') || isHeading1 || isHeading2;

    return new Paragraph({
      heading: isHeading1
        ? HeadingLevel.HEADING_1
        : isHeading2
        ? HeadingLevel.HEADING_2
        : isHeading3
        ? HeadingLevel.HEADING_3
        : undefined,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: cleanText,
          bold: isBold,
          size: isHeading1 ? 28 : isHeading2 ? 24 : 22,
          font: 'Arial',
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: schoolName || 'Primary School Assessment',
                bold: true,
                size: 28,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                italics: true,
                size: 24,
                font: 'Arial',
              }),
            ],
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\u1200-\u137F]/g, '_').slice(0, 35);
  saveBlob(blob, `${sanitizedTitle}.docx`);
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { fill: 'E5E7EB' },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold: true,
            italics: true,
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createBodyCell(
  text: string,
  widthPercent: number,
  bold = false,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: text || '-',
            bold,
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createMetadataCell(text: string): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [
      new Paragraph({
        spacing: { before: 50, after: 50 },
        children: [
          new TextRun({
            text: text || '-',
            size: 20, // 10pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createSignatureCell(text: string): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text,
            size: 20, // 10pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function getDocxDayStages(day: DayPlanItem, isAmharic: boolean, isOromic?: boolean): LessonPlanStageRow[] {
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

export async function exportFiveDaysPlanToDocx(plan: FiveDaysPlanData): Promise<void> {
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

  const docChildren: any[] = [];

  plan.days.forEach((day, idx) => {
    const dayLessonTopic = day.lessonTopic || day.subTopic || plan.unitAndTopic || '';
    const dayDate = day.date || day.dayName || plan.weekRangeOrDates || '';
    const dayRationale = day.rationale || plan.rationale || '';
    const dayPrereq = day.prerequisiteKnowledge || day.starterActivities || '';
    const dayCompetencies = day.competencies || plan.generalCompetencies || '';
    const stages = getDocxDayStages(day, isAmharic, isOromic);

    // 1. Centered Title and Subtitle matching the daily lesson plan format 100%
    const titleText = isOromic
      ? `KAROORA BARNOOTA GUYYAA (${day.dayName.toUpperCase()})`
      : isAmharic
      ? `ዕለታዊ የትምህርት እቅድ (${day.dayName})`
      : `DAILY LESSON PLAN (${day.dayName.toUpperCase()})`;

    const subtitleText = isOromic
      ? `Sirna Barnoota Oromiyaa fi Itoophiyaa - ${plan.weekRangeOrDates || 'Daily Lesson Plan'}`
      : isAmharic
      ? `የኢትዮጵያ ትምህርት ሚኒስቴር ይፋዊ የ9-ዓምድ ሰንጠረዥ - ${plan.weekRangeOrDates || 'ሳምንታዊ'}`
      : `Official Ministry of Education Primary 9-Column Table - ${plan.weekRangeOrDates || 'Weekly'}`;

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: idx === 0 ? 0 : 80, after: 60 },
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            italics: true,
            size: 26, // 13pt
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: subtitleText,
            size: 18, // 9pt
            color: '666666',
            font: 'Arial',
          }),
        ],
      }),

      // 2. Exact 7-field information layout matching Daily Lesson Plan
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: 'Name of teacher:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${plan.teacherName || '________________________'}       `, bold: true, font: 'Arial', size: 20 }),
          new TextRun({ text: 'Name of School:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${plan.schoolName || '________________________________'}`, bold: true, font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: 'Subject:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${plan.subject || '____________________'}       `, font: 'Arial', size: 20 }),
          new TextRun({ text: 'Unit and topic:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${plan.unitAndTopic || '________________________'}`, font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: 'Grade and Section:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${plan.gradeAndSection || '____________'}       `, font: 'Arial', size: 20 }),
          new TextRun({ text: 'Lesson topic:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${dayLessonTopic || '________________________'}`, bold: true, font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'Date:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: `${dayDate || '____________________'}`, font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: 'Rationale of the topic:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: dayRationale || '________________________________________________________________', font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: 'Pre-requisite knowledge:- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: dayPrereq || '________________________________________________________________', font: 'Arial', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({ text: 'Competencies (Learning objectives):- ', italics: true, font: 'Arial', size: 20 }),
          new TextRun({ text: dayCompetencies || '________________________________________________________________', bold: true, font: 'Arial', size: 20 }),
        ],
      }),

      // 3. Exact 9-Column Table
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header Row
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell(isOromic ? 'Stages\n(Sadarkaa)' : 'Stages\n(ደረጃዎች)', 14),
              createHeaderCell(isOromic ? 'Time\n(Yeroo)' : 'Time\n(ጊዜ)', 8),
              createHeaderCell(isOromic ? 'Learning Contents\n(Qabiyyee)' : 'Learning Contents\n(የትምህርት ይዘት)', 14),
              createHeaderCell(isOromic ? 'Page\n(Fuula)' : 'Page\n(ገጽ)', 6),
              createHeaderCell(isOromic ? "Teacher's activities\n(Gocha Barsiisaa)" : "Teacher's activities\n(የመምህሩ ተግባራት)", 20),
              createHeaderCell(isOromic ? "Student's activities\n(Gocha Barattootaa)" : "Student's activities\n(የተማሪው ተግባራት)", 18),
              createHeaderCell(isOromic ? 'Assessment\n(Madaallii)' : 'Assessment\n(የምዘና ዘዴዎች)', 10),
              createHeaderCell(isOromic ? 'Teaching Aids\n(Meeshaalee)' : 'Teaching Aids\n(መርጃዎች)', 10),
              createHeaderCell(isOromic ? 'Remarks\n(Yaada)' : 'Remarks\n(አስተያየት)', 5),
            ],
          }),
          // Body Rows
          ...stages.map((s) =>
            new TableRow({
              children: [
                createBodyCell(s.stage, 14, true),
                createBodyCell(s.timeAllotment, 8, false, AlignmentType.CENTER),
                createBodyCell(s.learningContents, 14),
                createBodyCell(s.page, 6, false, AlignmentType.CENTER),
                createBodyCell(s.teacherActivities, 20),
                createBodyCell(s.studentActivities, 18),
                createBodyCell(s.assessmentTechniques, 10),
                createBodyCell(s.teachingAids, 10),
                createBodyCell(s.remarks, 5, false, AlignmentType.CENTER),
              ],
            })
          ),
        ],
      }),

      // 4. Support for learners of special needs for this day
      new Paragraph({
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: isOromic
              ? 'Support for learners of special needs (Barattoota Fedhii Addaa Qabaniif):-'
              : isAmharic
              ? 'Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-'
              : 'Support for learners of special needs:-',
            italics: true,
            bold: true,
            font: 'Arial',
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: isOromic ? '- Slow learners (Suuta barataniif): ' : '- Slow learners: ', bold: true, font: 'Arial', size: 19 }),
          new TextRun({ text: day.specialNeedsSupport?.slowLearners || plan.specialNeedsSupport?.slowLearners || 'Deeggarsa dhuunfaa fi fakkeenya salphaa kennuu / Provide extra practice and repetition with peer support.', font: 'Arial', size: 19 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: isOromic ? '- Medium learners (Giddu-galeeyyii): ' : '- Medium learners: ', bold: true, font: 'Arial', size: 19 }),
          new TextRun({ text: day.specialNeedsSupport?.mediumLearners || plan.specialNeedsSupport?.mediumLearners || 'Hojii daree idilee fi hordoffii gochuu / Standard pace activities as planned above.', font: 'Arial', size: 19 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 160 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: isOromic ? '- Fast learners (Dafanii baratan): ' : '- Fast learners: ', bold: true, font: 'Arial', size: 19 }),
          new TextRun({ text: day.specialNeedsSupport?.fastLearners || plan.specialNeedsSupport?.fastLearners || 'Hojiiwwan dabalataa fi gaaffii cimaa kennuu / Provide enrichment and extension exercises.', font: 'Arial', size: 19 }),
        ],
      }),

      // 5. Official 2-Column Signatures Table matching Daily Lesson Plan
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createSignatureCell(`Teacher's Name:- ${plan.teacherName || '________________________'}`),
              createSignatureCell('Signature:- ________________________'),
            ],
          }),
          new TableRow({
            children: [
              createSignatureCell(`Dept. Head's Name:- ${plan.deptHeadName || '________________________'}`),
              createSignatureCell('Signature:- ________________________'),
            ],
          }),
          new TableRow({
            children: [
              createSignatureCell(`Name of the Vice - principal:- ${plan.vicePrincipalName || '________________________'}`),
              createSignatureCell('Signature:- ________________________'),
            ],
          }),
          new TableRow({
            children: [
              createSignatureCell("Post lesson teacher's self-assessment:-"),
              createSignatureCell(day.postLessonAssessment || ''),
            ],
          }),
        ],
      })
    );

    // 6. Page Break between days so each day appears as a complete distinct daily lesson plan in Word!
    if (idx < plan.days.length - 1) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = (plan.unitAndTopic || plan.subject || '5_Days_Lesson_Plan')
    .replace(/[^\w\u1200-\u137F\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  saveBlob(blob, `5_Days_Plan_${safeTitle || 'Weekly'}.docx`);
}
