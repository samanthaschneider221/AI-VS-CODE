import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion } from '../lib/course-answer.js';
import { createSession, submitQuestion, getSessionHistory } from '../lib/session-store.js';
import { POST as officeHoursPost } from '../app/api/office-hours/route.js';

test('a student receives an answer grounded in course materials', () => {
  const result = answerQuestion('What does the browser do in a client-server architecture?');

  assert.equal(
    result.answer,
    'A browser commonly acts as a client. The client sends a request over HTTP; the server processes it and returns a response.',
  );
  assert.deepEqual(result.source, {
    title: 'Lecture 01: Client-Server Basics',
    section: 'Requests and responses',
  });
});

test('an unsupported question is not answered with invented information', () => {
  const result = answerQuestion('What is the final exam date?');

  assert.equal(
    result.answer,
    "I couldn't find that in the available course materials. Try asking about the client-server model.",
  );
  assert.equal(result.source, null);
});

test('a typed name starts an in-memory session and stores only that session history', () => {
  const firstSession = createSession('Ari');
  const secondSession = createSession('Ari');

  const result = submitQuestion(firstSession.id, 'What does a browser do?');

  assert.equal(result.answer, 'A browser commonly acts as a client. The client sends a request over HTTP; the server processes it and returns a response.');
  assert.equal(getSessionHistory(firstSession.id).length, 2);
  assert.deepEqual(getSessionHistory(secondSession.id), []);
});

test('the deployment API creates and uses a session through one route', async () => {
  const makeRequest = (body) => new Request('http://localhost/api/office-hours', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const startResponse = await officeHoursPost(makeRequest({ action: 'start', name: 'Deploy test' }));
  const session = await startResponse.json();
  const askResponse = await officeHoursPost(makeRequest({
    action: 'ask',
    sessionId: session.id,
    question: 'What does a browser do?',
  }));
  const answer = await askResponse.json();

  assert.equal(startResponse.status, 200);
  assert.equal(askResponse.status, 200);
  assert.match(answer.answer, /browser commonly acts as a client/);
});