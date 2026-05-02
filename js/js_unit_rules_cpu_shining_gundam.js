import {
  setForm,
  getStateEffect,
  setStateEffect,
  clearStateEffect
} from "./js_unit_runtime.js";

import { resolveSlotEffect } from "./js_slot_effects.js";

function ensureCpuShiningState(state) {
  if (typeof state.cpuShiningMeditationCount !== "number") state.cpuShiningMeditationCount = 0;
  if (typeof state.cpuShiningMeditationExReady !== "boolean") state.cpuShiningMeditationExReady = false;
  if (typeof state.cpuShiningMeikyoUnlocked !== "boolean") state.cpuShiningMeikyoUnlocked = false;
  if (typeof state.cpuShiningExtraActionsThisSlot !== "number") state.cpuShiningExtraActionsThisSlot = 0;
  if (typeof state.cpuShiningFullEvadeTurns !== "number") state.cpuShiningFullEvadeTurns = 0;
  if (typeof state.cpuShiningWaterDropPending !== "boolean") state.cpuShiningWaterDropPending = false;
}

function getSuperEffect(state) {
  return getStateEffect(state, "cpu_shining_super");
}

function getMeikyoEffect(state) {
  return getStateEffect(state, "cpu_shining_meikyo");
}

function getActiveModeEffect(state) {
  return getMeikyoEffect(state) || getSuperEffect(state) || null;
}

function getActiveModeEffectId(state) {
  if (getMeikyoEffect(state)) return "cpu_shining_meikyo";
  if (getSuperEffect(state)) return "cpu_shining_super";
  return null;
}

function extendActiveMode(state, amount) {
  const effect = getActiveModeEffect(state);
  if (!effect) return false;
  effect.turns += amount;
  return true;
}

function enterMode(state, formId, effectId, turns) {
  clearStateEffect(state, "cpu_shining_super");
  clearStateEffect(state, "cpu_shining_meikyo");

  const changed = setForm(state, formId, {
    preserveHp: true,
    preserveEvade: true
  });

  if (!changed) return false;

  state.overEvadeMode = false;
  state.overEvadeCap = state.evadeMax;
  state.overEvadeBaseMax = state.evadeMax;
  state.overEvadeAbsoluteMax = state.evadeMax;

  if (state.evade > state.evadeMax) state.evade = state.evadeMax;
  if (state.evade < 0) state.evade = 0;

  setStateEffect(state, effectId, {
    turns,
    skipNextTick: true
  });

  return true;
}

function enterMeikyoByCrisis(state) {
  state.cpuShiningMeikyoUnlocked = true;
  return enterMode(state, "meikyo", "cpu_shining_meikyo", 5);
}

function activateModeFromSlot6(state) {
  if (state.cpuShiningMeikyoUnlocked || state.hp <= 150) {
    return enterMeikyoByCrisis(state)
      ? "シャイニング：明鏡止水スーパーモード発動"
      : "シャイニング：明鏡止水移行失敗";
  }

  return enterMode(state, "super", "cpu_shining_super", 5)
    ? "シャイニング：スーパーモード発動"
    : "シャイニング：スーパーモード移行失敗";
}

function tickModeEffect(state, effectId, baseFormId) {
  const effect = getStateEffect(state, effectId);
  if (!effect) return false;

  if (effect.skipNextTick) {
    effect.skipNextTick = false;
    return true;
  }

  effect.turns -= 1;

  if (effect.turns <= 0) {
    clearStateEffect(state, effectId);
    setForm(state, baseFormId, {
      preserveHp: true,
      preserveEvade: true
    });
    if (state.evade > state.evadeMax) state.evade = state.evadeMax;
  }

  return true;
}

function getSlotNumber(slotKey) {
  return Number(String(slotKey).replace(/^slot/, ""));
}

