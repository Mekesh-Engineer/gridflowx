import {
  ref,
  get,
  set,
  update,
  remove,
  query,
} from 'firebase/database';
import { db } from '@/lib/firebase';

export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docSnap = await get(ref(db, `${collectionName}/${id}`));
    if (docSnap.exists()) {
      return docSnap.val() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting doc ${collectionName}/${id}:`, error);
    throw error;
  }
}

export async function setDocument<T extends { id?: string }>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  try {
    await set(ref(db, `${collectionName}/${id}`), data);
  } catch (error) {
    console.error(`Error setting doc ${collectionName}/${id}:`, error);
    throw error;
  }
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  try {
    await update(ref(db, `${collectionName}/${id}`), data);
  } catch (error) {
    console.error(`Error updating doc ${collectionName}/${id}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    await remove(ref(db, `${collectionName}/${id}`));
  } catch (error) {
    console.error(`Error deleting doc ${collectionName}/${id}:`, error);
    throw error;
  }
}

export async function queryDocuments<T>(
  collectionName: string,
): Promise<T[]> {
  try {
    const q = query(ref(db, collectionName));
    const snap = await get(q);
    if (!snap.exists()) return [];
    
    const results: T[] = [];
    snap.forEach((child) => {
      results.push(child.val() as T);
    });
    return results;
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
}
