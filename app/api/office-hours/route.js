import { createSession, getSessionHistory, submitQuestion } from '../../../lib/session-store.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Send a valid request to continue.' }, { status: 400 });
  }

  try {
    if (body.action === 'start') {
      return Response.json(createSession(body.name));
    }

    if (body.action === 'ask') {
      const reply = submitQuestion(body.sessionId, body.question);

      if (!reply) {
        return Response.json({ error: 'Start a new session to ask a question.' }, { status: 404 });
      }

      return Response.json({ ...reply, history: getSessionHistory(body.sessionId) });
    }

    return Response.json({ error: 'Choose a valid office-hours action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}