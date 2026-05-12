import {
  setForm,
  getStateEffect,
  setStateEffect,
  clearStateEffect
} from "./js_unit_runtime.js";

function ensureCpuZState(state) {
  if (typeof state.cpuZFullEvadeTurns !== "number") state.cpuZFullEvadeTurns = 0;
  if (typeof state.cpuZFullEvadePendingTurns !== "number") state.cpuZFullEvadePendingTurns = 0;
  if (typeof state.cpuZBioTurns !== "number") state.cpuZBioTurns = 0;
  if (typeof state.cpuZHyperMega !== "boolean") state.cpuZHyperMega = false;
  if (typeof state.cpuZExRifle !== "boolean") state.cpuZExRifle = false;
  if (typeof state.cpuZBioSlot3Ex !== "boolean") state.cpuZBioSlot3Ex = false;
  if (typeof state.cpuZUsedBio3ExThisAction !== "boolean") state.cpuZUsedBio3ExThisAction = false;
}

function cpuZSetForm(state, formId) {
  return setForm(state, formId, {
    preserveHp: true,
    preserveEvade: true
  });
}
function cpuZSetBoostEffect(state) {
  setStateEffect(state, "cpu_z_biosensor", {
    turns: state.cpuZBioTurns,
    boost: true,
    boostType: "biosensor",
    boostName: "バイオセンサー"
  });
}

function cpuZClearBoostEffect(state) {
  clearStateEffect(state, "cpu_z_biosensor");
}
function cpuZActivateBiosensor(state) {
  ensureCpuZState(state);
  const changed = cpuZSetForm(state, "bio");
  if (!changed) return false;

  state.cpuZBioTurns = 3;
  state.cpuZBioSlot3Ex = false;
  state.cpuZUsedBio3ExThisAction = false;
  cpuZSetBoostEffect(state);

  return true;
}

function cpuZEndBiosensor(state) {
  ensureCpuZState(state);
  state.cpuZBioTurns = 0;
  state.cpuZBioSlot3Ex = false;
  state.cpuZUsedBio3ExThisAction = false;
  return cpuZSetForm(state, "ms");
}

function addCpuZFullEvadePending(state, turns) {
  ensureCpuZState(state);
  state.cpuZFullEvadePendingTurns = Math.max(
    state.cpuZFullEvadePendingTurns,
    turns
  );
}

function cpuZActivatePendingFullEvade(state, messages) {
  ensureCpuZState(state);

  if (state.cpuZFullEvadePendingTurns > 0) {
    state.cpuZFullEvadeTurns = Math.max(
      state.cpuZFullEvadeTurns,
      state.cpuZFullEvadePendingTurns
    );
    messages.push(`CPU Z：全攻撃回避 ${state.cpuZFullEvadePendingTurns}ターン有効化`);
    state.cpuZFullEvadePendingTurns = 0;
  }
}

function cpuZRandomTransform(state, messages) {
  ensureCpuZState(state);

  if (state.formId === "bio") return;

  if (Math.floor(Math.random() * 10) !== 0) return;

  if (state.formId === "ms") {
    if (cpuZSetForm(state, "wr")) {
      messages.push("CPU Z特性：10分の1判定成功。ウェイブライダーへ変形");
    }
    return;
  }

  if (state.formId === "wr") {
    if (cpuZSetForm(state, "ms")) {
      messages.push("CPU Z特性：10分の1判定成功。Zガンダムへ変形");
    }
  }
}

