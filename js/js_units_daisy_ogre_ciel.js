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
        type: "evade",
        amount: 3
      }
    },

    {
      label: "武器攻撃A",
      desc: "現在選択中の武器攻撃Aを使用する",
      effect: {
        type: "custom"
      }
    },

    {
      label: "武器攻撃B",
      desc: "現在選択中の武器攻撃Bを使用する",
      effect: {
        type: "custom"
      }
    },

    {
      label: "投擲武器",
      desc: "現在選択中の投擲武器を使用する",
      effect: {
        type: "custom"
      }
    },

    {
      label: "リペアキット",
      desc: "HP60回復",
      effect: {
        type: "heal",
        amount: 60
      }
    },

    {
      label: "スキャニング",
      desc: "回避所持数を倍加する",
      effect: {
        type: "custom"
      }
    }
  ],

  specials: [
    {
      name: "武器攻撃A",
      desc: "スロット2の武器を変更",
      timing: "self"
    },

    {
      name: "武器攻撃B",
      desc: "スロット3の武器を変更",
      timing: "self"
    },

    {
      name: "投擲武器",
      desc: "スロット4の武器を変更",
      timing: "self"
    },

    {
      name: "追撃",
      desc: "スロット2/3/4後に回避1消費で同じ行動をもう一度使用",
      timing: "attack"
    },

    {
      name: "メイガススキル",
      desc: "行動権を消費せず、1ターンに1回特殊支援スキルを発動",
      timing: "self"
    }
  ]
};
