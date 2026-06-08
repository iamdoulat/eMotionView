const isServer = typeof window === 'undefined';

let mongoServer: any = null;
async function getMongo() {
  if (!mongoServer) mongoServer = import('./mongodb');
  return mongoServer;
}

const API = '/api/data';

async function apiGet(collection: string, id?: string): Promise<any> {
  const url = id ? `${API}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}` : `${API}/${encodeURIComponent(collection)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API GET ${collection} failed: ${res.status}`);
  return res.json();
}

async function apiPost(collection: string, data: any): Promise<any> {
  const res = await fetch(`${API}/${encodeURIComponent(collection)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API POST ${collection} failed: ${res.status}`);
  return res.json();
}

async function apiPut(collection: string, id: string, data: any): Promise<void> {
  const res = await fetch(`${API}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API PUT ${collection} failed: ${res.status}`);
}

async function apiDelete(collection: string, id: string): Promise<void> {
  const res = await fetch(`${API}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API DELETE ${collection} failed: ${res.status}`);
}

export type CollectionRef = { _name: string };
export type DocRef = { _collection: string; _id: string };
export type QueryFilter = { field: string; op: string; value: any };
export type QuerySort = { field: string; dir: 'asc' | 'desc' };
export type QueryObj = {
  _collection: string;
  filters: QueryFilter[];
  sorts: QuerySort[];
  limitCount?: number;
};

const db = { _isMock: true };

function collection(dbOrName: any, name?: string): CollectionRef {
  const collectionName = name || (typeof dbOrName === 'string' ? dbOrName : dbOrName?._name);
  if (!collectionName) throw new Error('Collection name is required');
  return { _name: collectionName };
}

function doc(database: any, collectionName: string, docId: string): DocRef;
function doc(collectionRef: CollectionRef, docId: string): DocRef;
function doc(databaseOrRef: any, collectionNameOrId: string, docId?: string): DocRef {
  if (docId !== undefined) {
    return { _collection: collectionNameOrId, _id: docId };
  }
  if (typeof databaseOrRef === 'object' && databaseOrRef._name) {
    return { _collection: databaseOrRef._name, _id: collectionNameOrId };
  }
  const slashIdx = collectionNameOrId.indexOf('/');
  if (slashIdx !== -1) {
    return { _collection: collectionNameOrId.slice(0, slashIdx), _id: collectionNameOrId.slice(slashIdx + 1) };
  }
  return { _collection: collectionNameOrId, _id: '' };
}

function query(collectionRef: CollectionRef, ...conditions: (QueryFilter | QuerySort | number)[]): QueryObj {
  const q: QueryObj = { _collection: collectionRef._name, filters: [], sorts: [] };
  for (const condition of conditions) {
    if (typeof condition === 'number') {
      q.limitCount = condition;
    } else if ('field' in condition && 'dir' in condition) {
      q.sorts.push(condition as QuerySort);
    } else {
      q.filters.push(condition as QueryFilter);
    }
  }
  return q;
}

function where(field: string, op: string, value: any): QueryFilter {
  return { field, op, value };
}

function orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): QuerySort {
  return { field, dir };
}

function limit(n: number): number {
  return n;
}

function increment(n: number): { _increment: number } {
  return { _increment: n };
}

function arrayUnion(...values: any[]): { _arrayUnion: any[] } {
  return { _arrayUnion: values };
}

function arrayRemove(...values: any[]): { _arrayRemove: any[] } {
  return { _arrayRemove: values };
}

async function getDoc(ref: DocRef): Promise<any> {
  if (isServer) {
    try {
      const { findOne } = await getMongo();
      const doc = await findOne(ref._collection, { _id: ref._id });
      if (doc) return { exists: () => true, data: () => doc, id: doc._id.toString(), ...doc };
      return { exists: () => false, data: () => ({}), id: ref._id };
    } catch (error) {
      return { exists: () => false, data: () => ({}), id: ref._id };
    }
  }
  try {
    const data = await apiGet(ref._collection, ref._id);
    return { exists: () => true, data: () => data, id: data._id || ref._id, ...data };
  } catch {
    return { exists: () => false, data: () => ({}), id: ref._id };
  }
}

