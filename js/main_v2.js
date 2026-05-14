import {
  TITLE_DEFINITIONS,
  TITLE_NAME_MAP,
  UNLOCKABLE_UNIT_MAP,
  TITLE_GROUPS,
  getTitleConditionText
} from "./js_player_titles.js";

import {
  playerSession,
  loginPlayer,
  registerPlayer,
  logoutPlayer,
  canUseTestMode,
  recordBattleResult,
  record2v2BattleResult,
  restorePlayerSession,
  saveCurrentPlayerProfile
} from "./js_player_profile.js";
import {
  createRoomId,
  writeRoom,
  readRoom,
  updateRoom,
  listenRoom,
  buildInitialRoomData,
  cleanupOldRooms
} from "./js_online_firebase.js";
import { onlineState } from "./js_online_state.js";
import { unitList, bossList, cpuList, cpuBeginnerList, debugUnitList } from "./js_units_index.js";
import {
  createBattleState,
  applyUnitDerivedState,
  getSlotByKey,
  getRandomSlotKey,
  getPredictableSlotKeys,
  getSlotNumberFromKey,
  getRollableSlotKeys,
  executeUnitSpecial,
  executeUnitCanUseSpecial,
  executeUnitResolveChoice,
  executeUnitTurnEnd,
  executeUnitBeforeSlot,
  executeUnitEnemyBeforeSlot,
  executeUnitAfterSlotResolved,
  executeUnitActionResolved,
  executeUnitOnDamaged,
  executeUnitModifyTakenDamage,
  executeUnitModifyEvadeAttempt
} from "./js_unit_runtime.js";

import {
  takeHit as resolveTakeHit,
  evadeAttack as resolveEvadeAttack
} from "./js_battle_system.js";
import { resolveSlotEffect } from "./js_slot_effects.js";
import { executeCommonSpecial } from "./js_special_actions.js";
import {
  showPopup,
  renderPlayerState,
  renderPlayerState2v2,
  renderAttackChoicesUI,
  renderPendingChoiceUI
} from "./js_ui.js";

import { create2v2Helpers } from "./js_2on2_helpers.js";
import { create2v2Actions } from "./js_2on2_actions.js";

import { createBattleFlow } from "./js_battle_flow.js";

import { createAttackResolution } from "./js_attack_resolution.js";

import { createUiController } from "./js_ui_controller.js";

import { createGameSetup } from "./js_game_setup.js";

import { createActionLayer } from "./js_action_layer.js";

const screens = {
  title: document.getElementById("title"),
  select: document.getElementById("select"),
  battle: document.getElementById("battle"),
  onlineRoom: document.getElementById("onlineRoom")
};
const startOnline1v1Btn = document.getElementById("startOnline1v1Btn");
const startOnline2v2Btn = document.getElementById("startOnline2v2Btn");
const createOnlineRoomBtn = document.getElementById("createOnlineRoomBtn");
const joinOnlineRoomBtn = document.getElementById("joinOnlineRoomBtn");
const backFromOnlineRoomBtn = document.getElementById("backFromOnlineRoomBtn");
const onlineRoomIdInput = document.getElementById("onlineRoomIdInput");
const onlineRoomStatus = document.getElementById("onlineRoomStatus");
const onlineInviteUrl = document.getElementById("onlineInviteUrl");

startOnline1v1Btn.addEventListener("click", () => {
  battleMode = "online1v1";
  showScreen("onlineRoom");
});

startOnline2v2Btn.addEventListener("click", () => {
  showPopup("オンライン2on2はオンライン1on1安定後に実装予定です");
});

createOnlineRoomBtn.addEventListener("click", async () => {
  try {await cleanupOldRooms();
    const roomId = createRoomId();

    onlineState.enabled = true;
    onlineState.roomId = roomId;
    onlineState.myPlayer = "A";
    onlineState.isHost = true;
onlineSelectEntered = false;
onlineBattleStarted = false;
    onlineRoomStatus.textContent = `部屋作成中... 部屋ID：${roomId}`;

    const initialRoomData = buildInitialRoomData({ mode: "online1v1" });
Object.assign(initialRoomData.players.A, {
  profileId: playerSession.profile?.id || null,
  profileName: playerSession.profile?.name || playerSession.profile?.id || "ゲスト",
  equippedTitles: Array.isArray(playerSession.profile?.equippedTitles)
    ? playerSession.profile.equippedTitles
    : [],
  lastSeen: Date.now()
});

await writeRoom(roomId, initialRoomData);
    const inviteUrl = `${location.origin}${location.pathname}?mode=online1v1&room=${roomId}`;

    onlineRoomStatus.textContent = `部屋を作成しました。あなたはPLAYER Aです。部屋ID：${roomId}`;
    onlineInviteUrl.textContent = inviteUrl;

    listenRoom(roomId, (roomData) => {
  if (!roomData) return;

  const playerBJoined = roomData.players?.B?.joined;

  if (playerBJoined) {
    onlineRoomStatus.textContent = `PLAYER B が参加しました。部屋ID：${roomId}`;
    enterOnlineSelect();
  } else {
    onlineRoomStatus.textContent = `PLAYER B の参加待ちです。部屋ID：${roomId}`;
  }

  applyOnlineRoomData(roomData);
});
  } catch (error) {
    console.error(error);
    onlineRoomStatus.textContent = "部屋作成に失敗しました";
    showPopup(`部屋作成エラー：${error.message}`);
  }
});

joinOnlineRoomBtn.addEventListener("click", async () => {
  await cleanupOldRooms();

  const roomId = onlineRoomIdInput.value.trim();

  if (!roomId) {
    showPopup("部屋IDを入力してください");
    return;
  }

  const snapshot = await readRoom(roomId);
  if (!snapshot.exists()) {
    showPopup("部屋が見つかりません");
    return;
  }

  onlineState.enabled = true;
  onlineState.roomId = roomId;
  onlineState.myPlayer = "B";
  onlineState.isHost = false;
onlineSelectEntered = false;
onlineBattleStarted = false;
  await updateRoom(roomId, {
  "players/B/joined": true,
  "players/B/left": false,
  "players/B/lastSeen": Date.now(),
  ...getOnlineProfilePatch("B"),
  "meta/updatedAt": Date.now()
});
  onlineRoomStatus.textContent = "部屋に参加しました。あなたはPLAYER Bです。";

  listenRoom(roomId, (roomData) => {
  if (!roomData) return;

  onlineRoomStatus.textContent = "オンライン部屋に接続中です。";
  enterOnlineSelect();
  applyOnlineRoomData(roomData);
});
});

backFromOnlineRoomBtn.addEventListener("click", () => {
  showTitle();
});


