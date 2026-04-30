export const cpu_gundam_mc = {
  id: "cpu_gundam_mc",
  name: "ガンダム(ﾏｸﾞﾈｯﾄｺｰﾃｨﾝｸﾞ)",
  defaultFormId: "base",
  isCpu: true,

  forms: {
    base: {
      name: "ガンダム(ﾏｸﾞﾈｯﾄｺｰﾃｨﾝｸﾞ)",
      hp: 600,
      evadeMax: 5,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7", "slot8"],

      slots: {
        slot1: {
          label: "バルカン 15ダメージ×3回",
          desc: "15ダメージ×3回。射撃",
          effect: { type: "attack", attackType: "shoot", damage: 15, count: 3 }
        },
        slot2: {
          label: "全攻撃回避準備",
          desc: "次のターンの必中を除く攻撃を全て回避する。",
          effect: { type: "custom", effectId: "cpu_gundam_next_turn_full_evade" }
        },
        slot3: {
          label: "ビームサーベル 40ダメージ×2回",
          desc: "40ダメージ×2回。格闘、ビーム",
          effect: { type: "attack", attackType: "melee", damage: 40, count: 2, beam: true }
        },
        slot4: {
          label: "回復 60",
          desc: "60回復。次のターンの被ダメージを25%軽減する。",
          effect: { type: "heal", amount: 60 }
        },
        slot5: {
          label: "ビームライフル 80ダメージ",
          desc: "80ダメージ。射撃、ビーム",
          effect: { type: "attack", attackType: "shoot", damage: 80, count: 1, beam: true }
        },
        slot6: {
          label: "ハイパーナパーム 120ダメージ",
          desc: "120ダメージ。射撃、軽減不可",
          effect: { type: "attack", attackType: "shoot", damage: 120, count: 1, ignoreReduction: true }
        },
        slot7: {
          label: "ガンダムハンマー 80ダメージ",
          desc: "80ダメージ。格闘",
          effect: { type: "attack", attackType: "melee", damage: 80, count: 1 }
        },
        slot8: {
          label: "ハイパーバズーカ 80ダメージ",
          desc: "80ダメージ。射撃",
          effect: { type: "attack", attackType: "shoot", damage: 80, count: 1 }
        }
      },

      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_gundam_traits",
          timing: "auto",
          actionType: "auto",
          desc:
            "3ターンに1回、ガンダムハンマーかハイパーバズーカを通常スロット行動と同時に繰り出す。HP200未満で4が軽減不可ビームサーベル+回復50へ変化。HP50以下で5がラスト・シューティングへ変化。3ターンに1回、1/6で次ターンの必中を除く攻撃を全て回避する。"
        }
      ]
    }
  }
};
