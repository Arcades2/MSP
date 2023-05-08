import { groupBy } from "lodash";

export default function formatReactions<
  T extends {
    type: {
      value: string;
    };
    user: {
      id: string;
    };
  }
>(reactions: T[], userId: string) {
  return {
    global: groupBy<T>(reactions, (reaction) => reaction.type.value),
    myReaction: reactions.find((reaction) => reaction.user.id === userId),
  };
}