document.getElementById("start1v1Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "1v1";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});

document.getElementById("start2v2Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "2v2";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});

document.getElementById("startChallenge1v1Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "challenge1v1";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});

document.getElementById("startChallenge2v2Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "challenge2v2";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});
document.getElementById("startVsCpu1v1Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "vscpu1v1";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});

document.getElementById("startVsCpu2v2Btn").addEventListener("click", () => {
  resetOnlineStateForLocalBattle();

  battleMode = "vscpu2v2";
  teamA = null;
  teamB = null;
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  showScreen("select");
  loadUnitButtons();
});

const units = unitList;

const unitButtons = document.getElementById("unitButtons");
const playerABox = document.getElementById("playerA");
const playerBBox = document.getElementById("playerB");
const selectGuide = document.getElementById("selectGuide");
const selectedUnitsPreview = document.getElementById("selectedUnitsPreview");
const confirmSelectedUnitBtn = document.getElementById("confirmSelectedUnitBtn");
const backFromSelectBtn = document.getElementById("backFromSelectBtn");

let selectingPlayer = "A";
let selectedUnitA = null;
let selectedUnitB = null;
let pendingSelectedUnit = null;
let extraUnlockedUnits = [];

let currentTurn = 1;
let currentPlayer = "A";
let isTestMode = false;

let battleMode = "1v1";

/*
  battleMode:
  - 1v1
  - 2v2
  - challenge1v1
  - challenge2v2
  - vscpu1v1
  - vscpu2v2
  - online1v1
*/

// 2on2用チーム構造
let teamA = null;
let teamB = null;

let playerAState = null;
let playerBState = null;

let currentAttack = [];
let currentAttackContext = null;
let currentAttackContexts = [];

let battleNotice = "";
let currentActionHeader = "";
let currentActionLabel = "";
let pendingChoice = null;

let battleFlow = null;

let attackResolution = null;

let twoVtwoHelpers = null;
let twoVtwoActions = null;

let uiController = null;

let gameSetup = null;

let actionLayer = null;

function canUseDebugUnit() {
  const role = playerSession.profile?.role;
  return role === "debug" || role === "Ciel_debugger";
}

function getTitleName(titleId) {
  return TITLE_NAME_MAP[titleId] || titleId;
}

function getUnitTrophyText(profile, unitId) {
  const trophies =
    profile?.trophies?.byUnit?.[unitId] || [];

  if (!trophies.length) {
    return "";
  }

  return trophies.join("");
}

function resetOnlineStateForLocalBattle() {
  onlineState.enabled = false;
  onlineState.roomId = null;
  onlineState.myPlayer = null;
  onlineState.isHost = false;
  onlineState.lastAppliedActionId = 0;
  onlineState.isApplyingRemote = false;

  onlineBattleStarted = false;
  onlineBattleFinished = false;
  onlineSelectEntered = false;
  onlineActionSeq = 0;
  const topHud = document.getElementById("onlineTopPlayerHud");
if (topHud) topHud.style.display = "none";

const extraArea = document.getElementById("onlineBattleExtraArea");
if (extraArea) extraArea.style.display = "none";

const peaceBox = document.getElementById("onlinePeaceSurrenderBox");
if (peaceBox) peaceBox.remove();
}
function resetLocalSelectionAndBattleState() {
  selectingPlayer = "A";
  selectedUnitA = null;
  selectedUnitB = null;
  pendingSelectedUnit = null;

  teamA = null;
  teamB = null;
  playerAState = null;
  playerBState = null;

  currentTurn = 1;
  currentPlayer = "A";
  currentAttack = [];
  currentAttackContext = null;
  currentAttackContexts = [];
  battleNotice = "";
  currentActionHeader = "";
  currentActionLabel = "";
  pendingChoice = null;

  if (unitButtons) unitButtons.innerHTML = "";
  if (selectedUnitsPreview) selectedUnitsPreview.innerHTML = "";
}

function showTitle() {
  if (
  onlineState.enabled &&
  onlineState.roomId &&
  onlineState.myPlayer &&
  !onlineBattleFinished
) {
  markOnlinePlayerLeft();
}
  resetOnlineStateForLocalBattle();
  resetLocalSelectionAndBattleState();

  const popup = document.getElementById("popup");
  if (popup) {
    popup.style.display = "none";
    popup.innerHTML = "";
  }

  showScreen("title");
}
function isTeamBattleMode() {
  return battleMode === "2v2" ||
    battleMode === "challenge2v2" ||
    battleMode === "vscpu2v2";
}

function isChallengeMode() {
  return battleMode === "challenge1v1" ||
    battleMode === "challenge2v2" ||
    battleMode === "vscpu1v1" ||
    battleMode === "vscpu2v2";
}

function getPlayerState(playerKey) {
  if (isTeamBattleMode()) {
    return getActiveUnitState(playerKey);
  }

  return playerKey === "A" ? playerAState : playerBState;
}

function getOpponentPlayer(playerKey) {
  return playerKey === "A" ? "B" : "A";
}

function getTeam(playerKey) {
  return playerKey === "A" ? teamA : teamB;
}

function getActiveUnitState(playerKey) {
  const team = getTeam(playerKey);
  if (!team) return null;

  return team[team.activeUnitKey] || null;
}

function getFocusUnitState(playerKey) {
  const team = getTeam(playerKey);
  if (!team) return null;

  return team[team.focusUnitKey] || null;
}

function setActiveUnit(playerKey, unitKey) {
  const team = getTeam(playerKey);
  if (!team) return;
  if (unitKey !== "unit1" && unitKey !== "unit2") return;

  team.activeUnitKey = unitKey;
}

function getCombatTargetState(playerKey) {
  if (isTeamBattleMode()) {
    return getFocusUnitState(playerKey);
  }

  return getPlayerState(playerKey);
}

function canChangeFocus(playerKey) {
  if (!isTeamBattleMode()) return false;
  if (playerKey !== currentPlayer) return false;
  if (pendingChoice) return false;
  if (currentAttack.length > 0) return false;
  return true;
}

function setFocusUnit(playerKey, unitKey) {
  const team = getTeam(playerKey);
  if (!team) return;
  if (unitKey !== "unit1" && unitKey !== "unit2") return;

  team.focusUnitKey = unitKey;
}

function toggleTeamMode(playerKey) {
  const team = getTeam(playerKey);
  if (!team) return;

  showPopup("統合型は未実装です");
}

function setBattleNotice(text) {
  battleNotice = text || "";
}

function createTeam(unit1, unit2) {
  return {
    unit1: createBattleState(unit1),
    unit2: createBattleState(unit2),

    mode: "split", // "split" or "unified"

    activeUnitKey: "unit1",
    focusUnitKey: "unit1",

    // 統合用
    unified: {
      baseHpA: 0,
      baseHpB: 0,
      totalDamage: 0,
      healA: 0,
      healB: 0
    }
  };
}
function isUnifiedTeam(playerKey) {
  return twoVtwoHelpers.isUnifiedTeam(playerKey);
}

function getUnifiedEvade(team) {
  return twoVtwoHelpers.getUnifiedEvade(team);
}

function consumeUnifiedEvade(team, amount) {
  return twoVtwoHelpers.consumeUnifiedEvade(team, amount);
}

function withUnifiedEvadeForCheck(playerKey, actor, callback) {
  return twoVtwoHelpers.withUnifiedEvadeForCheck(playerKey, actor, callback);
}
function clearBattleNotice() {
  battleNotice = "";
}

function appendBattleNotice(text) {
  if (!text) return;

  if (!battleNotice) {
    battleNotice = text;
    return;
  }

  battleNotice += `<br>${text}`;
}

function setCurrentAction(header, label) {
  currentActionHeader = header || "";
  currentActionLabel = label || "";
}

function clearCurrentAction() {
  currentActionHeader = "";
  currentActionLabel = "";
  currentAttackContext = null;
}
function clearPendingChoice() {
  pendingChoice = null;
}



function toggleTestMode() {
  if (!canUseTestMode()) {
    showPopup("テストモードはデバッグアカウント専用です");
    return;
  }

  isTestMode = !isTestMode;
  redrawBattleBoards();
  showPopup(isTestMode ? "テストモードON" : "テストモードOFF");
}
function updateDebugButtonVisibility() {
  const btn = document.getElementById("toggleTestModeBtn");
  if (!btn) return;

  btn.style.display = canUseTestMode() ? "" : "none";
}
function updatePlayerCardUi() {
  const summary = document.getElementById("playerCardSummary");
  const loginBtn = document.getElementById("playerLoginBtn");
  const registerBtn = document.getElementById("playerRegisterBtn");
  const logoutBtn = document.getElementById("playerLogoutBtn");
  const statsBtn = document.getElementById("playerStatsBtn");

  if (!summary || !loginBtn || !registerBtn || !logoutBtn || !statsBtn) return;

  const profile = playerSession.profile;

  if (!profile) {
    summary.innerHTML = "ゲスト参戦中<br>戦績は保存されません";
    loginBtn.style.display = "";
    registerBtn.style.display = "";
    logoutBtn.style.display = "none";
    statsBtn.style.display = "none";
    return;
  }

  const titleText = Array.isArray(profile.equippedTitles) && profile.equippedTitles.length > 0
  ? profile.equippedTitles
      .map(id => `[${getTitleName(id)}]`)
      .join("")
  : "称号なし";
  summary.innerHTML = `
    ID：${profile.id}<br>
    名前：${profile.name}<br>
    登録日：${profile.registeredAt}<br>
    権限：${profile.role}<br>
    称号：${titleText}
  `;

  loginBtn.style.display = "none";
  registerBtn.style.display = "none";
  logoutBtn.style.display = "";
  statsBtn.style.display = "";
}
function getUnitNameById(unitId) {
  const allUnits = [
  ...unitList,
  ...bossList,
  ...cpuList,
  ...cpuBeginnerList,
  ...debugUnitList
];

  const unit = allUnits.find(u => u.id === unitId);
  return unit ? unit.name : unitId;
}

function formatWinLose(record) {
  const win = record?.win || 0;
  const lose = record?.lose || 0;
  const total = win + lose;
  const rate = total > 0 ? Math.round((win / total) * 100) : 0;
  return `Win ${win} Lose ${lose} 勝率${rate}%`;
}

function renderDefeatedList(defeated = {}) {
  const entries = Object.entries(defeated);

  if (entries.length === 0) {
    return `<div class="player-stats-line">記録なし</div>`;
  }

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([unitId, count]) => {
      return `
        <div class="player-stats-line">
          ${getUnitNameById(unitId)}：${count}撃破
        </div>
      `;
    })
    .join("");
}

function renderVsList(vs = {}) {
  const entries = Object.entries(vs);

  if (entries.length === 0) {
    return `<div class="player-stats-line">記録なし</div>`;
  }

  return entries
    .map(([unitId, record]) => {
      return `<div class="player-stats-line">vs ${getUnitNameById(unitId)}：${formatWinLose(record)}</div>`;
    })
    .join("");
}

function renderPlayerStatsPanel() {
  const panel = document.getElementById("playerStatsPanel");
  const content = document.getElementById("playerStatsContent");

  if (!panel || !content) return;

  const profile = playerSession.profile;
  if (!profile) {
    showPopup("ログインしていません");
    return;
  }

  const stats = profile.stats || {};
  const unitsStats = stats.units || {};
  const defeated = stats.defeated || {};

  const unitSections = Object.entries(unitsStats).map(([unitId, unitStats]) => {
    return `
      <details>
    <summary>
  ${getUnitNameById(unitId)}
  ${getUnitTrophyText(profile, unitId)}
  使用回数 ${unitStats.used || 0}
</summary>
        <div class="player-stats-line">総合：${formatWinLose(unitStats.total)}</div>
        <div class="player-stats-line">オフライン：${formatWinLose(unitStats.offline)}</div>
        <div class="player-stats-line">オンライン：${formatWinLose(unitStats.online)}</div>
        <div class="player-stats-line">CPU：${formatWinLose(unitStats.cpu?.total)}</div>

        <details>
          <summary>CPU個別戦績</summary>
          ${renderVsList(unitStats.cpu?.vs)}
        </details>

        <details>
          <summary>オフライン対プレイアブル戦績</summary>
          ${renderVsList(unitStats.vsPlayable)}
        </details>

        <details>
          <summary>オンライン対プレイヤーID戦績</summary>
          ${renderVsList(unitStats.vsOnlinePlayer)}
        </details>

        <details>
          <summary>2v2戦績</summary>
          <div class="player-stats-line">通常2v2：${formatWinLose(unitStats.twoVtwo?.offline?.total)}</div>
          ${renderDefeatedList(unitStats.twoVtwo?.offline?.defeated)}

          <div class="player-stats-line">CPU2v2：${formatWinLose(unitStats.twoVtwo?.cpu?.total)}</div>
          ${renderDefeatedList(unitStats.twoVtwo?.cpu?.defeated)}

          <div class="player-stats-line">オンライン2v2：${formatWinLose(unitStats.twoVtwo?.online?.total)}</div>
          ${renderDefeatedList(unitStats.twoVtwo?.online?.defeated)}
        </details>
      </details>
    `;
  }).join("");

  content.innerHTML = `
    <div class="player-stats-line">ID：${profile.id}</div>
    <div class="player-stats-line">名前：${profile.name}</div>
    <div class="player-stats-line">登録日：${profile.registeredAt}</div>

    <details open>
      <summary>機体別使用戦績</summary>
      ${unitSections || `<div class="player-stats-line">まだ戦績がありません</div>`}
    </details>

    <details>
      <summary>総合CPU撃破数</summary>
      ${renderDefeatedList(defeated.cpu)}
    </details>

    <details>
      <summary>総合プレイアブル撃破数</summary>
      ${renderDefeatedList(defeated.playable)}
    </details>

    <details>
      <summary>総合ボス撃破数</summary>
      ${renderDefeatedList(defeated.boss)}
    </details>

    <details>
      <summary>総合オンライン撃破数</summary>
      ${renderDefeatedList(defeated.onlinePlayer)}
    </details>

    <button id="openTitleCustomizeBtn">称号・トロフィーカスタム</button>
  `;
document.getElementById("openTitleCustomizeBtn")?.addEventListener("click", renderTitleCustomizePanel);
  panel.style.display = "";
}

function getUnlockedTitleMap(profile) {
  return profile?.titles?.unlocked || {};
}

function renderTitleButtons(titleIds, profile, { hideLocked = false, clickable = true } = {}) {
  const unlocked = getUnlockedTitleMap(profile);

  return titleIds.map(titleId => {
    const isUnlocked = !!unlocked[titleId];
    if (hideLocked && !isUnlocked) return "";

    const label = isUnlocked ? getTitleName(titleId) : "？？？";
    const disabled = clickable && isUnlocked ? "" : "disabled";

    return `
      <button class="title-chip" data-title-id="${titleId}" ${disabled}>
        [${label}]
      </button>
    `;
  }).join("");
}
async function savePlayerCustomizeState() {
  if (!playerSession.profile) return;

  try {
    await saveCurrentPlayerProfile();
    updatePlayerCardUi();
  } catch (error) {
    console.error(error);
    showPopup("保存に失敗しました");
  }
}
function renderTitleCustomizePanel() {
  const profile = playerSession.profile;
  if (!profile) {
    showPopup("ログインしていません");
    return;
  }

  const panel = document.getElementById("playerStatsPanel");
  const content = document.getElementById("playerStatsContent");
  if (!panel || !content) return;

  const unlocked = Object.keys(getUnlockedTitleMap(profile));
  const equipped = Array.isArray(profile.equippedTitles)
    ? profile.equippedTitles
    : [];

  content.innerHTML = `
    <h3>称号カスタム</h3>
    <div class="player-stats-line">装備中：最大10個</div>

    <div class="title-equipped-area">
      ${equipped.length
        ? equipped.map(id => `
            <button class="title-chip equipped-title" data-title-id="${id}">
              [${getTitleName(id)}] ✕
            </button>
          `).join("")
        : `<div class="player-stats-line">称号なし</div>`
      }
    </div>

    <h4>取得済み称号</h4>
    <div class="title-list-area">
      ${unlocked.map(id => `
        <button class="title-chip owned-title" data-title-id="${id}">
          [${getTitleName(id)}]
        </button>
      `).join("")}
    </div>

    <button id="openTitleListBtn">称号一覧</button>
    <button id="openTrophyCustomizeBtn">トロフィーカスタム</button>
    <button id="backToStatsBtn">戦績に戻る</button>
  `;

  content.querySelectorAll(".owned-title").forEach(btn => {
  btn.addEventListener("click", async () => {
    const titleId = btn.dataset.titleId;
    if (!titleId) return;

    if (!profile.equippedTitles) profile.equippedTitles = [];

    if (profile.equippedTitles.includes(titleId)) {
      return;
    }

    if (profile.equippedTitles.length >= 10) {
      showPopup("装備できる称号は10個までです");
      return;
    }

    profile.equippedTitles.push(titleId);

    await savePlayerCustomizeState();
    renderTitleCustomizePanel();
  });
});

  content.querySelectorAll(".equipped-title").forEach(btn => {
  btn.addEventListener("click", async () => {
    const titleId = btn.dataset.titleId;

    profile.equippedTitles = profile.equippedTitles.filter(id => id !== titleId);

    await savePlayerCustomizeState();
    renderTitleCustomizePanel();
  });
});

  document.getElementById("openTitleListBtn")?.addEventListener("click", renderTitleListPanel);
  document.getElementById("openTrophyCustomizeBtn")?.addEventListener("click", renderTrophyCustomizePanel);
  document.getElementById("backToStatsBtn")?.addEventListener("click", renderPlayerStatsPanel);

  updatePlayerCardUi();
  panel.style.display = "";
}
function renderTitleListPanel() {
  const profile = playerSession.profile;
  if (!profile) return;

  const panel = document.getElementById("playerStatsPanel");
  const content = document.getElementById("playerStatsContent");
  if (!panel || !content) return;

  content.innerHTML = `
    <h3>称号一覧</h3>

    ${TITLE_GROUPS.map(group => `
      <details>
        <summary>${group.label}</summary>
        <div class="title-list-area">
          ${renderTitleButtons(group.titleIds, profile, { clickable: true })}
        </div>
      </details>
    `).join("")}

    <button id="backToTitleCustomizeBtn">称号カスタムに戻る</button>
  `;

  content.querySelectorAll(".title-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const titleId = btn.dataset.titleId;
      if (!titleId) return;

      const unlocked = getUnlockedTitleMap(profile);
      if (!unlocked[titleId]) return;

      showPopup(getTitleConditionText(titleId));
    });
  });

  document.getElementById("backToTitleCustomizeBtn")?.addEventListener("click", renderTitleCustomizePanel);

  panel.style.display = "";
}

function renderTrophyCustomizePanel() {
  const profile = playerSession.profile;
  if (!profile) return;

  const panel = document.getElementById("playerStatsPanel");
  const content = document.getElementById("playerStatsContent");
  if (!panel || !content) return;

  const unitStats = profile.stats?.units || {};
  const trophiesByUnit = profile.trophies?.byUnit || {};

  const unitSections = Object.keys(unitStats).map(unitId => {
    const trophies = trophiesByUnit[unitId] || [];

    return `
      <details>
        <summary>${getUnitNameById(unitId)} ${trophies.join("")}</summary>
        <div class="trophy-button-area">
          ${["D", "EX"].map(trophyId => {
            const owned = trophies.includes(trophyId);
            return `
              <button class="trophy-toggle-btn" data-unit-id="${unitId}" data-trophy-id="${trophyId}">
                ${owned ? `[${trophyId}] ON` : `[${trophyId}] OFF`}
              </button>
            `;
          }).join("")}
          <button class="trophy-clear-btn" data-unit-id="${unitId}">
            全部外す
          </button>
        </div>
      </details>
    `;
  }).join("");

  content.innerHTML = `
    <h3>トロフィーカスタム</h3>
    <div class="player-stats-line">ボタンを押すと付け外しできます</div>

    ${unitSections || `<div class="player-stats-line">トロフィー対象の戦績がありません</div>`}

    <button id="backToTitleCustomizeBtn">称号カスタムに戻る</button>
  `;

  content.querySelectorAll(".trophy-toggle-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const unitId = btn.dataset.unitId;
    const trophyId = btn.dataset.trophyId;

    if (!unitId || !trophyId) return;

    if (!profile.trophies) profile.trophies = {};
    if (!profile.trophies.byUnit) profile.trophies.byUnit = {};
    if (!profile.trophies.byUnit[unitId]) profile.trophies.byUnit[unitId] = [];

    const trophies = profile.trophies.byUnit[unitId];

    if (trophies.includes(trophyId)) {
      profile.trophies.byUnit[unitId] = trophies.filter(id => id !== trophyId);
    } else {
      trophies.push(trophyId);
    }

    await savePlayerCustomizeState();
    renderTrophyCustomizePanel();
  });
});

  content.querySelectorAll(".trophy-clear-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const unitId = btn.dataset.unitId;
    if (!unitId) return;

    if (!profile.trophies) profile.trophies = {};
    if (!profile.trophies.byUnit) profile.trophies.byUnit = {};

    profile.trophies.byUnit[unitId] = [];

    await savePlayerCustomizeState();
    renderTrophyCustomizePanel();
  });
});

  document.getElementById("backToTitleCustomizeBtn")?.addEventListener("click", renderTitleCustomizePanel);

  panel.style.display = "";
}
function canExecuteSpecialForPlayer(playerKey, special) {
  if (!special || special.actionType === "auto") {
    return false;
  }

  if (pendingChoice) {
    return false;
  }

  const timing = special.timing || "self";
if (
  special.effectType === "jegan_request_arms" &&
  currentAttack.length > 0 &&
  playerKey !== currentPlayer
) {
  const actor = getPlayerState(playerKey);
  if (!actor) return false;

  const availability = executeUnitCanUseSpecial(actor, special.key, {
    ownerPlayer: playerKey,
    enemyPlayer: getOpponentPlayer(playerKey),
    currentAttackContext,
    currentAttack
  });

  return availability.allowed !== false;
}
  let timingAllowed = false;

  if (timing === "self") {
    timingAllowed = playerKey === currentPlayer && currentAttack.length === 0;
  } else if (timing === "reaction") {
    timingAllowed = playerKey !== currentPlayer && currentAttack.length > 0;
  } else if (timing === "attack") {
    timingAllowed = playerKey === currentPlayer && currentAttack.length > 0;
  }

  if (!timingAllowed) {
    return false;
  }

  const actor = getPlayerState(playerKey);
  if (!actor) return false;

  const availability = withUnifiedEvadeForCheck(playerKey, actor, () =>
    executeUnitCanUseSpecial(actor, special.key, {
      ownerPlayer: playerKey,
      enemyPlayer: getOpponentPlayer(playerKey),
      currentAttackContext,
      currentAttack
    })
  );

  return availability.allowed !== false;
}

