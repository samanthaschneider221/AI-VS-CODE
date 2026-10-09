import { randomUUID } from 'node:crypto';

export function createQueueStore() {
  return { entries: [] };
}

export const defaultQueueStore = createQueueStore();

export function getQueue(queueStore = defaultQueueStore) {
  return queueStore.entries.map((student, index) => ({
    ...student,
    position: index + 1,
  }));
}

export function joinQueue(queueStore = defaultQueueStore, inputName) {
  const name = typeof inputName === 'string' ? inputName.trim() : '';

  if (!name) {
    throw new RangeError('Enter a name to join the queue.');
  }

  if (name.length > 60) {
    throw new RangeError('Enter a name between 1 and 60 characters.');
  }

  const student = { id: randomUUID(), name, createdAt: Date.now() };
  queueStore.entries.push(student);

  return { ...student, position: queueStore.entries.length };
}

export function advanceQueue(queueStore = defaultQueueStore) {
  const current = queueStore.entries.shift() ?? null;

  if (!current) {
    return { current: null, queue: getQueue(queueStore) };
  }

  return {
    current: { ...current, position: 1 },
    queue: getQueue(queueStore),
  };
}

export function removeQueueEntry(queueStore = defaultQueueStore, studentId) {
  const index = queueStore.entries.findIndex((student) => student.id === studentId);

  if (index === -1) {
    return null;
  }

  const [removed] = queueStore.entries.splice(index, 1);
  return removed;
}

export function listQueue() {
  return getQueue(defaultQueueStore);
}

export function enqueueStudent(name) {
  return joinQueue(defaultQueueStore, name);
}

export function nextStudent() {
  return advanceQueue(defaultQueueStore);
}

export function cancelStudent(studentId) {
  return removeQueueEntry(defaultQueueStore, studentId);
}
