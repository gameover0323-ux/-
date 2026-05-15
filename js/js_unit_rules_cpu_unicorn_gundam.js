import {
  setForm,
  getStateEffect,
  setStateEffect,
  clearStateEffect,
  addEvade,
  reduceEvade,
  doubleEvadeRedCap,
  normalizeEvadeCapState,
  executeUnitDispelBoostState,
  hasBoostStateEffect
} from "./js_unit_runtime.js";

import { createAttack } from "./js_battle_system.js";

function ensureCpuUnicornState(state) {
  if (typeof state.cpuUnicornTurnTickedActionCount !== "number") {
    state.cpuUnicornTurnTickedActionCount = -1;
  }
  if (!state) return;

  if (typeof state.unicornResonanceStock !== "number") {
    state.unicornResonanceStock = 0;
  }

  if (typeof state.cpuUnicornBoostSeen !== "boolean") {
    state.cpuUnicornBoostSeen = false;
  }

  if (typeof state.cpuUnicornFullEvadeTurns !== "number") {
    state.cpuUnicornFullEvadeTurns = 0;
  }
}

function isDestroy(state) {
  return state?.formId === "destroy";
}

function isAwaken(state) {
  return state?.formId === "awaken";
}

function enterDestroy(state, turns = 5) {
  ensureCpuUnicornState(state);

  setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  setStateEffect(state, "cpu_unicorn_ntd", {
    turns,
    boost: true,
    skipNextTick: true
  });

  clearStateEffect(state, "cpu_unicorn_awaken");
}

function enterAwaken(state) {
  ensureCpuUnicornState(state);

  const turns = Math.max(1, Number(state.unicornResonanceStock || 0));

  setForm(state, "awaken", {
    preserveHp: true,
    preserveEvade: true
  });

  setStateEffect(state, "cpu_unicorn_awaken", {
    turns,
    skipNextTick: true,
    boost: false
  });
}

function returnToDestroy(state) {
  setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  clearStateEffect(state, "cpu_unicorn_awaken");
}

function returnToUnicorn(state) {
  const beforeEvade = Number(state.evade || 0);

  setForm(state, "unicorn", {
    preserveHp: true,
    preserveEvade: true
  });

  state.evade = Math.max(0, beforeEvade);

  clearStateEffect(state, "cpu_unicorn_ntd");
  clearStateEffect(state, "cpu_unicorn_awaken");

  normalizeEvadeCapState(state);
}
function isPsychommuAttack(attack) {
  if (!attack) return false;

  return attack.psychommu === true ||
    attack.funnel === true ||
    attack.dragoon === true ||
    attack.incom === true ||
    attack.specialAttribute === "psychommu" ||
    attack.type === "psychommu";
}