function loadUnitButtons() {
  return gameSetup.loadUnitButtons();
}

function updateSelectUi() {
  return gameSetup.updateSelectUi();
}

function showScreen(screenId) {
  return uiController.showScreen(screenId);
}

function renderAttackLogText(message) {
  return uiController.renderAttackLogText(message);
}

function renderPendingChoice() {
  return uiController.renderPendingChoice();
}

function updateBattleCenterUi() {
  return uiController.updateBattleCenterUi();
}

function redrawBattleBoards() {
  return uiController.redrawBattleBoards();
}

function getPlayerStateRaw(playerKey) {
  return playerKey === "A" ? playerAState : playerBState;
}

function build1v1RenderHandlers(playerKey) {
  return {
    onSlotClick: (slot) => showPopup(slot.desc),
    onSpecialDesc: (special) => showPopup(special.desc),
    onSpecialExec: (specialKey) => executeSpecial(playerKey, specialKey),
    canExecuteSpecial: (special) => canExecuteSpecialForPlayer(playerKey, special)
  };
}

function build2v2RenderHandlers(playerKey) {
  const isBossSide = isChallengeMode() && playerKey === "B";

  return {
    currentPlayer,
    playerKey,
    canChangeFocus: isBossSide ? false : canChangeFocus(playerKey),
    onToggleTeamMode: () => toggleTeamMode(playerKey),
    onSwitchActiveUnit: (unitKey) => {
      const team = getTeam(playerKey);
      if (!team || !team[unitKey]) return;

      setActiveUnit(playerKey, unitKey);
      redrawBattleBoards();
    },
    onSwitchFocusUnit: (unitKey) => {
      const team = getTeam(playerKey);
      if (!team || !team[unitKey]) return;

      if (!canChangeFocus(playerKey)) {
        showPopup("フォーカス変更は自分ターン中、かつQTE中でない時のみ可能");
        return;
      }

      setFocusUnit(playerKey, unitKey);
      redrawBattleBoards();
    },
    onSlotClick: (slot) => showPopup(slot.desc),
    onSpecialDesc: (special) => showPopup(special.desc),
    onSpecialExec: (specialKey) => executeSpecial(playerKey, specialKey),
    canExecuteSpecial: (special) => canExecuteSpecialForPlayer(playerKey, special)
  };
}

