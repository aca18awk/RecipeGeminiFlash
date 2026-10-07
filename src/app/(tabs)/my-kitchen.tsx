import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe } from '@/types/recipe';
import { getRecipeImage, getEmptyStateImage } from '@/utils/image-map';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function MyKitchenScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { recipes, myKitchenIds, removeKitchenRecipe, restoreKitchenRecipe } = useRecipes();

  const [undoData, setUndoData] = useState<{ recipe: Recipe; index: number } | null>(null);
  const [timerId, setTimerId] = useState<any>(null);

  const savedRecipes = myKitchenIds
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean) as Recipe[];

  const handleRemove = (id: string) => {
    const removed = removeKitchenRecipe(id);
    if (removed) {
      if (timerId) clearTimeout(timerId);
      setUndoData(removed);
      const t = setTimeout(() => {
        setUndoData(null);
      }, 5000);
      setTimerId(t);
    }
  };

  const handleUndo = () => {
    if (undoData) {
      restoreKitchenRecipe(undoData.recipe, undoData.index);
      setUndoData(null);
      if (timerId) clearTimeout(timerId);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">🍴 My Kitchen</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Your saved recipes collection
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={getEmptyStateImage()} style={styles.emptyImage} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Your kitchen is empty
            </ThemedText>
            <ThemedText type="small" style={styles.emptyText}>
              Tap the cooking-pot icon on any recipe card to save it to your kitchen.
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore recipes"
              accessibilityHint="Navigates to recipes list"
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)')}>
              <ThemedText type="smallBold" style={{ color: '#fff' }}>Explore Recipes</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {savedRecipes.map(recipe => (
              <View
                key={recipe.id}
                style={[styles.recipeCard, { backgroundColor: colors.backgroundElement }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={recipe.title}
                  accessibilityHint="Double tap to view recipe details"
                  style={styles.cardMain}
                  onPress={() => router.push(`/recipe/${recipe.id}`)}>
                  <Image source={getRecipeImage(recipe.image)} style={styles.recipeImage} />
                  <View style={styles.recipeInfo}>
                    <ThemedText type="subtitle" numberOfLines={1}>
                      {recipe.title}
                    </ThemedText>
                    <ThemedText type="small" numberOfLines={2} themeColor="textSecondary">
                      {recipe.description}
                    </ThemedText>
                    <ThemedText type="small" style={styles.timeText}>
                      ⏱️ {recipe.cookingTimeMinutes} mins • Serves {recipe.servings}
                    </ThemedText>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${recipe.title} from My Kitchen`}
                  accessibilityHint="Double tap to remove recipe"
                  style={styles.removeButton}
                  onPress={() => handleRemove(recipe.id)}>
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                    size={20}
                    tintColor="#ef4444"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Undo Snackbar */}
      {undoData && (
        <View style={styles.snackbar}>
          <ThemedText type="small" style={styles.snackbarText}>
            Removed &quot;{undoData.recipe.title}&quot;
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Undo remove recipe"
            accessibilityHint="Restores the removed recipe"
            onPress={handleUndo}
            style={styles.undoButton}>
            <ThemedText type="smallBold" style={{ color: '#ea580c' }}>UNDO</ThemedText>
          </Pressable>
        </View>
      )}
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
  exploreButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  recipeCard: {
    flexDirection: 'row',
    borderRadius: Spacing.four,
    overflow: 'hidden',
    alignItems: 'center',
    paddingRight: Spacing.three,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: Spacing.three,
  },
  recipeInfo: {
    flex: 1,
    gap: 4,
  },
  timeText: {
    marginTop: 2,
  },
  removeButton: {
    padding: Spacing.two,
  },
  snackbar: {
    position: 'absolute',
    bottom: 30,
    left: Spacing.four,
    right: Spacing.four,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  snackbarText: {
    color: '#ffffff',
  },
  undoButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
});
