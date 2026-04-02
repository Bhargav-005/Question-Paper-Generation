# Q-Gen: AI-Powered Question Paper Generation System

Q-Gen is a comprehensive, full-stack web application designed for educational institutions to automate and streamline the creation of high-quality, standardized question papers. It leverages AI (OpenAI) to generate contextually relevant questions that align with specific **Syllabus Topics**, **Course Outcomes (COs)**, and **Bloom's Taxonomy** levels.

## 🚀 Key Features

- **Automated AI Question Generation**: Generates questions based on Bloom's levels (L1 to L6) and marks (Part A: 2m, Part B: 13m, Part C: 15m).
- **Comprehensive Academic Workflow**:
  - **Course Management**: Registry for subjects and departments.
  - **Syllabus & CO Setup**: Easy entry for units, topics, and learning outcomes.
  - **L-CO-Syllabus Mapping**: Intelligent mapping of syllabus topics to Course Outcomes.
  - **Dynamic Blueprinting**: Configure mark distributions and question types before generating.
- **Smart Metadata Analytics**: Track Bloom's distribution, CO coverage, and average paper quality.
- **Multi-Format Export**: One-click download of papers in professionally formatted **PDF** and **Word (DOCX)** documents.
- **Role-Based Access Control**: Secure login for Admin (Management) and Faculty (Creators).
- **Draft & History Management**: Save drafts, edit generated papers, and maintain a history of all generated documents.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing**: [Wouter](https://github.com/molecula-js/wouter)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Local Strategy)
- **AI Integration**: [OpenAI SDK](https://www.npmjs.com/package/openai)
- **Document Generation**: `jspdf` (PDF) and `docx` (Word)

### Database
- **Engine**: [PostgreSQL](https://www.postgresql.org/)
- **Tools**: [Drizzle ORM](https://orm.drizzle.team/) & `pg` (custom wrapper)

## 📁 Project Structure

```bash
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page-level components
│   │   ├── services/    # API calling client-side logic
│   │   └── lib/         # Utility functions & axios config
├── server/              # Express backend
│   ├── routes/          # API endpoint handlers
│   ├── services/        # Business logic & AI generation
│   ├── db.js            # Database pool and simple ORM
│   └── middleware/      # Auth & validation logic
├── shared/              # Shared schemas and constants
├── migrations/          # SQL database migrations
└── attached_assets/     # Branding and static assets
```

## ⚙️ How it Works (Workflow)

1. **Authentication**: Faculty or Admin logs into the system.
2. **Course Setup**: Initialize a course by providing the Subject Code, Name, and Regulation.
3. **Curriculum Definition**:
   - **Syllabus**: Break down the subject into 5 distinct Units with Specific Topics.
   - **Course Outcomes**: Define what students should be able to do (e.g., CO1, CO2).
   - **Mapping**: Map which topics contribute to which CO.
4. **Blueprint Design**: Define the "Skeleton" of your paper. Specify how many marks and which Bloom's levels should be prioritized for each unit and part (A, B, C).
5. **AI Generation**: The system sends the blueprint requirements (Topic + Bloom Level + Marks) to the AI service, which crafts high-quality questions.
6. **Review & Refine**: The generated questions are presented in a Preview dashboard. Faculty can edit, delete, or replace questions as needed.
7. **Export**: Once finalized, download the question paper in the desired institution format.

## 🏃 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd q-paper-webapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/qgen_db
   OPENAI_API_KEY=your_key_here
   SESSION_SECRET=a_random_secure_string
   NODE_ENV=development
   ```

4. **Initialize Database**:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

## 📜 License
This project is licensed under the MIT License.
