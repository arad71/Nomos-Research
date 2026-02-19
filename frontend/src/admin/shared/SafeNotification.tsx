import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import {
  undoableEventEmitter,
  useNotificationContext,
  useTranslate,
} from 'ra-core';

const defaultAnchorOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

const PREFIX = 'RaNotification';

const notificationClasses: Record<string, string> = {
  success: `${PREFIX}-success`,
  error: `${PREFIX}-error`,
  warning: `${PREFIX}-warning`,
  undo: `${PREFIX}-undo`,
  multiLine: `${PREFIX}-multiLine`,
};

const StyledSnackbar = styled(Snackbar, {
  name: PREFIX,
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  [`& .${notificationClasses.success}`]: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  [`& .${notificationClasses.error}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  [`& .${notificationClasses.warning}`]: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  [`& .${notificationClasses.undo}`]: {
    color: theme.palette.primary.light,
  },
  [`& .${notificationClasses.multiLine}`]: {
    whiteSpace: 'pre-wrap',
  },
}));

export const SafeNotification = (props: any) => {
  const {
    className,
    type = 'info',
    autoHideDuration = 4000,
    multiLine = false,
    anchorOrigin = defaultAnchorOrigin,
    ...rest
  } = props;

  const { notifications, takeNotification } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<any>(undefined);
  const translate = useTranslate();

  useEffect(() => {
    const beforeunload = (e: any) => {
      e.preventDefault();
      const confirmationMessage = '';
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    if (messageInfo?.notificationOptions?.undoable) {
      window.addEventListener('beforeunload', beforeunload);
    }

    if (notifications.length && !messageInfo) {
      setMessageInfo(takeNotification());
      setOpen(true);
    } else if (notifications.length && messageInfo && open) {
      setOpen(false);
    }

    return () => {
      if (messageInfo?.notificationOptions?.undoable) {
        window.removeEventListener('beforeunload', beforeunload);
      }
    };
  }, [notifications, messageInfo, open, takeNotification]);

  const handleRequestClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    if (messageInfo?.notificationOptions?.undoable) {
      undoableEventEmitter.emit('end', { isUndo: false });
    }
    setMessageInfo(undefined);
  }, [messageInfo]);

  const handleUndo = useCallback(() => {
    undoableEventEmitter.emit('end', { isUndo: true });
    setOpen(false);
  }, []);

  if (!messageInfo) {
    return null;
  }

  const {
    message,
    type: typeFromMessage,
    notificationOptions: {
      autoHideDuration: autoHideDurationFromMessage,
      messageArgs,
      multiLine: multiLineFromMessage,
      undoable,
      ...options
    },
  } = messageInfo;
  const notificationType = typeFromMessage || type;
  const normalizeMessage = (value: any): string => {
    if (typeof value === 'string') {
      return translate(value, messageArgs);
    }
    if (Array.isArray(value)) {
      return value.map(normalizeMessage).filter(Boolean).join('\n');
    }
    if (value && typeof value === 'object') {
      if (typeof value.msg === 'string') {
        return value.msg;
      }
      if (Array.isArray(value.detail)) {
        return value.detail.map(normalizeMessage).filter(Boolean).join('\n');
      }
      return JSON.stringify(value);
    }
    return value == null ? '' : String(value);
  };
  const messageIsElement = React.isValidElement(message);
  const normalizedMessage = messageIsElement ? '' : normalizeMessage(message);

  const snackbarProps = {
    className,
    open,
    message: normalizedMessage || undefined,
    autoHideDuration:
      autoHideDurationFromMessage === undefined
        ? autoHideDuration
        : autoHideDurationFromMessage,
    disableWindowBlurListener: undoable,
    TransitionProps: { onExited: handleExited },
    onClose: handleRequestClose,
    ContentProps: {
      className: clsx(notificationClasses[notificationType], {
        [notificationClasses.multiLine]: multiLineFromMessage || multiLine,
      }),
    },
    action: undoable ? (
      <Button
        color="primary"
        className={notificationClasses.undo}
        size="small"
        onClick={handleUndo}
      >
        {translate('ra.action.undo')}
      </Button>
    ) : null,
    anchorOrigin,
    ...rest,
    ...options,
  };

  // Avoid passing non-elements as children to Snackbar.
  if (messageIsElement) {
    snackbarProps.children = message;
  }

  return <StyledSnackbar {...snackbarProps} />;
};

export default SafeNotification;
