import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

/**
 * Single source of truth for color: react-native-paper's default MD3 theme.
 * Every other theme consumer (React Navigation's Stack headers, in particular)
 * is derived from these two objects so nothing drifts out of sync.
 */
export const paperThemes = {
  light: MD3LightTheme,
  dark: MD3DarkTheme,
};

const { LightTheme: adaptedNavigationLight, DarkTheme: adaptedNavigationDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
});

/** React Navigation themes carrying the same MD3 colors as {@link paperThemes} — keeps native-stack headers on-brand. */
export const navigationThemes = {
  light: adaptedNavigationLight,
  dark: adaptedNavigationDark,
};