function handleChoiceRequest(requestChoice) {
  if (!requestChoice) return;

  pendingChoice = {
    ...requestChoice
  };

  redrawBattleBoards();
  renderPendingChoice();
}
function shouldCpuUseEvade(defender) {
  if (!defender) return false;
  if (defender.evade <= 0) return false;

  const evadeMax = Math.max(1, defender.evadeMax || 1);
  const rate = defender.evade / evadeMax;

  return Math.random() < rate;
}

function autoResolveBossQteIfNeeded() {
  if (!isChallengeMode()) return false;

  const context = currentAttackContext;
  if (!context) return false;

  if (context.ownerPlayer !== "A") return false;
  if (context.enemyPlayer !== "B") return false;
  if (!currentAttack || currentAttack.length === 0) return false;

  const attacker = getPlayerState("A");
  const defender = getCombatTargetState("B");
  if (!attacker || !defender) return false;

  const damageBySource = new Map();
  let totalDamage = 0;
  let hitCount = 0;

  while (currentAttack.length > 0) {
  const attack = currentAttack[0];
  const sourceLabel =
    attack?.sourceLabel || `${attacker.name} ${context.slotNumber}.${context.slotLabel}`;
  const baseDamage = attack ? attack.damage : 0;

  // まずCPU側の特殊回避判定を試す
  const customEvade = executeUnitModifyEvadeAttempt(
    defender,
    attacker,
    attack,
    {
      attacker,
      defender,
      currentAttack,
      attackIndex: 0,
      currentAttackContext: context,
      isCpuAutoResolve: true
    }
  );

  if (customEvade && customEvade.handled) {
    if (customEvade.ok) {
      defender.evade -= customEvade.consumeEvade || 0;
      currentAttack.splice(0, 1);
      context.evadeCount++;

      if (customEvade.message) {
        appendBattleNotice(customEvade.message);
      }

      continue;
    }
  } else {
// 通常回避を試す
if (shouldCpuUseEvade(defender)) {
  const evadeResult = resolveEvadeAttack({
    defender,
    currentAttack,
    attackIndex: 0
  });

  if (evadeResult.ok) {
    context.evadeCount++;
    continue;
  }
}
  }

  // 回避できなければ被弾
  const hitResult = resolveTakeHit({
    attacker,
    defender,
    currentAttack,
    attackIndex: 0,
    modifyTakenDamage: (d, a, atk, dmg) =>
      executeUnitModifyTakenDamage(d, a, atk, dmg)
  });

  if (!hitResult || !hitResult.cancelled) {
    const finalDamage =
      typeof hitResult?.finalDamage === "number"
        ? hitResult.finalDamage
        : baseDamage;

    totalDamage += finalDamage;
    hitCount++;

    damageBySource.set(
      sourceLabel,
      (damageBySource.get(sourceLabel) || 0) + finalDamage
    );

    if (hitResult?.damageMessage) {
      appendBattleNotice(hitResult.damageMessage);
    }

    const damagedResult = executeUnitOnDamaged(defender, attacker);
    if (damagedResult.message) {
      appendBattleNotice(damagedResult.message);
    }
  }
}

  context.hitCount += hitCount;

  finishCurrentAttackResolution();

if (checkBattleEnd()) {
    return true;
  }

  const detailLines = [...damageBySource.entries()].map(
    ([label, damage]) => `${label}<br>→ ${damage}ダメージ`
  );

  renderAttackLogText(
    `${currentActionHeader}<br>` +
    `${detailLines.join("<br>")}<br>` +
    `合計${totalDamage}ダメージを与えた。`
  );

  return true;
}

function isUnitDefeated(unit) {
  return !unit || unit.hp <= 0;
}

function isSideDefeated(playerKey) {
  if (isTeamBattleMode()) {
    const team = getTeam(playerKey);
    if (!team) return true;

    const unit1Dead = isUnitDefeated(team.unit1);
    const unit2Dead = team.unit2 ? isUnitDefeated(team.unit2) : true;

    return unit1Dead && unit2Dead;
  }

  return isUnitDefeated(getPlayerStateRaw(playerKey));
}
function getOpponentCategoryByMode() {
  if (battleMode === "vscpu1v1" || battleMode === "vscpu2v2") return "cpu";
  if (battleMode === "challenge1v1" || battleMode === "challenge2v2") return "boss";
  return "playable";
}

function getBattleRecordMode() {
  if (onlineState.enabled) return "online";
  return "offline";
}

async function saveBattleResultForCurrentPlayer(winnerPlayer) {
  if (isTeamBattleMode()) {
    if (battleMode === "challenge2v2") {
      return;
    }

    const playerSide =
      onlineState.enabled ? onlineState.myPlayer : "A";

    const opponentSide =
      playerSide === "A" ? "B" : "A";

    const playerTeam = getTeam(playerSide);
    const opponentTeam = getTeam(opponentSide);

    if (!playerTeam || !opponentTeam) {
      return;
    }

    const playerUnitIds = [
      playerTeam.unit1?.unitId,
      playerTeam.unit2?.unitId
    ].filter(Boolean);

    const defeatedUnitIds = [
      opponentTeam.unit1?.unitId,
      opponentTeam.unit2?.unitId
    ].filter(Boolean);

    const result =
      winnerPlayer === playerSide
        ? "win"
        : "lose";

    await record2v2BattleResult({
      modeKey: get2v2StatsModeKey(),
      playerUnitIds,
      defeatedUnitIds,
      result
    });

    return;
  }
  if (!playerSession.profile) return;
  if (isTestMode) return;

  const playerSide = onlineState.enabled ? onlineState.myPlayer : "A";
  if (playerSide !== "A" && playerSide !== "B") return;

  const opponentSide = playerSide === "A" ? "B" : "A";
  const playerState = getPlayerStateRaw(playerSide);
  const opponentState = getPlayerStateRaw(opponentSide);

  if (!playerState || !opponentState) return;

  await recordBattleResult({
    mode: getBattleRecordMode(),
    playerUnitId: playerState.unitId,
    opponentUnitId: opponentState.unitId,
    opponentPlayerId: "",
    opponentCategory: getOpponentCategoryByMode(),
    result: winnerPlayer === playerSide ? "win" : "lose"
  });
}
function get2v2StatsModeKey() {
  if (battleMode === "vscpu2v2") {
    return "cpu";
  }

  if (battleMode === "online2v2") {
    return "online";
  }

  return "offline";
}
async function finishBattle(winnerPlayer) {
  if (onlineBattleFinished) return;
  onlineBattleFinished = true;

  publishOnlineBattleEnd(winnerPlayer);
await saveBattleResultForCurrentPlayer(winnerPlayer);
  const popup = document.getElementById("popup");
  if (!popup) return;

  popup.innerHTML = "";

  const message = document.createElement("div");
  message.innerHTML = `
    PLAYER ${winnerPlayer} の勝利！
    <br><br>
  `;

  const button = document.createElement("button");
  button.textContent = "タイトルへ戻る";

  button.addEventListener("click", () => {
    popup.style.display = "none";
    popup.innerHTML = "";

    currentAttack = [];
    currentAttackContext = null;
    currentAttackContexts = [];
    pendingChoice = null;
    battleNotice = "";
    currentActionHeader = "";
    currentActionLabel = "";

    teamA = null;
    teamB = null;
    playerAState = null;
    playerBState = null;
    selectedUnitA = null;
    selectedUnitB = null;
    selectingPlayer = "A";
    currentTurn = 1;
    currentPlayer = "A";

    onlineState.enabled = false;
    onlineState.roomId = null;
    onlineState.myPlayer = null;
    onlineState.isHost = false;
    onlineState.lastAppliedActionId = 0;
    onlineState.isApplyingRemote = false;

    onlineBattleStarted = false;
    onlineBattleFinished = false;
    onlineSelectEntered = false;
    onlineActionSeq = 0;

    showTitle();
  });

  popup.appendChild(message);
  popup.appendChild(button);
  popup.style.display = "block";
}

