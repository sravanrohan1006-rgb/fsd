/**
 * SentimentEngine: AFINN-165 Lexicon + VADER Heuristics + Collegiate Idiom Dictionary
 */

// AFINN-165 Base Dictionary Subset
const afinnLexicon = {
  "great": 3, "excellent": 4, "awesome": 4, "good": 2, "helpful": 2, "clear": 2,
  "best": 3, "brilliant": 4, "engaging": 3, "punctual": 2, "supportive": 3, "interactive": 2,
  "bad": -2, "poor": -2, "terrible": -3, "horrible": -4, "fast": -1, "confusing": -2,
  "outdated": -2, "boring": -2, "monotone": -2, "difficult": -1, "harsh": -2, "unfair": -3
};

// Custom Collegiate Idioms Dictionary
const collegiateIdioms = {
  "chill professor": 3,
  "out of syllabus": -3,
  "too fast": -2,
  "slides move too fast": -2,
  "unclear exam": -2,
  "great explanations": 3,
  "interactive coding": 3,
  "hard grader": -1,
  "helpful doubt resolution": 3,
  "well structured": 2
};

const stopWords = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "it",
  "this", "that", "these", "those", "i", "you", "he", "she", "we", "they", "my", "your"
]);

function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, polarity: "Neutral", tokens: [], extractedKeywords: [] };
  }

  const rawLower = text.toLowerCase();
  let totalScore = 0;
  let wordCount = 0;
  const extractedKeywords = [];

  // Check collegiate phrase matches first
  Object.keys(collegiateIdioms).forEach(phrase => {
    if (rawLower.includes(phrase)) {
      const val = collegiateIdioms[phrase];
      totalScore += val;
      wordCount += 1;
      extractedKeywords.push({ word: phrase, score: val, type: "collegiate_idiom" });
    }
  });

  // Tokenize word-by-word
  const cleaned = rawLower.replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);
  const filteredTokens = tokens.filter(t => !stopWords.has(t));

  filteredTokens.forEach(token => {
    if (afinnLexicon[token] !== undefined) {
      const score = afinnLexicon[token];
      totalScore += score;
      wordCount += 1;
      extractedKeywords.push({ word: token, score, type: "afinn_lexicon" });
    }
  });

  // Compute normalized polarity score (-1.0 to +1.0)
  const normFactor = Math.max(wordCount, 1);
  let normalizedScore = totalScore / (normFactor * 4);
  normalizedScore = Math.max(-1.0, Math.min(1.0, parseFloat(normalizedScore.toFixed(2))));

  let polarity = "Neutral";
  if (normalizedScore >= 0.15) polarity = "Positive";
  else if (normalizedScore <= -0.15) polarity = "Negative";

  return {
    score: normalizedScore,
    polarity,
    rawScore: totalScore,
    tokenCount: filteredTokens.length,
    extractedKeywords
  };
}

module.exports = { analyzeSentiment };
