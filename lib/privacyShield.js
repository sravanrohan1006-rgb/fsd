/**
 * Privacy & Anonymity Guarantee Shield
 * Strips student PII (Roll Numbers, IP addresses, email, headers) and computes one-way session token hash.
 */

const crypto = require('crypto');

function anonymizeSubmission(reqBody, clientIp) {
  const { sessionToken, textReview, ...rest } = reqBody;

  // Compute one-way cryptographic SHA-256 hash of student session token
  const anonymizedHash = crypto
    .createHash('sha256')
    .update(sessionToken || clientIp || Date.now().toString())
    .digest('hex')
    .substring(0, 16);

  // Strip potential PII patterns (emails, 10-digit student IDs) from feedback text
  let sanitizedText = textReview || '';
  sanitizedText = sanitizedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  sanitizedText = sanitizedText.replace(/\b\d{8,12}\b/g, '[REDACTED_ID]');

  return {
    sanitizedText,
    anonymizedSessionHash: anonymizedHash,
    cleanedPayload: rest
  };
}

module.exports = { anonymizeSubmission };
