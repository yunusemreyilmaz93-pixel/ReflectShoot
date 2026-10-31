/**
 * Tiny in-memory stand-in for the parts of firebase-admin Firestore the API handlers use:
 * collection().doc().get/set/update/delete, nested collections, add(), where('==') queries and
 * runTransaction (reads happen on the live store, writes apply immediately, which is enough here).
 */
type Store = Map<string, Record<string, any>>;

export function createFakeDb(seed: Record<string, Record<string, any>> = {}) {
  const store: Store = new Map(Object.entries(seed));
  let autoId = 0;

  const merge = (path: string, data: Record<string, any>) => {
    const next = { ...(store.get(path) || {}) };
    for (const [key, value] of Object.entries(data)) {
      if (key.includes('.')) {
        const [head, ...rest] = key.split('.');
        next[head] = { ...(next[head] || {}), [rest.join('.')]: value };
      } else next[key] = value;
    }
    store.set(path, next);
  };

  const docRef = (path: string): any => ({
    id: path.split('/').pop(),
    path,
    parent: { parent: path.split('/').length > 2 ? docRef(path.split('/').slice(0, -2).join('/')) : null },
    get: async () => snapshot(path),
    set: async (data: Record<string, any>) => void store.set(path, { ...data }),
    update: async (data: Record<string, any>) => {
      if (!store.has(path)) throw new Error(`No document to update: ${path}`);
      merge(path, data);
    },
    delete: async () => void store.delete(path),
    collection: (name: string) => collectionRef(`${path}/${name}`),
  });

  const snapshot = (path: string): any => ({
    id: path.split('/').pop(),
    exists: store.has(path),
    ref: docRef(path),
    data: () => (store.has(path) ? { ...store.get(path)! } : undefined),
  });

  const queryRef = (prefix: string, filters: Array<[string, string, any]> = []): any => ({
    where: (field: string, op: string, value: any) => queryRef(prefix, [...filters, [field, op, value]]),
    limit: () => queryRef(prefix, filters),
    get: async () => {
      const docs = [...store.keys()]
        .filter((path) => path.startsWith(`${prefix}/`) && path.slice(prefix.length + 1).split('/').length === 1)
        .map(snapshot)
        .filter((doc: any) =>
          filters.every(([field, op, value]) => {
            const actual = field.split('.').reduce((acc: any, part) => acc?.[part], doc.data());
            if (op === '==') return actual === value;
            if (op === 'array-contains') return Array.isArray(actual) && actual.includes(value);
            return false;
          })
        );
      return { docs, empty: docs.length === 0, size: docs.length };
    },
  });

  const collectionRef = (prefix: string): any => ({
    ...queryRef(prefix),
    doc: (id?: string) => docRef(`${prefix}/${id ?? `auto${++autoId}`}`),
    add: async (data: Record<string, any>) => {
      const ref = docRef(`${prefix}/auto${++autoId}`);
      await ref.set(data);
      return ref;
    },
  });

  return {
    store,
    collection: (name: string) => collectionRef(name),
    batch: () => ({ update: () => undefined, commit: async () => undefined }),
    runTransaction: async (fn: (tx: any) => Promise<any>) =>
      fn({
        get: async (target: any) => (target.get ? target.get() : target),
        set: (ref: any, data: Record<string, any>) => void ref.set(data),
        update: (ref: any, data: Record<string, any>) => void ref.update(data),
      }),
  };
}

/** Express-like response recorder. */
export function createRes() {
  const res: any = { statusCode: 200, headers: {} as Record<string, string>, body: undefined };
  res.setHeader = (key: string, value: string) => void (res.headers[key] = value);
  res.status = (code: number) => ((res.statusCode = code), res);
  res.json = (payload: unknown) => ((res.body = payload), res);
  return res;
}
