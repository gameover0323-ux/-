export const jegan_d_type = {
  id: "jegan_d_type",
  name: "ジェガンD型",
  defaultFormId: "base",

  forms: {
    base: {
      name: "ジェガンD型",
      hp: 450,
      evadeMax: 3,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "ハンドグレネード 40ダメージ",
          desc: "40ダメージ。射撃。命中時、回避+1",
          effect: {
            type: "attack",
            attackType: "shoot",
            damage: 40,
            count: 1,
            onHitEffect: "jegan_evade_plus_1"
          }
        },
        slot2: {
          label: "回避 +1",
          desc: "回避ストック+1",
          effect: { type: "evade", amount: 1 }
        },
        slot3: {
          label: "ビームサーベル 30ダメージ×2回",
          desc: "30ダメージ×2回。格闘、ビーム属性",
          effect: {
            type: "attack",
            attackType: "melee",
            damage: 30,
            count: 2,
            beam: true
          }
        },
        slot4: {
          label: "回避 +1",
          desc: "回避ストック+1",
          effect: { type: "evade", amount: 1 }
        },
        slot5: {
          label: "回復 80",
          desc: "HP80回復",
          effect: { type: "heal", amount: 80 }
        },
        slot6: {
          label: "換装",
          desc: "5ターン間、スタークジェガンに換装する。",
          effect: { type: "custom", customType: "jegan_change_stark" }
        }
      },

      specials: [
        {
          name: "換装",
          effectType: "jegan_equip_ewac",
          timing: "self",
          desc: "行動権を1消費して、任意でEWACを装備可能。EWACを破壊した場合は選択不可だが、代わりに1EXと4EXが解禁される。",
          actionType: "instant"
        },
        {
          name: "リミッター解除",
          effectType: "jegan_limiter_base",
          timing: "self",
          desc: "任意でHPを120消費し、3ターンの間2回行動に変化する。3ターン経過後、1ターン休みになる。休みターン中でもHP120消費で強引に行動権+1可能。",
          actionType: "instant"
        },
        {
          name: "シールド",
          effectType: "jegan_shield",
          timing: "reaction",
          desc: "3回まで、1ターンに受けるダメージを半減する。",
          actionType: "instant"
        },
        {
          name: "兵装要請",
          effectType: "jegan_request_arms",
          timing: "self",
          desc: "行動前に6と6EXを切り替える。6/6EXの使用権を放棄すると、各1回ずつ1ターン全ダメージ無効バリアを得る。両方放棄すると6SP使用可能。",
          actionType: "choice"
        },
        {
          name: "突貫",
          effectType: "jegan_assault_predict",
          timing: "self",
          desc: "行動権を1消費して相手の次のターンのスロット行動番号を予測し、成功した場合相手の回避数を0にする。形態変化は対応できない。",
          actionType: "choice"
        }
      ]
    },

    stark: {
      name: "スタークジェガン",
      hp: 450,
      evadeMax: 8,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "バルカンポッド 10ダメージ×6回",
          desc: "10ダメージ×6回。射撃",
          effect: { type: "attack", attackType: "shoot", damage: 10, count: 6 }
        },
        slot2: {
          label: "ビームサーベル 20ダメージ×3回",
          desc: "20ダメージ×3回。格闘、ビーム属性",
          effect: { type: "attack", attackType: "melee", damage: 20, count: 3, beam: true }
        },
        slot3: {
          label: "ハイパーバズーカ 90ダメージ",
          desc: "90ダメージ。軽減不可",
          effect: { type: "attack", damage: 90, count: 1, ignoreReduction: true }
        },
        slot4: {
          label: "ビームライフル 40ダメージ×2回",
          desc: "40ダメージ×2回。射撃、ビーム属性",
          effect: { type: "attack", attackType: "shoot", damage: 40, count: 2, beam: true }
        },
        slot5: {
          label: "回避 +5",
          desc: "回避ストック+5",
          effect: { type: "evade", amount: 5 }
        },
        slot6: {
          label: "急襲",
          desc: "所持回避数×10ダメージ",
          effect: { type: "custom", customType: "jegan_stark_raid" }
        }
      },

      specials: [
        {
          name: "換装",
          effectType: "jegan_stark_release",
          timing: "self",
          desc: "任意で装備を解除し、ジェガンD型かEWACに換装する。行動権を消費しない。",
          actionType: "choice"
        },
        {
          name: "加速",
          effectType: "jegan_stark_accel",
          timing: "self",
          desc: "所持回避数が4以上の時、任意で所持回避数を4減らして行動権を1増やす。",
          actionType: "instant"
        },
        {
          name: "シールド",
          effectType: "jegan_shield",
          timing: "reaction",
          desc: "3回まで、1ターンに受けるダメージを半減する。",
          actionType: "instant"
        },
        {
          name: "リミッター解除",
          effectType: "jegan_limiter_stark",
          timing: "self",
          desc: "任意でHPを120消費して、使用ターンの行動権+1、回避ストック最大値を倍、現在所持数を倍にする。ただしスタークジェガン解除後1ターン休みになる。",
          actionType: "instant"
        },
        {
          name: "撹乱",
          effectType: "jegan_stark_disturb",
          timing: "self",
          desc: "行動権を1消費して回避数を3獲得する。また、総行動ターンの偶数ターンに自動的に回避数を1取得する。",
          actionType: "instant"
        }
      ]
    },

    ewac: {
      name: "ジェガンD型（EWAC装備）",
      hp: 450,
      evadeMax: 5,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "支給急造ハンドグレネード 10ダメージ",
          desc: "10ダメージ。射撃。使用する度に威力が5ずつ上昇する。",
          effect: { type: "custom", customType: "jegan_ewac_grenade" }
        },
        slot2: {
          label: "ビームサーベル 30ダメージ",
          desc: "30ダメージ。格闘、ビーム属性",
          effect: { type: "attack", attackType: "melee", damage: 30, count: 1, beam: true }
        },
        slot3: {
          label: "回避 +1",
          desc: "回避ストック+1",
          effect: { type: "evade", amount: 1 }
        },
        slot4: {
          label: "回復 30",
          desc: "HP30回復",
          effect: { type: "heal", amount: 30 }
        },
        slot5: {
          label: "回避 +2",
          desc: "回避ストック+2",
          effect: { type: "evade", amount: 2 }
        },
        slot6: {
          label: "EWAC索敵",
          desc: "相手所持回避数を0にする。",
          effect: { type: "custom", customType: "jegan_ewac_search" }
        }
      },

      specials: [
        {
          name: "解除",
          effectType: "jegan_ewac_release",
          timing: "self",
          desc: "任意で装備を解除し、ジェガンD型になる。行動権は消費しない。",
          actionType: "instant"
        },
        {
          name: "索敵予測",
          effectType: "jegan_ewac_predict",
          timing: "self",
          desc: "行動権が1以上の時、行動権を全て消費して相手の次のスロット番号を予測し、的中した時HPを100回復する。",
          actionType: "choice"
        },
        {
          name: "EWAC分析",
          effectType: "jegan_ewac_analysis",
          timing: "self",
          desc: "行動前にスロット6、6EXを切り替える。",
          actionType: "instant"
        },
        {
          name: "離脱解除",
          effectType: "jegan_ewac_escape",
          timing: "reaction",
          desc: "1度だけ任意のターン全てのダメージを無効化し、EWAC装備の選択権を破棄する。",
          actionType: "instant"
        },
        {
          name: "捕捉・援護射撃",
          effectType: "jegan_ewac_support_fire",
          timing: "self",
          desc: "3回だけ、1ターンに1度まで使用可能。宣言したターンの3ターン経過後に80ダメージの射撃攻撃を放つ。宣言後は発動まで特殊行動1、4使用不可。",
          actionType: "instant"
        }
      ]
    },

    escort: {
      name: "ジェガンD型(エスコートタイプ装備型)",
      hp: 450,
      evadeMax: 2,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],

      slots: {
        slot1: {
          label: "回復 80",
          desc: "HP80回復",
          effect: { type: "heal", amount: 80 }
        },
        slot2: {
          label: "ビームライフル 80ダメージ",
          desc: "80ダメージ。射撃、ビーム属性",
          effect: { type: "attack", attackType: "shoot", damage: 80, count: 1, beam: true }
        },
        slot3: {
          label: "ショートマシンガン 5ダメージ×16回",
          desc: "5ダメージ×16回。射撃。フルヒット時、相手回避を0にする。",
          effect: {
            type: "attack",
            attackType: "shoot",
            damage: 5,
            count: 16,
            onFullHitEffect: "jegan_enemy_evade_zero"
          }
        },
        slot4: {
          label: "ビームサーベル 70ダメージ",
          desc: "70ダメージ。格闘、ビーム属性",
          effect: { type: "attack", attackType: "melee", damage: 70, count: 1, beam: true }
        },
        slot5: {
          label: "回復 80",
          desc: "HP80回復",
          effect: { type: "heal", amount: 80 }
        },
        slot6: {
          label: "強襲 120ダメージ",
          desc: "120ダメージ。軽減不可",
          effect: { type: "attack", damage: 120, count: 1, ignoreReduction: true }
        }
      },

      specials: [
        {
          name: "換装",
          effectType: "jegan_escort_release",
          timing: "self",
          desc: "任意で装備を解除し、ジェガンD型かEWACに換装する。行動権を消費しない。",
          actionType: "choice"
        },
        {
          name: "特性:アーマー",
          effectType: "jegan_escort_armor",
          timing: "auto",
          desc: "常に1回あたりのダメージを5ずつ軽減する。軽減不可属性の場合は軽減不可。",
          actionType: "auto"
        },
        {
          name: "シールド",
          effectType: "jegan_shield",
          timing: "reaction",
          desc: "3回まで、1ターンに受けるダメージを半減する。",
          actionType: "instant"
        },
        {
          name: "特性・警戒",
          effectType: "jegan_escort_alert",
          timing: "auto",
          desc: "総ゲームターンの奇数ターンに回避数を1回取得する。",
          actionType: "auto"
        },
        {
          name: "強襲",
          effectType: "jegan_escort_assault",
          timing: "self",
          desc: "所持回避数を2消費し、行動権を1追加する。",
          actionType: "instant"
        }
      ]
    }
  }
};
