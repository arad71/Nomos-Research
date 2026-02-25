import { makeStyles as createMakeStyles } from 'tss-react/mui';

type Styles = Record<string, any>;
type StylesCreator = ((theme: any, params?: any) => Styles) | Styles;

const makeStyles = (stylesOrCreator: StylesCreator) => {
  const useTssStyles = createMakeStyles({ name: 'LegacyMakeStyles' })(
    (theme: any, params: any) =>
      typeof stylesOrCreator === 'function'
        ? stylesOrCreator(theme, params)
        : stylesOrCreator
  );

  return (params?: any): any => useTssStyles(params).classes as any;
};

export default makeStyles;
