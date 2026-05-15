import {
  setForm,
  getStateEffect,
  setStateEffect,
  clearStateEffect,
  reduceEvade,
  doubleEvadeRedCap,
  normalizeEvadeCapState,
  executeUnitDispelBoostState
} from "./js_unit_runtime.js";

import { createAttack } from "./js_battle_system.js";

function ensureUnicornState(state) {
  if (!state) return;

  if (typeof state.unicornResonanceStock !== "number") state.unicornResonanceStock = 0;
  if (typeof state.unicornShieldCount !== "number") state.unicornShieldCount = 3;
  if (typeof state.unicornWeaponExMode !== "boolean") state.unicornWeaponExMode = false;
}

function isDestroy(state) {
  return state?.formId === "destroy";
}

function isAwaken(state) {
  return state?.formId === "awaken";
}

function enterDestroy(state, turns = 5) {
  ensureUnicornState(state);

  const changed = setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  if (changed) {
    state.unicornShieldCount += 1;
  }

  setStateEffect(state, "unicorn_ntd", {
    turns,
    boost: true,
    skipNextTick: true
  });

  clearStateEffect(state, "unicorn_awaken");
  state.unicornWeaponExMode = false;

  return changed;
}

function enterAwaken(state) {
  ensureUnicornState(state);

  const turns = Math.max(0, Number(state.unicornResonanceStock || 0));
  if (turns <= 0) {
    return false;
  }

  setForm(state, "awaken", {
    preserveHp: true,
    preserveEvade: true
  });

  setStateEffect(state, "unicorn_awaken", {
    turns,
    skipNextTick: true,
    boost: false
  });

  return true;
}

function returnToDestroy(state) {
  setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  clearStateEffect(state, "unicorn_awaken");
  state.unicornWeaponExMode = false;
}

function returnToUnicorn(state) {
  setForm(state, "unicorn", {
    preserveHp: true,
    preserveEvade: true
  });

  clearStateEffect(state, "unicorn_ntd");
  clearStateEffect(state, "unicorn_awaken");
  state.unicornWeaponExMode = false;
}

function consumeResonanceForAwaken(state) {
  ensureUnicornState(state);

  if (state.unicornResonanceStock <= 0) {
    return {
      ok: false,
      message: "特殊行動2の保持数がありません"
    };
  }

  if (Math.random() < 0.5) {
    enterAwaken(state);
    return {
      ok: true,
      message: "覚醒した"
    };
  }

  state.unicornResonanceStock -= 1;

  const ntd = getStateEffect(state, "unicorn_ntd");
  if (ntd && typeof ntd.turns === "number") {
    ntd.turns += 1;
  }

  return {
    ok: true,
    message: "デストロイモードの強化ターン+1"
  };
}
function gainResonanceByEvadeCost(state, cost) {
  ensureUnicornState(state);

  if (state.evade < cost) {
    return {
      handled: true,
      redraw: false,
      message: "回避が足りません"
    };
  }

  reduceEvade(state, cost);
  state.unicornResonanceStock += 1;

  return {
    handled: true,
    redraw: true,
    message: `特殊行動2保持数+1（現在${state.unicornResonanceStock}）`
  };
}

function isPsychommuAttack(attack) {
  if (!attack) return false;

  return attack.psychommu === true ||
    attack.funnel === true ||
    attack.dragoon === true ||
    attack.incom === true ||
    attack.specialAttribute === "psychommu";
}

function applyBeamMagnumHit(attacker, defender, allowMinus) {
  if (!defender) return null;

  if (allowMinus) {
    defender.evade = Number(defender.evade || 0) - 1;
  } else if (defender.evade > 0) {
    defender.evade -= 1;
  }

  normalizeEvadeCapState(defender);
  return `${defender.name}の回避-1`;
}

export function getUnicornDerivedState(state) {
  ensureUnicornState(state);

  const ntd = getStateEffect(state, "unicorn_ntd");
  const awaken = getStateEffect(state, "unicorn_awaken");

  const status = [
    `特殊2保持:${state.unicornResonanceStock}`,
    `シールド:${state.unicornShieldCount}`
  ];

  if (ntd && typeof ntd.turns === "number" && ntd.turns > 0) {
    status.push(`NT-D 残${ntd.turns}ターン`);
  }

  if (awaken && typeof awaken.turns === "number" && awaken.turns > 0) {
    status.push(`NT-D覚醒 残${awaken.turns}ターン`);
  }

  const derived = { status };

  if (isAwaken(state) && state.unicornWeaponExMode) {
    derived.slots = {
      slot3: {
        label: "バズーカ砲 75ダメージ×2回",
        desc: "75ダメージ×2回。射撃、軽減不可",
        effect: {
          type: "attack",
          damage: 75,
          count: 2,
          attackType: "shoot",
          ignoreReduction: true
        }
      },
      slot4: {
        label: "ガトリング砲 10ダメージ×12回",
        desc: "10ダメージ×12回。射撃、軽減不可",
        effect: {
          type: "attack",
          damage: 10,
          count: 12,
          attackType: "shoot",
          ignoreReduction: true
        }
      }
    };
  }

  return derived;
}

