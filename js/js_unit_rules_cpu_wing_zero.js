import { setForm, getStateEffect, setStateEffect, clearStateEffect } from "./js_unit_runtime.js";

function ensureCpuWingZeroState(state) {
  if (typeof state.cpuWingZeroSlot6Ex !== "boolean") state.cpuWingZeroSlot6Ex = Math.random() < 0.5;
  if (typeof state.cpuWingZeroFullEvadeTurns !== "number") state.cpuWingZeroFullEvadeTurns = 0;
  if (typeof state.cpuWingZeroBerserkUsed !== "boolean") state.cpuWingZeroBerserkUsed = false;
  if (typeof state.cpuWingZeroSystemActivatedOnce !== "boolean") state.cpuWingZeroSystemActivatedOnce = false;
  if (typeof state.cpuWingZeroHitClearPending !== "boolean") state.cpuWingZeroHitClearPending = false;
  if (typeof state.cpuWingZeroExtraUsedThisSlot !== "boolean") state.cpuWingZeroExtraUsedThisSlot = false;
}

function getEvadeSystem(state) {
  return getStateEffect(state, "cpu_wing_zero_evade_system");
}

function getHitSystem(state) {
  return getStateEffect(state, "cpu_wing_zero_hit_system");
}

function hasBothSystems(state) {
  return !!getEvadeSystem(state) && !!getHitSystem(state);
}

function activateEvadeSystem(state) {
  state.cpuWingZeroSystemActivatedOnce = true;
  setStateEffect(state, "cpu_wing_zero_evade_system", { turns: 3, skipNextTick: true });
  return "ウイングゼロ：ゼロシステム発動(回避補正)";
}

function activateHitSystem(state) {
  state.cpuWingZeroSystemActivatedOnce = true;
  state.cpuWingZeroHitClearPending = true;
  setStateEffect(state, "cpu_wing_zero_hit_system", { turns: 3, skipNextTick: true });
  return "ウイングゼロ：ゼロシステム発動(命中補正)";
}

function activateBerserk(state) {
  state.cpuWingZeroBerserkUsed = true;
  state.cpuWingZeroSystemActivatedOnce = true;
  state.evade = Math.max(state.evade, 3);
  setStateEffect(state, "cpu_wing_zero_evade_system", { turns: 3, skipNextTick: true });
  setStateEffect(state, "cpu_wing_zero_hit_system", { turns: 3, skipNextTick: true });
  return "ウイングゼロ特性：HP100以下、ゼロシステム暴走。6/6EX同時発動、回避3";
}

function tickEffect(state, effectId) {
  const effect = getStateEffect(state, effectId);
  if (!effect) return false;
  if (effect.skipNextTick) {
    effect.skipNextTick = false;
    return true;
  }
  effect.turns -= 1;
  if (effect.turns <= 0) clearStateEffect(state, effectId);
  return true;
}

function transformToNeoBird(state) {
  if (state.formId === "neo_bird") return false;
  return setForm(state, "neo_bird", { preserveHp: true, preserveEvade: true });
}

function returnToMsWithDoubleEvade(state) {
  const nextEvade = Math.max(0, state.evade * 2);
  const changed = setForm(state, "base", { preserveHp: true, preserveEvade: true });
  state.evade = nextEvade;
  state.overEvadeMode = true;
  state.overEvadeCap = nextEvade;
  state.overEvadeBaseMax = state.evadeMax;
  state.overEvadeAbsoluteMax = null;
  return changed;
}

function buildAttack(damage, count, extra = {}) {
  return Array.from({ length: count }, () => ({
    damage,
    ...extra
  }));
}

