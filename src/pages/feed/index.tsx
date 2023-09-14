import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { getServerSideHelpers } from "~/server/helpers/ssHelpers";
import { api } from "~/utils/api";
import MusicPost from "~/components/MusicPost";
import invariant from "tiny-invariant";
import CreatePostForm from "~/components/CreatePostForm";
import { useInView } from "react-intersection-observer";
import { Button } from "~/components/ui/button";
import React from "react";
import { type NextPageWithLayout } from "~/pages/_app";
import AppLayout from "~/components/AppLayout/AppLayout";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  invariant(session, "Session should be defined");

  const ssr = getServerSideHelpers(session);

  await ssr.post.infiniteFollowedPosts.prefetchInfinite({});

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const FeedPage: NextPageWithLayout = () => {
  const feed = api.post.infiniteFollowedPosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
    }
  );

  const { ref, inView } = useInView();
  const { fetchNextPage } = feed;

  React.useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (feed.status === "error") {
    return <div>{feed.error.message}</div>;
  }

  return (
    <>
      <div className="p-2">
        <h1>Feed</h1>
      </div>
      <div className="my-4 w-full border-t border-neutral-400 border-opacity-25" />
      <div className="p-2">
        <CreatePostForm />
      </div>
      <div>
        {feed.data?.pages
          .flatMap((page) => page.posts)
          .map((post) => (
            <div
              key={post.id}
              className="border-y border-neutral-400 border-opacity-25"
            >
              <MusicPost post={post} />
            </div>
          ))}
        <div className="my-8 text-center">
          <Button
            ref={ref}
            onClick={() => feed.fetchNextPage()}
            disabled={!feed.hasNextPage || feed.isFetchingNextPage}
          >
            {(() => {
              if (feed.isFetchingNextPage) return "Loading more...";
              if (feed.hasNextPage) return "Load older";
              return "Nothing more to load";
            })()}
          </Button>
        </div>
      </div>
    </>
  );
};

FeedPage.getLayout = (page: React.ReactElement) => (
  <AppLayout>{page}</AppLayout>
);

export default FeedPage;
