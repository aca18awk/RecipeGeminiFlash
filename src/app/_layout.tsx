import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { RecipeProvider } from '@/context/RecipeContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RecipeProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="recipe/cooking/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
      </RecipeProvider>
    </ThemeProvider>
  );
}
