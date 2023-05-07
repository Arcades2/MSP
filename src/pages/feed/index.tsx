import { type GetServerSideProps, type NextPage } from "next";
import { getServerAuthSession } from "~/server/auth";
import { getServerSideHelpers } from "~/server/helpers/ssHelpers";
import { api } from "~/utils/api";
import MusicPost from "~/components/MusicPost";
import invariant from "tiny-invariant";
import CreatePostForm from "~/components/CreatePostForm";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  invariant(session, "Session should be defined");

  const ssr = getServerSideHelpers(session);

  await Promise.all([
    ssr.post.getFollowingPosts.prefetch(),
    ssr.reaction.getReactionTypes.prefetch(undefined),
  ]);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const FeedPage: NextPage = () => {
  const feed = api.post.getFollowingPosts.useQuery();

  if (feed.status === "error") {
    return <div>{feed.error.message}</div>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-[700px] border-x border-neutral-400 border-opacity-25">
      <div className="p-2">
        <h1>Feed</h1>
      </div>
      <div className="my-4 w-full border-t border-neutral-400 border-opacity-25" />
      <div className="p-2">
        <CreatePostForm />
      </div>
      <div>
        {feed.data?.map((post) => (
          <div
            key={post.id}
            className="border-y border-neutral-400 border-opacity-25"
          >
            <MusicPost post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