export function getCpuZGundamDerivedState(state) {
  ensureCpuZState(state);

  const result = {
    name: null,
    slots: {},
    specials: {},
    status: []
  };

  if (state.cpuZFullEvadeTurns > 0) {
    result.status.push(`全攻撃回避:${state.cpuZFullEvadeTurns}ターン`);
  }

  if (state.cpuZFullEvadePendingTurns > 0) {
    result.status.push(`全攻撃回避待機:${state.cpuZFullEvadePendingTurns}ターン`);
  }

  if (state.formId === "ms") {
    if (state.cpuZExRifle) {
      result.slots.slot1 = {
        label: "1EX ビームコンフューズ 30ダメージ×3回",
        desc: "30ダメージ×3回。射撃、ビーム。命中回数分、相手の次ターン攻撃を無効化。",
        effect: {
          type: "attack",
          damage: 30,
          count: 3,
          attackType: "shoot",
          beam: true
        },
        ex: true
      };
    }

    if (state.cpuZHyperMega) {
      result.slots.slot6 = {
        label: "6EX ハイメガキャノン 110ダメージ",
        desc: "110ダメージ。射撃。1度使用すると6に戻る。",
        effect: {
          type: "attack",
          damage: 110,
          count: 1,
          attackType: "shoot"
        },
        ex: true
      };
    }

    return result;
  }

  if (state.formId === "bio") {
    result.name = "Zガンダム(バイオセンサー)";

    if (state.cpuZBioTurns > 0) {
      result.status.push(`バイオセンサー:${state.cpuZBioTurns}ターン`);
    }

    const sureHit = getStateEffect(state, "cpu_z_next_sure_hit");
    if (sureHit) {
      if (sureHit.pendingActivation) {
        result.status.push("次ターン攻撃:必中待機");
      } else {
        result.status.push("このターンの攻撃:必中");
      }
    }

    if (state.cpuZBioSlot3Ex) {
      result.slots.slot3 = {
        label: "3EX ハイパービームサーベル両断 150ダメージ",
        desc: "150ダメージ。格闘、ビーム。命中時、バイオセンサー状態+3ターン。",
        effect: {
          type: "attack",
          damage: 150,
          count: 1,
          attackType: "melee",
          beam: true,
          cannotEvade: !!(sureHit && !sureHit.pendingActivation),
          addedCannotEvade: !!(sureHit && !sureHit.pendingActivation)
        },
        ex: true
      };
    }

    if (sureHit && !sureHit.pendingActivation) {
      ["slot3", "slot4", "slot5", "slot6"].forEach((slotKey) => {
        const current = result.slots[slotKey] || {};
        const baseSlot = state.baseSlots[slotKey];

        result.slots[slotKey] = {
          ...current,
          effect: {
            ...(baseSlot?.effect || {}),
            ...(current.effect || {}),
            cannotEvade: true,
            addedCannotEvade: true
          }
        };
      });
    }

    return result;
  }

  return result;
}

export function onCpuZGundamBeforeSlot(state, rolledSlotNumber, context = {}) {
  ensureCpuZState(state);

  let redraw = false;
  const messages = [];

  state.cpuZUsedBio3ExThisAction = false;

  const sureHit = getStateEffect(state, "cpu_z_next_sure_hit");
  if (sureHit && sureHit.pendingActivation) {
    sureHit.pendingActivation = false;
    sureHit.activeForTurn = true;
    redraw = true;
  }

  if (state.formId === "ms") {
    if (rolledSlotNumber === 1 && state.cpuZExRifle) {
      state.cpuZExRifle = false;
      state.cpuZUsedExRifleThisAction = true;
      redraw = true;
    } else {
      state.cpuZUsedExRifleThisAction = false;
    }

    if (rolledSlotNumber === 6 && state.cpuZHyperMega) {
      state.cpuZHyperMega = false;
      state.cpuZUsedHyperMegaThisAction = true;
      redraw = true;
    } else {
      state.cpuZUsedHyperMegaThisAction = false;
    }
  }

  if (state.formId === "bio") {
    if (rolledSlotNumber === 3 && state.cpuZBioSlot3Ex) {
      state.cpuZBioSlot3Ex = false;
      state.cpuZUsedBio3ExThisAction = true;
      redraw = true;
    }
  }

  return {
    redraw,
    message: messages.join("\n") || null
  };
}

export function onCpuZGundamAfterSlotResolved(state, slotNumber, context = {}) {
  ensureCpuZState(state);

  const resolveResult = context.resolveResult || null;

  if (state.formId === "ms") {
    if (
      slotNumber === 4 &&
      resolveResult &&
      resolveResult.kind === "custom"
    ) {
      state.evade = Math.min(state.evadeMax, state.evade + 2);
      addCpuZFullEvadePending(state, 2);

      return {
        redraw: true,
        message: "CPU Z：回避+2。次ターンから2ターン全攻撃回避"
      };
    }

    if (
      slotNumber === 5 &&
      resolveResult &&
      resolveResult.kind === "custom"
    ) {
      const changed = cpuZActivateBiosensor(state);

      return {
        redraw: changed,
        message: changed ? "CPU Z：バイオセンサー発動" : "CPU Z：バイオセンサー発動失敗"
      };
    }

    if (
      slotNumber === 6 &&
      resolveResult &&
      resolveResult.kind === "heal"
    ) {
      state.cpuZHyperMega = true;

      return {
        redraw: true,
        message: "CPU Z：6が6EX ハイメガキャノンに変化"
      };
    }
  }

  if (state.formId === "wr") {
    if (
      (slotNumber === 1 || slotNumber === 3) &&
      resolveResult &&
      resolveResult.kind === "custom"
    ) {
      addCpuZFullEvadePending(state, 1);

      return {
        redraw: true,
        message: "CPU Z：次ターン全攻撃回避を待機"
      };
    }
  }

  if (state.formId === "bio") {
    if (
      slotNumber === 1 &&
      resolveResult &&
      resolveResult.kind === "custom"
    ) {
      state.evade = Math.min(state.evadeMax, state.evade + 2);
      addCpuZFullEvadePending(state, 1);

      return {
        redraw: true,
        message: "CPU Z：回避+2。次ターン全攻撃回避を待機"
      };
    }
  }

  return { redraw: false, message: null };
}

