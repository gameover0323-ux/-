import {
  setForm,
  getStateEffect,
  setStateEffect,
  clearStateEffect,
  addEvade,
  reduceEvade,
  normalizeEvadeCapState,
  doubleEvadeRedCap,
  executeUnitDispelBoostState,
  hasBoostStateEffect
} from "./js_unit_runtime.js";

import { createAttack } from "./js_battle_system.js";

function ensureState(state) {
  if (!state) return;

  if (typeof state.unicornResonanceStock !== "number") {
    state.unicornResonanceStock = 0;
  }

  if (typeof state.cpuUnicornBoostTriggered !== "boolean") {
    state.cpuUnicornBoostTriggered = false;
  }
}

function isDestroy(state) {
  return state?.formId === "destroy";
}

function isAwaken(state) {
  return state?.formId === "awaken";
}

function enterDestroy(state, turns = 5) {
  setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  setStateEffect(state, "cpu_unicorn_ntd", {
    turns,
    skipNextTick: true,
    boost: true
  });

  clearStateEffect(state, "cpu_unicorn_awaken");
}

function enterAwaken(state) {
  const turns = Math.max(1, Number(state.unicornResonanceStock || 0));

  setForm(state, "awaken", {
    preserveHp: true,
    preserveEvade: true
  });

  setStateEffect(state, "cpu_unicorn_awaken", {
    turns,
    skipNextTick: true
  });
}

function returnToUnicorn(state) {
  setForm(state, "unicorn", {
    preserveHp: true,
    preserveEvade: true
  });

  clearStateEffect(state, "cpu_unicorn_ntd");
  clearStateEffect(state, "cpu_unicorn_awaken");
}

function returnToDestroy(state) {
  setForm(state, "destroy", {
    preserveHp: true,
    preserveEvade: true
  });

  clearStateEffect(state, "cpu_unicorn_awaken");
}

function isPsychommuAttack(attack) {
  if (!attack) return false;

  return (
    attack.funnel === true ||
    attack.dragoon === true ||
    attack.incom === true ||
    attack.psychommu === true ||
    attack.specialAttribute === "psychommu" ||
    attack.attackType === "psychommu"
  );
}

export function getCpuUnicornDerivedState(state) {
  ensureState(state);

  const status = [
    `覚醒保持:${state.unicornResonanceStock}`
  ];

  const ntd = getStateEffect(state, "cpu_unicorn_ntd");
  const awaken = getStateEffect(state, "cpu_unicorn_awaken");

  if (ntd?.turns > 0) {
    status.push(`NT-D 残${ntd.turns}ターン`);
  }

  if (awaken?.turns > 0) {
    status.push(`NT-D覚醒 残${awaken.turns}ターン`);
  }

  const derived = { status };

  if (isAwaken(state) && Math.random() < 0.5) {
    derived.slots = {
      slot3: {
        label: "バズーカ砲 75ダメージ×2回",
        desc: "75ダメージ×2回 射撃 軽減不可",
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
        desc: "10ダメージ×12回 射撃 軽減不可",
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
