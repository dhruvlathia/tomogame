import { db } from "./firebase";
import { ref, set, get, update, remove, onValue } from "firebase/database";

// WRITE (replace)
export const writeData = async (path: string, data: any) => {
    return set(ref(db, path), data);
};

// UPDATE (merge)
export const updateData = async (path: string, data: any) => {
    return update(ref(db, path), data);
};

// READ once
export const readDataOnce = async (path: string) => {
    const snapshot = await get(ref(db, path));
    return snapshot.exists() ? snapshot.val() : null;
};

// READ realtime
export const listenData = (
    path: string,
    callback: (data: any) => void
) => {
    return onValue(ref(db, path), (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : null);
    });
};

// DELETE
export const deleteData = async (path: string) => {
    return remove(ref(db, path));
};

// PUSH (add to list with unique ID)
import { push } from "firebase/database";
export const pushData = async (path: string, data: any) => {
    const newRef = push(ref(db, path));
    await set(newRef, data);
    return newRef.key;
};