async function getDocs(ref: CollectionRef | QueryObj): Promise<any> {
  if (isServer) {
    try {
      const { findMany } = await getMongo();
      if ('_name' in ref && !('filters' in ref)) {
        const docs = await findMany(ref._name);
        return { docs: docs.map((d: any) => ({ ...d, id: d._id.toString() })), empty: docs.length === 0, size: docs.length };
      }
      const q = ref as QueryObj;
      const filter = convertFilterToMongo(q.filters);
      const sort = q.sorts.length > 0 ? convertSortToMongo(q.sorts) as any : undefined;
      const docs = await findMany(q._collection, filter, sort, q.limitCount);
      return { docs: docs.map((d: any) => ({ ...d, id: d._id.toString() })), empty: docs.length === 0, size: docs.length };
    } catch (error) {
      return { docs: [], empty: true, size: 0 };
    }
  }
  const collectionName = '_name' in ref ? ref._name : (ref as QueryObj)._collection;
  try {
    const data = await apiGet(collectionName);
    const docs = Array.isArray(data) ? data : [];
    return { docs: docs.map((d: any) => ({ ...d, id: d._id || d.id })), empty: docs.length === 0, size: docs.length };
  } catch {
    return { docs: [], empty: true, size: 0 };
  }
}

function convertFilterToMongo(filters: QueryFilter[]): Record<string, any> {
  const mongoFilter: Record<string, any> = {};
  for (const f of filters) {
    const value = f.value && typeof f.value === 'object' && '_increment' in f.value
      ? undefined : f.value;
    if (value === undefined && f.op === '==') continue;
    switch (f.op) {
      case '==': mongoFilter[f.field] = value; break;
      case '!=': mongoFilter[f.field] = { $ne: value }; break;
      case '>': mongoFilter[f.field] = { $gt: value }; break;
      case '>=': mongoFilter[f.field] = { $gte: value }; break;
      case '<': mongoFilter[f.field] = { $lt: value }; break;
      case '<=': mongoFilter[f.field] = { $lte: value }; break;
      case 'in': mongoFilter[f.field] = { $in: value }; break;
      case 'array-contains': mongoFilter[f.field] = { $in: [value] }; break;
      case 'not-in': mongoFilter[f.field] = { $nin: value }; break;
      default: mongoFilter[f.field] = value;
    }
  }
  return mongoFilter;
}

function convertSortToMongo(sorts: QuerySort[]): [string, 1 | -1][] {
  return sorts.map(s => [s.field, s.dir === 'desc' ? -1 as const : 1 as const]);
}

async function setDoc(ref: DocRef, data: any, options?: { merge?: boolean }): Promise<void> {
  if (isServer) {
    const { updateOne, replaceOne } = await getMongo();
    if (options?.merge) {
      await updateOne(ref._collection, { _id: ref._id }, data, true);
    } else {
      await replaceOne(ref._collection, { _id: ref._id }, data);
    }
    return;
  }
  await apiPut(ref._collection, ref._id, data);
}

async function addDoc(collectionRef: CollectionRef, data: any): Promise<{ id: string }> {
  if (isServer) {
    const { insertOne } = await getMongo();
    const id = await insertOne(collectionRef._name, data);
    return { id };
  }
  const result = await apiPost(collectionRef._name, data);
  return { id: result.id };
}

async function deleteDoc(ref: DocRef): Promise<void> {
  if (isServer) {
    const { deleteOne } = await getMongo();
    await deleteOne(ref._collection, { _id: ref._id });
    return;
  }
  await apiDelete(ref._collection, ref._id);
}

async function updateDoc(ref: DocRef, data: any): Promise<void> {
  if (isServer) {
    const { updateOne } = await getMongo();
    const processedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && '_arrayUnion' in value) {
        processedData[key] = { $each: value._arrayUnion };
      } else if (value && typeof value === 'object' && '_arrayRemove' in value) {
        processedData[key] = { $each: value._arrayRemove };
      } else {
        processedData[key] = value;
      }
    }
    await updateOne(ref._collection, { _id: ref._id }, processedData);
    return;
  }
  await apiPut(ref._collection, ref._id, data);
}

