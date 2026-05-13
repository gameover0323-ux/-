import { createAttack } from "./js_battle_system.js";

import {
  getSlotByKey,
  getSlotNumberFromKey,
  executeUnitSpecial,
  executeUnitCanUseSpecial,
  executeUnitResolveChoice,
  executeUnitBeforeSlot,
  executeUnitEnemyBeforeSlot,
  executeUnitAfterSlotResolved,
  executeUnitExtraWeaponResult
} from "./js_unit_runtime.js";

import { resolveSlotEffect } from "./js_slot_effects.js";
import { executeCommonSpecial } from "./js_special_actions.js";

export function createActionLayer(ctx) {
  function ensureReservedActions(state) {
    if (!state) return [];
    if (!Array.isArray(state.pendingReservedActions)) {
      state.pendingReservedActions = [];
    }
    return state.pendingReservedActions;
  }

  function reserveAction(state, action) {
    const list = ensureReservedActions(state);
    list.push({
      id: action.id || `reserved_${Date.now()}_${Math.random()}`,
      delay: Number(action.delay || 0),
      trigger: action.trigger || "turn_start",
      ownerPlayer: action.ownerPlayer,
      enemyPlayer: action.enemyPlayer,
      type: action.type || "attack",
      label: action.label || "予約アクション",
      attacks: Array.isArray(action.attacks) ? action.attacks : [],
      specialKey: action.specialKey || null,
      payload: action.payload || null
    });
  }

  function processReservedActionsForTrigger(ownerPlayer, trigger) {
    const actor = ctx.getPlayerState(ownerPlayer);
    if (!actor) return false;

    const list = ensureReservedActions(actor);
    if (list.length === 0) return false;

    list.forEach((action) => {
      if (action.trigger === trigger) {
        action.delay -= 1;
      }
    });

    const index = list.findIndex((action) => {
      return action.trigger === trigger && action.delay <= 0;
    });

    if (index < 0) return false;

    const action = list.splice(index, 1)[0];
    return startReservedAction(action);
  }

  function startReservedAction(action) {
    if (!action) return false;

    const ownerPlayer = action.ownerPlayer || ctx.getCurrentPlayer();
    const enemyPlayer = action.enemyPlayer || ctx.getOpponentPlayer(ownerPlayer);

    if (action.type === "attack") {
      ctx.setCurrentAction(
        `PLAYER ${ownerPlayer} の予約アクション`,
        action.label
      );

      ctx.setCurrentAttack(action.attacks);
      ctx.setCurrentAttackContext({
        ownerPlayer,
        enemyPlayer,
        slotKey: null,
        slotNumber: null,
        slotLabel: action.label,
        slotDesc: action.label,
        reservedActionId: action.id,
        reservedActionLabel: action.label,
        totalCount: action.attacks.length,
        hitCount: 0,
        evadeCount: 0
      });

      ctx.redrawBattleBoards();
      ctx.renderAttackChoices();
      return true;
    }

    if (action.type === "special" && action.specialKey) {
      executeSpecial(ownerPlayer, action.specialKey);
      return true;
    }

    ctx.renderAttackLogText(`${action.label}：未対応の予約アクション`);
    return true;
  }
 function resolveCommonPendingChoice(actor, choice, selectedValue, context = {}) {
  if (!choice || !choice.effectType) {
    return { handled: false };
  }

  if (choice.effectType === "hp_cost_damage_bonus") {
    const hpCost = parseInt(selectedValue, 10);

    if (!hpCost || hpCost <= 0) {
      return { handled: true, redraw: false, message: null };
    }

    if (hpCost >= actor.hp) {
      return { handled: true, redraw: false, message: "HPが足りません" };
    }

    actor.hp -= hpCost;

    if (choice.params?.setFlag) {
      actor[choice.params.setFlag] = true;
    }

    if (choice.params?.zeroEvade) {
      actor.evade = 0;
    }

    const rate =
      typeof choice.params?.damageRate === "number"
        ? choice.params.damageRate
        : 0.5;

    const bonus = Math.floor(hpCost * rate);

    if (Array.isArray(context.currentAttack)) {
      context.currentAttack.forEach((attack) => {
        attack.damage += bonus;
      });
    }

    return {
      handled: true,
      redraw: true,
      message: `${choice.params?.messagePrefix || "出力解放"}: ${bonus}ダメージ加算`
    };
  }

  if (choice.effectType === "hp_cost_append_attack") {
    const hpCost = parseInt(selectedValue, 10);

    if (!hpCost || hpCost <= 0) {
      return { handled: true, redraw: false, message: null };
    }

    if (hpCost >= actor.hp) {
      return { handled: true, redraw: false, message: "HPが足りません" };
    }

    actor.hp -= hpCost;

    if (choice.params?.setFlag) {
      actor[choice.params.setFlag] = true;
    }

    if (choice.params?.zeroEvade) {
      actor.evade = 0;
    }

    const rate =
      typeof choice.params?.damageRate === "number"
        ? choice.params.damageRate
        : 0.5;

    const damage = Math.floor(hpCost * rate);

    const appendAttacks = createAttack(damage, choice.params?.count || 1, {
      type: choice.params?.attackType || "shoot",
      beam: !!choice.params?.beam,
      cannotEvade: !!choice.params?.cannotEvade,
      ignoreReduction: !!choice.params?.ignoreReduction,
      ignoreDefense: !!choice.params?.ignoreDefense,
      special: choice.params?.special || null,
      source: choice.params?.sourceLabel || "追加攻撃"
    });

    return {
      handled: true,
      redraw: true,
      message: choice.params?.message || null,
      appendAttacks
    };
  }

  return { handled: false };
 }
  
  function runAfterSlotResolvedHook(actor, slotNumber, resolveResult, slotMeta = {}) {
  const enemyPlayer = slotMeta.enemyPlayer || ctx.getOpponentPlayer(slotMeta.ownerPlayer);
  const enemyState = ctx.getPlayerState(enemyPlayer);

  const afterResult = executeUnitAfterSlotResolved(actor, slotNumber, {
    ...slotMeta,
    enemyPlayer,
    enemyState,
    resolveResult
  });

  if (afterResult.redraw) {
    ctx.redrawBattleBoards();
  }

  if (afterResult.message) {
  ctx.appendBattleNotice(afterResult.message);
}

if (afterResult.reserveAction) {
  reserveAction(actor, afterResult.reserveAction);
}

if (Array.isArray(afterResult.reserveActions)) {
  afterResult.reserveActions.forEach(action => {
    reserveAction(actor, action);
  });
}

return afterResult;
  }
  function startSlotAction(ownerPlayer, slotKey, slotOverride = null) {
    const enemyPlayer = ctx.getOpponentPlayer(ownerPlayer);

    const actor = ctx.getPlayerState(ownerPlayer);
    const defender = ctx.getCombatTargetState(enemyPlayer);

    if (!actor) return false;

    const slot = slotOverride || getSlotByKey(actor, slotKey);
    if (!slot) return false;

    const slotNumber = getSlotNumberFromKey(slotKey);

    actor.lastSlotKey = slotKey;

const beforeResult = executeUnitBeforeSlot(actor, slotNumber, {
      ownerPlayer,
      enemyPlayer,
      enemyPlayerLabel: `PLAYER ${enemyPlayer}`,
      enemyState: defender,
      slotKey,
      slot,
      isForcedSlotAction: !!slotOverride
    });

    if (beforeResult.redraw) {
      ctx.redrawBattleBoards();
    }
    if (beforeResult.message) {
      ctx.appendBattleNotice(beforeResult.message);
    }
    if (beforeResult.cancelSlot) {
      ctx.redrawBattleBoards();
      ctx.renderAttackLogText(beforeResult.message || "行動不能");
      return false;
    }
    

    if (defender) {
      const enemyBeforeResult = executeUnitEnemyBeforeSlot(defender, slotNumber, {
        ownerPlayer: enemyPlayer,
        enemyPlayer: ownerPlayer,
        enemyPlayerLabel: `PLAYER ${ownerPlayer}`,
        enemyRolledSlotKey: slotKey,
        enemyState: actor
      });

      if (enemyBeforeResult.redraw) {
        ctx.redrawBattleBoards();
      }
      if (enemyBeforeResult.message) {
        ctx.appendBattleNotice(enemyBeforeResult.message);
      }
    }

ctx.setCurrentAction(
  `${actor.name} の行動`,
  `${slotNumber}.${slot.label}`
);

    ctx.redrawBattleBoards();

    resolveSlot(slot, {
      ownerPlayer,
      enemyPlayer,
      slotKey,
      slotNumber
    });

    return true;
  }

  function resolveSlot(slot, slotMeta = {}) {
  ctx.setCurrentAttack([]);

  const actor = ctx.getPlayerState(ctx.getCurrentPlayer());
  const result = resolveSlotEffect({ slot, actor });

  function mergeExtraResult(baseResult) {
    const merged = {
      attacks: [],
      messages: [],
      redraw: false
    };

    const extraResult = executeUnitExtraWeaponResult(actor, {
      ownerPlayer: slotMeta.ownerPlayer,
      enemyPlayer: slotMeta.enemyPlayer,
      slotKey: slotMeta.slotKey,
      slotNumber: slotMeta.slotNumber,
      slot
    });

    if (!extraResult) return merged;

    if (Array.isArray(extraResult.appendAttacks)) {
      merged.attacks.push(...extraResult.appendAttacks);
    }

    if (Array.isArray(extraResult.appendMessages)) {
      merged.messages.push(...extraResult.appendMessages.filter(Boolean));
    }

    if (extraResult.message) {
      merged.messages.push(extraResult.message);
    }

    if (extraResult.redraw) {
      merged.redraw = true;
    }

    return merged;
  }

  function startAttackQte(attacks, extraContext = {}) {
  ctx.setCurrentAttack(attacks);
  ctx.setCurrentAttackContext({
    ownerPlayer: slotMeta.ownerPlayer,
    enemyPlayer: slotMeta.enemyPlayer,
    slotKey: slotMeta.slotKey,
    slotNumber: slotMeta.slotNumber,
    slotLabel: slot.label,
    slotDesc: slot.desc,
    totalCount: attacks.length,
    hitCount: 0,
    evadeCount: 0,
    ...extraContext
  });
  ctx.redrawBattleBoards();
  ctx.renderAttackChoices();
}

  if (
    result.kind === "evade" ||
    result.kind === "heal" ||
    result.kind === "none" ||
    result.kind === "custom"
  ) {
    const afterResult = runAfterSlotResolvedHook(actor, slotMeta.slotNumber, result, slotMeta);

if (afterResult?.appendAttacks && afterResult.appendAttacks.length > 0) {
  startAttackQte(afterResult.appendAttacks, {
    appendedOnly: true,
    sourceLabel: afterResult.appendAttacks[0]?.source || "追加攻撃"
  });
  return;
}

const extra = mergeExtraResult(result);
    extra.messages.forEach((message) => {
      ctx.appendBattleNotice(message);
    });

    if (extra.redraw) {
      ctx.redrawBattleBoards();
    }

    if (extra.attacks.length > 0) {
      startAttackQte(extra.attacks, {
  appendedOnly: true,
  sourceLabel: extra.attacks[0]?.source || "追加攻撃"
});
      return;
    }

    ctx.redrawBattleBoards();

    if (result.message) {
      ctx.renderAttackLogText(result.message);
    } else {
      ctx.renderAttackLogText("行動完了");
    }

    if (ctx.getBattleMode() === "2v2") {
      executeNextQueuedSlot();
    }

    return;
  }

  if (result.kind === "attack") {
  const afterResult = runAfterSlotResolvedHook(actor, slotMeta.slotNumber, result, slotMeta);

  const extra = mergeExtraResult(result);

  const attacks = [
    ...result.attacks,
    ...(afterResult?.appendAttacks || []),
    ...extra.attacks
  ];

  extra.messages.forEach((message) => {
    ctx.appendBattleNotice(message);
  });

  if (extra.redraw || afterResult?.redraw) {
    ctx.redrawBattleBoards();
  }

  startAttackQte(attacks);
  return;
  }

  ctx.renderAttackLogText("この行動はまだ未対応");
}

  function executeSpecial(ownerPlayer, specialKey) {
    const actor = ctx.getPlayerState(ownerPlayer);
    const special = actor?.specials?.[specialKey];

    if (!actor || !special) {
      ctx.showPopup("特殊行動データが見つからない");
      return;
    }

    const availability = executeUnitCanUseSpecial(actor, specialKey, {
      ownerPlayer,
      enemyPlayer: ctx.getOpponentPlayer(ownerPlayer),
      currentAttackContext: ctx.getCurrentAttackContext(),
      currentAttack: ctx.getCurrentAttack()
    });

    if (availability.allowed === false) {
      ctx.showPopup(availability.message || "このタイミングでは実行できない");
      return;
    }

    if (!ctx.canExecuteSpecialForPlayer(ownerPlayer, special)) {
      ctx.showPopup("このタイミングでは実行できない");
      return;
    }

    const commonResult = executeCommonSpecial(actor, specialKey);

    if (commonResult.handled) {
      if (commonResult.redraw) {
        ctx.redrawBattleBoards();
      }

      if (commonResult.message) {
        ctx.showPopup(commonResult.message);
      }
      return;
    }

    if (ctx.isUnifiedTeam(ownerPlayer)) {
      const team = ctx.getTeam(ownerPlayer);
      const totalEvade = ctx.getUnifiedEvade(team);

      const backup = actor.evade;
      actor.evade = totalEvade;

      const preview = executeUnitCanUseSpecial(actor, specialKey, {
        ownerPlayer,
        enemyPlayer: ctx.getOpponentPlayer(ownerPlayer),
        currentAttackContext: ctx.getCurrentAttackContext(),
        currentAttack: ctx.getCurrentAttack()
      });

      actor.evade = backup;

      if (preview.allowed !== false && preview.costEvade) {
        ctx.consumeUnifiedEvade(team, preview.costEvade);
      }
    }

    const currentAttack = ctx.getCurrentAttack();
    const currentAttackContext = ctx.getCurrentAttackContext();

    const unitResult = executeUnitSpecial(actor, specialKey, {
      ownerPlayer,
      enemyPlayer: ctx.getOpponentPlayer(ownerPlayer),
      enemyState: ctx.getPlayerState(ctx.getOpponentPlayer(ownerPlayer)),
      currentAttackContext,
      currentAttack
    });

    if (unitResult.handled) {
      if (unitResult.requestChoice) {
        ctx.handleChoiceRequest(unitResult.requestChoice);
        return;
      }
if (unitResult.reserveAction) {
  reserveAction(actor, unitResult.reserveAction);

  if (unitResult.redraw) {
    ctx.redrawBattleBoards();
  }

  if (unitResult.message) {
    ctx.showPopup(unitResult.message);
  }

  return;
}
if (unitResult.startSlotAction) {
  startSlotAction(
    ownerPlayer,
    unitResult.startSlotAction.slotKey,
    unitResult.startSlotAction.slotData || null
  );
  return;
}

      if (unitResult.appendAttacks && unitResult.appendAttacks.length > 0) {
        currentAttack.push(...unitResult.appendAttacks);

        if (currentAttackContext) {
          currentAttackContext.totalCount += unitResult.appendAttacks.length;
        }

        ctx.setCurrentAttack(currentAttack);
        ctx.setCurrentAttackContext(currentAttackContext);

        ctx.redrawBattleBoards();

        if (unitResult.message) {
          ctx.appendBattleNotice(unitResult.message);
        }

        ctx.renderAttackChoices();
        return;
      }

      if (unitResult.forcedSlotDesc) {
        ctx.setCurrentAttack([]);
        ctx.setCurrentAction(
          `PLAYER ${ownerPlayer} の行動`,
          unitResult.forcedSlotLabel || special.name
        );

        resolveSlot(
          {
            label: unitResult.forcedSlotLabel || special.name,
            desc: unitResult.forcedSlotDesc
          },
          {
            ownerPlayer,
            enemyPlayer: ctx.getOpponentPlayer(ownerPlayer),
            slotKey: null,
            slotNumber: null
          }
        );
        return;
      }

      if (unitResult.redraw) {
        ctx.redrawBattleBoards();
      }

      if (unitResult.message) {
        ctx.showPopup(unitResult.message);
      }

      return;
    }
  }



function resolvePendingChoice(selectedValue) {
  const pendingChoice = ctx.getPendingChoice();
  if (!pendingChoice) return;

  const choice = pendingChoice;
  const ownerPlayer = choice.ownerPlayer;
  const enemyPlayer = choice.enemyPlayer || ctx.getOpponentPlayer(ownerPlayer);

  const actor = ctx.getPlayerState(ownerPlayer);
  const defender = ctx.getPlayerState(enemyPlayer);

  if (!actor) {
    ctx.clearPendingChoice();
    return;
  }

  const choiceContext = {
    ownerPlayer,
    enemyPlayer,
    enemyState: defender,
    currentAttackContext: ctx.getCurrentAttackContext(),
    currentAttack: ctx.getCurrentAttack()
  };

  let result = resolveCommonPendingChoice(actor, choice, selectedValue, choiceContext);

  if (!result.handled) {
    result = executeUnitResolveChoice(actor, choice, selectedValue, choiceContext);
  }

  ctx.clearPendingChoice();

  if (!result.handled) {
    ctx.redrawBattleBoards();
    ctx.renderAttackLogText("選択完了");
    return;
  }

  if (result.requestChoice) {
    ctx.handleChoiceRequest(result.requestChoice);
    return;
  }

 if (result.startSlotAction) {
  if (result.message) {
    ctx.appendBattleNotice(result.message);
  }

  if (ctx.isUnifiedTeam(ownerPlayer)) {
    ctx.executeUnifiedSelectedSlot(ownerPlayer, result.startSlotAction.slotKey);
    return;
  }

  startSlotAction(
    ownerPlayer,
    result.startSlotAction.slotKey,
    result.startSlotAction.slotData || null
  );
  return;
}
  if (Array.isArray(result.appendAttacks) && result.appendAttacks.length > 0) {
    const currentAttack = ctx.getCurrentAttack();
    const currentAttackContext = ctx.getCurrentAttackContext();

    currentAttack.push(...result.appendAttacks);

    if (currentAttackContext) {
      currentAttackContext.totalCount += result.appendAttacks.length;
    }

    ctx.setCurrentAttack(currentAttack);
    ctx.setCurrentAttackContext(currentAttackContext);
  }

  ctx.redrawBattleBoards();

  if (result.message) {
    ctx.appendBattleNotice(result.message);
  }

  if (ctx.getCurrentAttack() && ctx.getCurrentAttack().length > 0) {
    ctx.renderAttackChoices();
    return;
  }

  ctx.renderAttackLogText(result.message || "選択完了");
}

  function executeNextQueuedSlot() {
    const team = ctx.getTeam(ctx.getCurrentPlayer());
    if (!team || !team._slotQueue || team._slotQueue.length === 0) {
      ctx.redrawBattleBoards();
      return;
    }

    const next = team._slotQueue.shift();

    ctx.setActiveUnit(ctx.getCurrentPlayer(), next.unitKey);

    startSlotAction(ctx.getCurrentPlayer(), next.slotKey);
  }

  return {
    startSlotAction,
    resolveSlot,
    runAfterSlotResolvedHook,
    executeSpecial,
    resolvePendingChoice,
    reserveAction,
    processReservedActionsForTrigger,
    executeNextQueuedSlot
  };
}
