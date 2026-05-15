export const cpu_unicorn_gundam = {
  id: "cpu_unicorn_gundam",
  name: "ユニコーンガンダム",
  defaultFormId: "unicorn",
  isCpu: true,

  forms: {
    unicorn: {
      name: "ユニコーンガンダム",
      hp: 750,
      evadeMax: 2,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "バルカン砲 10ダメージ×4回",
          desc: "10ダメージ×4回。射撃",
          effect: {
            type: "attack",
            damage: 10,
            count: 4,
            attackType: "shoot"
          }
        },
        slot2: {
          label: "ビームサーベル 30ダメージ×2回",
          desc: "30ダメージ×2回。格闘、ビーム",
          effect: {
            type: "attack",
            damage: 30,
            count: 2,
            attackType: "melee",
            beam: true
          }
        },
        slot3: {
          label: "回避 +2",
          desc: "回避+2",
          effect: {
            type: "evade",
            amount: 2
          }
        },
        slot4: {
          label: "バズーカ砲 50ダメージ",
          desc: "50ダメージ。射撃",
          effect: {
            type: "attack",
            damage: 50,
            count: 1,
            attackType: "shoot"
          }
        },
        slot5: {
          label: "NT-D発動",
          desc: "5ターン間デストロイモードに変形。強化",
          effect: {
            type: "custom",
            effectId: "cpu_unicorn_ntd_activate"
          }
        },
        slot6: {
          label: "ビームマグナム 90ダメージ",
          desc: "90ダメージ。射撃、ビーム。ヒット時、相手の回避を1消費する。",
          effect: {
            type: "attack",
            damage: 90,
            count: 1,
            attackType: "shoot",
            beam: true
          }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_unicorn_traits",
          timing: "auto",
          actionType: "auto",
          desc: "被ダメージ10%半減。相手強化感知でNT-D発動。回避消費で覚醒保持値上昇。"
        }
      ]
    },

    destroy: {
      name: "ユニコーンガンダム(デストロイモード)",
      hp: 750,
      evadeMax: 8,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "デストロイスティンガー 120ダメージ",
          desc: "120ダメージ。格闘",
          effect: {
            type: "attack",
            damage: 120,
            count: 1,
            attackType: "melee"
          }
        },
        slot2: {
          label: "回避 3回",
          desc: "回避+3。次のターンの攻撃を全回避する。",
          effect: {
            type: "custom",
            effectId: "cpu_unicorn_full_evade"
          }
        },
        slot3: {
          label: "回復 90",
          desc: "90回復",
          effect: {
            type: "heal",
            amount: 90
          }
        },
        slot4: {
          label: "波動 0ダメージ",
          desc: "0ダメージ。ヒット時、強化形態を解除し、行動権+1。サイコミュ",
          effect: {
            type: "attack",
            damage: 0,
            count: 1,
            attackType: "shoot",
            psychommu: true,
            specialAttribute: "psychommu"
          }
        },
        slot5: {
          label: "ビームマグナム 130ダメージ",
          desc: "130ダメージ。射撃、ビーム。ヒット時、相手の回避を1消費する。0の時はマイナス値になる。",
          effect: {
            type: "attack",
            damage: 130,
            count: 1,
            attackType: "shoot",
            beam: true
          }
        },
        slot6: {
          label: "乱撃",
          desc: "40ダメージ×回避保持数。格闘",
          effect: {
            type: "custom",
            effectId: "cpu_unicorn_rush"
          }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_unicorn_destroy_traits",
          timing: "auto",
          actionType: "auto",
          desc: "被ダメージ30%半減。サイコミュ系無効。相手強化感知で覚醒抽選。"
        }
      ]
    },

    awaken: {
      name: "ユニコーンガンダム(デストロイモード・覚醒)",
      hp: 750,
      evadeMax: 16,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: {
          label: "回復 150",
          desc: "150回復",
          effect: {
            type: "heal",
            amount: 150
          }
        },
        slot2: {
          label: "回避所持数倍加",
          desc: "回避所持数倍加",
          effect: {
            type: "custom",
            effectId: "cpu_unicorn_double_evade"
          }
        },
        slot3: {
          label: "ビームマグナム 150ダメージ",
          desc: "150ダメージ。射撃、ビーム。ヒット時、相手の回避を1消費する。0の時はマイナス値になる。",
          effect: {
            type: "attack",
            damage: 150,
            count: 1,
            attackType: "shoot",
            beam: true
          }
        },
        slot4: {
          label: "ビームガトリング 20ダメージ×10回",
          desc: "20ダメージ×10回。射撃、ビーム",
          effect: {
            type: "attack",
            damage: 20,
            count: 10,
            attackType: "shoot",
            beam: true
          }
        },
        slot5: {
          label: "ソフトチェストタッチ 40ダメージ×5回",
          desc: "40ダメージ×5回。格闘。フルヒット時、100ダメージ追撃。",
          effect: {
            type: "attack",
            damage: 40,
            count: 5,
            attackType: "melee"
          }
        },
        slot6: {
          label: "光 0ダメージ",
          desc: "0ダメージ。ヒット時、相手回避0、強化解除、行動権+2、5ターン間相手攻撃ダメージ半減。サイコミュ",
          effect: {
            type: "attack",
            damage: 0,
            count: 1,
            attackType: "shoot",
            psychommu: true,
            specialAttribute: "psychommu"
          }
        }
      },
      specials: [
        {
          name: "CPU特性",
          effectType: "cpu_unicorn_awaken_traits",
          timing: "auto",
          actionType: "auto",
          desc: "毎自ターン20回復。サイコミュ系無効。被弾時75%半減。条件達成時ビームトンファー。"
        }
      ]
    }
  }
};
