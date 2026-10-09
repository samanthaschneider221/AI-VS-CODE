import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createQueueStore,
  getQueue,
  joinQueue,
  advanceQueue,
  removeQueueEntry,
} from '../lib/queue-store.js';

test('students join the queue in order and receive their position number', () => {
  const queueStore = createQueueStore();

  const first = joinQueue(queueStore, 'Ari');
  const second = joinQueue(queueStore, 'Mina');

  assert.equal(first.position, 1);
  assert.equal(second.position, 2);
  assert.deepEqual(getQueue(queueStore).map((student) => student.name), ['Ari', 'Mina']);
});

test('the next student is called when the queue advances', () => {
  const queueStore = createQueueStore();

  joinQueue(queueStore, 'Ari');
  joinQueue(queueStore, 'Mina');

  const result = advanceQueue(queueStore);

  assert.equal(result.current.name, 'Ari');
  assert.deepEqual(getQueue(queueStore).map((student) => student.name), ['Mina']);
});

test('a student can leave the queue without changing the other seats', () => {
  const queueStore = createQueueStore();

  joinQueue(queueStore, 'Ari');
  const mina = joinQueue(queueStore, 'Mina');

  const removed = removeQueueEntry(queueStore, mina.id);

  assert.equal(removed.name, 'Mina');
  assert.deepEqual(getQueue(queueStore).map((student) => student.name), ['Ari']);
});
