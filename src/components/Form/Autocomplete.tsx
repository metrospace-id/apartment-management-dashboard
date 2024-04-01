import { useEffect, useState, useRef } from 'react'
import ReactModal from 'react-modal'

import { ChevronDown as IconChevronDown, Search as IconSearch } from '../Icons'
import Input from './Input'
import type { InputProps } from './Input'

ReactModal.setAppElement('#body-app')

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
  disabled,
  readOnly,
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

  const autocompleteFieldRef = useRef<HTMLDivElement>(null)
  const inputFieldRef = useRef<HTMLInputElement>(null)

  const customStyles = {
    overlay: {
      backgroundColor: 'transparent',
      zIndex: 9999,
      top: autocompleteFieldRef.current?.getBoundingClientRect()?.top,
    },
    content: {
      left: autocompleteFieldRef.current?.getBoundingClientRect()?.left,
      width: autocompleteFieldRef.current?.clientWidth,
    },
  }

  const handleOpenAutocomplete = () => {
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 100)
    setIsSuggestionBoxShow(true)
  }

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
    <div className="w-full relative">
      <Input
        leftIcon={<IconSearch className="text-neutral-400 w-4 h-4 lg:w-5 lg:h-5" />}
        rightIcon={(
          <IconChevronDown
            className={`text-neutral-40 ${isSuggestionBoxShow ? 'rotate-180' : ''} w-4 h-4 lg:w-5 lg:h-5 cursor-pointer`}
            width={20}
            height={20}
            onClick={disabled || readOnly ? () => null : () => setIsSuggestionBoxShow((prevState) => (!prevState))}
          />
        )}
        value={autocompleteText || ''}
        onChange={(e) => handleChangeAutocompleteText(e.target.value)}
        onClick={disabled || readOnly ? () => null : handleOpenAutocomplete}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        InputRef={inputFieldRef}
        {...props}
      />

      <div className="relative" id="form-autocomplete" ref={autocompleteFieldRef}>
        <ReactModal
          isOpen={isSuggestionBoxShow}
          style={customStyles}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
          onRequestClose={() => setIsSuggestionBoxShow(false)}
          className={`mt-1 max-h-[calc(36px*5)] overflow-scroll border border-slate-200 focus-visible:outline-none
          shadow-sm p-2 rounded-xl absolute z-50 bg-white dark:bg-slate-900 dark:border-slate-600`}
        >
          <ol>
            {filteredItems.length ? filteredItems.map((menu) => (
              <li
                className="px-4 py-[6px]
                text-md text-slate-600 hover:bg-sky-100 rounded-xl mb-1 cursor-pointer dark:text-white dark:hover:bg-primary"
                onClick={() => handleClickMenu(menu)}
                role="presentation"
                key={menu.value}
              >
                {menu.element || menu.label}
              </li>
            )) : (
              <p className="px-4 py-[6px] text-md text-slate-600 dark:text-white">Data tidak ditemukan</p>
            )}
          </ol>
        </ReactModal>
      </div>
    </div>
  )
}
