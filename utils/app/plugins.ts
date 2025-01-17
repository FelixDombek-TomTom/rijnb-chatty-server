import {PluginKey} from "@/types/plugin"

export const STORAGE_KEY_PLUGIN_KEYS = "pluginKeys"

export const getPluginKeys = (): PluginKey[] => {
  const PluginKeyAsString = localStorage.getItem(STORAGE_KEY_PLUGIN_KEYS)
  try {
    return PluginKeyAsString ? (JSON.parse(PluginKeyAsString) as PluginKey[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const savePluginKeys = (pluginKeys: PluginKey[]) =>
  localStorage.setItem(STORAGE_KEY_PLUGIN_KEYS, JSON.stringify(pluginKeys))

export const removePluginKeys = () => {
  localStorage.removeItem(STORAGE_KEY_PLUGIN_KEYS)
}
