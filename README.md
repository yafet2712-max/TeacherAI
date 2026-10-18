# Ethiopian Teacher Helper & Curriculum Lesson Planner

An AI-powered, full-stack web application built specifically for Ethiopian primary school teachers and educators. It supports curriculum standards in **Afaan Oromoo (Oromic)**, **Amharic (አማርኛ)**, and **English**, generating official Ministry of Education 9-column daily lesson plans, 5-day weekly schedules, quizzes, worksheets, and Microsoft Word (`.docx`) exports.

---

## ✨ Key Features

1. **Multi-Language Medium of Instruction Support**:
   - **🌳 Afaan Oromoo**: Oromia Regional / MoE curriculum standards with native Qubee Afaan Oromoo support.
   - **🇪🇹 Amharic (አማርኛ)**: Ethiopic script support for grades 1–8.
   - **🇬🇧 English**: Professional pedagogical English for grades 7 & 8.

2. **Official Ministry of Education Lesson Plan Formats**:
   - **1-Day Daily Lesson Plan**: Exact 9-column matrix (*Stages*, *Time*, *Learning Contents*, *Page*, *Teacher's activities*, *Student's activities*, *Assessment*, *Teaching Aids*, *Remarks*), rationale, pre-requisite knowledge, competencies, special needs support, and official signature tables.
   - **5-Days Weekly Plan**: Full Monday–Friday weekly breakdown where each day expands into its own complete official daily format with page breaks for Word export.

3. **Microsoft Word (`.docx`) Export**:
   - One-click export to formatted Word documents ready for official school submission.

4. **Additional Teacher Tools**:
   - Quick Quiz Generator, Worksheet Maker, Ethiopic Fidel Chart, Grammar Lab, Story Generator, Assignment Grader, Cultural Translator, and Saved Library.

---

## 🛠️ Project Structure

- `src/`: React frontend components, types, and utilities (`docxExport.ts`, `curriculumLanguage.ts`).
- `server.ts`: Express backend server managing AI lesson generation routes.
- `package.json`: Project dependencies and scripts.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
