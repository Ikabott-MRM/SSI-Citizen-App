import { MD3Theme } from 'react-native-paper';

type IOVFTheme = {
  customColors: {
    typography: {
      primary: string;
      secondary: string;
      color3: string;
    };
    background: {
      primary: string;
      secondary: string;
      color3: string;
      color4: string;
    };
  };
};

export type CustomTheme = MD3Theme & IOVFTheme;
