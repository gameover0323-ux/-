export const cpuUnicornGundam = {
  id: "cpu_unicorn_gundam",
  name: "CPU ユニコーンガンダム",
  isCpu: true,

  defaultFormId: "unicorn",

  forms: {
    unicorn: {
      name: "ユニコーンガンダム",
      hp: 750,
      evadeMax: 2,

      slot1: {
        label: "バルカン砲 10ダメージ×4回",
        desc: "10ダメージ×4回 射撃",
        effect: {
          type: "attack",
          damage: 10,
          count: 4,
          attackType: "shoot"
        }
      },

      slot2: {
        label: "ビームサーベル 30ダメージ×2回",
        desc: "30ダメージ×2回 格闘 ビーム",
        effect: {
          type: "attack",
          damage: 30,
          count: 2,
          attackType: "melee",
          beam: true
        }
      },

      slot3: {
        label: "回避 2回",
        desc: "回避+2",
        effect: {
          type: "evade",
          amount: 2
        }
      },

      slot4: {
        label: "バズーカ砲 50ダメージ",
        desc: "50ダメージ 射撃",
        effect: {
          type: "attack",
          damage: 50,
          count: 1,
          attackType: "shoot"
        }
      },

      slot5: {
        label: "NT-D発動",
        desc: "5ターン間デストロイモード",
        effect: {
          type: "custom",
          customEffectId: "cpu_unicorn_ntd"
        }
      },

      slot6: {
        label: "ビームマグナム 90ダメージ",
        desc: "90ダメージ 射撃 ビーム",
        effect: {
          type: "attack",
          damage: 90,
          count: 1,
          attackType: "shoot",
          beam: true
        }
      }
    },

    destroy: {
      name: "ユニコーンガンダム(デストロイモード)",
      hp: 750,
      evadeMax: 8,

      slot1: {
        label: "デストロイスティンガー 120ダメージ",
        desc: "120ダメージ 格闘",
        effect: {
          type: "attack",
          damage: 120,
          count: 1,
          attackType: "melee"
        }
      },

      slot2: {
        label: "回避 3回",
        desc: "回避+3 全回避",
        effect: {
          type: "custom",
          customEffectId: "cpu_unicorn_full_evade"
        }
      },

      slot3: {
        label: "回復 90",
        desc: "HP90回復",
        effect: {
          type: "heal",
          amount: 90
        }
      },

      slot4: {
        label: "波動",
        desc: "強化解除 行動権+1 サイコミュ",
        effect: {
          type: "attack",
          damage: 0,
          count: 1,
          attackType: "psychommu"
        }
      },

      slot5: {
        label: "ビームマグナム 130ダメージ",
        desc: "130ダメージ 射撃 ビーム",
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
        desc: "40ダメージ×回避保持数 格闘",
        effect: {
          type: "custom",
          customEffectId: "cpu_unicorn_rush"
        }
      }
    },

    awaken: {
      name: "ユニコーンガンダム(デストロイモード・覚醒)",
      hp: 750,
      evadeMax: 16,

      slot1: {
        label: "回復 150",
        desc: "HP150回復",
        effect: {
          type: "heal",
          amount: 150
        }
      },

      slot2: {
        label: "回避所持数倍加",
        desc: "回避倍加",
        effect: {
          type: "custom",
          customEffectId: "cpu_unicorn_double_evade"
        }
      },

      slot3: {
        label: "ビームマグナム 150ダメージ",
        desc: "150ダメージ 射撃 ビーム",
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
        desc: "20ダメージ×10回 射撃 ビーム",
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
        desc: "40ダメージ×5回 格闘",
        effect: {
          type: "attack",
          damage: 40,
          count: 5,
          attackType: "melee"
        }
      },

      slot6: {
        label: "光",
        desc: "回避0 強化解除 行動権+2 サイコミュ",
        effect: {
          type: "attack",
          damage: 0,
          count: 1,
          attackType: "psychommu"
        }
      }
    }
  }
};
