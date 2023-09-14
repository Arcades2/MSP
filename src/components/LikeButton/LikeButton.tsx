import { Button } from "~/components/ui/button";
import { PiHeartStraightBold, PiHeartStraightFill } from "react-icons/pi";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import React from "react";

export type LikeButtonProps = {
  postId: string;
  initialLikes: Array<{
    id: string;
    user: {
      id: string;
      image: string | null;
      name: string;
    };
  }>;
};

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const session = useSession();
  const me = session.data?.user;

  const likesQuery = api.like.getPostLikes.useQuery(
    { postId },
    {
      initialData: initialLikes,
      staleTime: Infinity,
    }
  );

  const utils = api.useContext();
  const liked = !!likesQuery.data.find((like) => like.user.id === me?.id);

  React.useEffect(() => {
    utils.like.getPostLikes.setData({ postId }, initialLikes);
  }, [utils, postId, initialLikes]);

  const likePostMutation = api.like.likePost.useMutation({
    onMutate: async (variables) => {
      await utils.post.infiniteFollowedPosts.cancel();

      const prevLikes = utils.like.getPostLikes.getData({
        postId: variables.postId,
      });

      utils.like.getPostLikes.setData({ postId: variables.postId }, (prev) => {
        if (!prev) return [];

        return variables.like
          ? [
              ...prev,
              {
                id: "tempId",
                user: {
                  id: me?.id ?? "",
                  image: me?.image ?? null,
                  name: me?.name ?? "",
                },
              },
            ]
          : prev.filter((like) => like.user.id !== me?.id);
      });

      return {
        prevLikes,
      };
    },
    onError: (_, variables, context) => {
      if (context) {
        utils.like.getPostLikes.setData(
          {
            postId: variables.postId,
          },
          context.prevLikes
        );
      }
    },
    onSettled: async (_, __, variables) => {
      await utils.like.getPostLikes.invalidate({ postId: variables.postId });
    },
  });

  return (
    <div className="flex items-baseline">
      <Button
        variant="ghost"
        size="icon"
        className="text-lg transition-transform hover:scale-110 hover:bg-transparent "
        onClick={(e) => {
          e.stopPropagation();
          return likePostMutation.mutate({
            postId,
            like: !liked,
          });
        }}
      >
        {liked ? <PiHeartStraightFill /> : <PiHeartStraightBold />}
      </Button>
      <span className="text-lg">{likesQuery.data.length}</span>
    </div>
  );
}
