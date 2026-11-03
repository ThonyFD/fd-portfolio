import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromFirestoreValue, toFirestoreValue } from './firestore.mjs';

test('fromFirestoreValue maps scalar types', () => {
  assert.equal(fromFirestoreValue({ stringValue: 'a' }), 'a');
  assert.equal(fromFirestoreValue({ integerValue: '2' }), 2);
  assert.equal(fromFirestoreValue({ doubleValue: 0.5 }), 0.5);
  assert.equal(fromFirestoreValue({ booleanValue: true }), true);
  assert.equal(fromFirestoreValue({ nullValue: null }), null);
});

test('fromFirestoreValue maps nested maps and arrays', () => {
  const v = {
    mapValue: {
      fields: {
        tags: { arrayValue: { values: [{ stringValue: 'x' }] } },
        empty: { arrayValue: {} },
        inner: { mapValue: { fields: { n: { integerValue: '3' } } } },
      },
    },
  };
  assert.deepEqual(fromFirestoreValue(v), { tags: ['x'], empty: [], inner: { n: 3 } });
});

test('toFirestoreValue round-trips', () => {
  const x = { a: 'b', n: 4, f: 1.5, t: false, z: null, list: [1, 'two', { k: true }], m: {} };
  assert.deepEqual(fromFirestoreValue(toFirestoreValue(x)), x);
});
