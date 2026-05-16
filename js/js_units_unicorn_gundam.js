export const unicorn_gundam = {
  id: "unicorn_gundam",
  name: "ユニコーンガンダム",
  defaultFormId: "unicorn",
  forms: {
    unicorn: {
      name: "ユニコーンガンダム",
      hp: 750,
      evadeMax: 2,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "バルカン砲 10ダメージ×4回", desc: "10ダメージ×4回。射撃", effect: { type: "attack", damage: 10, count: 4, attackType: "shoot" } },
        slot2: { label: "ビームサーベル 30ダメージ×2回", desc: "30ダメージ×2回。格闘、ビーム", effect: { type: "attack", damage: 30, count: 2, attackType: "melee", beam: true } },
        slot3: { label: "回避 +2", desc: "回避ストック+2", effect: { type: "evade", amount: 2 } },
        slot4: { label: "バズーカ砲 50ダメージ", desc: "50ダメージ。射撃", effect: { type: "attack", damage: 50, count: 1, attackType: "shoot" } },
        slot5: { label: "NT-D発動", desc: "5ターン間デストロイモードに変形。強化", effect: { type: "custom", effectId: "unicorn_ntd_activate" } },
        slot6: { label: "ビームマグナム 90ダメージ", desc: "90ダメージ。ヒット時、相手の回避を強制的に1消費する。射撃、ビーム", effect: { type: "attack", damage: 90, count: 1, attackType: "shoot", beam: true, special: "unicorn_beam_magnum_plus" } }
      },
      specials: [
        { name: "シールド", effectType: "unicorn_shield", timing: "reaction", desc: "相手の攻撃時、3回だけ1ターンに受けるダメージを半減する。", actionType: "instant" },
        { name: "共振", effectType: "unicorn_resonance", timing: "self", desc: "相手が強化状態になったことを感知した時、強化1発動毎1回発動可能。50%でデストロイモードに変形。", actionType: "instant" },
        { name: "覚悟", effectType: "unicorn_resolve", timing: "self", desc: "回避を1消費すると、特殊行動2の数値が1上昇する。", actionType: "instant" }
      ]
    },

    destroy: {
      name: "ユニコーンガンダム(デストロイモード)",
      hp: 750,
      evadeMax: 8,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "デストロイスティンガー 120ダメージ", desc: "120ダメージ。格闘", effect: { type: "attack", damage: 120, count: 1, attackType: "melee" } },
        slot2: { label: "回避 +3", desc: "回避ストック+3", effect: { type: "evade", amount: 3 } },
        slot3: { label: "回復 90", desc: "HP90回復", effect: { type: "heal", amount: 90 } },
        slot4: { label: "波動 0ダメージ", desc: "0ダメージ。ヒット時、強化形態の場合通常形態に戻す。さらに行動権+1。サイコミュ属性", effect: { type: "attack", damage: 0, count: 1, attackType: "shoot", psychommu: true, special: "unicorn_wave" } },
        slot5: { label: "ビームマグナム 130ダメージ", desc: "130ダメージ。ヒット時、相手の回避を強制的に1消費する。0の時はマイナス値。射撃、ビーム", effect: { type: "attack", damage: 130, count: 1, attackType: "shoot", beam: true, special: "unicorn_beam_magnum_minus" } },
        slot6: { label: "乱撃", desc: "40ダメージ×回避保持数。格闘", effect: { type: "custom", effectId: "unicorn_rush" } }
      },
      specials: [
        { name: "シールド", effectType: "unicorn_shield", timing: "reaction", desc: "相手の攻撃時、3回だけ1ターンに受けるダメージを半減する。変形する度に使用可能回数が1回復する。", actionType: "instant" },
        { name: "覚醒", effectType: "unicorn_awaken_try", timing: "self", desc: "特殊行動2の数値を1消費して50%で覚醒。失敗時はデストロイモードの強化ターン数+1。", actionType: "instant" },
        { name: "特性", effectType: "unicorn_psychommu_cancel", timing: "passive", desc: "ファンネル、ドラグーン、インコム、サイコミュ属性の武装または特殊行動を無効化する。", actionType: "auto" },
        { name: "平静", effectType: "unicorn_calm", timing: "self", desc: "回避を2消費すると、特殊行動2の数値が1上昇する。", actionType: "instant" }
      ]
    },

    awaken: {
      name: "ユニコーンガンダム(デストロイモード・覚醒)",
      hp: 750,
      evadeMax: 16,
      rollableSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      ownedSlotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
      slots: {
        slot1: { label: "回復 150", desc: "HP150回復", effect: { type: "heal", amount: 150 } },
        slot2: { label: "回避所持数倍加", desc: "回避所持数を倍加する。", effect: { type: "custom", effectId: "unicorn_double_evade" } },
        slot3: { label: "ビームマグナム 150ダメージ", desc: "150ダメージ。ヒット時、相手の回避を強制的に1消費する。0の時はマイナス値。射撃、ビーム", effect: { type: "attack", damage: 150, count: 1, attackType: "shoot", beam: true, special: "unicorn_beam_magnum_minus" } },
        slot4: { label: "ビームガトリング 20ダメージ×10回", desc: "20ダメージ×10回。射撃、ビーム", effect: { type: "attack", damage: 20, count: 10, attackType: "shoot", beam: true } },
        slot5: { label: "ソフトチェストタッチ 40ダメージ×5回", desc: "40ダメージ×5回。フルヒット時追撃100ダメージ。格闘", effect: { type: "attack", damage: 40, count: 5, attackType: "melee", special: "unicorn_soft_chest_touch" } },
        slot6: { label: "光 0ダメージ", desc: "0ダメージ。ヒット時、相手の回避が0になり、強制的に強化形態を解除。さらに行動権+2、5ターン間相手の攻撃ダメージを半減する。サイコミュ属性", effect: { type: "attack", damage: 0, count: 1, attackType: "shoot", psychommu: true, special: "unicorn_light" } }
      },
      specials: [
        { name: "特性", effectType: "unicorn_awaken_trait", timing: "passive", desc: "毎ターン20回復。ファンネル、ドラグーン、インコム、サイコミュ属性を無効化する。", actionType: "auto" },
        { name: "心の光", effectType: "unicorn_heart_light", timing: "passive", desc: "各形態の特殊行動2の数値=この形態の強化ターン。この形態への変化は強化属性/強化形態として扱われない。", actionType: "auto" },
        { name: "武装変更", effectType: "unicorn_weapon_change", timing: "self", desc: "行動前に3、4を3EX、4EXに自由に変更できる。", actionType: "instant" },
        { name: "シールドファンネル", effectType: "unicorn_shield_funnel", timing: "attack", desc: "被弾時75%で自動半減。自分のターンの時は回避を1消費して30ダメージ射撃攻撃。", actionType: "instant" },
        { name: "亡霊は暗黒に帰れ！", effectType: "unicorn_ghost_return", timing: "self", desc: "消費前の回避所持数と特殊行動2保持数で威力計算後、両方0にして解放出力ビームトンファーを放つ。", actionType: "instant" }
      ]
    }
  }
};
