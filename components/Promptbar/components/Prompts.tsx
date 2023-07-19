import {Prompt} from "@/types/prompt";
import {FC} from "react";

import {PromptComponent} from "./Prompt";

interface Props {
  prompts: Prompt[];
}

export const Prompts: FC<Props> = ({prompts}) => {
  return (
      <div className="flex w-full flex-col gap-1">
        {prompts
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((prompt, index) => (
            <PromptComponent key={index} prompt={prompt}/>
        ))}
      </div>
  );
};