function checkBattleEnd() {
  if (isSideDefeated("A")) {
    finishBattle("B");
    return true;
  }

  if (isSideDefeated("B")) {
    finishBattle("A");
    return true;
  }

  return false;
}

function renderAttackChoices() {
  if (autoResolveBossQteIfNeeded()) {
    clearBattleNotice();
    return;
  }

  renderAttackChoicesUI({
    currentAttack,
    battleNotice,
    currentActionHeader,
    currentActionLabel,
    onHit: (index) => takeHit(index),
    onEvade: (index) => evadeAttack(index),
    onSupportDefense: (index) => supportDefenseAttack(index),
    canSupportDefense: isTeamBattleMode()
  });

  clearBattleNotice();
}
function canOperateQteDefender() {
  if (!onlineState.enabled) return true;

  const context = currentAttackContext;
  if (!context) return false;

  return context.enemyPlayer === onlineState.myPlayer;
}

function takeHit(i) {
  if (!canOperateQteDefender()) {
    showPopup("防御側プレイヤーのみ操作できます");
    return;
  }

  const result = attackResolution.takeHit(i);
  checkBattleEnd();

  publishOnlineQteAction("hit", i);

  return result;
}

function evadeAttack(i) {
  if (!canOperateQteDefender()) {
    showPopup("防御側プレイヤーのみ操作できます");
    return;
  }

  const result = attackResolution.evadeAttack(i);

  publishOnlineQteAction("evade", i);

  return result;
}

function supportDefenseAttack(i) {
  if (!canOperateQteDefender()) {
    showPopup("防御側プレイヤーのみ操作できます");
    return;
  }

  const result = attackResolution.supportDefenseAttack(i);
  checkBattleEnd();

  publishOnlineQteAction("supportDefense", i);

  return result;
}
function finishCurrentAttackResolution() {
  return attackResolution.finishCurrentAttackResolution();
}

function startSlotAction(ownerPlayer, slotKey, slotOverride = null) {
  return actionLayer.startSlotAction(ownerPlayer, slotKey, slotOverride);
}

function runAfterSlotResolvedHook(actor, slotNumber, resolveResult, slotMeta = {}) {
  return actionLayer.runAfterSlotResolvedHook(actor, slotNumber, resolveResult, slotMeta);
}

function resolveSlot(slot, slotMeta = {}) {
  return actionLayer.resolveSlot(slot, slotMeta);
}

function executeSpecial(ownerPlayer, specialKey) {
  if (onlineState.enabled && ownerPlayer !== onlineState.myPlayer) {
    showPopup("相手側の特殊行動は操作できません");
    return;
  }

  const result = actionLayer.executeSpecial(ownerPlayer, specialKey);

  publishOnlineSpecialAction(ownerPlayer, specialKey);

  return result;
}

function resolvePendingChoice(selectedValue) {
  const choice = pendingChoice;

  if (onlineState.enabled && choice) {
    const ownerPlayer = choice.ownerPlayer;

    if (ownerPlayer !== onlineState.myPlayer) {
      showPopup("選択権のあるプレイヤーのみ操作できます");
      return;
    }
  }

  publishOnlineChoiceAction(choice, selectedValue);

  return actionLayer.resolvePendingChoice(selectedValue);
}

  
function executeNextQueuedSlot() {
  return actionLayer.executeNextQueuedSlot();
}
function reserveAction(state, action) {
    return actionLayer.reserveAction(state, action);
  }

  function processReservedActionsForTrigger(ownerPlayer, trigger) {
    return actionLayer.processReservedActionsForTrigger(ownerPlayer, trigger);
  }
function getPendingChoice() {
  return pendingChoice;
}

function getCurrentAttack() {
  return currentAttack;
}

function getCurrentAttackContext() {
  return currentAttackContext;
}

function getCurrentAttackContexts() {
  return currentAttackContexts;
}

function setCurrentAttack(value) {
  currentAttack = value;
}

function setCurrentAttackContext(value) {
  currentAttackContext = value;
}

function setCurrentAttackContexts(value) {
  currentAttackContexts = value;
}

function ensureActionState(state) {
  return battleFlow.ensureActionState(state);
}

function resetActionCount(state) {
  return battleFlow.resetActionCount(state);
}

function canConsumeAction(state, amount = 1) {
  return battleFlow.canConsumeAction(state, amount);
}

function consumeActionCount(state, amount = 1) {
  return battleFlow.consumeActionCount(state, amount);
}

function clampEvadeToMax(state) {
  return battleFlow.clampEvadeToMax(state);
}

function executeSlot() {
  if (!canOperateOnlinePlayer()) {
    showPopup("相手のターンです");
    return;
  }

  return battleFlow.executeSlot();
}

function simulateSlot() {
  return battleFlow.simulateSlot();
}

function endTurn() {
  if (!canOperateOnlinePlayer()) {
    showPopup("相手のターンです");
    return;
  }

  const beforePlayer = currentPlayer;

  const result = battleFlow.endTurn();

if (onlineState.enabled && beforePlayer !== currentPlayer) {
  publishOnlineEndTurnAction(beforePlayer);
}

  return result;
}
  
function bootOnlineFromUrl() {
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const roomId = params.get("room");

  if (mode !== "online1v1" || !roomId) return;

  battleMode = "online1v1";
  showScreen("onlineRoom");

  if (onlineRoomIdInput) {
    onlineRoomIdInput.value = roomId;
  }

  if (onlineRoomStatus) {
    onlineRoomStatus.textContent = "招待URLから部屋IDを読み込みました。「部屋に入る」を押してください。";
  }
}

let onlineBattleStarted = false;
let onlineBattleFinished = false;
let onlineActionSeq = 0;
let onlineSelectEntered = false;
function getUnitById(unitId) {
  const allUnits = [
  ...unitList,
  ...bossList,
  ...cpuList,
  ...cpuBeginnerList,
  ...debugUnitList
];

  return allUnits.find(unit => unit.id === unitId) || null;
}
function syncExtraUnlockedUnitsFromProfile() {
  if (!playerSession.profile?.unlocks) {
    extraUnlockedUnits = [];
  } else {
    extraUnlockedUnits = Object.entries(playerSession.profile.unlocks)
      .filter(([, unlocked]) => unlocked)
      .map(([unlockKey]) => UNLOCKABLE_UNIT_MAP[unlockKey])
      .filter(Boolean)
      .map(unitId => getUnitById(unitId))
      .filter(Boolean);
  }


}
function getOnlineProfilePatch(playerKey) {
  const profile = playerSession.profile;

  if (!profile) {
    return {
      [`players/${playerKey}/profileId`]: null,
      [`players/${playerKey}/profileName`]: "ゲスト",
      [`players/${playerKey}/equippedTitles`]: []
    };
  }

  return {
    [`players/${playerKey}/profileId`]: profile.id || null,
    [`players/${playerKey}/profileName`]: profile.name || profile.id || "名無し",
    [`players/${playerKey}/equippedTitles`]: Array.isArray(profile.equippedTitles)
      ? profile.equippedTitles
      : []
  };
}

function getOnlineTitleText(playerData) {
  const titleIds = Array.isArray(playerData?.equippedTitles)
    ? playerData.equippedTitles
    : [];

  if (titleIds.length === 0) {
    return "称号なし";
  }

  return titleIds.map(id => `[${getTitleName(id)}]`).join("");
}

function ensureOnlineBattleExtraUi() {
  ensureOnlineTopPlayerHud();

  if (!document.getElementById("onlineBattleExtraArea")) {
    const area = document.createElement("div");
    area.id = "onlineBattleExtraArea";
    area.style.margin = "12px 0";
    area.style.padding = "8px";
    area.style.borderTop = "2px solid #fff";
    area.style.borderBottom = "2px solid #fff";
    area.style.display = onlineState.enabled ? "" : "none";

    area.innerHTML = `
      <div id="onlinePeaceStatusArea" style="font-size:14px;margin-bottom:8px;"></div>
      <div id="onlineChatFixedArea" style="text-align:left;margin-bottom:8px;">
        <div id="onlineChatA">[PLAYER Aチャット]</div>
        <div id="onlineChatB">[PLAYER Bチャット]</div>
      </div>
    `;

    const attackLog = document.getElementById("attackLog");
    if (attackLog?.parentNode) {
      attackLog.parentNode.insertBefore(area, attackLog);
    }
  }

  ensureOnlineCenterButtons();
}
function ensureOnlineTopPlayerHud() {
  if (document.getElementById("onlineTopPlayerHud")) {
    return;
  }

  const battleScreen = document.getElementById("battle");
  if (!battleScreen) return;

  const hud = document.createElement("div");
  hud.id = "onlineTopPlayerHud";
  hud.style.display = onlineState.enabled ? "grid" : "none";
  hud.style.gridTemplateColumns = "1fr 120px 1fr";
  hud.style.gap = "8px";
  hud.style.alignItems = "start";
  hud.style.margin = "0 0 8px 0";

  hud.innerHTML = `
    <div id="onlineTopPlayerA" style="text-align:center;">
      <div style="display:flex;gap:4px;justify-content:center;align-items:center;">
        <input id="onlineChatInputA" maxlength="50" placeholder="50文字まで" style="width:150px;max-width:70%;">
        <button id="onlineChatSendBtnA">送信</button>
      </div>
      <div id="onlinePlayerInfoA" style="font-size:14px;margin-top:4px;line-height:1.4;"></div>
    </div>

    <div></div>

    <div id="onlineTopPlayerB" style="text-align:center;">
      <div style="display:flex;gap:4px;justify-content:center;align-items:center;">
        <input id="onlineChatInputB" maxlength="50" placeholder="50文字まで" style="width:150px;max-width:70%;">
        <button id="onlineChatSendBtnB">送信</button>
      </div>
      <div id="onlinePlayerInfoB" style="font-size:14px;margin-top:4px;line-height:1.4;"></div>
    </div>
  `;

  const title = battleScreen.querySelector("h2") || battleScreen.firstElementChild;
  if (title?.nextSibling) {
    battleScreen.insertBefore(hud, title.nextSibling);
  } else {
    battleScreen.prepend(hud);
  }

  document.getElementById("onlineChatSendBtnA")?.addEventListener("click", () => sendOnlineChatFrom("A"));
  document.getElementById("onlineChatSendBtnB")?.addEventListener("click", () => sendOnlineChatFrom("B"));
}