export function getCpuWingZeroDerivedState(state) {
  ensureCpuWingZeroState(state);

  const result = { name: null, slots: {}, specials: {}, status: [] };

  const evadeSystem = getEvadeSystem(state);
  const hitSystem = getHitSystem(state);

  if (evadeSystem) result.status.push(`ゼロシステム回避 残${evadeSystem.turns}ターン`);
  if (hitSystem) result.status.push(`ゼロシステム命中 残${hitSystem.turns}ターン`);
  if (hasBothSystems(state)) result.status.push("両解放：被ダメージ2倍");
  if (state.cpuWingZeroFullEvadeTurns > 0) result.status.push(`全攻撃回避 残${state.cpuWingZeroFullEvadeTurns}ターン`);

  if (hitSystem) {
    Object.keys(state.slots || {}).forEach((slotKey) => {
      const baseSlot = state.baseSlots?.[slotKey];
      if (!baseSlot?.effect || baseSlot.effect.type !== "attack") return;
      result.slots[slotKey] = {
        effect: {
          ...baseSlot.effect,
          cannotEvade: true,
          addedCannotEvade: true
        }
      };
    });
  }

  if (state.formId === "base" && state.cpuWingZeroSlot6Ex) {
    result.slots.slot6 = {
      label: "6EX ゼロシステム発動(命中補正)",
      desc: "3ターンの間強化。1ターン目の自分フェイズ初めに相手回避0。効果中自身の攻撃が必中。回避3消費で同じスロット行動をもう一度繰り出す。",
      effect: { type: "custom", effectId: "cpu_wing_zero_hit_system" },
      ex: true
    };
  }

  if (state.formId === "neo_bird" && state.cpuWingZeroSlot6Ex) {
    result.slots.slot6 = {
      label: "6EX 変形ビームソード 40ダメージ",
      desc: "40ダメージ。ヒット時のみMS形態へ移行。現在の所持回避数をMS形態の回避上限を超えて倍にして引き継ぐ。",
      effect: { type: "attack", damage: 40, count: 1, attackType: "melee", beam: true },
      ex: true
    };
  }

  return result;
}

export function onCpuWingZeroBeforeSlot(state, rolledSlotNumber, context = {}) {
  ensureCpuWingZeroState(state);
  state.cpuWingZeroExtraUsedThisSlot = false;

  if (getHitSystem(state) && state.cpuWingZeroHitClearPending && context.enemyState) {
    context.enemyState.evade = 0;
    state.cpuWingZeroHitClearPending = false;
    return { redraw: true, message: "ウイングゼロ：ゼロシステム命中補正。相手回避0" };
  }

  return { redraw: false, message: null };
}

export function getCpuWingZeroExtraWeaponResult(state, context = {}) {
  ensureCpuWingZeroState(state);

 
  const total = { appendAttacks: [], appendMessages: [], redraw: true };

  if (
    state.formId === "base" &&
    context.slotNumber === 5 &&
    state.evade >= 3 &&
    context.enemyState &&
    Number(context.enemyState.evade || 0) <= 0 &&
    Number(context.enemyState.hp || 0) < state.hp / 4 &&
    Math.random() < 0.5
  ) {
    const spent = state.evade;
    state.evade = 0;
    const bonusDamage = Math.floor(spent / 2);
    if (bonusDamage > 0) {
      total.appendAttacks.push(...buildAttack(bonusDamage, 1, {
        attackType: "shoot",
        beam: true,
        ignoreReduction: true
      }));
      total.appendMessages.push(`ウイングゼロ特性：回避${spent}消費、HP1残し追撃 ${bonusDamage}ダメージ`);
    }
  }

  if (
    getHitSystem(state) &&
    !state.cpuWingZeroExtraUsedThisSlot &&
    state.evade >= 3 &&
    state.evadeMax > 0 &&
    Math.random() < state.evade / state.evadeMax &&
    context.slot
  ) {
    state.evade = Math.max(0, state.evade - 3);
    state.cpuWingZeroExtraUsedThisSlot = true;

    const effect = context.slot.effect || {};
    if (effect.type === "attack") {
      total.appendAttacks.push(...buildAttack(effect.damage, effect.count || 1, {
        attackType: effect.attackType,
        beam: effect.beam,
        ignoreReduction: effect.ignoreReduction,
        cannotEvade: true,
        addedCannotEvade: true
      }));
      total.appendMessages.push("ウイングゼロ：回避3消費、同じスロット行動を再攻撃");
    }
  }

  if (total.appendAttacks.length === 0 && total.appendMessages.length === 0) return null;
  return total;
}

export function onCpuWingZeroAfterSlotResolved(state, slotNumber, context = {}) {
  ensureCpuWingZeroState(state);

  const result = context.resolveResult;
  const effectId = result?.customEffectId;

  if (effectId === "cpu_wing_zero_full_evade_3") {
    state.cpuWingZeroFullEvadeTurns = Math.max(state.cpuWingZeroFullEvadeTurns, 1);
    state.evade += 3;
    return { redraw: true, message: "ウイングゼロ：次ターン全攻撃回避、回避+3" };
  }

  if (effectId === "cpu_wing_zero_full_evade_2") {
    state.cpuWingZeroFullEvadeTurns = Math.max(state.cpuWingZeroFullEvadeTurns, 1);
    state.evade += 2;
    return { redraw: true, message: "ウイングゼロ：次ターン全攻撃回避、回避+2" };
  }

  if (effectId === "cpu_wing_zero_evade_system") {
    return { redraw: true, message: activateEvadeSystem(state) };
  }

  if (effectId === "cpu_wing_zero_hit_system") {
    return { redraw: true, message: activateHitSystem(state) };
  }

  if (state.formId === "neo_bird" && slotNumber === 6 && result?.kind === "attack" && !state.cpuWingZeroSlot6Ex) {
    state.hp = Math.min(state.maxHp, state.hp + 80);
    return { redraw: true, message: "ウイングゼロ：突撃 80回復" };
  }

  return { redraw: false, message: null };
}

