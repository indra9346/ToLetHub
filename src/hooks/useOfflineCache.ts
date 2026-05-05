import { openDB } from "idb";

const DB_NAME = "tolethub-offline";
const DB_VERSION = 2;

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("houses")) {
        db.createObjectStore("houses", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("house-detail")) {
        db.createObjectStore("house-detail", { keyPath: "id" });
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

export const cacheHouseDetail = async (house: any) => {
  if (!house?.id) return;
  try {
    const db = await getDB();
    await db.put("house-detail", house);
  } catch (e) {
    console.warn("Failed to cache house detail:", e);
  }
};

export const getCachedHouseDetail = async (id: string): Promise<any | null> => {
  try {
    const db = await getDB();
    return (await db.get("house-detail", id)) ?? null;
  } catch {
    return null;
  }
};
