import { create } from 'zustand';
import { evaluateSelection, isLargeStraight5, bestSetIndices } from '../game/scoring';

type Mode = 'SOLO' | 'CPU' | 'PVP';

type Profile = {
  level: number;
  xp: number;
  hintBank: number;
  rerollBank: number;
};

type State = {
  profile: Profile;
  leagueBracket: string;
  mode: Mode;
  dice: number[];
  held: boolean[];
  selected: boolean[];
  banked: number;
  sideboard: number;
  allowFreeRoll: boolean;
  hintBank: number;
  rerollBank: number;

  canCommitSelection: () => boolean;
  selectionPreview: () => number;

  roll: () => void;
  toggleSelect: (i: number) => void;
  keep: () => void;
  bank: () => void;
  useHint: () => void;
  useReroll: () => void;
};

const DIE_COUNT = 5;
const rng = () => 1 + Math.floor(Math.random() * 6);

// Level threshold grows linearly
function nextLevelThreshold(level: number) {
  return 500 + (level - 1) * 250;
}

export const useGame = create<State>((set, get) => ({
  profile: { level: 1, xp: 0, hintBank: 3, rerollBank: 1 },
  leagueBracket: 'Bronze',
  mode: 'SOLO',
  dice: [1,1,1,1,1],
  held: [false,false,false,false,false],
  selected: [false,false,false,false,false],
  banked: 0,
  sideboard: 0,
  allowFreeRoll: false,
  hintBank: 3,
  rerollBank: 1,

  canCommitSelection: () => {
    const { dice, selected, held } = get();
    const selVals: number[] = [];
    for (let i=0;i<DIE_COUNT;i++){
      if (selected[i]) {
        if (held[i]) return false;
        selVals.push(dice[i]);
      }
    }
    if (selVals.length === 0) return false;
    const { total, usedMask } = evaluateSelection(selVals);
    return total > 0 && usedMask.every(Boolean);
  },

  selectionPreview: () => {
    const { dice, selected, held } = get();
    const selVals: number[] = [];
    for (let i=0;i<DIE_COUNT;i++){
      if (selected[i]) {
        if (held[i]) return 0;
        selVals.push(dice[i]);
      }
    }
    if (selVals.length === 0) return 0;
    const { total, usedMask } = evaluateSelection(selVals);
    return usedMask.every(Boolean) ? total : 0;
  },

  roll: () => {
    const { held, allowFreeRoll } = get();
    const next = Array(DIE_COUNT).fill(0).map((_, i) => (held[i] ? get().dice[i] : rng()));
    let bonusAwarded = false;
    if (held.every(h => !h)) {
      if (isLargeStraight5(next)) {
        set((s) => {
          // +500 sideboard, +50 XP
          let level = s.profile.level;
          let xp = s.profile.xp + 50;
          while (xp >= nextLevelThreshold(level)) {
            xp -= nextLevelThreshold(level);
            level += 1;
          }
          return {
            sideboard: s.sideboard + 500,
            allowFreeRoll: true,
            profile: { ...s.profile, level, xp }
          };
        });
        bonusAwarded = true;
      } else {
        if (allowFreeRoll) set({ allowFreeRoll: false });
      }
    } else {
      if (allowFreeRoll) set({ allowFreeRoll: false });
    }

    const freeIdx = next.map((_, i) => i).filter(i => !held[i]);
    const freeVals = freeIdx.map(i => next[i]);
    const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0};
    freeVals.forEach(v => counts[v]++);
    const anyScorable = counts[1] >= 1 || [2,3,4,5,6].some(f => counts[f] >= 2);

    if (!anyScorable && !bonusAwarded) {
      set({
        dice: next,
        held: Array(DIE_COUNT).fill(false),
        selected: Array(DIE_COUNT).fill(false),
        sideboard: 0,
        allowFreeRoll: false
      });
      return;
    }

    set({
      dice: next,
      selected: Array(DIE_COUNT).fill(false),
    });
  },

  toggleSelect: (i) =>
    set((state) => {
      if (state.held[i]) return state;
      const newSel = [...state.selected];
      newSel[i] = !newSel[i];
      return { selected: newSel };
    }),

  keep: () => {
    const { canCommitSelection, selectionPreview, selected, held, sideboard } = get();
    if (!canCommitSelection()) return;
    const add = selectionPreview();
    const newHeld = held.map((h, i) => h || selected[i]);
    const allHeld = newHeld.every(Boolean);
    if (allHeld) {
      for (let i = 0; i < newHeld.length; i++) newHeld[i] = false;
    }
    set({
      held: newHeld,
      selected: Array(DIE_COUNT).fill(false),
      sideboard: sideboard + add,
      allowFreeRoll: false,
    });
  },

  bank: () => {
    const { banked, sideboard } = get();
    set((s) => {
      let level = s.profile.level;
      let xp = s.profile.xp + sideboard; // 1 XP per banked point
      while (xp >= nextLevelThreshold(level)) {
        xp -= nextLevelThreshold(level);
        level += 1;
      }
      return {
        banked: banked + sideboard,
        sideboard: 0,
        held: Array(DIE_COUNT).fill(false),
        selected: Array(DIE_COUNT).fill(false),
        allowFreeRoll: false,
        profile: { ...s.profile, level, xp }
      };
    });
  },

  useHint: () => {
    const { hintBank, dice, held } = get();
    if (hintBank <= 0) return;
    const { indices, score } = bestSetIndices(dice, held);
    if (indices.length === 0) return; // don't consume hint if no valid set
    set((s) => {
      const sel = Array(DIE_COUNT).fill(false);
      indices.forEach(i => sel[i] = true);
      return { selected: sel, hintBank: s.hintBank - 1 };
    });
  },

  useReroll: () => {
    const { rerollBank, held } = get();
    if (rerollBank <= 0) return;
    const next = Array(DIE_COUNT).fill(0).map((_, i) => (held[i] ? get().dice[i] : rng()));
    set({ dice: next, rerollBank: rerollBank - 1, selected: Array(DIE_COUNT).fill(false), allowFreeRoll: false });
  },
}));