function ensureOnlineCenterButtons() {
  if (!onlineState.enabled) return;
  if (document.getElementById("onlinePeaceSurrenderBox")) return;

  const actionCounterValue = document.getElementById("actionCounterValue");
  const actionBox = actionCounterValue?.parentNode;
  if (!actionBox?.parentNode) return;

  const wrap = document.createElement("div");
  wrap.id = "onlinePeaceSurrenderBox";
  wrap.style.marginTop = "8px";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.gap = "6px";

  wrap.innerHTML = `
    <button id="onlinePeaceBtn" style="width:64px;">和平</button>
    <button id="onlineSurrenderBtn" style="width:64px;">降伏</button>
  `;

  actionBox.parentNode.appendChild(wrap);

  document.getElementById("onlinePeaceBtn")?.addEventListener("click", requestOnlinePeace);
  document.getElementById("onlineSurrenderBtn")?.addEventListener("click", requestOnlineSurrender);
}
async function sendOnlineChatFrom(playerKey) {
  if (!onlineState.enabled || !onlineState.roomId || !onlineState.myPlayer) return;

  if (playerKey !== onlineState.myPlayer) {
    showPopup("自分側のチャット欄だけ送信できます");
    return;
  }

  const input = document.getElementById(`onlineChatInput${playerKey}`);
  const text = String(input?.value || "").trim().slice(0, 50);

  await updateRoom(onlineState.roomId, {
    [`chat/${playerKey}/text`]: text,
    [`chat/${playerKey}/updatedAt`]: Date.now(),
    [`players/${playerKey}/lastSeen`]: Date.now(),
    "meta/updatedAt": Date.now()
  });

  if (input) {
    input.value = "";
  }
}
function renderOnlineExtraUi(roomData) {
  ensureOnlineBattleExtraUi();

  const area = document.getElementById("onlineBattleExtraArea");
  if (area) {
    area.style.display = onlineState.enabled ? "" : "none";
  }

  if (!onlineState.enabled || !roomData) return;

  const playerA = roomData.players?.A || {};
  const playerB = roomData.players?.B || {};
  const chatA = roomData.chat?.A?.text || "";
  const chatB = roomData.chat?.B?.text || "";

  const topHud = document.getElementById("onlineTopPlayerHud");
if (topHud) {
  topHud.style.display = onlineState.enabled ? "grid" : "none";
}

const inputA = document.getElementById("onlineChatInputA");
const inputB = document.getElementById("onlineChatInputB");
const sendA = document.getElementById("onlineChatSendBtnA");
const sendB = document.getElementById("onlineChatSendBtnB");

if (inputA) inputA.disabled = onlineState.myPlayer !== "A";
if (inputB) inputB.disabled = onlineState.myPlayer !== "B";
if (sendA) sendA.disabled = onlineState.myPlayer !== "A";
if (sendB) sendB.disabled = onlineState.myPlayer !== "B";

const infoA = document.getElementById("onlinePlayerInfoA");
const infoB = document.getElementById("onlinePlayerInfoB");

if (infoA) {
  infoA.innerHTML = `
    <div>${getOnlineTitleText(playerA)}</div>
    <div>${playerA.profileName || "ゲスト"}</div>
  `;
}

if (infoB) {
  infoB.innerHTML = `
    <div>${getOnlineTitleText(playerB)}</div>
    <div>${playerB.profileName || "ゲスト"}</div>
  `;
}

  const chatADiv = document.getElementById("onlineChatA");
  const chatBDiv = document.getElementById("onlineChatB");

  if (chatADiv) {
    chatADiv.textContent = `[PLAYER Aチャット] ${chatA}`;
  }

  if (chatBDiv) {
    chatBDiv.textContent = `[PLAYER Bチャット] ${chatB}`;
  }

  const peaceArea = document.getElementById("onlinePeaceStatusArea");
  if (peaceArea) {
    const peace = roomData.peace || {};
    if (peace.status === "requested") {
      peaceArea.textContent = `和平交渉中：PLAYER ${peace.requestedBy}`;
    } else if (peace.status === "accepted") {
      peaceArea.textContent = "和平成立";
    } else if (peace.status === "rejected") {
      peaceArea.textContent = "和平拒否";
    } else {
      peaceArea.textContent = "";
    }
  }
}

async function requestOnlinePeace() {
  if (!onlineState.enabled || !onlineState.roomId) return;

  const ok = confirm("和平交渉しますか？");
  if (!ok) return;

  await updateRoom(onlineState.roomId, {
    "peace/requestedBy": onlineState.myPlayer,
    "peace/status": "requested",
    "peace/updatedAt": Date.now(),
    "meta/notice": `PLAYER ${onlineState.myPlayer} が和平交渉を申し込みました`,
    "meta/updatedAt": Date.now()
  });

  showPopup("相手に和平交渉中です");
}

async function respondOnlinePeace(accept) {
  if (!onlineState.enabled || !onlineState.roomId) return;

  if (accept) {
    await updateRoom(onlineState.roomId, {
      "peace/status": "accepted",
      "peace/updatedAt": Date.now(),
      "meta/status": "peace",
      "meta/result": {
        type: "peace",
        winner: null,
        loser: null,
        reason: "peace",
        finishedAt: Date.now()
      },
      "meta/notice": "和平成立しました",
      "meta/updatedAt": Date.now()
    });
    showOnlinePeaceFinishedPopup();
    return;
  }

  await updateRoom(onlineState.roomId, {
    "peace/status": "rejected",
    "peace/updatedAt": Date.now(),
    "meta/notice": `PLAYER ${onlineState.myPlayer} が和平を拒否しました`,
    "meta/updatedAt": Date.now()
  });

  showPopup("和平を拒否しました");
}

function showOnlinePeaceRequestPopup(requester) {
  const popup = document.getElementById("popup");
  if (!popup) return;

  popup.innerHTML = "";

  const msg = document.createElement("div");
  msg.innerHTML = `
    <div>和平交渉が来ました。</div>
    <div>和平するとこの戦闘の戦績はなかったことになります。</div>
  `;

  const yes = document.createElement("button");
  yes.textContent = "和平する";
  yes.addEventListener("click", () => {
    popup.style.display = "none";
    respondOnlinePeace(true);
  });

  const no = document.createElement("button");
  no.textContent = "和平しない";
  no.addEventListener("click", () => {
    popup.style.display = "none";
    respondOnlinePeace(false);
  });

  popup.appendChild(msg);
  popup.appendChild(yes);
  popup.appendChild(no);
  popup.style.display = "block";
}

function showOnlinePeaceFinishedPopup() {
  const popup = document.getElementById("popup");
  if (!popup) return;

  popup.innerHTML = "";

  const msg = document.createElement("div");
  msg.textContent = "和平成立した！";

  const btn = document.createElement("button");
  btn.textContent = "タイトルにもどる";
  btn.addEventListener("click", () => {
    popup.style.display = "none";
    showTitle();
  });

  popup.appendChild(msg);
  popup.appendChild(btn);
  popup.style.display = "block";
}

async function requestOnlineSurrender() {
  if (!onlineState.enabled || !onlineState.roomId || !onlineState.myPlayer) return;

  const ok = confirm("降伏しますか？");
  if (!ok) return;

  const loser = onlineState.myPlayer;
  const winner = loser === "A" ? "B" : "A";

  await updateRoom(onlineState.roomId, {
    "meta/status": "finished",
    "meta/result": {
      type: "surrender",
      winner,
      loser,
      reason: "surrender",
      finishedAt: Date.now()
    },
    "meta/notice": `PLAYER ${loser} が降伏しました`,
    "meta/updatedAt": Date.now()
  });

  finishBattle(winner);
}

function applyOnlineMetaResult(roomData) {
  const result = roomData?.meta?.result;
  if (!result) return;

  if (result.type === "peace") {
    showOnlinePeaceFinishedPopup();
    return;
  }

  if (result.type === "surrender" || result.type === "leave") {
    if (onlineBattleFinished) return;
    finishBattle(result.winner);
  }
}

function applyOnlinePeaceRequest(roomData) {
  const peace = roomData?.peace;
  if (!peace) return;
  if (peace.status !== "requested") return;
  if (!peace.requestedBy) return;
  if (peace.requestedBy === onlineState.myPlayer) return;

  const popup = document.getElementById("popup");
  if (popup && popup.style.display === "block") return;

  showOnlinePeaceRequestPopup(peace.requestedBy);
}

async function markOnlinePlayerLeft() {
  if (onlineBattleFinished) return;
  if (!onlineState.enabled || !onlineState.roomId || !onlineState.myPlayer) return;

  const leaver = onlineState.myPlayer;
  const winner = leaver === "A" ? "B" : "A";

  try {
    await updateRoom(onlineState.roomId, {
      [`players/${leaver}/left`]: true,
      [`players/${leaver}/lastSeen`]: Date.now(),
      "meta/status": "finished",
      "meta/result": {
        type: "leave",
        winner,
        loser: leaver,
        reason: "leave",
        finishedAt: Date.now()
      },
      "meta/notice": `PLAYER ${leaver} が退室しました`,
      "meta/updatedAt": Date.now()
    });
  } catch (error) {
    console.error(error);
  }
}

