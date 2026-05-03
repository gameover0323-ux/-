export const cpu_wing_zero = {
  id: "cpu_wing_zero",
  name: "ウイングガンダムゼロ",
  defaultFormId: "base",
  isCpu: true,
  forms: {
    base: {
      name: "ウイングガンダムゼロ",
      hp: 700,
      evadeMax: 3,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "マシンキャノン 5ダメージ×8回", desc: "5ダメージ×8回。射撃、軽減不可", effect: { type: "attack", damage: 5, count: 8, attackType: "shoot", ignoreReduction: true } },
        slot2: { label: "ビームサーベル 30ダメージ×2回", desc: "30ダメージ×2回。格闘、ビーム", effect: { type: "attack", damage: 30, count: 2, attackType: "melee", beam: true } },
        slot3: { label: "全攻撃回避準備 + 回避3", desc: "次のターン全ての攻撃を回避、回避所持数+3", effect: { type: "custom", effectId: "cpu_wing_zero_full_evade_3" } },
        slot4: { label: "バスターライフル 70ダメージ", desc: "70ダメージ。射撃、ビーム", effect: { type: "attack", damage: 70, count: 1, attackType: "shoot", beam: true } },
        slot5: { label: "ツインバスターライフル 70ダメージ×2回", desc: "70ダメージ×2回。軽減不可、射撃、ビーム", effect: { type: "attack", damage: 70, count: 2, attackType: "shoot", beam: true, ignoreReduction: true } },
        slot6: { label: "ゼロシステム発動(回避補正)", desc: "3ターンの間、回避可能な全ての攻撃を回避数消費なしで回避可能。回避所持中は回避数消費で必中も回避可。被ダメージ1.5倍、両解放で2倍。", effect: { type: "custom", effectId: "cpu_wing_zero_evade_system" } }
      },
      specials: [
        { name: "CPU特性", effectType: "cpu_wing_zero_traits", timing: "auto", actionType: "auto", desc: "ゼロシステム切替、ツインバスター追撃、10%軽減、10%変形、HP100以下暴走。" }
      ]
    },
    neo_bird: {
      name: "ウイングガンダムゼロ(ネオバード形態)",
      hp: 700,
      evadeMax: 6,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "マシンキャノン 10ダメージ×3回", desc: "10ダメージ×3回。軽減不可", effect: { type: "attack", damage: 10, count: 3, ignoreReduction: true } },
        slot2: { label: "全攻撃回避準備 + 回避2", desc: "次のターンの攻撃を全て回避する、回避所持数+2", effect: { type: "custom", effectId: "cpu_wing_zero_full_evade_2" } },
        slot3: { label: "全攻撃回避準備 + 回避2", desc: "次のターンの攻撃を全て回避する、回避所持数+2", effect: { type: "custom", effectId: "cpu_wing_zero_full_evade_2" } },
        slot4: { label: "奇襲 40ダメージ", desc: "40ダメージ", effect: { type: "attack", damage: 40, count: 1 } },
        slot5: { label: "ツインバスターライフル 40ダメージ×2回", desc: "40ダメージ×2回", effect: { type: "attack", damage: 40, count: 2 } },
        slot6: { label: "突撃 40ダメージ + 80回復", desc: "40ダメージ+80回復", effect: { type: "attack", damage: 40, count: 1 } }
      },
      specials: [
        { name: "CPU特性", effectType: "cpu_wing_zero_traits", timing: "auto", actionType: "auto", desc: "MS形態と特性共有。" }
      ]
    }
  }
};
