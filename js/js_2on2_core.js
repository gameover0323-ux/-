export function create2v2Core(ctx) {
  function isTeamBattleMode() {
    const battleMode = ctx.getBattleMode();

    return battleMode === "2v2" ||
      battleMode === "challenge2v2" ||
      battleMode === "vscpu2v2";
  }

  function getTeam(playerKey) {
    return playerKey === "A" ? ctx.getTeamA() : ctx.getTeamB();
  }

  function getActiveUnitState(playerKey) {
    const team = getTeam(playerKey);
    if (!team) return null;

    return team[team.activeUnitKey] || null;
  }

  function getFocusUnitState(playerKey) {
    const team = getTeam(playerKey);
    if (!team) return null;

    return team[team.focusUnitKey] || null;
  }

  function setActiveUnit(playerKey, unitKey) {
    const team = getTeam(playerKey);
    if (!team) return;
    if (unitKey !== "unit1" && unitKey !== "unit2") return;
    if (!team[unitKey]) return;

    team.activeUnitKey = unitKey;
  }

  function getCombatTargetState(playerKey) {
    if (isTeamBattleMode()) {
      return getFocusUnitState(playerKey);
    }

    return ctx.getPlayerStateRaw(playerKey);
  }

  function canChangeFocus(playerKey) {
    if (!isTeamBattleMode()) return false;
    if (playerKey !== ctx.getCurrentPlayer()) return false;
    if (ctx.hasPendingChoice()) return false;
    if (ctx.hasCurrentAttack()) return false;

    return true;
  }

  function setFocusUnit(playerKey, unitKey) {
    const team = getTeam(playerKey);
    if (!team) return;
    if (unitKey !== "unit1" && unitKey !== "unit2") return;
    if (!team[unitKey]) return;

    team.focusUnitKey = unitKey;
  }

  function toggleTeamMode(playerKey) {
    const team = getTeam(playerKey);
    if (!team) return;

    ctx.showPopup("統合型は未実装です");
  }

  function createTeam(unit1, unit2) {
    return {
      unit1: ctx.createBattleState(unit1),
      unit2: ctx.createBattleState(unit2),

      mode: "split",

      activeUnitKey: "unit1",
      focusUnitKey: "unit1",

      unified: {
        baseHpA: 0,
        baseHpB: 0,
        totalDamage: 0,
        healA: 0,
        healB: 0
      }
    };
  }

  return {
    isTeamBattleMode,
    getTeam,
    getActiveUnitState,
    getFocusUnitState,
    setActiveUnit,
    getCombatTargetState,
    canChangeFocus,
    setFocusUnit,
    toggleTeamMode,
    createTeam
  };
}
