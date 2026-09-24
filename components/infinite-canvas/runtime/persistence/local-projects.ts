'use client';

import { nanoid } from 'nanoid';

import { createEmptyCanvasProject, parseCanvasProject } from '@/components/infinite-canvas/runtime/persistence/project-codec';
import { STORE_PREFIX } from '@/lib/constants/config';
import { CanvasStorageError } from '@/components/infinite-canvas/runtime/persistence/canvas-storage-error';
import type { CanvasProject } from '@/components/infinite-canvas/types/project';

const PROJECTS = 'projects';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${STORE_PREFIX}-canvas`, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(PROJECTS, { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Canvas storage is blocked by another tab.'));
    request.onsuccess = () => resolve(request.result);
  });
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(PROJECTS, mode);
    const request = operation(tx.objectStore(PROJECTS));
    tx.oncomplete = () => { database.close(); resolve(request.result); };
    tx.onabort = () => { database.close(); reject(tx.error ?? request.error); };
    tx.onerror = () => { database.close(); reject(tx.error ?? request.error); };
  });
}

async function updateProject(id: string, update: (project: CanvasProject) => CanvasProject): Promise<CanvasProject> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(PROJECTS, 'readwrite');
    const store = tx.objectStore(PROJECTS);
    const request = store.get(id);
    let result: CanvasProject;
    let failure: unknown;
    request.onsuccess = () => {
      try {
        if (!request.result) throw new CanvasStorageError('missing');
        result = update(parseCanvasProject(request.result));
        store.put(result);
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { database.close(); resolve(result); };
    tx.onabort = () => { database.close(); reject(failure ?? tx.error); };
    tx.onerror = () => { database.close(); reject(tx.error); };
  });
}

/** Browser-only project storage; no backend or authentication dependency. */
export function createCanvasProjectStorage() {
  return {
    async listProjects(page = 1, pageSize = 12) {
      const projects = await transaction<CanvasProject[]>('readonly', (store) => store.getAll());
      const rows = projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice((page - 1) * pageSize, page * pageSize).map((project) => ({
        projectId: project.id, title: project.title, createdAt: project.createdAt, updatedAt: project.updatedAt,
        nodeCount: project.nodes.length, connectionCount: project.connections.length,
      }));
      return { rows, total: projects.length };
    },
    async createProject(title: string, snapshot?: CanvasProject) {
      const id = nanoid();
      const now = new Date().toISOString();
      const project = snapshot ? { ...parseCanvasProject(snapshot), id, createdAt: now, updatedAt: now } : createEmptyCanvasProject(id, title, now);
      await transaction('readwrite', (store) => store.add(project));
      return project;
    },
    async getProject(id: string) {
      const project = await transaction<CanvasProject | undefined>('readonly', (store) => store.get(id));
      if (!project) throw new CanvasStorageError('missing');
      return parseCanvasProject(project);
    },
    async saveProject(id: string, snapshot: CanvasProject) {
      const project = await updateProject(id, (current) => ({
        ...parseCanvasProject(snapshot),
        id, createdAt: current.createdAt, title: current.title, updatedAt: new Date().toISOString(),
      }));
      return project;
    },
    async renameProject(id: string, title: string) {
      const project = await updateProject(id, (current) => ({ ...current, title, updatedAt: new Date().toISOString() }));
      return project;
    },
    async deleteProject(id: string) {
      await transaction('readwrite', (store) => store.delete(id));
    },
    async deleteProjects(projectIds: readonly string[]) {
      await transaction('readwrite', (store) => { for (const id of projectIds) store.delete(id); return store.count(); });
    },
  };
}
