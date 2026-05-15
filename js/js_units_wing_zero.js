export const wing_zero = {
  id: "wing_zero",
  name: "ウイングガンダムゼロ",

  defaultFormId: "ms",

  forms: {
    ms: {
      name: "ウイングガンダムゼロ",
      hp: 700,
      evadeMax: 3,

      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "マシンキャノン 5ダメージ×8回",
          desc: "5ダメージ×8回。射撃、軽減不可",
          effect: {
            type: "attack",
            damage: 5,
            count: 8,
            attackType: "shoot",
            ignoreReduction: true
          }
        },
        slot2: {
          label: "ビームサーベル 30ダメージ×2回",
          desc: "30ダメージ×2回。格闘、ビーム属性",
          effect: {
            type: "attack",
            damage: 30,
            count: 2,
            attackType: "melee",
            beam: true
          }
        },
        slot3: {
          label: "回避 3回",
          desc: "回避3回",
          effect: {
            type: "evade",
            amount: 3
          }
        },
        slot4: {
          label: "バスターライフル 70ダメージ",
          desc: "70ダメージ。射撃、ビーム属性",
          effect: {
            type: "attack",
            damage: 70,
            count: 1,
            attackType: "shoot",
            beam: true
          }
        },
        slot5: {
          label: "ツインバスターライフル 70ダメージ×2回",
          desc: "70ダメージ×2回。射撃、ビーム属性、軽減不可",
          effect: {
            type: "attack",
            damage: 70,
            count: 2,
            attackType: "shoot",
            beam: true,
            ignoreReduction: true
          }
        },
        slot6: {
          label: "ゼロシステム発動(回避補正)",
          desc: "3ターンの間回避可能な全ての攻撃を回避数消費なしで回避可能にする。回避所持中は回避数を消費で必中効果も無効にして回避可にする。ただし、自分の被ダメージが1.5倍になる。両解放で被ダメージが2倍になる。",
          effect: {
            type: "custom",
            effectId: "wing_zero_system_activate"
          }
        }
      },

      specials: [
        {
          name: "ゼロシステム",
          effectType: "toggle_zero_mode",
          timing: "self",
          desc: "スロット行動前に6と6EXを任意で切り替える",
          actionType: "instant"
        },
        {
          name: "バスターライフル・出力解放",
          effectType: "buster_unlock",
          timing: "attack",
          desc: "5の行動時、回避3以上で回避を0にし、自機の任意HP消費の半分を追撃ダメージ加算可能",
          actionType: "instant"
        },
        {
          name: "シールド",
          effectType: "shield",
          timing: "reaction",
          desc: "相手の攻撃時、3回だけ1ターンに受けるダメージを半減する。",
          actionType: "instant"
        },
        {
          name: "変形",
          effectType: "transform_neo",
          timing: "self",
          desc: "任意タイミングでネオバード形態へ変形",
          actionType: "instant"
        },
        {
          name: "ゼロシステム暴走",
          effectType: "zero_berserk",
          timing: "self",
          desc: "一度も6を引かずHP100以下で1回だけ使用可能。ゼロシステム回避/命中を同時に3ターン付与し、回避数を3に上書き",
          actionType: "instant"
        }
      ]
    },

    neo: {
      name: "ウイングガンダムゼロ(ネオバード)",
      hp: 700,
      evadeMax: 6,

      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "マシンキャノン 10ダメージ×3回",
          desc: "10ダメージ×3回。射撃、軽減不可",
          effect: {
            type: "attack",
            damage: 10,
            count: 3,
            attackType: "shoot",
            ignoreReduction: true
          }
        },
        slot2: {
          label: "回避 2回",
          desc: "回避2回",
          effect: {
            type: "evade",
            amount: 2
          }
        },
        slot3: {
          label: "回避 2回",
          desc: "回避2回",
          effect: {
            type: "evade",
            amount: 2
          }
        },
        slot4: {
          label: "奇襲 40ダメージ",
          desc: "40ダメージ。奇襲",
          effect: {
            type: "attack",
            damage: 40,
            count: 1,
            attackType: "shoot"
          }
        },
        slot5: {
          label: "ツインバスターライフル 40ダメージ×2回",
          desc: "40ダメージ×2回。射撃、ビーム",
          effect: {
            type: "attack",
            damage: 40,
            count: 2,
            attackType: "shoot",
            beam: true
          }
        },
        slot6: {
          label: "突撃 40ダメージ + 80回復",
          desc: "40ダメージ。格闘 + 80回復",
          effect: {
            type: "attack",
            damage: 40,
            count: 1,
            attackType: "melee"
          }
        }
      },

      specials: [
        {
          name: "パイロットセンス",
          effectType: "toggle_zero_mode",
          timing: "self",
          desc: "スロット行動前に6と6EXを任意で切り替える",
          actionType: "instant"
        },
        {
          name: "バスターライフル・出力解放",
          effectType: "buster_unlock",
          timing: "attack",
          desc: "5の行動時、回避3以上で回避を0にし、自機の任意HP消費の半分を追撃ダメージ加算可能",
          actionType: "instant"
        },
        {
          name: "シールド",
      effectType: "shield",
          timing: "reaction",
          desc: "相手の攻撃時、3回だけ1ターンに受けるダメージを半減する。",
          actionType: "instant"
        },
        {
          name: "変形",
          effectType: "transform_ms",
          timing: "self",
          desc: "任意タイミングでMS形態へ変形",
          actionType: "instant"
        }
      ]
    }
  }
};
