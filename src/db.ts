import type { Task, Category } from './types';

const DB_NAME = 'TaskManagementDB';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const CATEGORIES_STORE = 'categories';
const ARCHIVED_STORE = 'archived';

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tasks store
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const tasksStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
          tasksStore.createIndex('createdAt', 'createdAt', { unique: false });
          tasksStore.createIndex('category', 'category', { unique: false });
        }

        // Create categories store
        if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
          db.createObjectStore(CATEGORIES_STORE, { keyPath: 'id' });
        }

        // Create archived tasks store
        if (!db.objectStoreNames.contains(ARCHIVED_STORE)) {
          const archivedStore = db.createObjectStore(ARCHIVED_STORE, { keyPath: 'id' });
          archivedStore.createIndex('completedAt', 'completedAt', { unique: false });
        }
      };
    });
  }

  // Tasks operations
  async addTask(task: Task): Promise<void> {
    const transaction = this.db!.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.add(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(): Promise<Task[]> {
    const transaction = this.db!.transaction([TASKS_STORE], 'readonly');
    const store = transaction.objectStore(TASKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTask(task: Task): Promise<void> {
    const transaction = this.db!.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.put(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(id: string): Promise<void> {
    const transaction = this.db!.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async archiveTask(task: Task): Promise<void> {
    // Add to archived store
    const archiveTransaction = this.db!.transaction([ARCHIVED_STORE], 'readwrite');
    const archiveStore = archiveTransaction.objectStore(ARCHIVED_STORE);
    await new Promise((resolve, reject) => {
      const request = archiveStore.add(task);
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });

    // Remove from tasks store
    await this.deleteTask(task.id);
  }

  async getArchivedTasks(): Promise<Task[]> {
    const transaction = this.db!.transaction([ARCHIVED_STORE], 'readonly');
    const store = transaction.objectStore(ARCHIVED_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteArchivedTask(id: string): Promise<void> {
    const transaction = this.db!.transaction([ARCHIVED_STORE], 'readwrite');
    const store = transaction.objectStore(ARCHIVED_STORE);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Categories operations
  async addCategory(category: Category): Promise<void> {
    const transaction = this.db!.transaction([CATEGORIES_STORE], 'readwrite');
    const store = transaction.objectStore(CATEGORIES_STORE);
    return new Promise((resolve, reject) => {
      const request = store.add(category);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    const transaction = this.db!.transaction([CATEGORIES_STORE], 'readonly');
    const store = transaction.objectStore(CATEGORIES_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const transaction = this.db!.transaction([CATEGORIES_STORE], 'readwrite');
    const store = transaction.objectStore(CATEGORIES_STORE);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseService();
