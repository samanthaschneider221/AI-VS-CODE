import { createQueueStore, getQueue, joinQueue, advanceQueue, removeQueueEntry } from '../../../lib/queue-store.js';
import { createSession, getSessionHistory, submitQuestion } from '../../../lib/session-store.js';

export const dynamic = 'force-dynamic';

const queueStore = createQueueStore();

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

    if (body.action === 'join-queue' || body.action === 'joinQueue' || body.action === 'join') {
      const student = joinQueue(queueStore, body.name);
      return Response.json({ student, queue: getQueue(queueStore) });
    }

    if (body.action === 'list-queue' || body.action === 'listQueue' || body.action === 'list') {
      return Response.json({ queue: getQueue(queueStore) });
    }

    if (body.action === 'advance-queue' || body.action === 'advanceQueue' || body.action === 'next') {
      const result = advanceQueue(queueStore);
      return Response.json({ current: result.current, queue: result.queue });
    }

    if (body.action === 'leave-queue' || body.action === 'leaveQueue' || body.action === 'remove') {
      const removed = removeQueueEntry(queueStore, body.id);
      return Response.json({ removed, queue: getQueue(queueStore) });
    }

    return Response.json({ error: 'Choose a valid office-hours action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}