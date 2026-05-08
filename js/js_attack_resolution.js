export function createAttackResolution(ctx) {
  function isTeamBattleMode() {
    return ctx.getBattleMode() === "2v2" || ctx.getBattleMode() === "challenge2v2";
  }

function finishCurrentAttackResolution() {
    const currentAttackContexts = ctx.getCurrentAttackContexts();

    if (isTeamBattleMode() && currentAttackContexts.length > 0) {
      const contexts = [...currentAttackContexts];

      ctx.setCurrentAttackContext(null);
      ctx.setCurrentAttackContexts([]);

      for (const context of contexts) {
        const attacker = context.attacker;
        const defender = ctx.getCombatTargetState(context.enemyPlayer);

        const actionResult = ctx.executeUnitActionResolved(attacker, defender, {
          ...context,
          allEvaded:
            context.totalCount > 0 &&
            context.hitCount === 0 &&
            context.evadeCount === context.totalCount
        });

        if (actionResult.message) {
          ctx.appendBattleNotice(actionResult.message);
        }

        if (Array.isArray(actionResult.appendAttacks) && actionResult.appendAttacks.length > 0) {
          ctx.setCurrentAttack(actionResult.appendAttacks);
          ctx.setCurrentAttackContext({
            ownerPlayer: context.ownerPlayer,
            enemyPlayer: context.enemyPlayer,
            slotKey: context.slotKey,
            slotNumber: context.slotNumber,
            slotLabel: actionResult.appendSlotLabel || actionResult.appendAttackLabel || "追加攻撃",
            slotDesc: actionResult.appendSlotDesc || "",
            totalCount: actionResult.appendAttacks.length,
            hitCount: 0,
            evadeCount: 0,
            appendedFrom: context.slotLabel || null
          });

          ctx.redrawBattleBoards();
          ctx.renderAttackChoices();
          return;
        }

        if (actionResult.requestChoice) {
          ctx.handleChoiceRequest(actionResult.requestChoice);
          return;
        }
      }

      ctx.renderAttackLogText("攻撃解決済み");
      return;
    }

    const context = ctx.getCurrentAttackContext();

    if (!context) {
      ctx.redrawBattleBoards();
      ctx.renderAttackLogText("攻撃解決済み");
      return;
    }

    const attacker = ctx.getPlayerState(context.ownerPlayer);
    const defender = ctx.getCombatTargetState(context.enemyPlayer);

    ctx.setCurrentAttackContext(null);

    const actionResult = ctx.executeUnitActionResolved(attacker, defender, {
      ...context,
      allEvaded:
        context.totalCount > 0 &&
        context.hitCount === 0 &&
        context.evadeCount === context.totalCount
    });

    ctx.redrawBattleBoards();

    if (actionResult.message) {
      ctx.appendBattleNotice(actionResult.message);
    }

    if (Array.isArray(actionResult.appendAttacks) && actionResult.appendAttacks.length > 0) {
      ctx.setCurrentAttack(actionResult.appendAttacks);
      ctx.setCurrentAttackContext({
        ownerPlayer: context.ownerPlayer,
        enemyPlayer: context.enemyPlayer,
        slotKey: context.slotKey,
        slotNumber: context.slotNumber,
        slotLabel: actionResult.appendSlotLabel || actionResult.appendAttackLabel || "追加攻撃",
        slotDesc: actionResult.appendSlotDesc || "",
        totalCount: actionResult.appendAttacks.length,
        hitCount: 0,
        evadeCount: 0,
        appendedFrom: context.slotLabel || null
      });

      ctx.redrawBattleBoards();
      ctx.renderAttackChoices();
      return;
    }

    if (actionResult.requestChoice) {
      ctx.handleChoiceRequest(actionResult.requestChoice);
      return;
    }

    ctx.renderAttackLogText("攻撃解決済み");
}
