export function createGameSetup(ctx) {

  function loadUnitButtons() {
    ctx.unitButtons.innerHTML = "";

    ctx.units.forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.name;

      btn.addEventListener("click", () => {
        selectUnit(unit);
      });

      ctx.unitButtons.appendChild(btn);
    });

    updateSelectUi();
  }

  function updateSelectUi() {
    if (ctx.selectGuide) {
      ctx.selectGuide.textContent =
        ctx.getSelectingPlayer() === "A"
          ? "PLAYER A の機体を選択"
          : "PLAYER B の機体を選択";
    }

    if (ctx.selectedUnitsPreview) {
      if (ctx.getBattleMode() === "2v2") {
        const teamA = ctx.getTeamA();
        const teamB = ctx.getTeamB();

        const aList = teamA?.units || [];
        const bList = teamB?.units || [];

        const aText =
          aList.length > 0
            ? `PLAYER A: ${aList.map(u => u.name).join(" / ")}`
            : "PLAYER A: 未選択";

        const bText =
          bList.length > 0
            ? `PLAYER B: ${bList.map(u => u.name).join(" / ")}`
            : "PLAYER B: 未選択";

        ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}`;
      } else {
        const a = ctx.getSelectedUnitA();
        const b = ctx.getSelectedUnitB();

        const aText = a ? `PLAYER A: ${a.name}` : "PLAYER A: 未選択";
        const bText = b ? `PLAYER B: ${b.name}` : "PLAYER B: 未選択";

        ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}`;
      }
    }
  }

  function selectUnit(unit) {
    if (ctx.getBattleMode() === "2v2") {
      if (!ctx.getTeamA()) ctx.setTeamA({ units: [] });
      if (!ctx.getTeamB()) ctx.setTeamB({ units: [] });
    }

    if (ctx.getBattleMode() === "1v1") {
      if (ctx.getSelectingPlayer() === "A") {
        ctx.setSelectedUnitA(unit);
        ctx.setSelectingPlayer("B");
        updateSelectUi();
        return;
      }

      ctx.setSelectedUnitB(unit);
      updateSelectUi();
      startBattlePreview(ctx.getSelectedUnitA(), ctx.getSelectedUnitB());
      return;
    }

    if (ctx.getSelectingPlayer() === "A") {
      const teamA = ctx.getTeamA();
      teamA.units.push(unit);

      if (teamA.units.length < 2) {
        updateSelectUi();
        return;
      }

      ctx.setSelectingPlayer("B");
      updateSelectUi();
      return;
    }

    const teamB = ctx.getTeamB();
    teamB.units.push(unit);

    if (teamB.units.length < 2) {
      updateSelectUi();
      return;
    }

    startBattlePreview2v2(ctx.getTeamA().units, ctx.getTeamB().units);
  }

function startBattlePreview(unitA, unitB) {
  ctx.init1v1(unitA, unitB);
}

function startBattlePreview2v2(unitsA, unitsB) {
  ctx.init2v2(unitsA, unitsB);
}

  return {
    loadUnitButtons,
    updateSelectUi
  };
}