export function canUseUnicornSpecial(state, specialKey, context = {}) {
  ensureUnicornState(state);

  const special = state.specials?.[specialKey];
  if (!special) return { allowed: false, message: "特殊行動が見つかりません" };

  if (special.effectType === "unicorn_shield") {
    return {
      allowed: state.unicornShieldCount > 0,
      message: state.unicornShieldCount > 0 ? null : "シールド残数がありません"
    };
  }

  if (special.effectType === "unicorn_resonance" || special.effectType === "unicorn_awaken_try") {
    return {
      allowed: state.unicornResonanceStock > 0,
      message: state.unicornResonanceStock > 0 ? null : "特殊行動2の保持数がありません"
    };
  }

  if (special.effectType === "unicorn_resolve") {
    return { allowed: state.evade >= 1, message: state.evade >= 1 ? null : "回避が足りません" };
  }

  if (special.effectType === "unicorn_calm") {
    return { allowed: state.evade >= 2, message: state.evade >= 2 ? null : "回避が足りません" };
  }

  if (special.effectType === "unicorn_shield_funnel") {
    return { allowed: state.evade >= 1, message: state.evade >= 1 ? null : "回避が足りません" };
  }

  return { allowed: true, message: null };
}

export function executeUnicornSpecial(state, specialKey, context = {}) {
  ensureUnicornState(state);

  const special = state.specials?.[specialKey];
  if (!special) return { handled: false };

  if (special.effectType === "unicorn_shield") {
    if (state.unicornShieldCount <= 0) {
      return { handled: true, message: "シールド残数がありません" };
    }

    state.unicornShieldCount -= 1;
    state.shieldActive = true;

    return {
      handled: true,
      redraw: true,
      message: `シールド発動。残り${state.unicornShieldCount}`
    };
  }

  if (special.effectType === "unicorn_resonance") {
    if (state.unicornResonanceStock <= 0) {
      return { handled: true, message: "特殊行動2の保持数がありません" };
    }

    state.unicornResonanceStock -= 1;

    if (Math.random() < 0.5) {
      enterDestroy(state, 5);
      return {
        handled: true,
        redraw: true,
        message: "共振成功。デストロイモードに変形"
      };
    }

    return {
      handled: true,
      redraw: true,
      message: "共振せず"
    };
  }

  if (special.effectType === "unicorn_resolve") {
    return gainResonanceByEvadeCost(state, 1);
  }

  if (special.effectType === "unicorn_awaken_try") {
    const result = consumeResonanceForAwaken(state);
    return {
      handled: true,
      redraw: true,
      message: result.message
    };
  }

  if (special.effectType === "unicorn_calm") {
    return gainResonanceByEvadeCost(state, 2);
  }

  if (special.effectType === "unicorn_weapon_change") {
    state.unicornWeaponExMode = !state.unicornWeaponExMode;

    return {
      handled: true,
      redraw: true
    };
  }

  if (special.effectType === "unicorn_shield_funnel") {
    if (state.evade <= 0) {
      return { handled: true, message: "回避が足りません" };
    }

    reduceEvade(state, 1);

    return {
      handled: true,
      redraw: true,
      appendAttacks: createAttack(30, 1, {
        type: "shoot",
        source: "シールドファンネル"
      }),
      message: "シールドファンネル射出"
    };
  }

  if (special.effectType === "unicorn_ghost_return") {
    const evadeBefore = Math.max(0, Number(state.evade || 0));
    const stockBefore = Math.max(0, Number(state.unicornResonanceStock || 0));
    const damage = evadeBefore * 5 * stockBefore;

    state.evade = 0;
    state.unicornResonanceStock = 0;
    normalizeEvadeCapState(state);

    return {
      handled: true,
      redraw: true,
      appendAttacks: createAttack(damage, 1, {
        type: "melee",
        ignoreReduction: true,
        source: "亡霊は暗黒に帰れ！"
      }),
      message: `解放出力ビームトンファー：${damage}ダメージ`
    };
  }

  return { handled: false };
}

export function onUnicornAfterSlotResolved(state, slotNumber, payload = {}) {
  ensureUnicornState(state);

  const result = payload.resolveResult;

  if (result?.customEffectId === "unicorn_ntd_activate") {
    enterDestroy(state, 5);

    return {
      redraw: true,
      message: "NT-D発動。5ターン間デストロイモード"
    };
  }

  if (result?.customEffectId === "unicorn_rush") {
    const count = Math.max(0, Number(state.evade || 0));

    return {
      redraw: false,
      appendAttacks: createAttack(40, count, {
        type: "melee",
        source: "乱撃"
      }),
      message: `乱撃：40ダメージ×${count}回`
    };
  }

  if (result?.customEffectId === "unicorn_double_evade") {
    doubleEvadeRedCap(state);

    return {
      redraw: true,
      message: "回避所持数倍加"
    };
  }

  return { redraw: false, message: null };
}

