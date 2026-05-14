import { createAttack } from "./js_battle_system.js";

import {
  setStateEffect,
  getStateEffect,
  clearStateEffect
} from "./js_unit_runtime.js";

const WEAPON_A = {
  rifle: {
    label: "アサルトライフル",
    maxAmmo: 40,
    consume: 5,
    slot: {
      label: "アサルトライフル",
      desc: "10ダメージ×5回 射撃",
      effect: {
        kind: "attack",
        damage: 10,
        count: 5,
        type: "shoot"
      }
    }
  },
  smg: {
    label: "サブマシンガン",
    maxAmmo: 30,
    consume: 10,
    slot: {
      label: "サブマシンガン",
      desc: "5ダメージ×10回 射撃",
      effect: {
        kind: "attack",
        damage: 5,
        count: 10,
        type: "shoot"
      }
    }
  },
  sniper: {
    label: "スナイパーライフル",
    maxAmmo: 3,
    consume: 1,
    slot: {
      label: "スナイパーライフル",
      desc: "50ダメージ 射撃 軽減不可",
      effect: {
        kind: "attack",
        damage: 50,
        count: 1,
        type: "shoot",
        ignoreReduction: true
      }
    }
  }
};

const WEAPON_B = {
  launcher: {
    label: "グレネードランチャー",
    maxAmmo: 5,
    consume: 1,
    slot: {
      label: "グレネードランチャー",
      desc: "80ダメージ 射撃 軽減不可",
      effect: {
        kind: "attack",
        damage: 80,
        count: 1,
        type: "shoot",
        ignoreReduction: true
      }
    }
  },
  melee: {
    label: "格闘",
    maxAmmo: null,
    consume: 0,
    slot: {
      label: "格闘",
      desc: "60ダメージ×2回 格闘 [∞]",
      effect: {
        kind: "attack",
        damage: 60,
        count: 2,
        type: "melee"
      }
    }
  },
  plasma: {
    label: "チャージプラズマガン",
    maxAmmo: 8,
    consume: 1,
    slot: {
      label: "チャージプラズマガン",
      desc: "90ダメージ 射撃 ビーム",
      effect: {
        kind: "attack",
        damage: 90,
        count: 1,
        type: "shoot",
        beam: true
      }
    }
  }
};

const THROW_WEAPON = {
  grenade: {
    label: "グレネード",
    maxAmmo: 1,
    consume: 1,
    slot: {
      label: "グレネード",
      desc: "100ダメージ 射撃",
      effect: {
        kind: "attack",
        damage: 100,
        count: 1,
        type: "shoot"
      }
    }
  },
  incendiary: {
    label: "焼夷弾",
    maxAmmo: 1,
    consume: 1,
    slot: {
      label: "焼夷弾",
      desc: "20ダメージ 格闘。次ターン以降5ターン間、毎ターン開始時20ダメージ格闘攻撃",
      effect: {
        kind: "attack",
        damage: 20,
        count: 1,
        type: "melee"
      }
    }
  },
  chaff: {
    label: "チャフグレネード",
    maxAmmo: 1,
    consume: 1,
    slot: {
      label: "チャフグレネード",
      desc: "3ターン間、必中を除く攻撃を回避消費なしで回避可能",
      effect: {
        kind: "custom"
      }
    }
  }
};

function ensureDaisyState(state) {
  if (!state) return;

  if (!state.daisyWeaponA) state.daisyWeaponA = "rifle";
  if (!state.daisyWeaponB) state.daisyWeaponB = "launcher";
  if (!state.daisyThrowWeapon) state.daisyThrowWeapon = "grenade";

  if (!state.daisyAmmo) {
    state.daisyAmmo = {
      rifle: 40,
      smg: 30,
      sniper: 3,
      launcher: 5,
      melee: Infinity,
      plasma: 8,
      grenade: 1,
      incendiary: 1,
      chaff: 1
    };
  }

  if (typeof state.daisyUsedMagius !== "boolean") {
    state.daisyUsedMagius = false;
  }

  if (typeof state.daisyHealFieldTurns !== "number") {
    state.daisyHealFieldTurns = 0;
  }
}

function ammoText(state, weaponId, maxAmmo) {
  if (maxAmmo === null) return "∞";
  const value = state.daisyAmmo?.[weaponId] ?? 0;
  return String(value);
}

function withAmmoLabel(state, weaponId, weapon) {
  return {
    ...weapon.slot,
    label: `${weapon.slot.label}[${ammoText(state, weaponId, weapon.maxAmmo)}]`
  };
}

