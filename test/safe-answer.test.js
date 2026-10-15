import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAnswer } from '../lib/safe-answer.js';

test('answer output removes executable HTML and preserves readable text', () => {
  const answer = sanitizeAnswer(
    '<p>Review this idea.</p><script>stealData()</script><img src="x" onerror="stealData()">',
  );

  assert.equal(answer, 'Review this idea.');
  assert.doesNotMatch(answer, /<|>|stealData|onerror/i);
});

test('answer output removes link targets and keeps the link label as plain text', () => {
  const answer = sanitizeAnswer(
    'Read <a href="https://outside.example">this source</a> or [this one](https://outside.example).',
  );

  assert.equal(answer, 'Read this source or this one.');
  assert.doesNotMatch(answer, /https?:\/\/|href=|\]\(/i);
});
