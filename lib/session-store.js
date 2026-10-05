import { randomUUID } from 'node:crypto';
import { answerQuestion } from './course-answer.js';

const sessions = new Map();

export function createSession(name) {
  const displayName = typeof name === 'string' ? name.trim() : '';

  if (!displayName || displayName.length > 60) {
    throw new RangeError('Enter a name between 1 and 60 characters.');
  }

  const session = { id: randomUUID(), name: displayName, messages: [] };
  sessions.set(session.id, session);

  return { id: session.id, name: session.name };
}

export function submitQuestion(sessionId, question) {
  const session = sessions.get(sessionId);
  const text = typeof question === 'string' ? question.trim() : '';

  if (!session) {
    return null;
  }
  if (!text || text.length > 2000) {
    throw new RangeError('Enter a question between 1 and 2,000 characters.');
  }

  const reply = answerQuestion(text);
  session.messages.push(
    { role: 'user', content: text },
    { role: 'assistant', content: reply.answer, source: reply.source },
  );

  return { answer: reply.answer, source: reply.source };
}

export function getSessionHistory(sessionId) {
  return (sessions.get(sessionId)?.messages ?? []).map((message) => ({ ...message }));
}