import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { FieldTitle, required, useInput } from 'ra-core';
import { DateInput } from '@/components/admin/date-input';
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from '@/components/admin/form';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AuthorDiscipline from '../shared/choices/AuthorDiscipline';

const requiredAbbreviation = required();

const splitDisciplines = (value?: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const joinDisciplines = (values: string[]) => values.join(', ');

const DisciplineMultiSelect = () => {
  const { field, id } = useInput({ source: 'discipline' });
  const selectedDisciplines = splitDisciplines(field.value);

  const toggleDiscipline = (discipline: string, checked: boolean) => {
    const next = checked
      ? [...selectedDisciplines, discipline]
      : selectedDisciplines.filter((value) => value !== discipline);
    field.onChange(joinDisciplines(next));
  };

  return (
    <FormField id={id} name={field.name}>
      <FormLabel>
        <FieldTitle source="discipline" isRequired={false} />
      </FormLabel>
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full justify-between overflow-hidden py-1.75 font-normal"
            >
              <span className={selectedDisciplines.length ? 'truncate text-left' : 'truncate text-left text-muted-foreground'}>
                {selectedDisciplines.length ? joinDisciplines(selectedDisciplines) : 'Select disciplines'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-(--radix-popover-trigger-width) p-2">
            <div className="grid gap-1">
              {AuthorDiscipline.map((discipline) => (
                <label
                  key={discipline.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedDisciplines.includes(discipline.id)}
                    onCheckedChange={(checked) => toggleDiscipline(discipline.id, checked === true)}
                  />
                  <span>{discipline.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormError />
    </FormField>
  );
};

const AuthorForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TextInput source="first_names" />
      <TextInput source="surname" />
      <TextInput source="initials" />
      <TextInput source="abbreviation" validate={requiredAbbreviation} />
      <DisciplineMultiSelect />
      <DateInput source="effective_from" label="Effective from" />
      <DateInput source="effective_to" label="Effective to" />
    </div>
    <div className="max-w-xl">
      <TextInput source="orc_id" label="ORC ID" />
    </div>
  </SimpleForm>
);

export default AuthorForm;
