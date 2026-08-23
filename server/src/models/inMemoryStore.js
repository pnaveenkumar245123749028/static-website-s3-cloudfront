import crypto from 'crypto';

class InMemoryStore {
  constructor() {
    this.collections = {
      users: new Map(),
      workflows: new Map(),
      executions: new Map(),
      executionlogs: new Map(),
      integrations: new Map(),
      notifications: new Map(),
      agentmemories: new Map(),
    };
    this.isInMemory = true;
  }

  getCollection(name) {
    const key = name.toLowerCase();
    if (!this.collections[key]) {
      this.collections[key] = new Map();
    }
    return this.collections[key];
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  async insert(collectionName, doc) {
    const collection = this.getCollection(collectionName);
    const id = doc._id ? doc._id.toString() : this.generateId();
    const now = new Date();
    const newDoc = {
      ...doc,
      _id: id,
      id: id,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now,
    };
    collection.set(id, JSON.parse(JSON.stringify(newDoc)));
    return JSON.parse(JSON.stringify(newDoc));
  }

  async findById(collectionName, id) {
    const collection = this.getCollection(collectionName);
    const doc = collection.get(id?.toString());
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  async findOne(collectionName, query = {}) {
    const docs = await this.find(collectionName, query);
    return docs.length > 0 ? docs[0] : null;
  }

  async find(collectionName, query = {}, options = {}) {
    const collection = this.getCollection(collectionName);
    let results = [];

    for (const doc of collection.values()) {
      let matches = true;
      for (const [key, value] of Object.entries(query)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('$in' in value) {
            if (!value.$in.includes(doc[key])) matches = false;
          } else if ('$nin' in value) {
            if (value.$nin.includes(doc[key])) matches = false;
          } else if ('$regex' in value) {
            const regex = new RegExp(value.$regex, value.$options || '');
            if (!regex.test(doc[key] || '')) matches = false;
          } else if ('$gt' in value) {
            if (!(doc[key] > value.$gt)) matches = false;
          } else if ('$gte' in value) {
            if (!(doc[key] >= value.$gte)) matches = false;
          } else if ('$lt' in value) {
            if (!(doc[key] < value.$lt)) matches = false;
          } else if ('$lte' in value) {
            if (!(doc[key] <= value.$lte)) matches = false;
          } else if ('$ne' in value) {
            if (doc[key] === value.$ne) matches = false;
          }
        } else if (doc[key] !== value) {
          matches = false;
        }
      }
      if (matches) {
        results.push(JSON.parse(JSON.stringify(doc)));
      }
    }

    // Sorting
    if (options.sort) {
      const [sortField, sortDir] = Object.entries(options.sort)[0] || ['createdAt', -1];
      const dir = sortDir === -1 || sortDir === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    // Pagination
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async count(collectionName, query = {}) {
    const docs = await this.find(collectionName, query);
    return docs.length;
  }

  async updateById(collectionName, id, update) {
    const collection = this.getCollection(collectionName);
    const existing = collection.get(id?.toString());
    if (!existing) return null;

    let updated = { ...existing };

    if (update.$set) {
      updated = { ...updated, ...update.$set };
    } else if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        updated[key] = (updated[key] || 0) + val;
      }
    } else {
      updated = { ...updated, ...update };
    }

    updated.updatedAt = new Date();
    collection.set(id?.toString(), JSON.parse(JSON.stringify(updated)));
    return JSON.parse(JSON.stringify(updated));
  }

  async deleteById(collectionName, id) {
    const collection = this.getCollection(collectionName);
    const existed = collection.has(id?.toString());
    collection.delete(id?.toString());
    return existed;
  }

  async deleteMany(collectionName, query = {}) {
    const docs = await this.find(collectionName, query);
    const collection = this.getCollection(collectionName);
    let count = 0;
    for (const doc of docs) {
      collection.delete(doc._id);
      count++;
    }
    return count;
  }
}

export const inMemoryStore = new InMemoryStore();
