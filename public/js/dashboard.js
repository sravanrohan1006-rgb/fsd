/**
 * HOD Analytics Dashboard & Chart.js Visualizers
 */

let deptChart = null;

async function initHodDashboard() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();

    // Render KPI Metrics
    document.getElementById('kpiHappiness').innerText = `${data.summary.departmentHappinessIndex}%`;
    document.getElementById('kpiAvgScore').innerText = (data.summary.averageSentimentScore > 0 ? '+' : '') + data.summary.averageSentimentScore;
    document.getElementById('kpiTotalReviews').innerText = data.summary.totalReviews;

    renderDepartmentChart(data.faculty);
    renderBenchmarkTable(data.faculty);
    renderFacultyCards(data.faculty);
  } catch (err) {
    console.error('Failed to load HOD Dashboard:', err);
  }
}

function renderDepartmentChart(facultyList) {
  const ctx = document.getElementById('chartDepartmentSentiment').getContext('2d');

  let pos = 0, neu = 0, neg = 0;
  facultyList.forEach(f => {
    pos += f.sentimentDistribution.positive;
    neu += f.sentimentDistribution.neutral;
    neg += f.sentimentDistribution.negative;
  });

  if (deptChart) deptChart.destroy();

  deptChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive Sentiment', 'Neutral', 'Negative Concerns'],
      datasets: [{
        data: [pos, neu, neg],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      }
    }
  });
}

function renderBenchmarkTable(facultyList) {
  const tbody = document.getElementById('benchmarkTableBody');
  tbody.innerHTML = '';

  facultyList.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${f.name}</strong><br><small style="color:#94a3b8">${f.course}</small></td>
      <td>${f.teachingClarity} ⭐</td>
      <td>${f.pacing} ⭐</td>
      <td>${f.doubtResolution} ⭐</td>
      <td><span class="badge ${f.overallSentiment >= 0.3 ? 'positive' : f.overallSentiment <= -0.1 ? 'negative' : 'neutral'}">${f.overallSentiment}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderFacultyCards(facultyList) {
  const grid = document.getElementById('facultyCardsGrid');
  grid.innerHTML = '';

  facultyList.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${f.name}</h3>
      <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:0.8rem;">${f.course}</p>
      
      <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:1rem;">
        <span style="font-weight:700;">Overall Sentiment:</span>
        <span class="badge ${f.overallSentiment >= 0.3 ? 'positive' : f.overallSentiment <= -0.1 ? 'negative' : 'neutral'}">Score: ${f.overallSentiment} (${f.reviewCount} Reviews)</span>
      </div>

      <div style="margin-bottom:0.8rem;">
        <strong style="color:#34d399; font-size:0.85rem;">👍 What Students Appreciated:</strong>
        <ul style="font-size:0.85rem; color:#cbd5e1; padding-left:1.2rem; margin-top:0.3rem;">
          ${f.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom:0.8rem;">
        <strong style="color:#fca5a5; font-size:0.85rem;">⚠️ Actionable Opportunities for Improvement:</strong>
        <ul style="font-size:0.85rem; color:#cbd5e1; padding-left:1.2rem; margin-top:0.3rem;">
          ${f.concerns.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div style="background-color:#0f172a; padding:0.6rem 0.8rem; border-radius:6px; font-size:0.8rem; border-left:3px solid #38bdf8;">
        <strong>HOD Recommendation:</strong> ${f.actionRecommendation}
      </div>
    `;
    grid.appendChild(card);
  });
}