function getCurrentWeaponInfoBySlot(state, slotNumber) {
  ensureDaisyState(state);

  if (slotNumber === 2) {
    const id = state.daisyWeaponA;
    return {
      group: "A",
      id,
      data: WEAPON_A[id]
    };
  }

  if (slotNumber === 3) {
    const id = state.daisyWeaponB;
    return {
      group: "B",
      id,
      data: WEAPON_B[id]
    };
  }

  if (slotNumber === 4) {
    const id = state.daisyThrowWeapon;
    return {
      group: "throw",
      id,
      data: THROW_WEAPON[id]
    };
  }

  return null;
}

function hasAmmoForWeapon(state, weaponId, weapon) {
  if (!weapon) return true;
  if (weapon.maxAmmo === null) return true;

  const current = Number(state.daisyAmmo?.[weaponId] || 0);
  return current >= weapon.consume;
}

function consumeAmmo(state, weaponId, weapon) {
  if (!weapon || weapon.maxAmmo === null) return;
  state.daisyAmmo[weaponId] = Math.max(
    0,
    Number(state.daisyAmmo[weaponId] || 0) - weapon.consume
  );
}

function reloadGroup(state, group) {
  ensureDaisyState(state);

  if (group === "A") {
    Object.entries(WEAPON_A).forEach(([id, weapon]) => {
      if (weapon.maxAmmo !== null) state.daisyAmmo[id] = weapon.maxAmmo;
    });
    return "武器攻撃Aを全リロード";
  }

  if (group === "B") {
    Object.entries(WEAPON_B).forEach(([id, weapon]) => {
      if (weapon.maxAmmo !== null) state.daisyAmmo[id] = weapon.maxAmmo;
    });
    return "武器攻撃Bを全リロード";
  }

  if (group === "throw") {
    Object.entries(THROW_WEAPON).forEach(([id, weapon]) => {
      if (weapon.maxAmmo !== null) state.daisyAmmo[id] = weapon.maxAmmo;
    });
    return "投擲武器を全リロード";
  }

  return "リロード";
}

function buildReloadSlot(message) {
  return {
    label: "リロード",
    desc: message,
    effect: {
      kind: "custom"
    }
  };
}

export function getDaisyDerivedState(state) {
  ensureDaisyState(state);

  const weaponA = WEAPON_A[state.daisyWeaponA] || WEAPON_A.rifle;
  const weaponB = WEAPON_B[state.daisyWeaponB] || WEAPON_B.launcher;
  const throwWeapon = THROW_WEAPON[state.daisyThrowWeapon] || THROW_WEAPON.grenade;

  const status = [];

  if (getStateEffect(state, "daisy_chaff")) {
    status.push("チャフ：無償回避");
  }

  if (getStateEffect(state, "daisy_protection")) {
    status.push("プロテクション：完全無敵");
  }

  if (state.daisyHealFieldTurns > 0) {
    status.push(`ヒールフィールド：${state.daisyHealFieldTurns}T`);
  }

  return {
    status,
    slots: {
      slot2: withAmmoLabel(state, state.daisyWeaponA, weaponA),
      slot3: withAmmoLabel(state, state.daisyWeaponB, weaponB),
      slot4: withAmmoLabel(state, state.daisyThrowWeapon, throwWeapon)
    }
  };
}

export function canUseDaisySpecial(state, specialKey, context = {}) {
  ensureDaisyState(state);

  if (specialKey === "special4") {
    const ctx = context.currentAttackContext;
    if (!ctx) return { allowed: false, message: "追撃できる攻撃がありません" };
    if (![2, 3, 4].includes(ctx.slotNumber)) {
      return { allowed: false, message: "追撃対象外です" };
    }
    if (state.evade < 1) {
      return { allowed: false, message: "回避が足りません" };
    }
  }

  if (specialKey === "special5" && state.daisyUsedMagius) {
    return { allowed: false, message: "メイガススキルはこのターン使用済み" };
  }

  return { allowed: true, message: null };
}

