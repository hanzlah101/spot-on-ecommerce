import * as React from "react"
import type { Table } from "@tanstack/react-table"
import type { DataTableFilterOption } from "@/utils/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Copy, Ellipsis, AlignCenter, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Separator } from "@/components/ui/separator"
import { DataTableFacetedFilter } from "../data-table-faceted-filter"
import { dataTableConfig, type DataTableConfig } from "@/config/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableMultiFilterProps<TData> {
  table: Table<TData>
  allOptions: DataTableFilterOption<TData>[]
  options: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  defaultOpen: boolean
}

export function DataTableMultiFilter<TData>({
  table,
  allOptions,
  options,
  setSelectedOptions,
  defaultOpen,
}: DataTableMultiFilterProps<TData>) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [operator, setOperator] = React.useState(
    dataTableConfig.logicalOperators[0],
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 truncate rounded-full"
        >
          <AlignCenter className="mr-2 size-3" aria-hidden="true" />
          {options.length} rule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 text-xs" align="start">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              key={option.id ?? i}
              i={i}
              option={option}
              table={table}
              allOptions={allOptions}
              options={options}
              setSelectedOptions={setSelectedOptions}
              operator={operator}
              setOperator={setOperator}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label="Delete filter"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            icon={Trash2}
            onClick={() => {
              setSelectedOptions((prev) => prev.filter((item) => !item.isMulti))
              const deletedOptions = options.filter((o) => o.isMulti)

              const deletedOptionsObject = deletedOptions.reduce(
                (acc, item) => {
                  acc[item.value] = null
                  return acc
                },
                {} as Record<keyof TData, null>,
              )

              const newSearchParams = createQueryString({
                ["operator"]: null,
                ...deletedOptionsObject,
              })
              router.push(`${pathname}?${newSearchParams}`)
            }}
          >
            Delete filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MultiFilterRowProps<TData> {
  i: number
  table: Table<TData>
  allOptions: DataTableFilterOption<TData>[]
  option: DataTableFilterOption<TData>
  options: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  operator?: DataTableConfig["logicalOperators"][number]
  setOperator: React.Dispatch<
    React.SetStateAction<DataTableConfig["logicalOperators"][number]>
  >
}

export function MultiFilterRow<TData>({
  i,
  table,
  option,
  allOptions,
  options,
  setSelectedOptions,
  operator,
  setOperator,
}: MultiFilterRowProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState("")
  const debounceValue = useDebounce(value, 500)

  const [selectedOption, setSelectedOption] = React.useState<
    DataTableFilterOption<TData> | undefined
  >(options[0])

  const operators =
    selectedOption && selectedOption?.options.length > 0
      ? dataTableConfig.selectableOperators
      : dataTableConfig.comparisonOperators

  const column = table.getColumn(
    selectedOption?.value ? String(selectedOption?.value) : "",
  )

  const filterOperator = React.useMemo(() => {
    return options.find((item) => item.value === column?.id)?.filterOperator
  }, [options, column])

  const [selectedOperator, setSelectedOperator] = React.useState(
    operators.find((c) => c.value === filterOperator) ?? operators[0],
  )

  React.useEffect(() => {
    if (selectedOption?.options.length) {
      setSelectedOperator(operators[0])
    }
  }, [selectedOption?.options.length, operators])

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams],
  )

  React.useEffect(() => {
    if (debounceValue.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: `${debounceValue}${
            debounceValue.length > 0 ? `~${selectedOperator?.value}` : ""
          }`,
        })}`,
        {
          scroll: false,
        },
      )
    }

    if (debounceValue.length === 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: null,
        })}`,
        {
          scroll: false,
        },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceValue, selectedOperator, selectedOption?.value])

  React.useEffect(() => {
    if (operator?.value) {
      router.push(
        `${pathname}?${createQueryString({
          operator: operator.value,
        })}`,
        {
          scroll: false,
        },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator?.value])

  return (
    <div className="flex items-center space-x-2">
      {i === 0 ? (
        <div>Where</div>
      ) : i === 1 ? (
        <Select
          value={operator?.value}
          onValueChange={(value) =>
            setOperator(
              dataTableConfig.logicalOperators.find((o) => o.value === value)!,
            )
          }
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTableConfig.logicalOperators.map((operator) => (
                <SelectItem
                  key={operator.value}
                  value={operator.value}
                  className="text-xs"
                >
                  {operator.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <div key={operator?.value}>{operator?.label}</div>
      )}
      <Select
        value={String(selectedOption?.value)}
        onValueChange={(value) => {
          setSelectedOption(allOptions.find((option) => option.value === value))
          setSelectedOptions((prev) =>
            prev.map((item) => {
              if (item.id === option.id) {
                return {
                  ...item,
                  value: value as keyof TData,
                }
              }
              return item
            }),
          )
        }}
      >
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                className="text-xs capitalize"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={selectedOperator?.value}
        onValueChange={(value) =>
          setSelectedOperator(operators.find((o) => o.value === value)!)
        }
      >
        <SelectTrigger className="h-8 w-full truncate px-2 py-0.5 hover:bg-muted/50">
          <SelectValue placeholder={operators[0]?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {operators?.map((op) => (
              <SelectItem key={op.value} value={op?.value}>
                {op?.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedOption?.options.length ? (
        table.getColumn(selectedOption.value ? String(option.value) : "") && (
          <DataTableFacetedFilter
            key={selectedOption.id}
            column={table.getColumn(
              selectedOption.value ? String(selectedOption.value) : "",
            )}
            title={selectedOption.label}
            options={selectedOption.options}
          />
        )
      ) : (
        <Input
          placeholder="Type here..."
          className="h-8"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <Ellipsis className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.id !== option.id),
              )
            }}
          >
            <Trash2 className="mr-2 size-4" aria-hidden="true" />
            Remove
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!selectedOption) return

              setSelectedOptions((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  label: selectedOption.label,
                  value: selectedOption.value,
                  options: selectedOption.options ?? [],
                  isMulti: true,
                },
              ])
            }}
          >
            <Copy className="mr-2 size-4" aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
