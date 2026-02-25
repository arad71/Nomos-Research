import React, { Children, isValidElement, useCallback } from 'react';
import {
  OptionalRecordContextProvider,
  setSubmissionErrors,
  useAugmentedForm,
  useRecordContext,
  useSaveContext,
} from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { IconButton, TableCell } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRowContext } from '@react-admin/ra-editable-datagrid';

export type InlineRowFormProps = any;

const InlineRowFormActionsTableCell = ({
  form,
  handleSubmit,
  hasSideEffects,
  handleSubmitWithSideEffects,
}: {
  form: any;
  handleSubmit: any;
  hasSideEffects: boolean;
  handleSubmitWithSideEffects: (values: any) => Promise<void>;
}) => {
  const { close } = useRowContext();

  const onSaveClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (hasSideEffects) {
        await form.handleSubmit(handleSubmitWithSideEffects)(event);
      } else {
        handleSubmit(event);
      }
    },
    [form, handleSubmit, handleSubmitWithSideEffects, hasSideEffects]
  );

  return (
    <TableCell
      className="RaRowForm-actionColumn"
      style={{ whiteSpace: 'nowrap', width: '5em' }}
    >
      <IconButton
        aria-label="Save"
        size="small"
        color="primary"
        onClick={onSaveClick}
      >
        <SaveIcon />
      </IconButton>
      <IconButton aria-label="Cancel" size="small" onClick={close}>
        <CancelIcon />
      </IconButton>
    </TableCell>
  );
};

export const InlineRowForm = (props: InlineRowFormProps) => {
  const {
    children,
    defaultValues,
    initialValues,
    mutationOptions,
    submitOnEnter = true,
    transform,
    ...rest
  } = props;

  const record = useRecordContext(props);
  const save = useSaveContext().save;

  const { form, formHandleSubmit } = useAugmentedForm({
    defaultValues: { ...initialValues, ...defaultValues, ...record },
    record,
    onSubmit: save,
    mode: 'onSubmit',
    ...rest,
  });

  const hasSideEffects =
    (mutationOptions &&
      (mutationOptions?.onSuccess ||
        mutationOptions?.onError ||
        mutationOptions?.meta)) ||
    transform;

  const handleSubmitWithSideEffects = useCallback(
    async (values: any) => {
      if (!save) return;
      const errors = await save(values, {
        ...mutationOptions,
        transform,
      });
      if (errors != null) {
        const hasMessage =
          errors &&
          typeof errors === 'object' &&
          !Array.isArray(errors) &&
          'message' in errors;
        if (!hasMessage) {
          setSubmissionErrors(errors, form.setError);
        }
      }
    },
    [form.setError, save, mutationOptions, transform]
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' && submitOnEnter) {
        if (hasSideEffects) {
          event.stopPropagation();
          await form.handleSubmit(handleSubmitWithSideEffects)(event);
        } else {
          formHandleSubmit(event);
        }
      }
    },
    [
      submitOnEnter,
      hasSideEffects,
      form,
      handleSubmitWithSideEffects,
      formHandleSubmit,
    ]
  );

  return (
    <OptionalRecordContextProvider value={record}>
      <FormProvider {...form}>
        {Children.map(children, (field, index) =>
          isValidElement<any>(field) ? (
            <TableCell
              key={index}
              className={field.props.cellClassName}
              align={field.props.textAlign}
              onKeyDown={handleKeyDown}
            >
              {field}
            </TableCell>
          ) : null
        )}
        <InlineRowFormActionsTableCell
          form={form}
          handleSubmit={formHandleSubmit}
          hasSideEffects={Boolean(hasSideEffects)}
          handleSubmitWithSideEffects={handleSubmitWithSideEffects}
        />
      </FormProvider>
    </OptionalRecordContextProvider>
  );
};
