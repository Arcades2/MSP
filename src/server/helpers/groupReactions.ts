import groupBy from "lodash/groupBy";
import invariant from "tiny-invariant";

export default function groupReactions(
  reactions: {
    type: {
      value: string;
    };
  }[]
) {
  const groupedReactions = groupBy(
    reactions,
    (reaction) => reaction.type.value
  );

  return Object.keys(groupedReactions).reduce<Record<string, number>>(
    (acc, key) => {
      const reaction = groupedReactions[key];
      invariant(reaction, "Reaction not found");
      acc[key] = reaction.length;
      return acc;
    },
    {}
  );
}
