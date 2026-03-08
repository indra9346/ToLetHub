import { openDB } from "idb";

const DB_NAME = "tolethub-offline";
const DB_VERSION = 1;

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("houses")) {
        db.createObjectStore("houses", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    },
  });

export const cacheHouses = async (houses: any[]) => {
  try {
    const db = await getDB();
    const tx = db.transaction("houses", "readwrite");
    const store = tx.objectStore("houses");
    await store.clear();
    for (const house of houses) {
      await store.put(house);
    }
    await tx.done;
    // Store timestamp
    const metaTx = db.transaction("meta", "readwrite");
    await metaTx.objectStore("meta").put({ key: "lastSync", value: Date.now() });
    await metaTx.done;
  } catch (e) {
    console.warn("Failed to cache houses:", e);
  }
};

export const getCachedHouses = async (): Promise<any[]> => {
  try {
    const db = await getDB();
    return await db.getAll("houses");
  } catch {
    return [];
  }
};

export const getLastSyncTime = async (): Promise<number | null> => {
  try {
    const db = await getDB();
    const meta = await db.get("meta", "lastSync");
    return meta?.value ?? null;
  } catch {
    return null;
  }
};
