import { CircleX } from "lucide-react";
import { useFormDialogContext } from "@react-admin/ra-form-layout";
import { Translate } from "ra-core";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/button";

/**
 * A button that navigates back to the previous page.
 *
 * Commonly used in form toolbars alongside SaveButton.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/cancelbutton/ CancelButton documentation}
 *
 * @example
 * import { CancelButton, SaveButton, SimpleForm } from '@/components/admin';
 *
 * const FormToolbar = () => (
 *   <div className="flex flex-row gap-2 justify-end">
 *     <CancelButton />
 *     <SaveButton />
 *   </div>
 * );
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm toolbar={<FormToolbar />}>
 *       ...
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export function CancelButton(props: React.ComponentProps<"button">) {
  const navigate = useNavigate();
  const dialogContext = useFormDialogContext();
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        if (dialogContext?.close) {
          dialogContext.close();
          return;
        }
        navigate(-1);
      }}
      className="cursor-pointer"
      {...props}
    >
      <CircleX />
      <Translate i18nKey="ra.action.cancel">Cancel</Translate>
    </Button>
  );
}
