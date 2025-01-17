import {v4 as uuidv4} from "uuid"

import {Prompt} from "@/types/prompt"

export const STORAGE_KEY_PROMPTS = "prompts"

export const createNewPrompt = (name: string): Prompt => {
  return {
    id: uuidv4(),
    name: name,
    description: "",
    content: "",
    folderId: undefined,
    factory: undefined
  }
}

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts))
}

export const getPrompts = (): Prompt[] => {
  const promptsAsString = localStorage.getItem(STORAGE_KEY_PROMPTS)
  try {
    return promptsAsString ? (JSON.parse(promptsAsString) as Prompt[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const removePrompts = () => localStorage.removeItem(STORAGE_KEY_PROMPTS)
