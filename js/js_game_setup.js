export function createGameSetup(ctx) {

  function isChallengeMode() {
  return ctx.getBattleMode() === "challenge1v1" ||
    ctx.getBattleMode() === "challenge2v2" ||
    ctx.getBattleMode() === "vscpu1v1" ||
    ctx.getBattleMode() === "vscpu2v2";
}

function isVsCpuMode() {
  return ctx.getBattleMode() === "vscpu1v1" ||
    ctx.getBattleMode() === "vscpu2v2";
}

  function isChallenge2v2() {
    return ctx.getBattleMode() === "challenge2v2";
  }

function isCpu2v2() {
  return ctx.getBattleMode() === "vscpu2v2";
}

function isSelectableEnemy2v2() {
  return ctx.getBattleMode() === "challenge2v2" ||
    ctx.getBattleMode() === "vscpu2v2";
}

  function getSelectList() {
  if (!isChallengeMode()) return ctx.units;

  if (isVsCpuMode() && ctx.getSelectingPlayer() === "B") {
    return [
      ...(ctx.cpus || []),
      ...(ctx.cpuBeginnerList || [])
    ];
  }

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
  ctx.setPendingSelectedUnit(unit);
  if (ctx.confirmSelectedUnitBtn) {
    ctx.confirmSelectedUnitBtn.disabled = false;
  }
       if (ctx.confirmSelectedUnitBtn) {
  ctx.confirmSelectedUnitBtn.disabled = !ctx.getPendingSelectedUnit();
  ctx.confirmSelectedUnitBtn.onclick = () => {
    const unit = ctx.getPendingSelectedUnit();
    if (!unit) return;
    ctx.setPendingSelectedUnit(null);
    ctx.confirmSelectedUnitBtn.disabled = true;
    selectUnit(unit);
  };
}

if (ctx.backFromSelectBtn) {
  ctx.backFromSelectBtn.onclick = () => {
    ctx.showTitle();
  };
}
  updateSelectUi();
});

      ctx.unitButtons.appendChild(btn);
    });

    if (isSelectableEnemy2v2() && ctx.getSelectingPlayer() === "B") {
  const decideBtn = document.createElement("button");
  decideBtn.textContent = "決定";

  decideBtn.addEventListener("click", () => {
    const teamB = ctx.getTeamB();
    const bossList = teamB?.units || [];

    if (bossList.length < 1) {
      return;
    }

    if (isCpu2v2()) {
      startChallengePreview2v2(ctx.getTeamA().units, bossList);
    } else {
      startChallengePreview2v2(ctx.getTeamA().units, bossList);
    }
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
      } else if (ctx.getBattleMode() === "challenge2v2" || ctx.getBattleMode() === "vscpu2v2") {
        ctx.selectGuide.textContent =
  ctx.getSelectingPlayer() === "A"
    ? "PLAYER A チームの機体を2機選択"
    : ctx.getBattleMode() === "vscpu2v2"
      ? "CPUチームの機体を選択（1体だけなら決定）"
      : "チャレンジボスを選択（1体だけなら決定）";
      } else {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A の機体を選択"
            : "PLAYER B の機体を選択";
      }
    }

    if (ctx.selectedUnitsPreview) {
      if (
  ctx.getBattleMode() === "2v2" ||
  ctx.getBattleMode() === "challenge2v2" ||
  ctx.getBattleMode() === "vscpu2v2"
) {
        const teamA = ctx.getTeamA();
        const teamB = ctx.getTeamB();

        const aList = teamA?.units || [];
        const bList = teamB?.units || [];

        const aText =
          aList.length > 0
            ? `PLAYER A: ${aList.map(u => u.name).join(" / ")}`
            : "PLAYER A: 未選択";

        const bLabel =
  ctx.getBattleMode() === "challenge2v2"
    ? "BOSS"
    : ctx.getBattleMode() === "vscpu2v2"
      ? "CPU"
      : "PLAYER B";
const bText = bList.length > 0
  ? `${bLabel}: ${bList.map(u => u.name).join(" / ")}`
  : `${bLabel}: 未選択`;

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

  if (isVsCpuMode() && ctx.getSelectingPlayer() === "B") {
    const normalCpus = ctx.cpus || [];
    const beginnerCpus = ctx.cpuBeginnerList || [];

    normalCpus.forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.name;
      btn.addEventListener("click", () => {
  ctx.setPendingSelectedUnit(unit);
  if (ctx.confirmSelectedUnitBtn) {
    ctx.confirmSelectedUnitBtn.disabled = false;
  }
  updateSelectUi();
});
      ctx.unitButtons.appendChild(btn);
    });

    if (beginnerCpus.length > 0) {
      const section = document.createElement("div");
      section.className = "cpuBeginnerSection";

      const title = document.createElement("div");
      title.className = "cpuBeginnerTitle";
      title.textContent = "初心者向け";

      const buttonArea = document.createElement("div");
      buttonArea.className = "cpuBeginnerButtons";

      beginnerCpus.forEach(unit => {
        const btn = document.createElement("button");
        btn.textContent = unit.name;
        btn.addEventListener("click", () => {
  ctx.setPendingSelectedUnit(unit);
  if (ctx.confirmSelectedUnitBtn) {
    ctx.confirmSelectedUnitBtn.disabled = false;
  }
  updateSelectUi();
});
        buttonArea.appendChild(btn);
      });

      section.appendChild(title);
      section.appendChild(buttonArea);
      ctx.unitButtons.appendChild(section);
    }
  } else {
    getSelectList().forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.name;
      btn.addEventListener("click", () => {
  ctx.setPendingSelectedUnit(unit);
  if (ctx.confirmSelectedUnitBtn) {
    ctx.confirmSelectedUnitBtn.disabled = false;
  }
  updateSelectUi();
});
      ctx.unitButtons.appendChild(btn);
    });
  }

  if (isSelectableEnemy2v2() && ctx.getSelectingPlayer() === "B") {
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
  if (ctx.onSelectUnit) {
    const handled = ctx.onSelectUnit(unit);
    if (handled) return;
  }

  const mode = ctx.getBattleMode();
  if (mode === "1v1") {
    if (ctx.getSelectingPlayer() === "A") {
      ctx.setSelectedUnitA(unit);
      ctx.setSelectingPlayer("B");
      updateSelectUi();
      return;
    }

    ctx.setSelectedUnitB(unit);
    updateSelectUi();
    ctx.init1v1(ctx.getSelectedUnitA(), ctx.getSelectedUnitB());
    return;
  }

  if (mode === "vscpu1v1") {
    if (ctx.getSelectingPlayer() === "A") {
      ctx.setSelectedUnitA(unit);
      ctx.setSelectingPlayer("B");
      updateSelectUi();
      return;
    }

    ctx.initChallenge1v1(ctx.getSelectedUnitA(), unit);
    return;
  }

  if (mode === "challenge1v1") {
    if (ctx.getSelectingPlayer() === "A") {
      ctx.setSelectedUnitA(unit);
      ctx.setSelectingPlayer("B");
      updateSelectUi();
      return;
    }

    ctx.initChallenge1v1(ctx.getSelectedUnitA(), unit);
    return;
  }

  if (mode === "2v2") {
    if (!ctx.getTeamA()) ctx.setTeamA({ units: [] });
    if (!ctx.getTeamB()) ctx.setTeamB({ units: [] });

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

    ctx.init2v2(ctx.getTeamA().units, ctx.getTeamB().units);
    return;
  }

if (mode === "vscpu2v2") {
  if (!ctx.getTeamA()) ctx.setTeamA({ units: [] });
  if (!ctx.getTeamB()) ctx.setTeamB({ units: [] });

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

  ctx.initChallenge2v2(ctx.getTeamA().units, ctx.getTeamB().units);
  return;
}

  if (mode === "challenge2v2") {
    if (!ctx.getTeamA()) ctx.setTeamA({ units: [] });
    if (!ctx.getTeamB()) ctx.setTeamB({ units: [] });

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
    return;
  }
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
