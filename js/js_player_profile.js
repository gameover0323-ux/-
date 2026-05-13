import { updatePlayerAchievements } from "./js_player_achievements.js";
import {
  readPlayerProfile,
  writePlayerProfile,
  updatePlayerProfile
} from "./js_online_firebase.js";

const SESSION_KEY = "gbs_current_player_id";

export const playerSession = {
  profile: null
};

function todayYmdSlash() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function validateHalfWidthAlnum(value) {
  return /^[A-Za-z0-9]+$/.test(String(value || ""));
}

async function sha256(text) {
  const data = new TextEncoder().encode(String(text));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map(v => v.toString(16).padStart(2, "0"))
    .join("");
}

function createInitialStats() {
  return {
    units: {},
    defeated: {
      cpu: {},
      playable: {},
      boss: {},
      onlinePlayer: {}
    },
    battleHistory: []
  };
}

function createProfile({ id, passwordHash, name }) {
  const isDebug = id === "testgameover";

  return {
  id,
  passwordHash,
  name: isDebug ? "げむおば(デバッグ)" : name,
  favoriteUnitId: "",
  comment: "",
  equippedTitles: [],
  registeredAt: todayYmdSlash(),
  role: isDebug ? "debug" : "player",
  stats: createInitialStats(),
  unlocks: {},
  titles: {
    unlocked: {}
  },
  trophies: {
    byUnit: {}
  }
};
}

export function isLoggedIn() {
  return !!playerSession.profile;
}

export function getCurrentPlayerProfile() {
  return playerSession.profile;
}

export function canUseTestMode() {
  return playerSession.profile?.role === "debug";
}

export async function loginPlayer(id, password) {
  if (!validateHalfWidthAlnum(id) || !validateHalfWidthAlnum(password)) {
    return { ok: false, message: "IDとパスワードは半角英数字のみです" };
  }

  const profile = await readPlayerProfile(id);
  if (!profile) {
    return { ok: false, notFound: true, message: "未登録IDです" };
  }

  const passwordHash = await sha256(password);
  if (profile.passwordHash !== passwordHash) {
    return { ok: false, message: "パスワードが違います" };
  }
updatePlayerAchievements(profile);
await writePlayerProfile(profile.id, profile);
  playerSession.profile = profile;
  sessionStorage.setItem(SESSION_KEY, id);

  return { ok: true, profile };
}

export async function registerPlayer({ id, password, name }) {
  if (!validateHalfWidthAlnum(id) || !validateHalfWidthAlnum(password)) {
    return { ok: false, message: "IDとパスワードは半角英数字のみです" };
  }

  const existing = await readPlayerProfile(id);
  if (existing) {
    return { ok: false, exists: true, message: "登録が確認されました。ログインしてください。" };
  }

  const passwordHash = await sha256(password);
  const profile = createProfile({
    id,
    passwordHash,
    name: name || id
  });
updatePlayerAchievements(profile);
  await writePlayerProfile(id, profile);

  playerSession.profile = profile;
  sessionStorage.setItem(SESSION_KEY, id);

  return { ok: true, profile };
}

export function logoutPlayer() {
  playerSession.profile = null;
  sessionStorage.removeItem(SESSION_KEY);
}

export async function saveCurrentPlayerProfile() {
  if (!playerSession.profile) return;
  await writePlayerProfile(playerSession.profile.id, playerSession.profile);
}

function ensureUnitStats(profile, unitId) {
  if (!profile.stats) profile.stats = createInitialStats();
  if (!profile.stats.units) profile.stats.units = {};
  if (!profile.stats.units[unitId]) {
    profile.stats.units[unitId] = {
      used: 0,
      total: { win: 0, lose: 0 },
      offline: { win: 0, lose: 0 },
      online: { win: 0, lose: 0 },
      cpu: {
        total: { win: 0, lose: 0 },
        vs: {}
      },
      vsPlayable: {},
      vsOnlinePlayer: {}
    };
  }
  return profile.stats.units[unitId];
}

function addWinLose(bucket, result) {
  if (!bucket) return;
  if (typeof bucket.win !== "number") bucket.win = 0;
  if (typeof bucket.lose !== "number") bucket.lose = 0;

  if (result === "win") bucket.win += 1;
  else bucket.lose += 1;
}