export function onCpuWingZeroActionResolved(attacker, defender, context = {}) {
  ensureCpuWingZeroState(attacker);

  if (
    attacker.formId === "neo_bird" &&
    context.slotNumber === 6 &&
    attacker.cpuWingZeroSlot6Ex &&
    context.hitCount > 0
  ) {
    returnToMsWithDoubleEvade(attacker);
    return { redraw: true, message: "ウイングゼロ：変形ビームソード命中。MS形態へ移行、回避倍化" };
  }

  return { redraw: false, message: null };
}

export function onCpuWingZeroTurnEnd(state, context = {}) {
  ensureCpuWingZeroState(state);

  const messages = [];
  let redraw = false;

  state.cpuWingZeroSlot6Ex = Math.random() < 0.5;
  redraw = true;

  if (state.cpuWingZeroFullEvadeTurns > 0) {
    state.cpuWingZeroFullEvadeTurns -= 1;
    redraw = true;
  }

  redraw = tickEffect(state, "cpu_wing_zero_evade_system") || redraw;
  redraw = tickEffect(state, "cpu_wing_zero_hit_system") || redraw;

  if (state.formId === "base" && Math.random() < 0.1) {
    if (transformToNeoBird(state)) {
      redraw = true;
      messages.push("ウイングゼロ特性：ネオバード形態へ変形");
    }
  }

  if (
    state.formId === "base" &&
    !state.cpuWingZeroBerserkUsed &&
    !state.cpuWingZeroSystemActivatedOnce &&
    state.hp <= 100
  ) {
    messages.push(activateBerserk(state));
    redraw = true;
  }

  return { redraw, message: messages.length > 0 ? messages.join("\n") : null };
}

export function modifyCpuWingZeroEvadeAttempt(defender, attacker, attack, context = {}) {
  ensureCpuWingZeroState(defender);

  if (defender.cpuWingZeroFullEvadeTurns > 0 && !attack.cannotEvade) {
    return {
      handled: true,
      ok: true,
      consumeEvade: 0,
      message: "ウイングゼロ：全攻撃回避"
    };
  }

  if (getEvadeSystem(defender)) {
    if (defender.evade <= 0) {
      return {
        handled: true,
        ok: false,
        reason: "noEvade",
        message: "回避が足りない"
      };
    }

    return {
      handled: true,
      ok: true,
      consumeEvade: 1,
      message: attack.cannotEvade
        ? "ウイングゼロ：回避1消費、必中攻撃を回避"
        : "ウイングゼロ：ゼロシステム回避、回避1消費"
    };
  }

  return { handled: false };
}

export function modifyCpuWingZeroTakenDamage(defender, attacker, attack, damage) {
  ensureCpuWingZeroState(defender);

  let nextDamage = damage;
  const messages = [];

  if (Math.random() < 0.1) {
    nextDamage = Math.floor(nextDamage * 0.8);
    messages.push("ウイングゼロ特性：10%判定成功、被ダメージ20%軽減");
  }

  if (hasBothSystems(defender)) {
    nextDamage = Math.floor(nextDamage * 2);
    messages.push("ウイングゼロ：両解放により被ダメージ2倍");
  } else if (getEvadeSystem(defender) || getHitSystem(defender)) {
    nextDamage = Math.floor(nextDamage * 1.5);
    messages.push("ウイングゼロ：ゼロシステム中、被ダメージ1.5倍");
  }

  return {
    damage: nextDamage,
    message: messages.length > 0 ? messages.join("\n") : null
  };
}

export function onCpuWingZeroDamaged(defender, attacker) {
  ensureCpuWingZeroState(defender);

  if (
    defender.formId === "base" &&
    !defender.cpuWingZeroBerserkUsed &&
    !defender.cpuWingZeroSystemActivatedOnce &&
    defender.hp <= 100
  ) {
    return { redraw: true, message: activateBerserk(defender) };
  }

  return { redraw: false, message: null };
}
