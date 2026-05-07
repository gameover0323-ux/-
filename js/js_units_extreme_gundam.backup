export const extreme_gundam = {
  id: "extreme_gundam",
  name: "エクストリームガンダム",
  maxHp: 1000,
  hp: 1000,
  evade: 0,
  evadeMax: 0,
  isBoss: true,
  formId: "normal",

  forms: {
    normal: {
      name: "エクストリームガンダム",
      maxHp: 1000,
      evadeMax: 0,
      slots: {
        slot1: { label: "ビームサーベル", desc: "40ダメージ×2回。格闘、ビーム、軽減不可。", effect: { type: "attack", damage: 40, count: 2, attackType: "melee", beam: true, ignoreReduction: true } },
        slot2: { label: "カルネージフェイズ換装", desc: "カルネージフェイズへ換装する。", effect: { type: "custom", effectId: "extreme_form_carnage" } },
        slot3: { label: "タキオンフェイズ換装", desc: "タキオンフェイズへ換装する。", effect: { type: "custom", effectId: "extreme_form_tachyon" } },
        slot4: { label: "イグニスフェイズ換装", desc: "イグニスフェイズへ換装する。", effect: { type: "custom", effectId: "extreme_form_ignis" } },
        slot5: { label: "ビームライフル", desc: "80ダメージ。射撃、ビーム、必中。", effect: { type: "attack", damage: 80, count: 1, attackType: "shoot", beam: true, cannotEvade: true } },
        slot6: { label: "ミスティックフェイズ換装", desc: "ミスティックフェイズへ換装する。", effect: { type: "custom", effectId: "extreme_form_mystic" } }
      },
      slotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]
    },

    carnage: {
      name: "エクストリームガンダム・カルネージフェイズ",
      maxHp: 1750,
      evadeMax: 0,
      slots: {
        slot1: { label: "ファイヤーバンカー", desc: "20ダメージ×2回。格闘。ヒット時、相手1ターン休み。", effect: { type: "attack", damage: 20, count: 2, attackType: "melee", special: "extreme_stun_1turn" } },
        slot2: { label: "ビームジャミングボール", desc: "30ダメージ。射撃。ヒット時、3ターン間相手の攻撃を3回分無効化する。", effect: { type: "attack", damage: 30, count: 1, attackType: "shoot", special: "extreme_confuse_3" } },
        slot3: { label: "カルネージ・ストライカー", desc: "150ダメージ。射撃、軽減不可。", effect: { type: "attack", damage: 150, count: 1, attackType: "shoot", ignoreReduction: true } },
        slot4: { label: "高高度カルネージストライカー", desc: "次のターン、相手の攻撃を無効化し、その後200ダメージの射撃攻撃を行う。", effect: { type: "custom", effectId: "extreme_high_altitude_carnage" } },
        slot5: { label: "カルネージストライカー連射", desc: "3回判定。1度でも当たると150ダメージ。射撃。", effect: { type: "attack", damage: 150, count: 3, attackType: "shoot", special: "extreme_once_hit_carnage" } },
        slot6: { label: "換装解除", desc: "エクストリームガンダムに戻る。次のターン、回避可能な攻撃を全て回避する。", effect: { type: "custom", effectId: "extreme_form_normal_full_evade" } }
      },
      slotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]
    },

    tachyon: {
      name: "エクストリームガンダム・タキオンフェイズ",
      maxHp: 2000,
      evadeMax: 0,
      slots: {
        slot1: { label: "衝撃波", desc: "10ダメージ×5回。格闘。", effect: { type: "attack", damage: 10, count: 5, attackType: "melee" } },
        slot2: { label: "サンダースラッシュ", desc: "30ダメージ。格闘。ヒット時、相手回避-2。", effect: { type: "attack", damage: 30, count: 1, attackType: "melee", special: "extreme_evade_minus_2" } },
        slot3: { label: "オーバーリミット", desc: "5ターン間、単発攻撃数値+5。重複時+3ターン、さらに+5。スロットがEXになる。", effect: { type: "custom", effectId: "extreme_overlimit" } },
        slot4: { label: "タキオンスライサー伸凪", desc: "150ダメージ。格闘。回避3所持がなければ回避不能。実消費は1。", effect: { type: "attack", damage: 150, count: 1, attackType: "melee", minEvadeRequired: 3 } },
        slot5: { label: "タキオンスライサー連斬", desc: "10ダメージ×7回。格闘、軽減不可。", effect: { type: "attack", damage: 10, count: 7, attackType: "melee", ignoreReduction: true } },
        slot6: { label: "換装解除", desc: "エクストリームガンダムに戻る。次のターン、回避可能な攻撃を全て回避する。", effect: { type: "custom", effectId: "extreme_form_normal_full_evade" } }
      },
      slotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]
    },

    ignis: {
      name: "エクストリームガンダム・イグニスフェイズ",
      maxHp: 2000,
      evadeMax: 0,
      slots: {
        slot1: { label: "シールドビット", desc: "3ターン間、射撃属性被ダメージを半減する。", effect: { type: "custom", effectId: "extreme_shield_bit" } },
        slot2: { label: "ファンネルスケートボード", desc: "発動ターン中、格闘属性無効。50ダメージ。格闘。", effect: { type: "attack", damage: 50, count: 1, attackType: "melee", special: "extreme_melee_null_this_turn" } },
        slot3: { label: "ローリング・ラインファンネル", desc: "100ダメージ。射撃、ビーム、必中。", effect: { type: "attack", damage: 100, count: 1, attackType: "shoot", beam: true, cannotEvade: true } },
        slot4: { label: "ファンネルランス・ニードルダンスコンビネーション", desc: "30ダメージ×4回。格闘、ビーム。", effect: { type: "attack", damage: 30, count: 4, attackType: "melee", beam: true } },
        slot5: { label: "ファンネル・フルバースト", desc: "45ダメージ×4回。射撃、ビーム、軽減不可。", effect: { type: "attack", damage: 45, count: 4, attackType: "shoot", beam: true, ignoreReduction: true } },
        slot6: { label: "換装解除", desc: "エクストリームガンダムに戻る。次のターン、回避可能な攻撃を全て回避する。", effect: { type: "custom", effectId: "extreme_form_normal_full_evade" } }
      },
      slotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]
    },

    mystic: {
      name: "エクストリームガンダム・ミスティックフェイズ",
      maxHp: 2500,
      evadeMax: 0,
      slots: {
        slot1: { label: "忘我墜星(オブビリオン・メテオ)", desc: "30ダメージ×4回。射撃。", effect: { type: "attack", damage: 30, count: 4, attackType: "shoot" } },
        slot2: { label: "天上麗舞(ソレスタル・ビューティング)", desc: "120ダメージ。射撃、軽減不可。ヒット時、相手回避-5。", effect: { type: "attack", damage: 120, count: 1, attackType: "shoot", ignoreReduction: true, special: "extreme_evade_minus_5" } },
        slot3: { label: "終焉摂理(デスティネイトプラン)", desc: "イクス・ファンネルミサイル。10ダメージ×8回。射撃。相手が4回以上回避すると、もう一度スロット行動する。", effect: { type: "attack", damage: 10, count: 8, attackType: "shoot", special: "extreme_reroll_if_evade_4" } },
        slot4: { label: "人馬一神・乱れ突き", desc: "攻撃8回判定。1つでも当たると120ダメージ。格闘、軽減不可。", effect: { type: "attack", damage: 120, count: 8, attackType: "melee", ignoreReduction: true, special: "extreme_once_hit_mystic" } },
        slot5: { label: "絶望蝶", desc: "相手の現在HPの半分ダメージ。月光蝶、軽減不可。", effect: { type: "attack", damage: 0, count: 1, attackType: "shoot", moonlightButterfly: true, ignoreReduction: true, special: "extreme_half_current_hp" } },
        slot6: { label: "換装解除", desc: "エクストリームガンダムに戻る。次のターン、回避可能な攻撃を全て回避する。", effect: { type: "custom", effectId: "extreme_form_normal_full_evade" } }
      },
      slotOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]
    }
  },

  slots: {},
  slotOrder: [],
  specials: {},
  specialOrder: []
};