export function executeDaisySpecial(state, specialKey, context = {}) {
  ensureDaisyState(state);

  if (specialKey === "special1") {
    return {
      handled: true,
      requestChoice: {
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        source: "daisy_weapon_a",
        choiceType: "select",
        effectType: "daisy_weapon_a",
        options: [
          { value: "rifle", label: "アサルトライフル" },
          { value: "smg", label: "サブマシンガン" },
          { value: "sniper", label: "スナイパーライフル" }
        ]
      }
    };
  }

  if (specialKey === "special2") {
    return {
      handled: true,
      requestChoice: {
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        source: "daisy_weapon_b",
        choiceType: "select",
        effectType: "daisy_weapon_b",
        options: [
          { value: "launcher", label: "グレネードランチャー" },
          { value: "melee", label: "格闘" },
          { value: "plasma", label: "チャージプラズマガン" }
        ]
      }
    };
  }

  if (specialKey === "special3") {
    return {
      handled: true,
      requestChoice: {
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        source: "daisy_throw_weapon",
        choiceType: "select",
        effectType: "daisy_throw_weapon",
        options: [
          { value: "grenade", label: "グレネード" },
          { value: "incendiary", label: "焼夷弾" },
          { value: "chaff", label: "チャフグレネード" }
        ]
      }
    };
  }

  if (specialKey === "special4") {
    const ctx = context.currentAttackContext;
    if (!ctx || ![2, 3, 4].includes(ctx.slotNumber)) {
      return { handled: true, message: "追撃対象外" };
    }

    if (state.evade < 1) {
      return { handled: true, message: "回避が足りません" };
    }

    state.evade -= 1;

    return {
      handled: true,
      startSlotAction: {
        slotKey: ctx.slotKey
      },
      message: "追撃"
    };
  }

  if (specialKey === "special5") {
    if (state.daisyUsedMagius) {
      return { handled: true, message: "このターンは使用済み" };
    }

    return {
      handled: true,
      requestChoice: {
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        source: "daisy_magius",
        choiceType: "select",
        effectType: "daisy_magius",
        options: [
          { value: "shade", label: "シェイドフィールド" },
          { value: "heal", label: "ヒールフィールド" },
          { value: "multi", label: "マルチシュート" },
          { value: "jammer", label: "モビリティジャマー" },
          { value: "protect", label: "プロテクション" }
        ]
      }
    };
  }

  return { handled: false };
}

export function onDaisyBeforeSlot(state, slotNumber, context = {}) {
  ensureDaisyState(state);

  if (slotNumber === 6) {
    state.evade *= 2;
    if (state.evade > state.evadeMax) {
      state.overEvadeMode = true;
      state.overEvadeCap = state.evade;
      state.overEvadeBaseMax = state.evadeMax;
    }

    return {
      redraw: true,
      message: "スキャニング：回避所持数を倍加"
    };
  }

  if (![2, 3, 4].includes(slotNumber)) {
    return { redraw: false, message: null };
  }

  const info = getCurrentWeaponInfoBySlot(state, slotNumber);
  if (!info || !info.data) return { redraw: false, message: null };

  if (!hasAmmoForWeapon(state, info.id, info.data)) {
    const message = reloadGroup(state, info.group);

    context.slot.label = "リロード";
    context.slot.desc = message;
    context.slot.effect = {
      kind: "custom"
    };

    return {
      redraw: true,
      message
    };
  }

  consumeAmmo(state, info.id, info.data);

  if (slotNumber === 4 && info.id === "chaff") {
    setStateEffect(state, "daisy_chaff", {
      turns: 3,
      skipNextTick: true
    });

    context.slot.label = "チャフグレネード";
    context.slot.desc = "3ターン間、必中を除く攻撃を回避消費なしで回避可能";
    context.slot.effect = {
      kind: "custom"
    };

    return {
      redraw: true,
      message: "チャフグレネード：無償回避状態"
    };
  }

  return { redraw: true, message: null };
}

