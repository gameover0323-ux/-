export const cpu_shining_gundam = {
  id: "cpu_shining_gundam",
  name: "シャイニングガンダム",
  defaultFormId: "base",
  isCpu: true,

  forms: {
    base: {
      name: "シャイニングガンダム",
      hp: 750,
      evadeMax: 3,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "シャイニングショット 30ダメージ",
          desc: "30ダメージ。射撃",
          effect: { type: "attack", damage: 30, count: 1, attackType: "shoot" }
        },
        slot2: {
          label: "全攻撃回避準備 + 回避3",
          desc: "次のターンの攻撃を全て回避する。回避所持数+3",
          effect: { type: "custom", effectId: "cpu_shining_full_evade_3" }
        },
        slot3: {
          label: "格闘攻撃 20ダメージ×2回",
          desc: "20ダメージ×2回。格闘",
          effect: { type: "attack", damage: 20, count: 2, attackType: "melee" }
        },
        slot4: {
          label: "ビームソード 40ダメージ",
          desc: "40ダメージ。格闘、ビーム",
          effect: { type: "attack", damage: 40, count: 1, attackType: "melee", beam: true }
        },
        slot5: {
          label: "シャイニングフィンガー 80ダメージ",
          desc: "80ダメージ。格闘",
          effect: { type: "attack", damage: 80, count: 1, attackType: "melee" }
        },
        slot6: {
          label: "スーパーモード発動",
          desc: "5ターン間スーパーモードに変化。条件を満たしている場合、5ターン間明鏡止水スーパーモードに変更",
          effect: { type: "custom", effectId: "cpu_shining_activate_mode" }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_shining_traits",
          timing: "auto",
          actionType: "auto",
          desc: "回避を消費して追加行動。HP150以下で明鏡止水スーパーモード発動。"
        }
      ]
    },

    super: {
      name: "シャイニングガンダムS",
      hp: 750,
      evadeMax: 6,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "全攻撃回避準備 + 回避4",
          desc: "次のターンの攻撃を全て回避する。回避所持数+4",
          effect: { type: "custom", effectId: "cpu_shining_full_evade_4" }
        },
        slot2: {
          label: "シャイニングフィンガー 120ダメージ",
          desc: "120ダメージ。格闘",
          effect: { type: "attack", damage: 120, count: 1, attackType: "melee" }
        },
        slot3: {
          label: "瞑想 60回復",
          desc: "60回復。強化ターン+2。ゲーム中計4回発動でEXに変化",
          effect: { type: "custom", effectId: "cpu_shining_meditation" }
        },
        slot4: {
          label: "シャイニングフィンガー(照射) 140ダメージ",
          desc: "140ダメージ。射撃",
          effect: { type: "attack", damage: 140, count: 1, attackType: "shoot" }
        },
        slot5: {
          label: "格闘連撃 20ダメージ×5回",
          desc: "20ダメージ×5回。格闘",
          effect: { type: "attack", damage: 20, count: 5, attackType: "melee" }
        },
        slot6: {
          label: "シャイニングフィンガーソード 170ダメージ",
          desc: "170ダメージ。格闘。命中時強化ターン+3",
          effect: { type: "attack", damage: 170, count: 1, attackType: "melee" }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_shining_traits",
          timing: "auto",
          actionType: "auto",
          desc: "回避を消費して追加行動。HP150以下で明鏡止水スーパーモード発動。"
        }
      ]
    },

    meikyo: {
      name: "シャイニングガンダム明鏡止水S",
      hp: 750,
      evadeMax: 8,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "格闘連撃 20ダメージ×6回",
          desc: "20ダメージ×6回。格闘",
          effect: { type: "attack", damage: 20, count: 6, attackType: "melee" }
        },
        slot2: {
          label: "回復 80",
          desc: "80回復。強化ターン+1",
          effect: { type: "custom", effectId: "cpu_shining_meikyo_heal" }
        },
        slot3: {
          label: "2ターン全攻撃回避 + 回避5",
          desc: "2ターン間全ての攻撃を回避する。回避+5",
          effect: { type: "custom", effectId: "cpu_shining_full_evade_2turn_5" }
        },
        slot4: {
          label: "シャイニングフィンガー 120ダメージ",
          desc: "120ダメージ。格闘",
          effect: { type: "attack", damage: 120, count: 1, attackType: "melee" }
        },
        slot5: {
          label: "シャイニングフィンガーソード 200ダメージ",
          desc: "200ダメージ。格闘、軽減不可。命中時強化ターン+2",
          effect: { type: "attack", damage: 200, count: 1, attackType: "melee", ignoreReduction: true }
        },
        slot6: {
          label: "超級覇王電影弾 30ダメージ×8回",
          desc: "30ダメージ×8回。格闘",
          effect: { type: "attack", damage: 30, count: 8, attackType: "melee" }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_shining_traits",
          timing: "auto",
          actionType: "auto",
          desc: "回避を消費して追加行動。HP200以下で必中化。"
        }
      ]
    }
  }
};