window.addEventListener("beforeunload", () => {
  if (!onlineState.enabled || !onlineState.roomId || !onlineState.myPlayer) return;

  const leaver = onlineState.myPlayer;
  const winner = leaver === "A" ? "B" : "A";

  updateRoom(onlineState.roomId, {
    [`players/${leaver}/left`]: true,
    [`players/${leaver}/lastSeen`]: Date.now(),
    "meta/status": "finished",
    "meta/result": {
      type: "leave",
      winner,
      loser: leaver,
      reason: "leave",
      finishedAt: Date.now()
    },
    "meta/notice": `PLAYER ${leaver} が退室しました`,
    "meta/updatedAt": Date.now()
  });
});
function applyOnlineRoomData(roomData) {
  if (!onlineState.enabled || !roomData) return;
renderOnlineExtraUi(roomData);
applyOnlinePeaceRequest(roomData);
applyOnlineMetaResult(roomData);
  const playerA = roomData.players?.A || {};
  const playerB = roomData.players?.B || {};

  if (playerA.unitId) {
    selectedUnitA = getUnitById(playerA.unitId);
  }

  if (playerB.unitId) {
    selectedUnitB = getUnitById(playerB.unitId);
  }

  updateSelectUi();
applyOnlineAction(roomData.action);
  if (
    !onlineBattleStarted &&
    playerA.ready &&
    playerB.ready &&
    selectedUnitA &&
    selectedUnitB
  ) {
    onlineBattleStarted = true;
    initOnline1v1Battle(selectedUnitA, selectedUnitB);
  }
}

function enterOnlineSelect() {
  if (onlineSelectEntered) return;

  battleMode = "online1v1";
  teamA = null;
  teamB = null;
  selectedUnitA = null;
  selectedUnitB = null;
  selectingPlayer = onlineState.myPlayer === "B" ? "B" : "A";
  onlineBattleStarted = false;
  onlineSelectEntered = true;

  showScreen("select");
  loadUnitButtons();
}
function canOperateOnlinePlayer() {
  if (!onlineState.enabled) return true;
  return currentPlayer === onlineState.myPlayer;
}
function publishOnlineChoiceAction(choice, selectedValue) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;
  if (!choice) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: choice.ownerPlayer,
      type: "choice",
      payload: {
        source: choice.source || null,
        choiceType: choice.choiceType || null,
        selectedValue
      },
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

function publishOnlineSpecialAction(ownerPlayer, specialKey) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;
  if (ownerPlayer !== onlineState.myPlayer) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: ownerPlayer,
      type: "special",
      payload: {
        specialKey
      },
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

function publishOnlineQteAction(kind, index) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: onlineState.myPlayer,
      type: "qte",
      payload: {
        kind,
        index
      },
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

function publishOnlineEndTurnAction(actorPlayer) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;
  if (actorPlayer !== onlineState.myPlayer) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: actorPlayer,
      type: "endTurn",
      payload: {},
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

function publishOnlineSlotAction(ownerPlayer, slotKey) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;
  if (ownerPlayer !== onlineState.myPlayer) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: ownerPlayer,
      type: "slot",
      payload: {
        slotKey
      },
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

function applyOnlineAction(action) {
  if (!onlineState.enabled || !action) return;
  if (typeof action.actionId !== "number") return;
  if (action.actionId <= onlineState.lastAppliedActionId) return;

  onlineState.lastAppliedActionId = action.actionId;
  onlineActionSeq = Math.max(onlineActionSeq, action.actionId);

  if (action.actor === onlineState.myPlayer) return;

  onlineState.isApplyingRemote = true;

  if (action.type === "slot") {
    const slotKey = action.payload?.slotKey;
    if (!slotKey) {
      onlineState.isApplyingRemote = false;
      return;
    }

    const actor = getPlayerState(action.actor);
    if (!actor) {
      onlineState.isApplyingRemote = false;
      return;
    }

    ensureActionState(actor);

    const started = startSlotAction(action.actor, slotKey);
    if (started) {
      consumeActionCount(actor, 1);
      redrawBattleBoards();
    }

    onlineState.isApplyingRemote = false;
    return;
  }

if (action.type === "special") {
    const specialKey = action.payload?.specialKey;
    if (!specialKey) {
      onlineState.isApplyingRemote = false;
      return;
    }

    actionLayer.executeSpecial(action.actor, specialKey);

    onlineState.isApplyingRemote = false;
    return;
}

if (action.type === "choice") {
    const selectedValue = action.payload?.selectedValue;

    actionLayer.resolvePendingChoice(selectedValue);

    onlineState.isApplyingRemote = false;
    return;
}
  
  if (action.type === "qte") {
    const kind = action.payload?.kind;
    const index = action.payload?.index;

    if (kind === "hit") {
      attackResolution.takeHit(index);
      checkBattleEnd();
    } else if (kind === "evade") {
      attackResolution.evadeAttack(index);
    } else if (kind === "supportDefense") {
      attackResolution.supportDefenseAttack(index);
      checkBattleEnd();
    }

    onlineState.isApplyingRemote = false;
    return;
  }
if (action.type === "battleEnd") {
  const winner = action.payload?.winner;
  if (!winner) {
    onlineState.isApplyingRemote = false;
    return;
  }

  finishBattle(winner);

  onlineState.isApplyingRemote = false;
  return;
}
  if (action.type === "endTurn") {
    battleFlow.endTurn();
    onlineState.isApplyingRemote = false;
    return;
  }

  onlineState.isApplyingRemote = false;
}

function initOnline1v1Battle(unitA, unitB) {
  playerAState = createBattleState(unitA);
  playerBState = createBattleState(unitB);

  resetActionCount(playerAState);
  resetActionCount(playerBState);

  currentTurn = 1;
  currentPlayer = "A";
  currentAttack = [];
  currentAttackContext = null;
  currentAttackContexts = [];
  battleNotice = "";
  currentActionHeader = "";
  currentActionLabel = "";
  pendingChoice = null;

onlineBattleFinished = false;
  
  isTestMode = false;

  redrawBattleBoards();
  ensureOnlineBattleExtraUi();
  document.getElementById("attackLog").textContent = "オンラインバトル開始";
  updateDebugButtonVisibility();
  showScreen("battle");
}

function publishOnlineBattleEnd(winnerPlayer) {
  if (!onlineState.enabled) return;
  if (onlineState.isApplyingRemote) return;

  onlineActionSeq += 1;
  onlineState.lastAppliedActionId = onlineActionSeq;

  updateRoom(onlineState.roomId, {
    action: {
      actionId: onlineActionSeq,
      actor: winnerPlayer,
      type: "battleEnd",
      payload: {
        winner: winnerPlayer
      },
      createdAt: Date.now()
    },
    "meta/updatedAt": Date.now()
  });
}

uiController = createUiController({
  screens,

  playerABox,
  playerBBox,

  getBattleMode: () => battleMode,
isTeamBattleMode,

  getCurrentPlayer: () => currentPlayer,
  getCurrentTurn: () => currentTurn,
  getIsTestMode: () => isTestMode,

  getBattleNotice: () => battleNotice,
  clearBattleNotice,

  getCurrentActionHeader: () => currentActionHeader,
  getCurrentActionLabel: () => currentActionLabel,

  getPendingChoice: () => pendingChoice,
  resolvePendingChoice,

  getPlayerState,
  getPlayerStateRaw,
  getTeam,

  getSlotNumberFromKey,

ensureActionState,

  applyUnitDerivedState,
  renderPlayerState,
  renderPlayerState2v2,
  renderPendingChoiceUI,

  build1v1RenderHandlers,
  build2v2RenderHandlers
});

attackResolution = createAttackResolution({
  getBattleMode: () => battleMode,
  getCurrentPlayer: () => currentPlayer,

  getCurrentAttack: () => currentAttack,
  getCurrentAttackContext: () => currentAttackContext,
  getCurrentAttackContexts: () => currentAttackContexts,

  setCurrentAttack: (v) => currentAttack = v,
  setCurrentAttackContext: (v) => currentAttackContext = v,
  setCurrentAttackContexts: (v) => currentAttackContexts = v,

  getPlayerState,
  getOpponentPlayer,
  getCombatTargetState,
  getTeam,

  appendBattleNotice,
  redrawBattleBoards,
  renderAttackChoices,
  renderAttackLogText,
  showPopup,

  handleChoiceRequest,

  executeUnitActionResolved,
  executeUnitOnDamaged,
  executeUnitModifyTakenDamage,
  executeUnitModifyEvadeAttempt,

  resolveTakeHit,
  resolveEvadeAttack
});

actionLayer = createActionLayer({
  getBattleMode: () => battleMode,
  getCurrentPlayer: () => currentPlayer,

  getPendingChoice,
  clearPendingChoice,

  getCurrentAttack,
  getCurrentAttackContext,
  getCurrentAttackContexts,

  setCurrentAttack,
  setCurrentAttackContext,
  setCurrentAttackContexts,

  getPlayerState,
  getOpponentPlayer,
  getCombatTargetState,
  getTeam,

  setActiveUnit,

  isUnifiedTeam,
  getUnifiedEvade,
  consumeUnifiedEvade,

  canExecuteSpecialForPlayer,

  setCurrentAction,
  appendBattleNotice,
processReservedActionsForTrigger,
  redrawBattleBoards,
  renderAttackChoices,
  renderAttackLogText,
  showPopup,

  handleChoiceRequest,

  executeUnifiedSelectedSlot: (...args) =>
    twoVtwoActions.executeUnifiedSelectedSlot(...args)
});


battleFlow = createBattleFlow({
  getBattleMode: () => battleMode,
isTeamBattleMode,
isChallengeMode,
executeTeamSlot: () => twoVtwoActions.executeTeamSlot(),

  getCurrentPlayer: () => currentPlayer,
  setCurrentPlayer: (value) => { currentPlayer = value; },

  getCurrentTurn: () => currentTurn,
  setCurrentTurn: (value) => { currentTurn = value; },

  getIsTestMode: () => isTestMode,

  getPlayerState,
  getOpponentPlayer,
  getTeam,

  hasPendingChoice: () => !!pendingChoice,

  setCurrentAttack,
setCurrentAttackContext,
setCurrentAttackContexts,

  clearBattleNotice,
  clearCurrentAction,
  clearPendingChoice,

  renderPendingChoice,
  handleChoiceRequest,

  redrawBattleBoards,
  startSlotAction,
  processReservedActionsForTrigger,

  onSlotActionResolved: publishOnlineSlotAction,
  getRollableSlotKeys,
  getRandomSlotKey,
  getSlotByKey,
  getPredictableSlotKeys,

  executeUnitTurnEnd,

  showPopup,
  getCurrentAttack,
renderAttackChoices
});

