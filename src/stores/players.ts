import { create } from "zustand";
import invariant from "tiny-invariant";

type PlayerState = {
  playing: boolean;
};

type PlayersState = {
  playersState: Record<string, PlayerState>;
  actions: {
    addPlayer: (postId: string, playerState?: PlayerState) => void;
    removePlayer: (postId: string) => void;
    pausePlayer: (postId: string) => void;
    playPlayer: (postId: string) => void;
  };
};

const usePlayersStore = create<PlayersState>((set) => ({
  playersState: {},
  actions: {
    addPlayer: (postId, playerState = { playing: false }) =>
      set((state) => ({
        playersState: {
          ...state.playersState,
          [postId]: playerState,
        },
      })),
    removePlayer: (postId) =>
      set((state) => ({
        playersState: Object.keys(state.playersState).reduce<
          PlayersState["playersState"]
        >((acc, key) => {
          if (key !== postId) {
            const playerState = state.playersState[key];
            invariant(playerState, "Player state not found");
            acc[key] = playerState;
          }
          return acc;
        }, {}),
      })),
    pausePlayer(postId) {
      set((state) => ({
        playersState: {
          ...state.playersState,
          [postId]: {
            playing: false,
          },
        },
      }));
    },
    playPlayer(postId) {
      set((state) => ({
        playersState: Object.keys(state.playersState).reduce<
          PlayersState["playersState"]
        >((acc, key) => {
          if (key === postId) {
            acc[key] = { playing: true };
          } else {
            acc[key] = { playing: false };
          }

          return acc;
        }, {}),
      }));
    },
  },
}));

export const usePlayersState = () =>
  usePlayersStore((state) => state.playersState);
export const usePlayerState = (id: string) =>
  usePlayersStore((state) => state.playersState[id] ?? { playing: false });
export const usePlayersActions = () =>
  usePlayersStore((state) => state.actions);
