import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  child,
  set,
  update,
  onValue,
  get,
  remove,
  query,
  orderByChild,
  endAt
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyAycT0fkOYGT59qutLaBjxOTq9ZILNDTL4",
  authDomain: "online-gvs.firebaseapp.com",
  databaseURL: "https://online-gvs-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "online-gvs",
  storageBucket: "online-gvs.firebasestorage.app",
  messagingSenderId: "415823310946",
  appId: "1:415823310946:web:91c174ec6e585b9c70613b",
  measurementId: "G-F6RJ07D98Z"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function createRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

export function getRoomRef(roomId) {
  return ref(db, `rooms/${roomId}`);
}

export function getRoomsRef() {
  return ref(db, "rooms");
}

export function writeRoom(roomId, data) {
  return set(getRoomRef(roomId), data);
}

export function updateRoom(roomId, patch) {
  return update(getRoomRef(roomId), patch);
}

export function readRoom(roomId) {
  return get(getRoomRef(roomId));
}

export function removeRoom(roomId) {
  return remove(getRoomRef(roomId));
}

export function listenRoom(roomId, callback) {
  return onValue(getRoomRef(roomId), snapshot => {
    callback(snapshot.val());
  });
}

export async function cleanupOldRooms(maxAgeMs = 24 * 60 * 60 * 1000) {
  const border = Date.now() - maxAgeMs;
  const oldRoomsQuery = query(
    getRoomsRef(),
    orderByChild("meta/updatedAt"),
    endAt(border)
  );

  const snapshot = await get(oldRoomsQuery);
  if (!snapshot.exists()) {
    return 0;
  }

  const removals = [];
  snapshot.forEach(child => {
    removals.push(remove(child.ref));
  });

  await Promise.all(removals);
  return removals.length;
}

export function buildInitialRoomData({ mode = "online1v1" } = {}) {
  const now = Date.now();

  return {
    meta: {
      status: "waiting",
      mode,
      hostPlayer: "A",
      createdAt: now,
      updatedAt: now,
      result: null,
      notice: ""
    },
    players: {
      A: {
        joined: true,
        ready: false,
        unitId: null,
        left: false,
        lastSeen: now,
        profileId: null,
        profileName: null,
        equippedTitles: []
      },
      B: {
        joined: false,
        ready: false,
        unitId: null,
        left: false,
        lastSeen: null,
        profileId: null,
        profileName: null,
        equippedTitles: []
      }
    },
    chat: {
      A: {
        text: "",
        updatedAt: 0
      },
      B: {
        text: "",
        updatedAt: 0
      }
    },
    peace: {
      requestedBy: null,
      status: "none",
      updatedAt: 0
    },
    battle: null,
    action: {
      actionId: 0,
      actor: "A",
      type: "roomCreated",
      payload: {},
      createdAt: now
    }
  };
}

export function getPlayerProfileRef(playerId) {
  return ref(db, `players/${playerId}`);
}

export async function readPlayerProfile(playerId) {
  const snapshot = await get(getPlayerProfileRef(playerId));
  return snapshot.exists() ? snapshot.val() : null;
}

export function writePlayerProfile(playerId, data) {
  return set(getPlayerProfileRef(playerId), data);
}

export function updatePlayerProfile(playerId, patch) {
  return update(getPlayerProfileRef(playerId), patch);
}
