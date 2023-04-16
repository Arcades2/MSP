import { type GetServerSideProps, type NextPage } from "next";
import { getServerAuthSession } from "~/server/auth";
import { getServerSideHelpers } from "~/server/helpers/ssHelpers";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const ssr = getServerSideHelpers(session);

  await ssr.post.getFollowingPosts.prefetch();

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const FeedPage: NextPage = function FeedPage() {
  const feed = api.post.getFollowingPosts.useQuery();

  if (feed.status === "error") {
    return <div>{feed.error.message}</div>;
  }

  return (
    <main>
      <h1>Feed</h1>
      <ul>
        {feed.data?.map((post) => (
          <li key={post.id}>{post.description}</li>
        ))}
      </ul>
    </main>
  );
};

export default FeedPage;