export function onDaisyAfterSlotResolved(state, slotNumber, resolveResult, context = {}) {
export function onDaisyAfterSlotResolved(state, slotNumber, resolveResult, context = {}) {
  ensureDaisyState(state);

  if (slotNumber === 4 && state.daisyThrowWeapon === "incendiary") {
    const enemyPlayer = context.enemyPlayer;
    const ownerPlayer = context.ownerPlayer;

    return {
      redraw: true,
      message: "焼夷弾：5ターン継続燃焼を予約",
      reserveActions: [1, 2, 3, 4, 5].map(delay => ({
        ownerPlayer,
        enemyPlayer,
        trigger: "turn_start",
        delay,
        type: "attack",
        label: `焼夷弾 継続ダメージ ${delay}/5`,
        attacks: createAttack(20, 1, {
          type: "melee",
          source: "焼夷弾 継続ダメージ"
        })
      }))
    };
  }

  return { redraw: false, message: null };
}

export function onDaisyActionResolved(attacker, defender, context = {}) {
  ensureDaisyState(attacker);

  if (
    [2, 3, 4].includes(context.slotNumber) &&
    attacker.evade >= 1 &&
    context.slotKey
  ) {
    return {
      redraw: true,
      requestChoice: {
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        source: "daisy_follow_up",
        choiceType: "confirm",
        effectType: "daisy_follow_up",
        slotKey: context.slotKey,
        options: [
          { value: "yes", label: "追撃する" },
          { value: "no", label: "追撃しない" }
        ]
      }
    };
  }

  return { redraw: false, message: null };
}

export function onDaisyResolveChoice(state, pendingChoice, selectedValue, context = {}) {
  ensureDaisyState(state);

  if (pendingChoice.effectType === "daisy_weapon_a") {
    state.daisyWeaponA = selectedValue;
    return { handled: true, redraw: true, message: "武器攻撃A変更" };
  }

  if (pendingChoice.effectType === "daisy_weapon_b") {
    state.daisyWeaponB = selectedValue;
    return { handled: true, redraw: true, message: "武器攻撃B変更" };
  }

  if (pendingChoice.effectType === "daisy_throw_weapon") {
    state.daisyThrowWeapon = selectedValue;
    return { handled: true, redraw: true, message: "投擲武器変更" };
  }

  if (pendingChoice.effectType === "daisy_follow_up") {
    if (selectedValue !== "yes") {
      return { handled: true, redraw: false, message: "追撃しない" };
    }

    if (state.evade < 1) {
      return { handled: true, redraw: true, message: "回避が足りません" };
    }

    state.evade -= 1;

    return {
      handled: true,
      redraw: true,
      message: "追撃",
      startSlotAction: {
        slotKey: pendingChoice.slotKey
      }
    };
  }

  if (pendingChoice.effectType === "daisy_magius") {
    state.daisyUsedMagius = true;

    if (selectedValue === "shade") {
      state.actionCount = Number(state.actionCount || 0) + 1;
      return { handled: true, redraw: true, message: "シェイドフィールド：行動権+1" };
    }

    if (selectedValue === "heal") {
      state.daisyHealFieldTurns = 5;
      return { handled: true, redraw: true, message: "ヒールフィールド：5ターン間、ターン終了時に追加回復" };
    }

    if (selectedValue === "multi") {
      return {
        handled: true,
        appendAttacks: createAttack(20, 10, {
          type: "shoot",
          source: "マルチシュート"
        }),
        message: "マルチシュート"
      };
    }

    if (selectedValue === "jammer") {
      const enemy = context.enemyState;
      if (enemy) enemy.evade = 0;
      return { handled: true, redraw: true, message: "モビリティジャマー：相手回避0" };
    }

    if (selectedValue === "protect") {
      setStateEffect(state, "daisy_protection", {
        turns: 1,
        skipNextTick: true
      });

      return { handled: true, redraw: true, message: "プロテクション：完全無敵" };
    }
  }

  return { handled: false };
}

export function onDaisyTurnEnd(state) {
  ensureDaisyState(state);

  state.daisyUsedMagius = false;

  let message = null;

  if (state.daisyHealFieldTurns > 0) {
    const before = state.hp;
    state.hp = Math.min(state.maxHp, state.hp + 40);
    state.daisyHealFieldTurns -= 1;
    message = `ヒールフィールド：${state.hp - before}回復`;
  }

  return {
    redraw: true,
    message
  };
}

export function modifyDaisyEvadeAttempt(defender, attacker, attack, context = {}) {
  ensureDaisyState(defender);

  if (!getStateEffect(defender, "daisy_chaff")) {
    return { handled: false };
  }

  if (attack?.cannotEvade) {
    if (defender.evade <= 0) {
      return {
        handled: true,
        ok: false,
        message: "必中攻撃：回避が足りません"
      };
    }

    return {
      handled: true,
      ok: true,
      consumeEvade: 1,
      message: "必中攻撃を回避"
    };
  }

  return {
    handled: true,
    ok: true,
    consumeEvade: 0,
    message: "チャフ：無償回避"
  };
}

export function modifyDaisyTakenDamage(defender, attacker, attack, damage) {
  ensureDaisyState(defender);

  if (getStateEffect(defender, "daisy_protection")) {
    return {
      damage: 0,
      cancelled: true,
      message: "プロテクション：完全無敵"
    };
  }

  return {
    damage,
    message: null
  };
}