export function onCpuZGundamActionResolved(attacker, defender, context = {}) {
  ensureCpuZState(attacker);

  const messages = [];
  let redraw = false;

  if (attacker.formId === "ms") {
    if (context.slotNumber === 3 && context.allEvaded) {
      attacker.cpuZExRifle = true;
      redraw = true;
      messages.push("CPU Z：1が1EX ビームコンフューズに変化");
    }

    if (
      context.slotKey === "slot1" &&
      attacker.cpuZUsedExRifleThisAction &&
      context.hitCount > 0
    ) {
      defender.confuseStock = (defender.confuseStock || 0) + context.hitCount;
      redraw = true;
      messages.push(`CPU Z：攻撃無効${context.hitCount}回付与`);
    }
  }

  if (attacker.formId === "bio") {
    if (
      context.slotNumber === 3 &&
      context.hitCount > 0 &&
      !attacker.cpuZUsedBio3ExThisAction
    ) {
      attacker.cpuZBioSlot3Ex = true;
      redraw = true;
      messages.push("CPU Z：3が3EX ハイパービームサーベル両断に変化");
    }

    if (
      context.slotNumber === 3 &&
      attacker.cpuZUsedBio3ExThisAction &&
      context.hitCount > 0
    ) {
      attacker.cpuZBioTurns += 3;
      redraw = true;
      messages.push("CPU Z：バイオセンサー状態+3ターン");
    }

    if (context.slotNumber === 4 && context.hitCount > 0) {
      setStateEffect(attacker, "cpu_z_next_sure_hit", {
        turns: 1,
        pendingActivation: true,
        activeForTurn: false
      });

      redraw = true;
      messages.push("CPU Z：次ターンの攻撃が必中");
    }

    if (context.slotNumber === 5 && context.hitCount > 0) {
      defender.confuseStock = (defender.confuseStock || 0) + context.hitCount;
      redraw = true;
      messages.push(`CPU Z：攻撃無効${context.hitCount}回付与`);
    }

    if (context.slotNumber === 6 && context.hitCount > 0) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + 50);
      redraw = true;
      messages.push("CPU Z：HP50回復");
    }

    const wasBioAttack =
      context.totalCount > 0 &&
      ["slot3", "slot4", "slot5", "slot6"].includes(context.slotKey);

    if (wasBioAttack && context.allEvaded) {
      defender.evade = 0;
      redraw = true;
      messages.push("CPU Z：攻撃を完全回避されたため相手の回避を0にした");
    }
  }

  return {
    redraw,
    message: messages.join("\n") || null
  };
}

export function onCpuZGundamTurnEnd(state, context = {}) {
  ensureCpuZState(state);

  const messages = [];
  let redraw = false;

  const sureHit = getStateEffect(state, "cpu_z_next_sure_hit");
  if (sureHit && sureHit.activeForTurn) {
    clearStateEffect(state, "cpu_z_next_sure_hit");
    redraw = true;
  }

  cpuZActivatePendingFullEvade(state, messages);

  if (state.formId === "wr") {
    state.evade = Math.min(state.evadeMax, state.evade + 1);
    messages.push("CPU Z：ウェイブライダー特性で回避+1");
    redraw = true;
  }

  if (state.formId === "bio") {
    if (state.cpuZBioTurns > 0) {
      state.cpuZBioTurns -= 1;
      redraw = true;

      if (state.cpuZBioTurns <= 0) {
        if (cpuZEndBiosensor(state)) {
          messages.push("CPU Z：バイオセンサー終了。Zガンダムへ戻った");
        }
      }
    }
  }

  if (state.cpuZFullEvadeTurns > 0) {
    state.cpuZFullEvadeTurns -= 1;
    redraw = true;
  }

  cpuZRandomTransform(state, messages);

  return {
    redraw: redraw || messages.length > 0,
    message: messages.join("\n") || null
  };
}

export function modifyCpuZGundamTakenDamage(defender, attacker, attack, damage) {
  ensureCpuZState(defender);

  if (defender.formId !== "bio") {
    return { damage, message: null };
  }

  if (attack && attack.ignoreReduction) {
    return { damage, message: null };
  }

  let finalDamage = Math.max(0, damage - 30);

  if (attack && attack.beam) {
    finalDamage = Math.floor(finalDamage / 2);
  }

  return {
    damage: finalDamage,
    message: "CPU Z：バイオセンサー特性でダメージ軽減"
  };
}

export function modifyCpuZGundamEvadeAttempt(state, attacker, attack) {
  ensureCpuZState(state);

  if (!attack || attack.cannotEvade) {
    return { handled: false };
  }

  if (state.cpuZFullEvadeTurns > 0) {
    return {
      handled: true,
      ok: true,
      consumeEvade: 0,
      message: "CPU Z：全攻撃回避"
    };
  }

  return { handled: false };
}