function addDefeated(profile, category, opponentUnitId) {
  if (!profile.stats.defeated) profile.stats.defeated = {};
  if (!profile.stats.defeated[category]) profile.stats.defeated[category] = {};
  profile.stats.defeated[category][opponentUnitId] =
    (profile.stats.defeated[category][opponentUnitId] || 0) + 1;
}

export async function recordBattleResult(record) {
  const profile = playerSession.profile;
  if (!profile) return { ok: false, message: "ゲスト参戦のため保存しません" };
  if (profile.role === "debug") return { ok: false, message: "デバッグアカウントの戦績は通常保存しません" };

  const {
    mode,
    playerUnitId,
    opponentUnitId,
    opponentPlayerId = "",
    opponentCategory = "playable",
    result
  } = record;

  if (!playerUnitId || !opponentUnitId || !result) {
    return { ok: false, message: "戦績保存に必要な情報が不足しています" };
  }

  const unitStats = ensureUnitStats(profile, playerUnitId);

  unitStats.used += 1;
  addWinLose(unitStats.total, result);

  if (mode === "online") {
    addWinLose(unitStats.online, result);

    if (opponentPlayerId) {
      if (!unitStats.vsOnlinePlayer[opponentPlayerId]) {
        unitStats.vsOnlinePlayer[opponentPlayerId] = { win: 0, lose: 0 };
      }
      addWinLose(unitStats.vsOnlinePlayer[opponentPlayerId], result);
    }

    if (result === "win") {
      addDefeated(profile, "onlinePlayer", opponentUnitId);
    }
  } else if (opponentCategory === "cpu" || opponentCategory === "boss") {
    addWinLose(unitStats.cpu.total, result);

    if (!unitStats.cpu.vs[opponentUnitId]) {
      unitStats.cpu.vs[opponentUnitId] = { win: 0, lose: 0 };
    }
    addWinLose(unitStats.cpu.vs[opponentUnitId], result);

    if (result === "win") {
      addDefeated(profile, opponentCategory, opponentUnitId);
    }
  } else {
    addWinLose(unitStats.offline, result);

    if (!unitStats.vsPlayable[opponentUnitId]) {
      unitStats.vsPlayable[opponentUnitId] = { win: 0, lose: 0 };
    }
    addWinLose(unitStats.vsPlayable[opponentUnitId], result);

    if (result === "win") {
      addDefeated(profile, "playable", opponentUnitId);
    }
  }

  profile.stats.battleHistory.unshift({
    date: todayYmdSlash(),
    mode,
    playerUnitId,
    opponentUnitId,
    opponentPlayerId,
    opponentCategory,
    result
  });

  profile.stats.battleHistory = profile.stats.battleHistory.slice(0, 100);
updatePlayerAchievements(profile);
  await writePlayerProfile(profile.id, profile);

  return { ok: true };
}
function ensureTwoVtwoStats(unitStats) {
  if (!unitStats.twoVtwo) {
    unitStats.twoVtwo = {
      offline: {
        total: { win: 0, lose: 0 },
        defeated: {}
      },
      cpu: {
        total: { win: 0, lose: 0 },
        defeated: {}
      },
      online: {
        total: { win: 0, lose: 0 },
        defeated: {}
      }
    };
  }

  return unitStats.twoVtwo;
}

function addTwoVtwoWin(bucket, defeatedUnitIds) {
  bucket.total.win += 1;

  defeatedUnitIds.forEach(unitId => {
    bucket.defeated[unitId] =
      (bucket.defeated[unitId] || 0) + 1;
  });
}

function addTwoVtwoLose(bucket) {
  bucket.total.lose += 1;
}

export async function record2v2BattleResult({
  modeKey,
  playerUnitIds,
  defeatedUnitIds,
  result
}) {
  const profile = playerSession.profile;

  if (!profile) return;
  if (profile.role === "debug") return;

  playerUnitIds.forEach(unitId => {
    const unitStats = ensureUnitStats(profile, unitId);

    const twoVtwo = ensureTwoVtwoStats(unitStats);

    const bucket = twoVtwo[modeKey];

    if (result === "win") {
      addTwoVtwoWin(bucket, defeatedUnitIds);
    } else {
      addTwoVtwoLose(bucket);
    }
  });
updatePlayerAchievements(profile);
  await writePlayerProfile(profile.id, profile);
}
export async function restorePlayerSession() {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return null;

  const profile = await readPlayerProfile(id);
  if (!profile) return null;
updatePlayerAchievements(profile);
await writePlayerProfile(profile.id, profile);
  playerSession.profile = profile;
  return profile;
}
