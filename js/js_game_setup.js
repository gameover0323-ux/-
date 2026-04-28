export function createGameSetup(ctx) {

  function isChallengeMode() {
    return ctx.getBattleMode() === "challenge1v1" || ctx.getBattleMode() === "challenge2v2";
  }

  function isChallenge2v2() {
    return ctx.getBattleMode() === "challenge2v2";
  }

  function getSelectList() {
    if (!isChallengeMode()) return ctx.units;

    if (ctx.getSelectingPlayer() === "B") {
      return ctx.bosses || [];
    }

    return ctx.units;
  }

  function loadUnitButtons() {
    ctx.unitButtons.innerHTML = "";

    getSelectList().forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.name;

      btn.addEventListener("click", () => {
        selectUnit(unit);
      });

      ctx.unitButtons.appendChild(btn);
    });

    if (isChallenge2v2() && ctx.getSelectingPlayer() === "B") {
      const decideBtn = document.createElement("button");
      decideBtn.textContent = "決定";

      decideBtn.addEventListener("click", () => {
        const teamB = ctx.getTeamB();
        const bossList = teamB?.units || [];

        if (bossList.length < 1) {
          return;
        }

        startChallengePreview2v2(ctx.getTeamA().units, bossList);
      });

      ctx.unitButtons.appendChild(decideBtn);
    }

    updateSelectUi();
  }

  function updateSelectUi() {
    if (ctx.selectGuide) {
      if (ctx.getBattleMode() === "challenge1v1") {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A の機体を選択"
            : "チャレンジボスを選択";
      } else if (ctx.getBattleMode() === "challenge2v2") {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A チームの機体を2機選択"
            : "チャレンジボスを選択（1体だけなら決定）";
      } else {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A の機体を選択"
            : "PLAYER B の機体を選択";
      }
    }

    if (ctx.selectedUnitsPreview) {
      if (ctx.getBattleMode() === "2v2" || ctx.getBattleMode() === "challenge2v2") {
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
            ? `BOSS: ${bList.map(u => u.name).join(" / ")}`
            : "BOSS: 未選択";

        ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}`;
      } else {
        const a = ctx.getSelectedUnitA();
        const b = ctx.getSelectedUnitB();

        const aText = a ? `PLAYER A: ${a.name}` : "PLAYER A: 未選択";
        const bLabel = ctx.getBattleMode() === "challenge1v1" ? "BOSS" : "PLAYER B";
        const bText = b ? `${bLabel}: ${b.name}` : `${bLabel}: 未選択`;

        ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}`;
      }
    }

    if (isChallengeMode()) {
      loadButtonsOnly();
    }
  }

  function loadButtonsOnly() {
    if (!ctx.unitButtons) return;

    ctx.unitButtons.innerHTML = "";

    getSelectList().forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.name;

      btn.addEventListener("click", () => {
        selectUnit(unit);
      });

      ctx.unitButtons.appendChild(btn);
    });

    if (isChallenge2v2() && ctx.getSelectingPlayer() === "B") {
      const decideBtn = document.createElement("button");
      decideBtn.textContent = "決定";

      decideBtn.addEventListener("click", () => {
        const teamB = ctx.getTeamB();
        const bossList = teamB?.units || [];

        if (bossList.length < 1) {
          return;
        }

        startChallengePreview2v2(ctx.getTeamA().units, bossList);
      });

      ctx.unitButtons.appendChild(decideBtn);
    }
  }

  function selectUnit(unit) {
    if (ctx.getBattleMode() === "2v2" || ctx.getBattleMode() === "challenge2v2") {
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

    if (ctx.getBattleMode() === "challenge1v1") {
      if (ctx.getSelectingPlayer() === "A") {
        ctx.setSelectedUnitA(unit);
        ctx.setSelectingPlayer("B");
        updateSelectUi();
        return;
      }

      ctx.setSelectedUnitB(unit);
      updateSelectUi();
      startChallengePreview(ctx.getSelectedUnitA(), ctx.getSelectedUnitB());
      return;
    }

    if (ctx.getBattleMode() === "challenge2v2") {
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

      updateSelectUi();

      if (teamB.units.length >= 2) {
        startChallengePreview2v2(ctx.getTeamA().units, teamB.units);
      }

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

  function startChallengePreview(unitA, bossUnit) {
    ctx.initChallenge1v1(unitA, bossUnit);
  }

  function startChallengePreview2v2(unitsA, bossUnits) {
    ctx.initChallenge2v2(unitsA, bossUnits);
  }

  return {
    loadUnitButtons,
    updateSelectUi
  };
}
