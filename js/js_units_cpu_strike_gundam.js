export const cpu_strike_gundam = {
  id: "cpu_strike_gundam",
  name: "ストライクガンダム",
  defaultFormId: "base",
  isCpu: true,
  forms: {
    base: {
      name: "ストライクガンダム",
      hp: 600,
      evadeMax: 3,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "ｲｰｹﾞﾙｼｭﾃﾙﾝ 10ダメージ×4回", desc: "10ダメージ×4回。射撃", effect: { type: "attack", damage: 10, count: 4, attackType: "shoot" } },
        slot2: { label: "バズーカ 50ダメージ", desc: "50ダメージ。射撃", effect: { type: "attack", damage: 50, count: 1, attackType: "shoot" } },
        slot3: { label: "回復 70", desc: "70回復", effect: { type: "heal", amount: 70 } },
        slot4: { label: "高ｴﾈﾙｷﾞｰﾋﾞｰﾑﾗｲﾌﾙ 60ダメージ", desc: "60ダメージ。射撃、ビーム", effect: { type: "attack", damage: 60, count: 1, attackType: "shoot", beam: true } },
        slot5: { label: "ｱｰﾏｰｼｭﾅｲﾀﾞｰ 20ダメージ×3回", desc: "20ダメージ×3回。格闘", effect: { type: "attack", damage: 20, count: 3, attackType: "melee" } },
        slot6: { label: "全攻撃回避準備 + 回避1", desc: "次のターンの攻撃を全て回避する。回避所持数+1", effect: { type: "custom", effectId: "cpu_strike_next_turn_full_evade_1" } }
      },
      specials: [{ name: "CPU特性", effectType: "cpu_strike_traits", timing: "auto", actionType: "auto", desc: "PS装甲。1ターン目から換装抽選し、以後3ターン毎に再抽選。" }]
    },

    aile: {
      name: "エールストライクガンダム",
      hp: 600,
      evadeMax: 6,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "全攻撃回避準備 + 回避3", desc: "次のターンの攻撃を全て回避する。回避所持数+3", effect: { type: "custom", effectId: "cpu_strike_next_turn_full_evade_3" } },
        slot2: { label: "高ｴﾈﾙｷﾞｰﾋﾞｰﾑﾗｲﾌﾙ 60ダメージ", desc: "60ダメージ。射撃、ビーム", effect: { type: "attack", damage: 60, count: 1, attackType: "shoot", beam: true } },
        slot3: { label: "ビームサーベル 30ダメージ×2回", desc: "30ダメージ×2回。格闘、ビーム", effect: { type: "attack", damage: 30, count: 2, attackType: "melee", beam: true } },
        slot4: { label: "S.E.E.D覚醒 5ターン", desc: "5ターンの間、ターン中攻撃が必中。回避数2倍。必中攻撃も回避可能。", effect: { type: "custom", effectId: "cpu_strike_seed_awaken" } },
        slot5: { label: "回復 40", desc: "40回復", effect: { type: "heal", amount: 40 } },
        slot6: { label: "キック 90ダメージ", desc: "90ダメージ。格闘", effect: { type: "attack", damage: 90, count: 1, attackType: "melee" } }
      },
      specials: [{ name: "CPU特性", effectType: "cpu_strike_traits", timing: "auto", actionType: "auto", desc: "PS装甲。OSチェック自動判定。150以上ダメージを3回まで1ターン半減。" }]
    },

    sword: {
      name: "ソードストライクガンダム",
      hp: 600,
      evadeMax: 4,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "全攻撃回避準備 + 回避2", desc: "次のターンの攻撃を全て回避する。回避所持数+2", effect: { type: "custom", effectId: "cpu_strike_next_turn_full_evade_2" } },
        slot2: { label: "ﾏｲﾀﾞｽﾒｯｻｰ 30ダメージ×2回", desc: "30ダメージ×2回。射撃、ビーム", effect: { type: "attack", damage: 30, count: 2, attackType: "shoot", beam: true } },
        slot3: { label: "回復 40", desc: "40回復", effect: { type: "heal", amount: 40 } },
        slot4: { label: "アンカー捕縛 10ダメージ", desc: "10ダメージ。命中時、次の攻撃が必中になり、もう一度スロット行動を行う。格闘", effect: { type: "attack", damage: 10, count: 1, attackType: "melee" } },
        slot5: { label: "対艦刀ｼｭﾍﾞﾙﾄ・ｹﾞﾍﾞｰﾙ 100ダメージ", desc: "100ダメージ。格闘", effect: { type: "attack", damage: 100, count: 1, attackType: "melee" } },
        slot6: { label: "ｲｰｹﾞﾙｼｭﾃﾙﾝ牽制 5ダメージ×6回", desc: "5ダメージ×6回。相手が回避を所持している場合、フルヒット時回避を1消費させる。射撃", effect: { type: "attack", damage: 5, count: 6, attackType: "shoot" } }
      },
      specials: [{ name: "CPU特性", effectType: "cpu_strike_traits", timing: "auto", actionType: "auto", desc: "一閃、3EX、短期決戦をCPU自動判定。" }]
    },

    launcher: {
      name: "ランチャーストライクガンダム",
      hp: 600,
      evadeMax: 2,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "ｲｰｹﾞﾙｼｭﾃﾙﾝ 10ダメージ×4回", desc: "10ダメージ×4回。射撃", effect: { type: "attack", damage: 10, count: 4, attackType: "shoot" } },
        slot2: { label: "ｺﾝﾎﾞｳｪﾎﾟﾝﾎﾟｯﾄﾞ 5ダメージ×10回", desc: "5ダメージ×10回。射撃", effect: { type: "attack", damage: 5, count: 10, attackType: "shoot" } },
        slot3: { label: "タックル 70ダメージ", desc: "70ダメージ。格闘", effect: { type: "attack", damage: 70, count: 1, attackType: "melee" } },
        slot4: { label: "回避 1回+回復30", desc: "回避1回+30回復", effect: { type: "custom", effectId: "cpu_strike_launcher_evade_heal" } },
        slot5: { label: "アグニ(砲撃) 90ダメージ", desc: "90ダメージ。射撃、ビーム、軽減不可", effect: { type: "attack", damage: 90, count: 1, attackType: "shoot", beam: true, ignoreReduction: true } },
        slot6: { label: "アグニ(照射砲) 150ダメージ", desc: "150ダメージ。射撃、ビーム、軽減不可", effect: { type: "attack", damage: 150, count: 1, attackType: "shoot", beam: true, ignoreReduction: true } }
      },
      specials: [{ name: "CPU特性", effectType: "cpu_strike_traits", timing: "auto", actionType: "auto", desc: "アグニフルチャージ、出力解放をCPU自動判定。" }]
    }
  }
};
