import React from "react";
import invariant from "tiny-invariant";
import { createPostInput } from "~/common/validation/post";
import { api } from "~/utils/api";

const CreatePostForm = () => {
  const [errors, setErrors] = React.useState<{
    url?: string;
  }>({});
  const formRef = React.useRef<HTMLFormElement>(null);

  const utils = api.useContext();

  const createPostMutation = api.post.createPost.useMutation({
    onSettled: async () => {
      await utils.post.getFollowingPosts.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    invariant(formRef.current, "Form should be defined");

    const data = new FormData(formRef.current);

    const parsing = createPostInput.safeParse(
      Object.fromEntries(data.entries())
    );

    if (!parsing.success) {
      setErrors({
        url: parsing.error.issues.find((issue) => issue.path[0] === "url")
          ?.message,
      });
      return;
    }

    createPostMutation.mutate(parsing.data, {
      onSuccess: () => {
        invariant(formRef.current, "Form should be defined");
        formRef.current.reset();
        setErrors({
          url: undefined,
        });
      },
    });
  };

  return (
    <form ref={formRef} className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <textarea
        id="description"
        name="description"
        className="rounded-sm p-2 text-black"
        rows={3}
      />
      <input
        id="url"
        name="url"
        type="text"
        className="rounded-sm p-2 text-black"
        placeholder="YouTube or SoundCloud url"
      />
      {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
      <button
        type="submit"
        className="bg-indigo-600 p-2"
        disabled={createPostMutation.isLoading}
      >
        Create Post
      </button>
    </form>
  );
};

export default CreatePostForm;
