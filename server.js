const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { analyzeSentiment } = require('./lib/sentimentEngine');
const { anonymizeSubmission } = require('./lib/privacyShield');

const app = express();
const PORT = process.env.PORT || 5500;
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// Load database mock
const dataFilePath = path.join(__dirname, 'data', 'sample_data.json');
let dbData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

// API 1: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'FeedbackFlow SentimentScope API', timestamp: new Date().toISOString() });
});

// API 2: Get faculty list & benchmarks
app.get('/api/faculty', (req, res) => {
  const departmentAvg = {
    teachingClarity: parseFloat((dbData.faculty.reduce((acc, f) => acc + f.teachingClarity, 0) / dbData.faculty.length).toFixed(2)),
    pacing: parseFloat((dbData.faculty.reduce((acc, f) => acc + f.pacing, 0) / dbData.faculty.length).toFixed(2)),
    doubtResolution: parseFloat((dbData.faculty.reduce((acc, f) => acc + f.doubtResolution, 0) / dbData.faculty.length).toFixed(2)),
    overallSentiment: parseFloat((dbData.faculty.reduce((acc, f) => acc + f.overallSentiment, 0) / dbData.faculty.length).toFixed(2))
  };

  res.json({
    department: dbData.department,
    faculty: dbData.faculty,
    departmentAvg
  });
});

// API 3: Get HOD Dashboard metrics
app.get('/api/dashboard', (req, res) => {
  const totalReviews = dbData.recentReviews.length;
  const avgSentiment = parseFloat(
    (dbData.faculty.reduce((sum, f) => sum + f.overallSentiment, 0) / dbData.faculty.length).toFixed(2)
  );

  res.json({
    department: dbData.department,
    summary: {
      totalFaculty: dbData.faculty.length,
      totalReviews,
      departmentHappinessIndex: Math.round(((avgSentiment + 1) / 2) * 100), // Scale -1..1 to 0..100%
      averageSentimentScore: avgSentiment
    },
    faculty: dbData.faculty,
    recentReviews: dbData.recentReviews
  });
});

// API 4: Post Anonymous Feedback
app.post('/api/feedback', (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { sanitizedText, anonymizedSessionHash, cleanedPayload } = anonymizeSubmission(req.body, clientIp);

    const { facultyId, teachingClarity, pacing, doubtResolution } = cleanedPayload;
    const facultyObj = dbData.faculty.find(f => f.id === facultyId);

    if (!facultyObj) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    // Process NLP Sentiment Analysis
    const sentimentAnalysis = analyzeSentiment(sanitizedText);

    // Build new review record
    const newReview = {
      id: 'rev_' + Date.now(),
      facultyId: facultyObj.id,
      facultyName: facultyObj.name,
      course: facultyObj.course,
      ratings: {
        clarity: Number(teachingClarity) || 4,
        pacing: Number(pacing) || 4,
        doubt: Number(doubtResolution) || 4
      },
      text: sanitizedText,
      sentimentScore: sentimentAnalysis.score,
      polarity: sentimentAnalysis.polarity,
      anonymousToken: anonymizedSessionHash,
      timestamp: new Date().toISOString()
    };

    // Update faculty stats dynamically
    facultyObj.reviewCount += 1;
    facultyObj.overallSentiment = parseFloat(
      ((facultyObj.overallSentiment * (facultyObj.reviewCount - 1) + sentimentAnalysis.score) / facultyObj.reviewCount).toFixed(2)
    );

    if (sentimentAnalysis.polarity === 'Positive') facultyObj.sentimentDistribution.positive += 1;
    else if (sentimentAnalysis.polarity === 'Negative') facultyObj.sentimentDistribution.negative += 1;
    else facultyObj.sentimentDistribution.neutral += 1;

    dbData.recentReviews.unshift(newReview);

    // Save back to JSON store
    fs.writeFileSync(dataFilePath, JSON.stringify(dbData, null, 2));

    res.status(201).json({
      message: 'Anonymous feedback recorded successfully.',
      anonymizedToken: anonymizedSessionHash,
      sentimentResult: sentimentAnalysis,
      updatedFacultyScore: facultyObj.overallSentiment
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Internal server error processing feedback' });
  }
});

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`===================================================`);
  console.log(`🚀 FeedbackFlow Fullstack Server active at http://${HOST}:${PORT}`);
  console.log(`===================================================`);
});
