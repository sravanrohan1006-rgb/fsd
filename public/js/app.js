/**
 * Student Evaluation Form Controller & Live Sentiment Lexicon Engine
 */

let facultyList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFacultyDropdown();
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`section-${tabName}`).classList.add('active');

  if (tabName === 'hod') {
    initHodDashboard();
  }
}

async function loadFacultyDropdown() {
  try {
    const res = await fetch('/api/faculty');
    const data = await res.json();
    facultyList = data.faculty || [];

    const select = document.getElementById('facultySelect');
    select.innerHTML = '<option value="">-- Choose Instructor & Course --</option>';

    facultyList.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = `${fac.name} (${fac.course})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load faculty list:', err);
  }
}

// Client-side quick Lexicon sentiment preview
function previewLiveSentiment(text) {
  const box = document.getElementById('liveSentimentBox');
  const scoreEl = document.getElementById('previewScore');
  const polEl = document.getElementById('previewPolarity');

  if (!text.trim()) {
    box.className = 'sentiment-preview neutral';
    scoreEl.innerText = '0.00';
    polEl.innerText = 'Neutral';
    return;
  }

  const posWords = ['great', 'excellent', 'awesome', 'good', 'chill', 'clear', 'helpful', 'best'];
  const negWords = ['bad', 'poor', 'fast', 'hard', 'unclear', 'outdated', 'boring', 'monotone'];

  let score = 0;
  const tokens = text.toLowerCase().split(/\s+/);

  tokens.forEach(t => {
    if (posWords.includes(t)) score += 0.3;
    if (negWords.includes(t)) score -= 0.3;
  });

  if (text.toLowerCase().includes('out of syllabus')) score -= 0.5;
  if (text.toLowerCase().includes('chill professor')) score += 0.5;

  score = Math.max(-1.0, Math.min(1.0, parseFloat(score.toFixed(2))));

  scoreEl.innerText = (score > 0 ? '+' : '') + score;
  box.classList.remove('positive', 'negative', 'neutral');

  if (score >= 0.15) {
    box.classList.add('positive');
    polEl.innerText = 'Positive';
  } else if (score <= -0.15) {
    box.classList.add('negative');
    polEl.innerText = 'Negative';
  } else {
    box.classList.add('neutral');
    polEl.innerText = 'Neutral';
  }
}

async function handleFeedbackSubmit(event) {
  event.preventDefault();

  const facultyId = document.getElementById('facultySelect').value;
  const teachingClarity = document.getElementById('ratingClarity').value;
  const pacing = document.getElementById('ratingPacing').value;
  const doubtResolution = document.getElementById('ratingDoubt').value;
  const textReview = document.getElementById('reviewText').value;

  if (!facultyId || !textReview.trim()) {
    alert('Please select a faculty member and provide a review.');
    return;
  }

  // Generate local dummy session hash for enrollment proof
  const sessionToken = 'student_session_' + Math.random().toString(36).substring(2, 10);

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facultyId,
        teachingClarity,
        pacing,
        doubtResolution,
        textReview,
        sessionToken
      })
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById('resultHash').innerText = result.anonymizedToken;
      document.getElementById('resultSentiment').innerText = `${result.sentimentResult.polarity} (${result.sentimentResult.score})`;
      document.getElementById('submissionResult').classList.remove('hidden');

      // Reset form
      document.getElementById('feedbackForm').reset();
      previewLiveSentiment('');
    } else {
      alert(result.error || 'Failed to submit feedback.');
    }
  } catch (err) {
    console.error('Error submitting feedback:', err);
    alert('Error connecting to backend server.');
  }
}