export function onUnicornActionResolved(attacker, defender, context = {}) {
  ensureUnicornState(attacker);

  const hitCount = Number(context.hitCount || 0);
  if (hitCount <= 0) {
    return { redraw: false, message: null };
  }

  const slotNumber = Number(context.slotNumber || 0);
  const slotLabel = context.slotLabel || "";

  if (slotLabel.includes("ビームマグナム")) {
    const allowMinus = isDestroy(attacker) || isAwaken(attacker);
    const message = applyBeamMagnumHit(attacker, defender, allowMinus);

    return {
      redraw: true,
      message
    };
  }

  if (isDestroy(attacker) && slotNumber === 4) {
    const dispel = executeUnitDispelBoostState(defender, attacker, {
      source: "波動"
    });

    if (attacker.actionCount < 99) attacker.actionCount += 1;

    return {
      redraw: true,
      message: dispel?.message
        ? `波動：${dispel.message}\n${attacker.name}の行動権+1`
        : `波動：${attacker.name}の行動権+1`
    };
  }

  if (isAwaken(attacker) && slotNumber === 5 && hitCount >= 5) {
    return {
      redraw: false,
      appendAttacks: createAttack(100, 1, {
        type: "melee",
        source: "ソフトチェストタッチ追撃"
      }),
      appendSlotLabel: "ソフトチェストタッチ追撃",
      message: "フルヒット追撃：100ダメージ"
    };
  }

  if (isAwaken(attacker) && slotNumber === 6) {
    if (defender) {
      defender.evade = 0;
      normalizeEvadeCapState(defender);
      setStateEffect(defender, "unicorn_light_damage_half", {
        turns: 5,
        skipNextTick: true
      });
    }

    const dispel = executeUnitDispelBoostState(defender, attacker, {
      source: "光"
    });

    attacker.actionCount += 2;

    return {
      redraw: true,
      message: dispel?.message
        ? `光：${defender.name}の回避を0にした。\n${dispel.message}\n${attacker.name}の行動権+2`
        : `光：${defender.name}の回避を0にした。\n${attacker.name}の行動権+2`
    };
  }

  return { redraw: false, message: null };
}

export function onUnicornTurnEnd(state, context = {}) {
  ensureUnicornState(state);

  if (isAwaken(state)) {
    state.hp = Math.min(state.maxHp, state.hp + 20);

    const awaken = getStateEffect(state, "unicorn_awaken");
    if (awaken && typeof awaken.turns === "number") {
      if (awaken.skipNextTick) {
        awaken.skipNextTick = false;
      } else {
        awaken.turns -= 1;
        state.unicornResonanceStock = Math.max(0, state.unicornResonanceStock - 1);
      }

      if (awaken.turns <= 0) {
        state.unicornResonanceStock = 0;
        returnToDestroy(state);
        return {
          redraw: true,
          message: "覚醒終了。デストロイモードへ移行"
        };
      }
    }

    return {
      redraw: true,
    };
  }

  const ntd = getStateEffect(state, "unicorn_ntd");
  if (isDestroy(state) && ntd && typeof ntd.turns === "number") {
    if (ntd.skipNextTick) {
      ntd.skipNextTick = false;
      return { redraw: false, message: null };
    }

    ntd.turns -= 1;

    if (ntd.turns <= 0) {
      returnToUnicorn(state);

      return {
        redraw: true,
        message: "NT-D終了。ユニコーンモードへ戻った。"
      };
    }
  }

  return { redraw: false, message: null };
}

export function modifyUnicornTakenDamage(defender, attacker, attack, damage) {
  ensureUnicornState(defender);

  if ((isDestroy(defender) || isAwaken(defender)) && isPsychommuAttack(attack)) {
    return {
      damage: 0,
      message: `${defender.name}はサイコミュ系攻撃を無効化した`
    };
  }

  let finalDamage = damage;

  if (getStateEffect(defender, "unicorn_light_damage_half")) {
    finalDamage = Math.floor(finalDamage / 2);
  }

  if (isAwaken(defender) && Math.random() < 0.75 && !attack.ignoreReduction) {
    finalDamage = Math.floor(finalDamage / 2);

    return {
      damage: finalDamage,
      message: "シールドファンネル：ダメージ半減"
    };
  }

  return {
    damage: finalDamage,
    message: null
  };
}

export function onUnicornDispelBoostState(state, source, context = {}) {
  if (isAwaken(state)) {
    return {
      handled: true,
      changed: false
    };
  }

  const wasDestroy = isDestroy(state) || !!getStateEffect(state, "unicorn_ntd");
  if (!wasDestroy) {
    return {
      handled: true,
      changed: false,
      message: null
    };
  }

  returnToUnicorn(state);

  return {
    handled: true,
    changed: true
  };
}