function getRandomSlotKey(state) {
  const keys = state.rollableSlotOrder || Object.keys(state.slots || {});
  if (!keys.length) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

function buildAttackMessage(slotNumber, slot, attacks) {
  if (!attacks || attacks.length === 0) return null;
  return `シャイニング追加行動：${slotNumber}.${slot.label}`;
}

function resolveCpuCustomSlot(state, slotKey, slot, messages) {
  const effectId = slot?.effect?.effectId;

  if (effectId === "cpu_shining_full_evade_3") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 1);
    state.evade += 3;
    messages.push("シャイニング追加行動：次ターン全攻撃回避、回避+3");
    return;
  }

  if (effectId === "cpu_shining_full_evade_4") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 1);
    state.evade += 4;
    messages.push("シャイニング追加行動：次ターン全攻撃回避、回避+4");
    return;
  }

  if (effectId === "cpu_shining_full_evade_2turn_5") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 2);
    state.evade += 5;
    messages.push("シャイニング追加行動：2ターン全攻撃回避、回避+5");
    return;
  }

  if (effectId === "cpu_shining_activate_mode") {
    messages.push(activateModeFromSlot6(state));
    return;
  }

  if (effectId === "cpu_shining_meditation") {
    state.hp = Math.min(state.maxHp, state.hp + 60);
    extendActiveMode(state, 2);
    state.cpuShiningMeditationCount += 1;

    const localMessages = ["シャイニング追加行動：瞑想 60回復、強化ターン+2"];

    if (state.cpuShiningMeditationCount >= 4 && !state.cpuShiningMeditationExReady) {
      state.cpuShiningMeditationExReady = true;
      localMessages.push("シャイニング：3EX 明鏡止水の心 解放");
    }

    messages.push(...localMessages);
    return;
  }

  if (effectId === "cpu_shining_meikyo_heart") {
    state.hp = Math.min(state.maxHp, state.hp + 80);
    state.cpuShiningMeikyoUnlocked = true;
    state.cpuShiningMeditationExReady = false;
    enterMode(state, "meikyo", "cpu_shining_meikyo", 5);
    messages.push("シャイニング追加行動：明鏡止水の心 80回復、明鏡止水発動");
    return;
  }

  if (effectId === "cpu_shining_meikyo_heal") {
    state.hp = Math.min(state.maxHp, state.hp + 80);
    extendActiveMode(state, 1);
    messages.push("シャイニング追加行動：回復80、強化ターン+1");
    return;
  }

  messages.push(`シャイニング追加行動：${slot.label}`);
}

function resolveAdditionalSlot(state, slotKey) {
  const slot = state.slots?.[slotKey];
  const messages = [];
  const appendAttacks = [];

  if (!slot) {
    return { appendAttacks, appendMessages: messages };
  }

  const slotNumber = getSlotNumber(slotKey);
  const result = resolveSlotEffect({ slot, actor: state });

  if (result.kind === "attack") {
    appendAttacks.push(...result.attacks);
    const attackMessage = buildAttackMessage(slotNumber, slot, result.attacks);
    if (attackMessage) messages.push(attackMessage);
    return { appendAttacks, appendMessages: messages };
  }

  if (result.kind === "evade" || result.kind === "heal") {
    messages.push(`シャイニング追加行動：${slotNumber}.${slot.label}`);
    if (result.message) messages.push(result.message);
    return { appendAttacks, appendMessages: messages };
  }

  if (result.kind === "custom") {
    resolveCpuCustomSlot(state, slotKey, slot, messages);
    return { appendAttacks, appendMessages: messages };
  }

  messages.push(`シャイニング追加行動：${slotNumber}.${slot.label}`);
  return { appendAttacks, appendMessages: messages };
}

function consumeEvade(state, amount) {
  if (state.evade < amount) return false;
  state.evade = Math.max(0, state.evade - amount);
  return true;
}

function addExtraActionResult(total, next) {
  if (!next) return;

  if (Array.isArray(next.appendAttacks)) {
    total.appendAttacks.push(...next.appendAttacks);
  }

  if (Array.isArray(next.appendMessages)) {
    total.appendMessages.push(...next.appendMessages);
  }
}

function tryForceSlot6(state, total, reasonText) {
  const next = resolveAdditionalSlot(state, "slot6");
  total.appendMessages.push(reasonText);
  addExtraActionResult(total, next);
}

function tryRandomAdditionalSlot(state, total, reasonText) {
  const slotKey = getRandomSlotKey(state);
  if (!slotKey) return;

  const next = resolveAdditionalSlot(state, slotKey);
  total.appendMessages.push(reasonText);
  addExtraActionResult(total, next);
}