function onSnapshot(ref: DocRef, callback: (snapshot: any) => void, errorCallback?: (error: any) => void): () => void {
  let intervalId: ReturnType<typeof setInterval>;
  let cancelled = false;

  const poll = async () => {
    if (cancelled) return;
    try {
      if (isServer) {
        const { findOne } = await getMongo();
        const snapshot = await findOne(ref._collection, { _id: ref._id });
        callback({
          exists: () => !!snapshot, data: () => snapshot || {}, id: ref._id, ...(snapshot || {}),
        });
      } else {
        try {
          const data = await apiGet(ref._collection, ref._id);
          callback({
            exists: () => true, data: () => data, id: data._id || ref._id, ...data,
          });
        } catch (fetchError: any) {
          // If the document simply doesn't exist (404), treat as a non-existent snapshot
          if (fetchError?.message?.includes('404')) {
            callback({
              exists: () => false, data: () => ({}), id: ref._id,
            });
          } else {
            throw fetchError;
          }
        }
      }
    } catch (error) {
      if (errorCallback) errorCallback(error);
    }
  };

  poll();
  intervalId = setInterval(poll, 3000);
  return () => { cancelled = true; clearInterval(intervalId); };
}

class WriteBatch {
  private operations: Array<{ type: 'set'; ref: DocRef; data: any; merge?: boolean } | { type: 'update'; ref: DocRef; data: any } | { type: 'delete'; ref: DocRef }> = [];

  set(ref: DocRef, data: any) { this.operations.push({ type: 'set', ref, data }); }
  update(ref: DocRef, data: any) { this.operations.push({ type: 'update', ref, data }); }
  delete(ref: DocRef) { this.operations.push({ type: 'delete', ref }); }

  async commit(): Promise<void> {
    for (const op of this.operations) {
      switch (op.type) {
        case 'set': await setDoc(op.ref, op.data); break;
        case 'update': await updateDoc(op.ref, op.data); break;
        case 'delete': await deleteDoc(op.ref); break;
      }
    }
  }
}

function writeBatch(database: any): WriteBatch {
  return new WriteBatch();
}

function rewriteUrl(item: any): any {
    if (typeof item === 'string' && item.includes('.r2.cloudflarestorage.com')) {
        try {
            const urlObj = new URL(item);
            const parts = urlObj.pathname.split('/');
            if (parts.length > 2) {
                const fileKey = parts.slice(2).join('/');
                return `/api/r2/proxy?key=${encodeURIComponent(fileKey)}`;
            }
            return item;
        } catch {
            return item;
        }
    } else if (Array.isArray(item)) {
        return item.map(rewriteUrl);
    } else if (item && typeof item === 'object') {
        if (typeof item.toDate === 'function') {
            return item.toDate().toISOString();
        }
        const result: Record<string, any> = {};
        for (const k in item) {
            result[k] = rewriteUrl(item[k]);
        }
        return result;
    }
    return item;
}

function docToJSON(doc: any): any {
  if (!doc) return null;
  const data = doc.data ? doc.data() : doc;
  if (!data) return null;
  const result: Record<string, any> = {};
  for (const key in data) {
      if (key === '_id' || key === 'id') continue;
      result[key] = rewriteUrl(data[key]);
  }
  return { ...result, id: doc.id || data._id?.toString() || data.id };
}

async function getDocByField(collectionName: string, field: string, value: any): Promise<any> {
  if (isServer) {
    try {
      const { findMany, toPlainObject } = await getMongo();
      const docs = await findMany(collectionName, { [field]: value } as any);
      return docs.length > 0 ? toPlainObject(docs[0]) : null;
    } catch (error) {
      return null;
    }
  }
  const docs = await apiGet(collectionName);
  const found = Array.isArray(docs) ? docs.find((d: any) => d[field] === value) : null;
  return found || null;
}

export {
  db,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  docToJSON,
  increment,
  arrayUnion,
  arrayRemove,
  getDocByField,
};
