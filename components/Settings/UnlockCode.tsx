import {IconCheck, IconKey, IconX} from "@tabler/icons-react"
import {FC, KeyboardEvent, useEffect, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import SidebarButton from "../Sidebar/SidebarButton"


interface Props {
  unlockCode: string
  onUnlockCodeChange: (apiKey: string) => void
}

export const UnlockCode: FC<Props> = ({unlockCode, onUnlockCodeChange}) => {
  const {t} = useTranslation("sidebar")
  const [isChanging, setIsChanging] = useState(false)
  const [newKey, setNewKey] = useState(unlockCode)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e)) {
      e.preventDefault()
      handleUpdateKey(newKey)
    }
  }

  const handleUpdateKey = (newKey: string) => {
    onUnlockCodeChange(newKey.trim())
    setIsChanging(false)
  }

  useEffect(() => {
    if (isChanging) {
      inputRef.current?.focus()
    }
  }, [isChanging])

  return isChanging ? (
    <div className="duration:200 flex w-full cursor-pointer items-center rounded-md py-3 px-3 transition-colors hover:bg-gray-500/10">
      <IconKey size={18} />

      <input
        ref={inputRef}
        className="ml-2 h-[20px] flex-1 overflow-hidden overflow-ellipsis border-b border-neutral-400 bg-transparent pr-1 text-[12.5px] leading-3 text-left text-white outline-none focus:border-neutral-100"
        type="password"
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        onKeyDown={handleEnterDown}
        placeholder={t("Enter unlock code")}
      />

      <div className="flex w-[40px]">
        <IconCheck
          className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            handleUpdateKey(newKey)
          }}
        />

        <IconX
          className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            setIsChanging(false)
            setNewKey(unlockCode)
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton text={t("Unlock code")} icon={<IconKey size={18} />} onClick={() => setIsChanging(true)} />
  )
}

export default UnlockCode