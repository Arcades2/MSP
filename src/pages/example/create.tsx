import React from "react";
import { type NextPage } from "next";
import { api } from "~/utils/api";

const CreateExamplePage: NextPage = () => {
  const [name, setName] = React.useState("");

  const utils = api.useContext();

  const exampleMutation = api.example.create.useMutation({
    onMutate: async (newExample) => {
      await utils.example.getAll.cancel();

      const prevExamples = utils.example.getAll.getData();

      utils.example.getAll.setData(undefined, (prev = []) => [
        ...prev,
        {
          id: "tempId",
          createdAt: new Date(),
          updatedAt: new Date(),
          name: newExample.name,
        },
      ]);

      return {
        prevExamples,
      };
    },
    onError: (err, newExample, context) => {
      if (context) {
        utils.example.getAll.setData(undefined, context.prevExamples);
      }
    },
    onSettled: async () => {
      await utils.example.getAll.invalidate();
    },
  });

  return (
    <div>
      <h1>Create Example</h1>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={() => {
          exampleMutation.mutate(
            { name },
            {
              onSuccess: () => {
                alert("Success!");
              },
            }
          );
        }}
        disabled={exampleMutation.isLoading}
      >
        Create
      </button>
    </div>
  );
};

export default CreateExamplePage;
