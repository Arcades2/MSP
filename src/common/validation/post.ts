import invariant from "tiny-invariant";
import { z } from "zod";

export const createPostInput = z.object({
  description: z.string(),
  url: z
    .string({
      required_error: "Please provide a url",
      description: "A youtube or soundcloud url",
      invalid_type_error: "Please provide a valid url",
    })
    .url({
      message: "Please provide a valid url",
    })
    .refine(
      (url) =>
        /https:\/\/soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/.test(url) ||
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:\S+)?$/.test(
          url
        ),
      "Please provide a valid youtube or soundcloud url"
    )
    .transform((url) => {
      if (url.includes("youtube")) {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const v = urlParams.get("v");
        invariant(v, "Invalid youtube url");
        return `https://www.youtube.com/watch?v=${v}`;
      }
      if (url.includes("soundcloud")) {
        return url.split("?")[0] as string;
      }
      throw new Error("Invalid url");
    }),
});
