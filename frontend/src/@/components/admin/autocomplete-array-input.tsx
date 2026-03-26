import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ChoicesProps, InputProps } from "ra-core";
import {
  useChoices,
  useChoicesContext,
  useGetRecordRepresentation,
  useInput,
  useTranslate,
  FieldTitle,
  useEvent,
} from "ra-core";
import { InputHelperText } from "./input-helper-text";
import { useCallback } from "react";

/**
 * Form control that lets users choose multiple values from a list using a dropdown with autocompletion.
 *
 * This input allows editing array values with a searchable dropdown interface and displays selected items as removable badges.
 * Works seamlessly inside ReferenceArrayInput for editing many-to-many relationships.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/autocompletearrayinput/ AutocompleteArrayInput documentation}
 *
 * @example
 * import {
 *   Create,
 *   SimpleForm,
 *   AutocompleteArrayInput,
 *   ReferenceArrayInput,
 * } from '@/components/admin';
 *
 * const PostCreate = () => (
 *   <Create>
 *     <SimpleForm>
 *       <AutocompleteArrayInput
 *         source="tags"
 *         choices={[
 *           { id: 'tech', name: 'Tech' },
 *           { id: 'news', name: 'News' },
 *           { id: 'lifestyle', name: 'Lifestyle' },
 *         ]}
 *       />
 *       <ReferenceArrayInput source="tag_ids" reference="tags">
 *         <AutocompleteArrayInput />
 *       </ReferenceArrayInput>
 *     </SimpleForm>
 *   </Create>
 * );
 */
export const AutocompleteArrayInput = (
  props: Omit<InputProps, "source"> &
    Partial<Pick<InputProps, "source">> &
    ChoicesProps & {
      className?: string;
      disableValue?: string;
      filterToQuery?: (searchText: string) => any;
      translateChoice?: boolean;
      placeholder?: string;
      inputText?:
        | React.ReactNode
        | ((option: any | undefined) => React.ReactNode);
    },
) => {
  const { filterToQuery = DefaultFilterToQuery, inputText } = props;
  const {
    allChoices = [],
    source,
    resource,
    isFromReference,
    setFilters,
  } = useChoicesContext(props);
  const { id, field, isRequired } = useInput({ ...props, source });
  const translate = useTranslate();
  const { placeholder = translate("ra.action.search", { _: "Search..." }) } =
    props;

  const getRecordRepresentation = useGetRecordRepresentation(resource);
  const { getChoiceText, getChoiceValue } = useChoices({
    optionText:
      props.optionText ?? (isFromReference ? getRecordRepresentation : "name"),
    optionValue: props.optionValue ?? "id",
    disableValue: props.disableValue,
    translateChoice: props.translateChoice ?? !isFromReference,
  });

  const [open, setOpen] = React.useState(false);

  const handleUnselect = useEvent((choice: any) => {
    field.onChange(
      field.value.filter((v: any) => v !== getChoiceValue(choice)),
    );
  });

  const handleOpenChange = useEvent((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFilterValue("");
      if (isFromReference) {
        setFilters(filterToQuery(""));
      }
    }
  });

  const availableChoices = allChoices.filter(
    (choice) => !field.value.includes(getChoiceValue(choice)),
  );
  const selectedChoices = allChoices.filter((choice) =>
    field.value.includes(getChoiceValue(choice)),
  );
  const [filterValue, setFilterValue] = React.useState("");

  const getInputText = useCallback(
    (selectedChoice: any) => {
      if (typeof inputText === "function") {
        return inputText(selectedChoice);
      }
      if (inputText !== undefined) {
        return inputText;
      }
      return getChoiceText(selectedChoice);
    },
    [inputText, getChoiceText],
  );

  return (
    <FormField className={props.className} id={id} name={field.name}>
      {props.label !== false && (
        <FormLabel>
          <FieldTitle
            label={props.label}
            source={props.source ?? source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.75 text-left text-sm transition-all ring-offset-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <div className="flex flex-1 flex-wrap gap-1">
                {selectedChoices.length > 0 ? (
                  selectedChoices.map((choice) => (
                    <Badge key={getChoiceValue(choice)} variant="outline">
                      {getInputText(choice)}
                      <button
                        type="button"
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(choice);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(choice);
                        }}
                      >
                        <span className="sr-only">
                          {translate("ra.action.remove", {
                            _: "Remove",
                          })}
                        </span>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-(--radix-popover-trigger-width) p-0">
            <Command shouldFilter={!isFromReference}>
              <CommandInput
                placeholder={placeholder}
                value={filterValue}
                onValueChange={(filter) => {
                  setFilterValue(filter);
                  if (isFromReference) {
                    setFilters(filterToQuery(filter), undefined, true);
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>No matching item found.</CommandEmpty>
                <CommandGroup>
                  {availableChoices.map((choice) => (
                    <CommandItem
                      key={getChoiceValue(choice)}
                      onSelect={() => {
                        setFilterValue("");
                        if (isFromReference) {
                          setFilters(filterToQuery(""));
                        }
                        field.onChange([
                          ...field.value,
                          getChoiceValue(choice),
                        ]);
                      }}
                      className="cursor-pointer"
                    >
                      {getChoiceText(choice)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <InputHelperText helperText={props.helperText} />
      <FormError />
    </FormField>
  );
};

const DefaultFilterToQuery = (searchText: string) => ({ q: searchText });
