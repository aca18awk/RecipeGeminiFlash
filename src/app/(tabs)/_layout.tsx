import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        tabBarActiveTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ ios: 'book.fill', android: 'book', web: 'book' }} tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-kitchen"
        options={{
          title: 'My Kitchen',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }} tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }} tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-recipe"
        options={{
          title: 'Add Recipe',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add' }} tintColor={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
