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

  function isSelectableEnemy2v2() {
    return ctx.getBattleMode() === "challenge2v2" ||
      ctx.getBattleMode() === "vscpu2v2";
  }

  function isOnlineMode() {
    return ctx.getBattleMode &&
      String(ctx.getBattleMode()).startsWith("online");
  }

  function getPendingUnit() {
    return typeof ctx.getPendingSelectedUnit === "function"
      ? ctx.getPendingSelectedUnit()
      : null;
  }

  function setPendingUnit(unit) {
    if (typeof ctx.setPendingSelectedUnit === "function") {
      ctx.setPendingSelectedUnit(unit);
    }
  }
function getDebugUnits() {
    return Array.isArray(ctx.debugUnits) ? ctx.debugUnits : [];
  }

  function canUseDebugUnit() {
    return typeof ctx.canUseDebugUnit === "function" && ctx.canUseDebugUnit();
  }
  function getSelectList() {
    const extraUnits =
      typeof ctx.getExtraUnlockedUnits === "function"
        ? ctx.getExtraUnlockedUnits()
        : [];

    if (!isChallengeMode()) {
      return isOnlineMode()
        ? ctx.units
        : [...ctx.units, ...extraUnits];
    }

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

  function makeUnitButton(unit) {
    const btn = document.createElement("button");
    btn.textContent = unit.name;

    btn.addEventListener("click", () => {
      setPendingUnit(unit);
      updateSelectUi();
    });

    return btn;
  }

  function setupFixedButtons() {
    if (ctx.confirmSelectedUnitBtn) {
      ctx.confirmSelectedUnitBtn.onclick = () => {
        const unit = getPendingUnit();
        if (!unit) return;

        setPendingUnit(null);
        selectUnit(unit);
      };
    }

    if (ctx.backFromSelectBtn) {
      ctx.backFromSelectBtn.onclick = () => {
        setPendingUnit(null);
        if (typeof ctx.showTitle === "function") {
          ctx.showTitle();
        }
      };
    }
  }

  function loadUnitButtons() {
  ctx.unitButtons.innerHTML = "";
} else {
    const normalUnits = getSelectList();
    const debugUnits = canUseDebugUnit() && !isOnlineMode()
      ? getDebugUnits()
      : [];

    appendUnitSection("プレイアブル機体", normalUnits, "playableSection");

    if (debugUnits.length > 0) {
      appendUnitSection("デバッグ権限", debugUnits, "debugUnitSection");
    }
  }
  function appendUnitSection(titleText, units, className) {
    if (!units || units.length <= 0) return;

    const section = document.createElement("div");
    section.className = className;

    const title = document.createElement("div");
    title.className = "selectSectionTitle";
    title.textContent = titleText;

    const buttonArea = document.createElement("div");
    buttonArea.className = "selectSectionButtons";

    units.forEach(unit => {
      buttonArea.appendChild(makeUnitButton(unit));
    });

    section.appendChild(title);
    section.appendChild(buttonArea);
    ctx.unitButtons.appendChild(section);
  }

  if (isVsCpuMode() && ctx.getSelectingPlayer() === "B") {
    appendUnitSection("CPU機体", ctx.cpus || [], "cpuNormalSection");
    appendUnitSection("初心者向けCPU", ctx.cpuBeginnerList || [], "cpuBeginnerSection");
  } else {
    getSelectList().forEach(unit => {
      ctx.unitButtons.appendChild(makeUnitButton(unit));
    });
  }

  if (isSelectableEnemy2v2() && ctx.getSelectingPlayer() === "B") {
    const decideBtn = document.createElement("button");
    decideBtn.textContent = "この編成で開始";

    decideBtn.addEventListener("click", () => {
      const teamB = ctx.getTeamB();
      const enemyList = teamB?.units || [];

      if (enemyList.length < 1) return;

      startChallengePreview2v2(ctx.getTeamA().units, enemyList);
    });

    ctx.unitButtons.appendChild(decideBtn);
  }

  setupFixedButtons();
  updateSelectUi();
  }
  function updateSelectUi() {
    const pending = getPendingUnit();

    if (ctx.confirmSelectedUnitBtn) {
      ctx.confirmSelectedUnitBtn.disabled = !pending;
      ctx.confirmSelectedUnitBtn.textContent = pending
        ? `${pending.name} に決定`
        : "決定";
    }

    if (ctx.selectGuide) {
      if (ctx.getBattleMode() === "challenge1v1") {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A の機体を選択"
            : "チャレンジボスを選択";
      } else if (
        ctx.getBattleMode() === "challenge2v2" ||
        ctx.getBattleMode() === "vscpu2v2"
      ) {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A チームの機体を2機選択"
            : ctx.getBattleMode() === "vscpu2v2"
              ? "CPUチームの機体を選択（1体だけならこの編成で開始）"
              : "チャレンジボスを選択（1体だけならこの編成で開始）";
      } else {
        ctx.selectGuide.textContent =
          ctx.getSelectingPlayer() === "A"
            ? "PLAYER A の機体を選択"
            : "PLAYER B の機体を選択";
      }
    }

    if (!ctx.selectedUnitsPreview) return;

    if (
      ctx.getBattleMode() === "2v2" ||
      ctx.getBattleMode() === "challenge2v2" ||
      ctx.getBattleMode() === "vscpu2v2"
    ) {
      const teamA = ctx.getTeamA();
      const teamB = ctx.getTeamB();

      const aList = teamA?.units || [];
      const bList = teamB?.units || [];

      const aText = aList.length > 0
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

      const pendingText = pending
        ? `<br>選択中: ${pending.name}`
        : "";

      ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}${pendingText}`;
      return;
    }

    const a = ctx.getSelectedUnitA();
    const b = ctx.getSelectedUnitB();

   const aText = a ? `PLAYER A: ${a.name}` : "PLAYER A: 未選択";

    const bLabel =
      ctx.getBattleMode() === "challenge1v1" ||
      ctx.getBattleMode() === "vscpu1v1"
        ? ctx.getBattleMode() === "vscpu1v1"
          ? "CPU"
          : "BOSS"
        : "PLAYER B";

    const bText = b ? `${bLabel}: ${b.name}` : `${bLabel}: 未選択`;

    const pendingText = pending
      ? `<br>選択中: ${pending.name}`
      : "";

    ctx.selectedUnitsPreview.innerHTML = `${aText}<br>${bText}${pendingText}`;
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
        loadUnitButtons();
        return;
      }

      ctx.setSelectedUnitB(unit);
      ctx.init1v1(ctx.getSelectedUnitA(), ctx.getSelectedUnitB());
      return;
    }

    if (mode === "vscpu1v1") {
      if (ctx.getSelectingPlayer() === "A") {
        ctx.setSelectedUnitA(unit);
        ctx.setSelectingPlayer("B");
        loadUnitButtons();
        return;
      }

      ctx.initChallenge1v1(ctx.getSelectedUnitA(), unit);
      return;
    }

    if (mode === "challenge1v1") {
      if (ctx.getSelectingPlayer() === "A") {
        ctx.setSelectedUnitA(unit);
        ctx.setSelectingPlayer("B");
        loadUnitButtons();
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
        loadUnitButtons();
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
        loadUnitButtons();
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
        loadUnitButtons();
        return;
      }

      const teamB = ctx.getTeamB();
      teamB.units.push(unit);
      updateSelectUi();
    }
  }

  function startChallengePreview2v2(unitsA, bossUnits) {
    ctx.initChallenge2v2(unitsA, bossUnits);
  }

  return {
    loadUnitButtons,
    updateSelectUi
  };
}
