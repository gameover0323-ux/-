import {
  createAttack
} from "./js_battle_system.js";

import {
  setStateEffect,
  getStateEffect,
  clearStateEffect,
  addPendingAttack
} from "./js_unit_runtime.js";

function ensureDaisyState(state) {
  if (!state) return;

  if (!state.daisyWeaponA) state.daisyWeaponA = "rifle";
  if (!state.daisyWeaponB) state.daisyWeaponB = "launcher";
  if (!state.daisyThrowWeapon) state.daisyThrowWeapon = "grenade";

  if (typeof state.daisyWeaponABullets !== "number") {
    state.daisyWeaponABullets = 40;
  }

  if (typeof state.daisyWeaponBBullets !== "number") {
    state.daisyWeaponBBullets = 5;
  }

  if (typeof state.daisyThrowBullets !== "number") {
    state.daisyThrowBullets = 1;
  }

  if (typeof state.daisyUsedMagius !== "boolean") {
    state.daisyUsedMagius = false;
  }
}

export function getDaisyDerivedState(state) {
  ensureDaisyState(state);

  const slots = {};

  // slot2
  if (state.daisyWeaponA === "rifle") {
    slots.slot2 = {
      label: `アサルトライフル[${state.daisyWeaponABullets}]`,
      desc: "10ダメージ×5回 射撃",
      effect: {
        kind: "attack",
        damage: 10,
        count: 5,
        type: "shoot"
      }
    };
  }

  if (state.daisyWeaponA === "smg") {
    slots.slot2 = {
      label: `サブマシンガン[${state.daisyWeaponABullets}]`,
      desc: "5ダメージ×10回 射撃",
      effect: {
        kind: "attack",
        damage: 5,
        count: 10,
        type: "shoot"
      }
    };
  }

  if (state.daisyWeaponA === "sniper") {
    slots.slot2 = {
      label: `スナイパーライフル[${state.daisyWeaponABullets}]`,
      desc: "50ダメージ 射撃 軽減不可",
      effect: {
        kind: "attack",
        damage: 50,
        count: 1,
        type: "shoot",
        ignoreReduction: true
      }
    };
  }

  return {
    slots
  };
}

export function executeDaisySpecial(state, specialKey, context = {}) {
  ensureDaisyState(state);

  // 武器A
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
          {
            value: "rifle",
            label: "アサルトライフル"
          },
          {
            value: "smg",
            label: "サブマシンガン"
          },
          {
            value: "sniper",
            label: "スナイパーライフル"
          }
        ]
      }
    };
  }

  // メイガス
  if (specialKey === "special5") {
    if (state.daisyUsedMagius) {
      return {
        handled: true,
        message: "このターンは使用済み"
      };
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
          {
            value: "shade",
            label: "シェイドフィールド"
          },
          {
            value: "heal",
            label: "ヒールフィールド"
          },
          {
            value: "multi",
            label: "マルチシュート"
          },
          {
            value: "jammer",
            label: "モビリティジャマー"
          },
          {
            value: "protect",
            label: "プロテクション"
          }
        ]
      }
    };
  }

  return {
    handled: false
  };
}

export function onDaisyResolveChoice(
  state,
  pendingChoice,
  selectedValue,
  context = {}
) {
  ensureDaisyState(state);

  if (pendingChoice.effectType === "daisy_weapon_a") {
    state.daisyWeaponA = selectedValue;

    return {
      handled: true,
      redraw: true,
      message: "武器攻撃A変更"
    };
  }

  if (pendingChoice.effectType === "daisy_magius") {
    state.daisyUsedMagius = true;

    if (selectedValue === "shade") {
      state.actionCount += 1;

      return {
        handled: true,
        redraw: true,
        message: "行動権+1"
      };
    }

    if (selectedValue === "multi") {
      return {
        handled: true,
        appendAttacks: createAttack(
          20,
          10,
          {
            type: "shoot"
          }
        ),
        message: "マルチシュート"
      };
    }

    if (selectedValue === "jammer") {
      const enemy = context.enemyState;

      if (enemy) {
        enemy.evade = 0;
      }

      return {
        handled: true,
        redraw: true,
        message: "モビリティジャマー"
      };
    }

    if (selectedValue === "protect") {
      setStateEffect(state, "daisy_protection", {
        turns: 1
      });

      return {
        handled: true,
        redraw: true,
        message: "完全無敵"
      };
    }
  }

  return {
    handled: false
  };
}

export function onDaisyTurnEnd(state) {
  ensureDaisyState(state);

  state.daisyUsedMagius = false;

  return {
    redraw: false
  };
}

export function modifyDaisyTakenDamage(
  defender,
  attacker,
  attack,
  damage
) {
  ensureDaisyState(defender);

  if (getStateEffect(defender, "daisy_protection")) {
    return {
      damage: 0,
      cancell
