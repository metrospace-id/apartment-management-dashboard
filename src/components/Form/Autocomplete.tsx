import { useEffect, useState } from 'react'

import useOutsideClick from 'hooks/useClickOutside'
import { ChevronDown as IconChevronDown, Search as IconSearch } from '../Icons'
import Input from './Input'
import type { InputProps } from './Input'

interface AutocompleteItemProps {
  label: string,
  element?: React.ReactNode
  value: string | number
}

interface AutocompleteProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: AutocompleteItemProps
  items: AutocompleteItemProps[]
  onChange?: (item: AutocompleteItemProps) => void
}

export default function Autocomplete({
  value,
  items,
  onChange,
  ...props
}: AutocompleteProps) {
  const [autocompleteText, setAutocompleteText] = useState('')
  const [filteredItems, setFilteredItems] = useState<AutocompleteItemProps[]>([])
  const [isSuggestionBoxShow, setIsSuggestionBoxShow] = useState(false)

  const handleClickMenu = (selectedMenu: AutocompleteProps['value']) => {
    if (selectedMenu) {
      onChange?.(selectedMenu)
      setAutocompleteText(selectedMenu.label)
      setIsSuggestionBoxShow(false)
    }
  }

  const handleChangeAutocompleteText = (text: string) => {
    setAutocompleteText(text)
  }

  const ref = useOutsideClick(() => setIsSuggestionBoxShow(false))

  useEffect(() => {
    if (value) {
      setAutocompleteText(value.label)
    }
  }, [value])

  useEffect(() => {
    setFilteredItems(items)
  }, [items])

  useEffect(() => {
    if (autocompleteText) {
      const filterItems = items
        .filter((menu) => menu.label.toLocaleLowerCase()
          .includes(autocompleteText.toLocaleLowerCase()))

      setFilteredItems(filterItems)
    } else {
      setFilteredItems(items)
    }
  }, [autocompleteText])

  return (
    <div className="w-full relative" ref={ref}>
      <Input
        leftIcon={<IconSearch className="text-neutral-400 w-4 h-4 lg:w-5 lg:h-5" />}
        rightIcon={<IconChevronDown className={`text-neutral-40 ${isSuggestionBoxShow ? 'rotate-180' : ''} w-4 h-4 lg:w-5 lg:h-5 cursor-pointer`} width={20} height={20} onClick={() => setIsSuggestionBoxShow((prevState) => (!prevState))} />}
        value={autocompleteText || ''}
        onChange={(e) => handleChangeAutocompleteText(e.target.value)}
        className="mb-1"
        onFocus={() => setIsSuggestionBoxShow(true)}
        autoComplete="off"
        {...props}
      />
      <div className="relative mt-2">
        {isSuggestionBoxShow && (
        <ol className="max-h-[calc(36px*5)] w-full overflow-scroll border border-slate-200 shadow-sm p-2 rounded-xl absolute z-50 bg-white dark:bg-slate-900 dark:border-slate-600 ">
          {filteredItems.map((menu) => (
            <li
              className="px-4 py-[6px] text-link text-slate-600 hover:bg-sky-100 rounded-xl mb-1 cursor-pointer dark:text-white dark:hover:bg-sky-700"
              onClick={() => handleClickMenu(menu)}
              role="presentation"
              key={menu.value}
            >
              {menu.element || menu.label}
            </li>
          ))}
        </ol>
        )}
      </div>
    </div>
  )
}
