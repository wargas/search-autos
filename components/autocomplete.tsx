'use client'

import { AutocompleteInputProps } from "@base-ui/react";
import { Autocomplete as AutocompleteREUI, AutocompleteContent, AutocompleteEmpty, AutocompleteInput, AutocompleteItem, AutocompleteList, AutocompleteContentProps } from "./reui/autocomplete";

type Props = AutocompleteInputProps & {
    items: { value: string, label: string}[]
    name: string
    defaultValue?: string | number
    key?: any
}

export function Autocomplete({ items, name, defaultValue, placeholder }: Props) {
    return <AutocompleteREUI defaultValue={defaultValue} name={name} items={items}>
    <AutocompleteInput placeholder={placeholder} showClear />
    <AutocompleteContent>
        <AutocompleteEmpty>Nenhum item</AutocompleteEmpty>
        <AutocompleteList>
            {item => (
                <AutocompleteItem key={item.value} value={item.value}>{item.label}</AutocompleteItem>
            )}
        </AutocompleteList>
    </AutocompleteContent>
</AutocompleteREUI>
}