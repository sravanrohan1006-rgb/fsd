# FeedbackFlow: SentimentScope (Fullstack Student Feedback & Analytics Platform)

FeedbackFlow modernizes higher education course evaluations by parsing qualitative student feedback using natural language processing (NLP), extracting actionable pedagogical insights, and equipping Heads of Departments (HODs) with sentiment analytics dashboards.

## 🚀 Key Features

- **Anonymous Student Evaluation Portal**: Multi-metric evaluation (teaching clarity, pacing, doubt resolution, qualitative review box) with native HTML5 validation and ARIA accessibility.
- **Privacy & Anonymity Shield**: One-way hashed session validation that strips student roll numbers, IP addresses, and metadata to guarantee candid feedback without fear of retaliation.
- **NLP Sentiment Engine**: Lexicon-based scoring (AFINN-165 & VADER heuristics) mapped to a `-1.0` to `+1.0` scale, augmented with custom collegiate idiom dictionary rules (`chill professor` -> +2, `out of syllabus` -> -3).
- **Key Concern & Strength Extractor**: Automatically highlights recurring praise (e.g., *Clear Explanations*, *Punctual*) and grievances (e.g., *Fast Pacing*, *Unclear Exam Patterns*).
- **HOD Faculty Analytics Dashboard**: Visual department metrics, faculty benchmark matrix, and interactive Chart.js sentiment distribution graphs.

## 🛠️ Project Structure

```
feedback-flow-fullstack/
├── package.json             # Project metadata & dependencies
├── server.js                # Express REST API server & static file host
├── README.md                # Documentation & setup guide
├── lib/
│   ├── sentimentEngine.js   # AFINN-165, VADER heuristics & collegiate dictionary
│   └── privacyShield.js     # One-way session hashing & metadata stripping
├── data/
│   └── sample_data.json     # Initial CS faculty & student evaluation records
└── public/
    ├── index.html           # Accessible single-page app (Student Form & HOD Dashboard)
    ├── css/
    │   └── style.css        # Responsive dark/light theme stylesheet with CSS Grid
    └── js/
        ├── app.js           # Student evaluation submit handler & real-time sentiment preview
        └── dashboard.js     # HOD dashboard loader & Chart.js graph renderers
```

## 🧰 Prerequisites & Setup

1. Make sure **Node.js** (v18+ recommended) is installed:
   ```bash
   node -v
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to:
   ```
   http://localhost:5500
   ```

## 📡 REST API Endpoints

- `GET /api/faculty` — Fetch faculty member list and department benchmark averages
- `GET /api/dashboard` — Fetch overall department metrics, faculty cards, and sentiment breakdowns
- `POST /api/feedback` — Submit anonymous student course evaluation & compute sentiment score
  - **Body Payload**:
    ```json
    {
      "facultyId": "fac_kulkarni",
      "courseId": "CS302",
      "teachingClarity": 4,
      "pacing": 3,
      "doubtResolution": 5,
      "textReview": "Great theoretical explanations, but slides move too fast during algorithm proofs.",
      "sessionToken": "student_enrollment_hash_xyz"
    }
    ```

## 📜 License
Licensed under the MIT License.
