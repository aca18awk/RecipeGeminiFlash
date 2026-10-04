import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { getEmptyStateImage } from '@/utils/image-map';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { shoppingList, toggleShoppingItem, removeShoppingItem, clearShoppingList } = useRecipes();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="title">🛒 Shopping List</ThemedText>
          {shoppingList.length > 0 && (
            <Pressable onPress={clearShoppingList} style={styles.clearButton}>
              <ThemedText type="smallBold" style={{ color: '#ef4444' }}>Clear All</ThemedText>
            </Pressable>
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Ingredients added from your recipes
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {shoppingList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={getEmptyStateImage()} style={styles.emptyImage} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Your shopping list is empty
            </ThemedText>
            <ThemedText type="small" style={styles.emptyText}>
              Open any recipe detail page and tap &quot;Add to shopping list&quot; to add ingredients here.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {shoppingList.map(item => (
              <Pressable
                key={item.id}
                style={[styles.itemCard, { backgroundColor: colors.backgroundElement }, item.checked && styles.itemCardChecked]}
                onPress={() => toggleShoppingItem(item.id)}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && (
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} tintColor="#fff" />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <ThemedText
                    type="smallBold"
                    style={[styles.itemName, item.checked && styles.textStrikethrough]}>
                    {item.quantity !== null ? `${item.quantity} ${item.unit || ''} ` : ''}
                    {item.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.recipeSource} themeColor="textSecondary">
                    For: {item.recipeTitle}
                  </ThemedText>
                </View>
                <Pressable onPress={() => removeShoppingItem(item.id)} style={styles.deleteButton}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor="#888" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  emptyImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    maxWidth: 280,
  },
  list: {
    gap: Spacing.two,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  itemCardChecked: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  recipeSource: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 6,
  },
});