export function getCpuShiningDerivedState(state) {
  ensureCpuShiningState(state);

  const result = {
    name: null,
    slots: {},
    specials: {},
    status: []
  };

  const superEffect = getSuperEffect(state);
  const meikyoEffect = getMeikyoEffect(state);

  if (superEffect && typeof superEffect.turns === "number") {
    result.status.push(`スーパーモード 残${superEffect.turns}ターン`);
  }

  if (meikyoEffect && typeof meikyoEffect.turns === "number") {
    result.status.push(`明鏡止水S 残${meikyoEffect.turns}ターン`);
  }

  if (state.cpuShiningFullEvadeTurns > 0) {
    result.status.push(`全攻撃回避 残${state.cpuShiningFullEvadeTurns}ターン`);
  }

  if (state.formId === "super" && state.cpuShiningMeditationExReady) {
    result.slots.slot3 = {
      label: "3EX 明鏡止水の心 80回復",
      desc: "80回復。5ターンの間、明鏡止水スーパーモードに変化。以降はスーパーモードが明鏡止水スーパーモードに永続的に変化する。",
      effect: { type: "custom", effectId: "cpu_shining_meikyo_heart" },
      ex: true
    };
  }

if (state.formId === "base" && state.cpuShiningMeikyoUnlocked) {
    result.slots.slot6 = {
      label: "明鏡止水の心",
      desc: "5ターン間明鏡止水スーパーモードに変化",
      effect: { type: "custom", effectId: "cpu_shining_activate_mode" },
      ex: true
    };
  }

if (state.formId === "meikyo" && state.cpuShiningWaterDropPending) {
    ["slot1", "slot4", "slot5", "slot6"].forEach((slotKey) => {
      const baseSlot = state.baseSlots?.[slotKey];
      if (!baseSlot) return;

      result.slots[slotKey] = {
        effect: {
          ...(baseSlot.effect || {}),
          cannotEvade: true,
          addedCannotEvade: true
        }
      };
    });

    result.status.push("明鏡止水：次攻撃必中");
  }

  return result;
}

export function onCpuShiningBeforeSlot(state, rolledSlotNumber, context = {}) {
  ensureCpuShiningState(state);
  state.cpuShiningExtraActionsThisSlot = 0;

  if (state.formId === "meikyo" && state.hp <= 200 && state.evade >= 5) {
    state.evade = Math.max(0, state.evade - 5);
    state.hp = Math.max(1, Math.ceil(state.hp / 2));
    state.cpuShiningWaterDropPending = true;

    return {
      redraw: true,
      message: "シャイニング特性：回避5消費、HP半減。次の攻撃が必中化"
    };
  }

  return { redraw: false, message: null };
}

export function getCpuShiningExtraWeaponResult(state, context = {}) {
  ensureCpuShiningState(state);

  const total = {
    appendAttacks: [],
    appendMessages: [],
    redraw: true
  };

  while (state.cpuShiningExtraActionsThisSlot < 2) {
    let triggered = false;

    if (state.formId === "base" || state.formId === "meikyo") {
      if (state.evade >= 3 && Math.random() < 0.5) {
        if (Math.random() < 0.5) {
          consumeEvade(state, 3);
          state.cpuShiningExtraActionsThisSlot += 1;
          tryForceSlot6(
            state,
            total,
            "シャイニング特性：回避3消費、スロット6を強制発動"
          );
        } else {
          consumeEvade(state, 1);
          state.cpuShiningExtraActionsThisSlot += 1;
          tryRandomAdditionalSlot(
            state,
            total,
            "シャイニング特性：回避1消費、追加スロット行動"
          );
        }

        triggered = true;
      }
    }

    if (!triggered && state.formId === "super") {
      const enemyEvade = Number(context.enemyState?.evade || 0);

      if (enemyEvade <= 0 && state.evade >= 3 && Math.random() < 0.5) {
        consumeEvade(state, 3);
        state.cpuShiningExtraActionsThisSlot += 1;
        tryForceSlot6(
          state,
          total,
          "シャイニングS特性：相手回避0、回避3消費、スロット6を強制発動"
        );
        triggered = true;
      }
    }

if (!triggered && state.evade >= 1 && Math.random() < 0.5) {
      consumeEvade(state, 1);
      state.cpuShiningExtraActionsThisSlot += 1;
      tryRandomAdditionalSlot(
        state,
        total,
        "シャイニング特性：回避1消費、追加スロット行動"
      );
      triggered = true;
    }

    if (!triggered) break;
  }

  if (total.appendAttacks.length === 0 && total.appendMessages.length === 0) {
    return null;
  }

  return total;
}

