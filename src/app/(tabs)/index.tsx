import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  View,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe } from '@/types/recipe';
import { getRecipeImage, getEmptyStateImage } from '@/utils/image-map';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const color =
    difficulty === 'easy' ? '#22c55e' : difficulty === 'medium' ? '#f59e0b' : '#ef4444';
  const label = difficulty.toUpperCase();
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <ThemedText style={[styles.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function CookingPotButton({ recipeId }: { recipeId: string }) {
  const { myKitchenIds, toggleMyKitchen } = useRecipes();
  const isSaved = myKitchenIds.includes(recipeId);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 5 }, () => {
      scale.value = withSpring(1);
    });
    toggleMyKitchen(recipeId);
  };

  return (
    <Pressable onPress={handlePress} style={styles.potButtonContainer}>
      <Animated.View style={[styles.potButton, animatedStyle, isSaved && styles.potButtonActive]}>
        <SymbolView
          name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
          size={16}
          tintColor={isSaved ? '#ffffff' : '#333333'}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const {
    recipes,
    searchQuery,
    setSearchQuery,
    filterVegetarian,
    setFilterVegetarian,
    filterUnder30,
    setFilterUnder30,
    filterDifficulty,
    setFilterDifficulty,
    resetFilters,
  } = useRecipes();

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVegetarian = filterVegetarian ? recipe.vegetarian : true;
    const matchesUnder30 = filterUnder30 ? recipe.cookingTimeMinutes <= 30 : true;
    const matchesDifficulty = filterDifficulty ? recipe.difficulty === filterDifficulty : true;

    return matchesSearch && matchesVegetarian && matchesUnder30 && matchesDifficulty;
  });

  const featuredRecipes = recipes.filter(r => r.featured);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header & Search */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.appTitle}>
          🍳 Recipe Flash
        </ThemedText>
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundElement }]}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search recipes, ingredients..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                  size={16}
                  tintColor={colors.textSecondary}
                />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.filterButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => setFilterModalVisible(true)}>
            <SymbolView
              name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Featured Carousel */}
        {searchQuery === '' && !filterVegetarian && !filterUnder30 && !filterDifficulty && (
          <View style={styles.featuredSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              ✨ Featured Recipes
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
              {featuredRecipes.map(recipe => (
                <Pressable
                  key={recipe.id}
                  style={[styles.carouselCard, { backgroundColor: colors.backgroundElement }]}
                  onPress={() => router.push(`/recipe/${recipe.id}`)}>
                  <Image source={getRecipeImage(recipe.image)} style={styles.carouselImage} />
                  <View style={styles.carouselOverlay}>
                    <ThemedText type="smallBold" style={styles.carouselTitle} numberOfLines={1}>
                      {recipe.title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.carouselTime}>
                      ⏱️ {recipe.cookingTimeMinutes} mins
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recipes List Header */}
        <View style={styles.listHeaderRow}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🍽️ All Recipes ({filteredRecipes.length})
          </ThemedText>
        </View>

        {/* Recipe Cards List */}
        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={getEmptyStateImage()} style={styles.emptyImage} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No recipes found
            </ThemedText>
            <ThemedText type="small" style={styles.emptyText}>
              Try adjusting your search or filters to find what you&apos;re looking for.
            </ThemedText>
            <Pressable style={styles.resetButton} onPress={resetFilters}>
              <ThemedText type="smallBold" style={{ color: '#fff' }}>Reset Filters</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.recipeList}>
            {filteredRecipes.map(recipe => (
              <Pressable
                key={recipe.id}
                style={[styles.recipeCard, { backgroundColor: colors.backgroundElement }]}
                onPress={() => router.push(`/recipe/${recipe.id}`)}>
                <Image source={getRecipeImage(recipe.image)} style={styles.recipeImage} />
                <View style={styles.recipeCardContent}>
                  <View style={styles.recipeCardTop}>
                    <ThemedText type="subtitle" numberOfLines={1} style={styles.recipeTitle}>
                      {recipe.title}
                    </ThemedText>
                    <CookingPotButton recipeId={recipe.id} />
                  </View>
                  <ThemedText type="small" numberOfLines={2} style={styles.recipeDesc} themeColor="textSecondary">
                    {recipe.description}
                  </ThemedText>
                  <View style={styles.recipeCardFooter}>
                    <ThemedText type="small">⏱️ {recipe.cookingTimeMinutes} mins</ThemedText>
                    <DifficultyBadge difficulty={recipe.difficulty} />
                    {recipe.vegetarian && <View style={styles.vegTag}><ThemedText type="small" style={{ color: '#16a34a' }}>🌱 Veg</ThemedText></View>}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Filter Recipes</ThemedText>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={22} tintColor={colors.text} />
              </Pressable>
            </View>

            <View style={styles.filterSection}>
              <ThemedText type="smallBold" style={styles.filterLabel}>Dietary</ThemedText>
              <Pressable
                style={[styles.chip, filterVegetarian && styles.chipActive]}
                onPress={() => setFilterVegetarian(!filterVegetarian)}>
                <ThemedText style={[styles.chipText, filterVegetarian && styles.chipTextActive]}>🌱 Vegetarian</ThemedText>
              </Pressable>
            </View>

            <View style={styles.filterSection}>
              <ThemedText type="smallBold" style={styles.filterLabel}>Cooking Time</ThemedText>
              <Pressable
                style={[styles.chip, filterUnder30 && styles.chipActive]}
                onPress={() => setFilterUnder30(!filterUnder30)}>
                <ThemedText style={[styles.chipText, filterUnder30 && styles.chipTextActive]}>⚡ Under 30 minutes</ThemedText>
              </Pressable>
            </View>

            <View style={styles.filterSection}>
              <ThemedText type="smallBold" style={styles.filterLabel}>Difficulty</ThemedText>
              <View style={styles.chipRow}>
                {['easy', 'medium', 'hard'].map(diff => (
                  <Pressable
                    key={diff}
                    style={[styles.chip, filterDifficulty === diff && styles.chipActive]}
                    onPress={() => setFilterDifficulty(filterDifficulty === diff ? null : diff)}>
                    <ThemedText style={[styles.chipText, filterDifficulty === diff && styles.chipTextActive]}>
                      {diff.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalResetButton}
                onPress={() => {
                  resetFilters();
                  setFilterModalVisible(false);
                }}>
                <ThemedText type="smallBold">Reset All</ThemedText>
              </Pressable>
              <Pressable
                style={styles.modalApplyButton}
                onPress={() => setFilterModalVisible(false)}>
                <ThemedText type="smallBold" style={{ color: '#fff' }}>Apply Filters</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: Spacing.three,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  featuredSection: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    fontSize: 18,
  },
  carouselContainer: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  carouselCard: {
    width: SCREEN_WIDTH * 0.65,
    height: 160,
    borderRadius: Spacing.four,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  carouselTitle: {
    color: '#ffffff',
    fontSize: 16,
  },
  carouselTime: {
    color: '#e2e8f0',
    marginTop: 2,
  },
  listHeaderRow: {
    marginTop: Spacing.two,
  },
  recipeList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  recipeCard: {
    flexDirection: 'row',
    borderRadius: Spacing.four,
    overflow: 'hidden',
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  recipeImage: {
    width: 90,
    height: 90,
    borderRadius: Spacing.three,
  },
  recipeCardContent: {
    flex: 1,
    gap: 4,
  },
  recipeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: Spacing.two,
  },
  recipeDesc: {
    fontSize: 13,
  },
  recipeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 4,
  },
  potButtonContainer: {
    padding: 4,
  },
  potButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  potButtonActive: {
    backgroundColor: '#ea580c',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  vegTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.six,
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
  },
  resetButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Spacing.five,
    borderTopRightRadius: Spacing.five,
    padding: Spacing.four,
    gap: Spacing.four,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterSection: {
    gap: Spacing.two,
  },
  filterLabel: {
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  chipText: {
    fontSize: 14,
    color: '#334155',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  modalResetButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalApplyButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#ea580c',
    alignItems: 'center',
  },
});