gameSetup = createGameSetup({
  units,
  bosses: bossList,
  cpus: cpuList,
  cpuBeginnerList,
  debugUnits: debugUnitList,
  canUseDebugUnit,
  unitButtons,
  selectGuide,
  selectedUnitsPreview,
confirmSelectedUnitBtn,
backFromSelectBtn,
getPendingSelectedUnit: () => pendingSelectedUnit,
setPendingSelectedUnit: (unit) => { pendingSelectedUnit = unit; },
getExtraUnlockedUnits: () => extraUnlockedUnits,
setExtraUnlockedUnits: (units) => { extraUnlockedUnits = units; },

showTitle: () => {
  showTitle();
},
  onSelectUnit: (unit) => {
    if (!onlineState.enabled) return false;

    const playerKey = onlineState.myPlayer;
    if (playerKey !== "A" && playerKey !== "B") return false;

    updateRoom(onlineState.roomId, {
      [`players/${playerKey}/unitId`]: unit.id,
      [`players/${playerKey}/ready`]: true,
      "meta/updatedAt": Date.now()
    });

    if (playerKey === "A") {
      selectedUnitA = unit;
    } else {
      selectedUnitB = unit;
    }

    updateSelectUi();
    return true;
  },

  getBattleMode: () => battleMode,
  

  isTeamBattleMode,
  isChallengeMode,

  getSelectingPlayer: () => selectingPlayer,
  setSelectingPlayer: (v) => selectingPlayer = v,

  getSelectedUnitA: () => selectedUnitA,
  setSelectedUnitA: (v) => selectedUnitA = v,

  getSelectedUnitB: () => selectedUnitB,
  setSelectedUnitB: (v) => selectedUnitB = v,

  getTeamA: () => teamA,
  setTeamA: (v) => teamA = v,

  getTeamB: () => teamB,
  setTeamB: (v) => teamB = v,

  init1v1: (unitA, unitB) => {
    playerAState = createBattleState(unitA);
    playerBState = createBattleState(unitB);

    resetActionCount(playerAState);
    resetActionCount(playerBState);

    currentTurn = 1;
    currentPlayer = "A";
    currentAttack = [];
    currentAttackContext = null;
    currentAttackContexts = [];
    battleNotice = "";
    currentActionHeader = "";
currentActionLabel = "";
    pendingChoice = null;

    isTestMode = false;
    selectingPlayer = "A";
    selectedUnitA = null;
    selectedUnitB = null;

    redrawBattleBoards();
    document.getElementById("attackLog").textContent = "バトル開始待機中";
  updateDebugButtonVisibility();
    showScreen("battle");
  },

  init2v2: (unitsA, unitsB) => {
    teamA = createTeam(unitsA[0], unitsA[1]);
    teamB = createTeam(unitsB[0], unitsB[1]);

    teamA.activeUnitKey = "unit1";
    teamA.focusUnitKey = "unit1";
    teamB.activeUnitKey = "unit1";
    teamB.focusUnitKey = "unit1";

    playerAState = teamA.unit1;
    playerBState = teamB.unit1;

    resetActionCount(teamA.unit1);
    resetActionCount(teamA.unit2);
    resetActionCount(teamB.unit1);
    resetActionCount(teamB.unit2);

    currentTurn = 1;
    currentPlayer = "A";
    currentAttack = [];
    currentAttackContext = null;
    currentAttackContexts = [];
    battleNotice = "";
    currentActionHeader = "";
    currentActionLabel = "";
    pendingChoice = null;

    isTestMode = false;
    selectingPlayer = "A";
    selectedUnitA = null;
    selectedUnitB = null;

    redrawBattleBoards();
    document.getElementById("attackLog").textContent = "バトル開始待機中";
  updateDebugButtonVisibility();
    showScreen("battle");
  },
    
  initChallenge1v1: (unitA, bossUnit) => {
    playerAState = createBattleState(unitA);
    playerBState = createBattleState(bossUnit);

    resetActionCount(playerAState);
    resetActionCount(playerBState);

    currentTurn = 1;
    currentPlayer = "A";
    currentAttack = [];
    currentAttackContext = null;
    currentAttackContexts = [];
    battleNotice = "";
    currentActionHeader = "";
    currentActionLabel = "";
    pendingChoice = null;

    isTestMode = false;
    selectingPlayer = "A";
    selectedUnitA = null;
    selectedUnitB = null;

    redrawBattleBoards();
    document.getElementById("attackLog").textContent = "チャレンジバトル開始";
   updateDebugButtonVisibility();
    showScreen("battle");
  },

  initChallenge2v2: (unitsA, bossUnits) => {
    teamA = createTeam(unitsA[0], unitsA[1]);

    teamB = {
      unit1: createBattleState(bossUnits[0]),
      unit2: bossUnits[1] ? createBattleState(bossUnits[1]) : null,

      mode: "split",
      activeUnitKey: "unit1",
      focusUnitKey: "unit1",

      unified: {
        baseHpA: 0,
        baseHpB: 0,
        totalDamage: 0,
        healA: 0,
        healB: 0
      }
    };

    playerAState = teamA.unit1;
    playerBState = teamB.unit1;

    resetActionCount(teamA.unit1);
    resetActionCount(teamA.unit2);
    resetActionCount(teamB.unit1);
    if (teamB.unit2) resetActionCount(teamB.unit2);

    currentTurn = 1;
    currentPlayer = "A";
    currentAttack = [];
    currentAttackContext = null;
    currentAttackContexts = [];
    battleNotice = "";
    currentActionHeader = "";
    currentActionLabel = "";
    pendingChoice = null;

    isTestMode = false;
    selectingPlayer = "A";
    selectedUnitA = null;
    selectedUnitB = null;

    redrawBattleBoards();
    document.getElementById("attackLog").textContent = "2機チャレンジバトル開始";
   updateDebugButtonVisibility();
    showScreen("battle");
  }
});

twoVtwoHelpers = create2v2Helpers({
  getBattleMode: () => battleMode,
  getTeam
});

twoVtwoActions = create2v2Actions({
  getBattleMode: () => battleMode,
isTeamBattleMode,

  getCurrentPlayer: () => currentPlayer,
  getTeam,
  getOpponentPlayer,
  getCombatTargetState,

  hasPendingChoice: () => !!pendingChoice,

  getCurrentAttack,
setCurrentAttack,

getCurrentAttackContext,
setCurrentAttackContext,

getCurrentAttackContexts,
setCurrentAttackContexts,

  ensureActionState,
  canConsumeAction,
  consumeActionCount,

  getRollableSlotKeys,
  getSlotByKey,
  getSlotNumberFromKey,

  executeUnitBeforeSlot,
  executeUnitEnemyBeforeSlot,

  resolveSlotEffect,
  runAfterSlotResolvedHook,

  appendBattleNotice,
  clearBattleNotice,
  clearCurrentAction,
  setCurrentAction,

  redrawBattleBoards,
  renderAttackChoices,
  renderAttackLogText,

  executeSlot
});

document.getElementById("executeSlotBtn").addEventListener("click", () => {
  twoVtwoActions.executeTeamSlot();
});

document.getElementById("executeUnit1SlotBtn").addEventListener("click", () => {
  twoVtwoActions.executeSingleTeamSlot("unit1");
});

document.getElementById("executeUnit2SlotBtn").addEventListener("click", () => {
  twoVtwoActions.executeSingleTeamSlot("unit2");
});
document.getElementById("simulateSlotBtn").addEventListener("click", simulateSlot);
document.getElementById("endTurnBtn").addEventListener("click", endTurn);
document.getElementById("toggleTestModeBtn").addEventListener("click", toggleTestMode);
document.getElementById("playerLoginBtn")?.addEventListener("click", async () => {
  const id = prompt("プレイヤーIDを入力してください");
  if (!id) return;

  const password = prompt("パスワードを入力してください");
  if (!password) return;

  const result = await loginPlayer(id.trim(), password.trim());

  if (!result.ok) {
    showPopup(result.message || "ログインに失敗しました");
    return;
  }
syncExtraUnlockedUnitsFromProfile();
updatePlayerCardUi();
updateDebugButtonVisibility();
showPopup("ログインしました");
});

document.getElementById("playerRegisterBtn")?.addEventListener("click", async () => {
  const id = prompt("登録するプレイヤーIDを半角英数字で入力してください");
  if (!id) return;

  const password = prompt("設定するパスワードを半角英数字で入力してください");
  if (!password) return;

  const name = prompt("プレイヤー名を入力してください") || id;

  const result = await registerPlayer({
    id: id.trim(),
    password: password.trim(),
    name: name.trim()
  });

  if (!result.ok) {
    showPopup(result.message || "登録に失敗しました");
    return;
  }
syncExtraUnlockedUnitsFromProfile();
  updatePlayerCardUi();
  updateDebugButtonVisibility();
  showPopup("プレイヤー登録しました");
});

document.getElementById("playerLogoutBtn")?.addEventListener("click", () => {
  logoutPlayer();
  extraUnlockedUnits = [];
  isTestMode = false;
  updatePlayerCardUi();
  updateDebugButtonVisibility();
  showPopup("ログアウトしました");
});

document.getElementById("playerStatsBtn")?.addEventListener("click", () => {
  renderPlayerStatsPanel();
});

document.getElementById("closePlayerStatsBtn")?.addEventListener("click", () => {
  const panel = document.getElementById("playerStatsPanel");
  if (panel) panel.style.display = "none";
});



loadUnitButtons();

restorePlayerSession().then(() => {
  syncExtraUnlockedUnitsFromProfile();
  updatePlayerCardUi();
  updateDebugButtonVisibility();
  bootOnlineFromUrl();
});