export function onCpuShiningAfterSlotResolved(state, slotNumber, context = {}) {
  ensureCpuShiningState(state);

  const result = context.resolveResult;
  if (!result || result.kind !== "custom") {
    return { redraw: false, message: null };
  }

  const effectId = result.customEffectId;

  if (effectId === "cpu_shining_full_evade_3") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 1);
    state.evade += 3;
    return { redraw: true, message: "シャイニング：次ターン全攻撃回避、回避+3" };
  }

  if (effectId === "cpu_shining_full_evade_4") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 1);
    state.evade += 4;
    return { redraw: true, message: "シャイニング：次ターン全攻撃回避、回避+4" };
  }

  if (effectId === "cpu_shining_full_evade_2turn_5") {
    state.cpuShiningFullEvadeTurns = Math.max(state.cpuShiningFullEvadeTurns, 2);
    state.evade += 5;
    return { redraw: true, message: "シャイニング：2ターン全攻撃回避、回避+5" };
  }

  if (effectId === "cpu_shining_activate_mode") {
    return { redraw: true, message: activateModeFromSlot6(state) };
  }

  if (effectId === "cpu_shining_meditation") {
    state.hp = Math.min(state.maxHp, state.hp + 60);
    extendActiveMode(state, 2);
    state.cpuShiningMeditationCount += 1;

    const messages = ["シャイニング：瞑想 60回復、強化ターン+2"];

   if (state.cpuShiningMeditationCount >= 4 && !state.cpuShiningMeditationExReady) {
      state.cpuShiningMeditationExReady = true;
      messages.push("シャイニング：3EX 明鏡止水の心 解放");
    }

    return { redraw: true, message: messages.join("\n") };
  }

  if (effectId === "cpu_shining_meikyo_heart") {
    state.hp = Math.min(state.maxHp, state.hp + 80);
    state.cpuShiningMeikyoUnlocked = true;
    state.cpuShiningMeditationExReady = false;
    enterMode(state, "meikyo", "cpu_shining_meikyo", 5);

    return {
      redraw: true,
      message: "シャイニング：明鏡止水の心 80回復、明鏡止水発動"
    };
  }

  if (effectId === "cpu_shining_meikyo_heal") {
    state.hp = Math.min(state.maxHp, state.hp + 80);
    extendActiveMode(state, 1);

    return {
      redraw: true,
      message: "シャイニング：回復80、強化ターン+1"
    };
  }

  return { redraw: false, message: null };
}

export function onCpuShiningActionResolved(attacker, defender, context = {}) {
  ensureCpuShiningState(attacker);

  const messages = [];
  let redraw = false;

  if (attacker.cpuShiningWaterDropPending && context.totalCount > 0) {
    attacker.cpuShiningWaterDropPending = false;
    redraw = true;
  }

  if (attacker.formId === "super" && context.slotNumber === 6 && context.hitCount > 0) {
    extendActiveMode(attacker, 3);
    redraw = true;
    messages.push("シャイニング：スーパーモード+3ターン");
  }

  if (attacker.formId === "meikyo" && context.slotNumber === 5 && context.hitCount > 0) {
    extendActiveMode(attacker, 2);
    redraw = true;
    messages.push("シャイニング：明鏡止水S+2ターン");
  }

  return {
    redraw,
    message: messages.length > 0 ? messages.join("\n") : null
  };
}

export function onCpuShiningTurnEnd(state, context = {}) {
  ensureCpuShiningState(state);

  const messages = [];
  let redraw = false;

  if (state.hp <= 150 && state.formId !== "meikyo") {
    const changed = enterMeikyoByCrisis(state);
    if (changed) {
      redraw = true;
      messages.push("シャイニング特性：HP150以下、明鏡止水スーパーモード発動");
    }
  }

  if (state.cpuShiningFullEvadeTurns > 0) {
    state.cpuShiningFullEvadeTurns -= 1;
    redraw = true;
  }

  if (getMeikyoEffect(state)) {
    redraw = tickModeEffect(state, "cpu_shining_meikyo", "base") || redraw;
  } else if (getSuperEffect(state)) {
    redraw = tickModeEffect(state, "cpu_shining_super", "base") || redraw;
  }

  return {
    redraw,
    message: messages.length > 0 ? messages.join("\n") : null
  };
}

export function modifyCpuShiningEvadeAttempt(defender, attacker, attack, context = {}) {
  ensureCpuShiningState(defender);

  if (defender.cpuShiningFullEvadeTurns > 0 && !attack.cannotEvade) {
    return {
      handled: true,
      evaded: true,
      message: "シャイニング：全攻撃回避"
    };
  }

  return { handled: false };
}

export function modifyCpuShiningTakenDamage(defender, attacker, attack, damage) {
  return { damage, message: null };
}

export function onCpuShiningDamaged(defender, attacker) {
  ensureCpuShiningState(defender);

  if (defender.hp <= 150 && defender.formId !== "meikyo") {
    const changed = enterMeikyoByCrisis(defender);
    return {
      redraw: changed,
      message: changed ? "シャイニング特性：HP150以下、明鏡止水スーパーモード発動" : null
    };
  }

  return { redraw: false, message: null };
}
