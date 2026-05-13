export const daisy_ogre_ciel = {
  id: "daisy_ogre_ciel",

  name: "デイジーオーガ(Ciel)",

  hp: 600,
  evadeMax: 8,

  slots: [
    {
      label: "回避",
      desc: "回避3回",
      effect: {
        kind: "evade",
        value: 3
      }
    },

    {
      label: "アサルトライフル",
      desc: "10ダメージ×5回 射撃",
      effect: {
        kind: "attack",
        damage: 10,
        count: 5,
        type: "shoot"
      }
    },

    {
      label: "グレネードランチャー",
      desc: "80ダメージ 射撃 軽減不可",
      effect: {
        kind: "attack",
        damage: 80,
        count: 1,
        type: "shoot",
        ignoreReduction: true
      }
    },

    {
      label: "グレネード",
      desc: "100ダメージ 射撃",
      effect: {
        kind: "attack",
        damage: 100,
        count: 1,
        type: "shoot"
      }
    },

    {
      label: "回復",
      desc: "HP60回復",
      effect: {
        kind: "heal",
        value: 60
      }
    },

    {
      label: "スキャニング",
      desc: "回避所持数を倍加する",
      effect: {
        kind: "custom"
      }
    }
  ],

  specials: [
    {
      name: "武器攻撃A",
      desc:
        "スロット2の武器を変更",
      timing: "self"
    },

    {
      name: "武器攻撃B",
      desc:
        "スロット3の武器を変更",
      timing: "self"
    },

    {
      name: "投擲武器",
      desc:
        "スロット4の武器を変更",
      timing: "self"
    },

    {
      name: "追撃",
      desc:
        "スロット2/3/4後に回避1消費で同じ攻撃を再実行",
      timing: "attack"
    },

    {
      name: "メイガススキル",
      desc:
        "特殊支援スキル",
      timing: "self"
    }
  ]
};
