// Firestore REST value codec and collection reader used at build time.

export function fromFirestoreValue(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('referenceValue' in v) return v.referenceValue;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromFirestoreValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields ?? {});
  throw new Error(`Unsupported Firestore value: ${Object.keys(v).join(',')}`);
}

export function fromFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([k, val]) => [k, fromFirestoreValue(val)]));
}

export function toFirestoreValue(x) {
  if (x === null || x === undefined) return { nullValue: null };
  if (typeof x === 'string') return { stringValue: x };
  if (typeof x === 'boolean') return { booleanValue: x };
  if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(toFirestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, val]) => [k, toFirestoreValue(val)])) } };
}

export async function fetchCollection({ projectId, collection, apiKey }) {
  const docs = [];
  let pageToken = '';
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`);
    url.searchParams.set('pageSize', '300');
    if (apiKey) url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore ${collection} fetch failed: HTTP ${res.status}`);
    const body = await res.json();
    for (const d of body.documents ?? []) {
      docs.push({ id: d.name.split('/').pop(), data: fromFields(d.fields ?? {}) });
    }
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return docs;
}