function consumeEvadeForStockByRate(state, cost) {
  ensureCpuUnicornState(state);

  const evade = Math.max(0, Number(state.evade || 0));
  const evadeMax = Math.max(1, Number(state.evadeMax || 1));
  const rate = Math.min(1, evade / evadeMax);

  if (evade < cost) return null;
  if (Math.random() >= rate) return null;

  reduceEvade(state, cost);
  state.unicornResonanceStock += 1;

  return `覚醒保持+1（現在${state.unicornResonanceStock}）`;
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

export function getCpuUnicornDerivedState(state) {
  ensureCpuUnicornState(state);

  const ntd = getStateEffect(state, "cpu_unicorn_ntd");
  const awaken = getStateEffect(state, "cpu_unicorn_awaken");

  const status = [
    `覚醒保持:${state.unicornResonanceStock}`
  ];

  if (ntd && typeof ntd.turns === "number" && ntd.turns > 0) {
    status.push(`NT-D 残${ntd.turns}ターン`);
  }

  if (awaken && typeof awaken.turns === "number" && awaken.turns > 0) {
    status.push(`NT-D覚醒 残${awaken.turns}ターン`);
  }

  const derived = { status };

  if (isAwaken(state) && Math.random() < 0.5) {
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

export function onCpuUnicornBeforeSlot(state, rolledSlotNumber, context = {}) {
  ensureCpuUnicornState(state);

  const enemyState = context.enemyState;
  const messages = [];

  const actionCountMarker = Number(state.actionCount || 0);

  if (state.cpuUnicornTurnTickedActionCount !== actionCountMarker) {
    state.cpuUnicornTurnTickedActionCount = actionCountMarker;

    if (isAwaken(state)) {
      state.hp = Math.min(state.maxHp, state.hp + 20);
      messages.push("CPUユニコーン：覚醒回復20");

      const awaken = getStateEffect(state, "cpu_unicorn_awaken");
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
          messages.push("覚醒終了。デストロイモードへ移行");
        }
      }
    } else {
      const ntd = getStateEffect(state, "cpu_unicorn_ntd");
      if (isDestroy(state) && ntd && typeof ntd.turns === "number") {
        if (ntd.skipNextTick) {
          ntd.skipNextTick = false;
        } else {
          ntd.turns -= 1;
        }

        if (ntd.turns <= 0) {
          returnToUnicorn(state);
          messages.push("NT-D終了。ユニコーンモードへ戻った。");
        }
      }
    }
  }

  if (enemyState && hasBoostStateEffect(enemyState) && !state.cpuUnicornBoostSeen) {
    state.cpuUnicornBoostSeen = true;
    state.unicornResonanceStock += 1;

    if (!isDestroy(state) && !isAwaken(state)) {
      if (Math.random() < 0.5) {
        enterDestroy(state, 5);
        messages.push("CPUユニコーン：強化反応。NT-D発動");
      } else {
        messages.push("CPUユニコーン：強化反応不発。覚醒保持+1");
      }
    } else if (isDestroy(state)) {
      if (Math.random() < 0.5) {
        enterAwaken(state);
        messages.push("CPUユニコーン：強化反応。覚醒");
      } else {
        const ntd = getStateEffect(state, "cpu_unicorn_ntd");
        if (ntd && typeof ntd.turns === "number") {
          ntd.turns += 1;
        }
        messages.push("CPUユニコーン：NT-D残ターン+1。覚醒保持+1");
      }
    }
  }

  if (enemyState && !hasBoostStateEffect(enemyState)) {
    state.cpuUnicornBoostSeen = false;
  }

  if (isDestroy(state) && !isAwaken(state) && state.unicornResonanceStock > 0) {
    if (Math.random() < 0.05) {
      enterAwaken(state);
      messages.push("CPUユニコーン：覚醒保持値に反応。覚醒");
    }
  }

  const cost = isDestroy(state) && !isAwaken(state) ? 2 : 1;
  const stockMessage = consumeEvadeForStockByRate(state, cost);
  if (stockMessage) {
    messages.push(`CPUユニコーン：${stockMessage}`);
  }

  return {
    redraw: messages.length > 0,
    message: messages.length > 0 ? messages.join("\n") : null
  };
}
export function onCpuUnicornAfterSlotResolved(state, slotNumber, payload = {}) {
  ensureCpuUnicornState(state);

  const result = payload.resolveResult;

  if (result?.customEffectId === "cpu_unicorn_ntd_activate") {
    enterDestroy(state, 5);

    return {
      redraw: true,
      message: "NT-D発動。5ターン間デストロイモード"
    };
  }

  if (result?.customEffectId === "cpu_unicorn_full_evade") {
    addEvade(state, 3);
    state.cpuUnicornFullEvadeTurns = 1;

    return {
      redraw: true,
      message: "回避+3。次のターンの攻撃を全回避"
    };
  }

  if (result?.customEffectId === "cpu_unicorn_rush") {
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

  if (result?.customEffectId === "cpu_unicorn_double_evade") {
    doubleEvadeRedCap(state);

    return {
      redraw: true,
      message: "回避所持数倍加"
    };
  }

  return { redraw: false, message: null };
}

export function onCpuUnicornActionResolved(attacker, defender, context = {}) {
  ensureCpuUnicornState(attacker);

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
      setStateEffect(defender, "cpu_unicorn_light_damage_half", {
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

export function onCpuUnicornTurnEnd(state, context = {}) {
  ensureCpuUnicornState(state);

  if (state.cpuUnicornFullEvadeTurns > 0) {
    state.cpuUnicornFullEvadeTurns -= 1;
  }

  if (isAwaken(state)) {
    const awaken = getStateEffect(state, "cpu_unicorn_awaken");

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

    return { redraw: true, message: null };
  }

  const ntd = getStateEffect(state, "cpu_unicorn_ntd");
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

export function modifyCpuUnicornTakenDamage(defender, attacker, attack, damage) {
  ensureCpuUnicornState(defender);

  if ((isDestroy(defender) || isAwaken(defender)) && isPsychommuAttack(attack)) {
    return {
      damage: 0,
      message: `${defender.name}はサイコミュ系攻撃を無効化した`
    };
  }

  let finalDamage = damage;

  if (getStateEffect(defender, "cpu_unicorn_light_damage_half")) {
    finalDamage = Math.floor(finalDamage / 2);
  }

  if (!isDestroy(defender) && !isAwaken(defender) && Math.random() < 0.1) {
    finalDamage = Math.floor(finalDamage / 2);
    return {
      damage: finalDamage,
      message: "ユニコーン特性：ダメージ半減"
    };
  }

  if (isDestroy(defender) && Math.random() < 0.3) {
    finalDamage = Math.floor(finalDamage / 2);
    return {
      damage: finalDamage,
      message: "デストロイモード特性：ダメージ半減"
    };
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

export function modifyCpuUnicornEvadeAttempt(defender, attacker, attack, context = {}) {
  ensureCpuUnicornState(defender);

  if (defender.cpuUnicornFullEvadeTurns > 0) {
    return {
      canEvade: true,
      forceEvade: true,
      message: "ユニコーン：全回避"
    };
  }

  return {};
          }
