import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { getRecipeImage } from '@/utils/image-map';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { recipes, addToShoppingList, toggleMyKitchen, myKitchenIds } = useRecipes();
  const recipe = recipes.find(r => r.id === id);

  const [servings, setServings] = useState<number>(recipe ? recipe.servings : 2);
  const [toastVisible, setToastVisible] = useState(false);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText type="subtitle">Recipe not found</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isSaved = myKitchenIds.includes(recipe.id);
  const scaleRatio = servings / recipe.servings;

  const handleAddShopping = () => {
    addToShoppingList(recipe.title, recipe.ingredients, scaleRatio);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={22} tintColor={colors.text} />
        </Pressable>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.topTitle}>
          {recipe.title}
        </ThemedText>
        <Pressable onPress={() => toggleMyKitchen(recipe.id)} style={styles.iconButton}>
          <SymbolView
            name={{ ios: isSaved ? 'bookmark.fill' : 'bookmark', android: isSaved ? 'bookmark' : 'bookmark_border', web: 'bookmark' }}
            size={22}
            tintColor={isSaved ? '#ea580c' : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo & Video */}
        <Image source={getRecipeImage(recipe.image)} style={styles.heroImage} />

        {recipe.video && (
          <View style={[styles.videoContainer, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.videoHeader}>
              <SymbolView name={{ ios: 'play.circle.fill', android: 'play_circle', web: 'play_circle' }} size={20} tintColor="#ea580c" />
              <ThemedText type="smallBold">{recipe.video.title}</ThemedText>
            </View>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <video
                style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                controls
                src={recipe.video.file.includes('folding') ? require('../../../assets/videos/folding-pierogi.mp4') : require('../../../assets/videos/shaping-babka.mp4')}
              />
            ) : (
              <ThemedText type="small" themeColor="textSecondary" style={styles.videoNote}>
                Technique video available in web view or mobile video player.
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.contentBody}>
          <ThemedText type="title" style={styles.title}>{recipe.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>{recipe.description}</ThemedText>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText type="small">⏱️ {recipe.cookingTimeMinutes} mins</ThemedText>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText type="small">difficulty: {recipe.difficulty}</ThemedText>
            </View>
            {recipe.vegetarian && (
              <View style={[styles.metaBadge, { backgroundColor: '#dcfce7' }]}>
                <ThemedText type="small" style={{ color: '#16a34a' }}>🌱 Vegetarian</ThemedText>
              </View>
            )}
          </View>

          {/* Servings Stepper */}
          <View style={[styles.servingsCard, { backgroundColor: colors.backgroundElement }]}>
            <View>
              <ThemedText type="smallBold">Servings</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Scales quantities automatically</ThemedText>
            </View>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setServings(Math.max(1, servings - 1))}>
                <ThemedText type="subtitle">-</ThemedText>
              </Pressable>
              <ThemedText type="smallBold" style={styles.servingsCount}>{servings}</ThemedText>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setServings(servings + 1)}>
                <ThemedText type="subtitle">+</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Ingredients Checklist */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitleText}>Ingredients</ThemedText>
            <Pressable onPress={handleAddShopping} style={styles.addShopButton}>
              <SymbolView name={{ ios: 'cart.badge.plus', android: 'add_shopping_cart', web: 'add_shopping_cart' }} size={16} tintColor="#ea580c" />
              <ThemedText type="smallBold" style={{ color: '#ea580c' }}>Add to Shopping List</ThemedText>
            </Pressable>
          </View>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ing, idx) => {
              const scaledQty = ing.quantity !== null ? Number((ing.quantity * scaleRatio).toFixed(2)) : null;
              return (
                <View key={idx} style={[styles.ingredientItem, { backgroundColor: colors.backgroundElement }]}>
                  <View style={styles.ingredientBullet} />
                  <ThemedText type="smallBold" style={styles.ingredientQty}>
                    {scaledQty !== null ? `${scaledQty} ${ing.unit || ''}` : ''}
                  </ThemedText>
                  <ThemedText type="small" style={styles.ingredientName}>{ing.name}</ThemedText>
                </View>
              );
            })}
          </View>

          {/* Steps Preview */}
          <ThemedText type="subtitle" style={[styles.sectionTitleText, { marginTop: Spacing.four }]}>Steps Preview</ThemedText>
          <View style={styles.stepsPreviewList}>
            {recipe.steps.map((step, idx) => (
              <View key={idx} style={[styles.stepPreviewItem, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText type="smallBold" style={styles.stepNumber}>Step {idx + 1}</ThemedText>
                <ThemedText type="small" numberOfLines={2} themeColor="textSecondary">{step.text}</ThemedText>
              </View>
            ))}
          </View>

          {/* Start Cooking Button */}
          <Pressable
            style={styles.startCookingButton}
            onPress={() => router.push(`/recipe/cooking/${recipe.id}`)}>
            <SymbolView name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }} size={20} tintColor="#fff" />
            <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 16 }}>Start Cooking Mode</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Confirmation Toast */}
      {toastVisible && (
        <View style={styles.toast}>
          <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor="#22c55e" />
          <ThemedText type="smallBold" style={styles.toastText}>Added to shopping list!</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  iconButton: {
    padding: Spacing.two,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  videoContainer: {
    margin: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  videoNote: {
    fontStyle: 'italic',
  },
  contentBody: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  metaBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },
  servingsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsCount: {
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  sectionTitleText: {
    fontSize: 18,
  },
  addShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.two,
  },
  ingredientsList: {
    gap: Spacing.two,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ea580c',
  },
  ingredientQty: {
    width: 90,
  },
  ingredientName: {
    flex: 1,
  },
  stepsPreviewList: {
    gap: Spacing.two,
  },
  stepPreviewItem: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: 4,
  },
  stepNumber: {
    color: '#ea580c',
  },
  startCookingButton: {
    backgroundColor: '#ea580c',
    height: 50,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  backButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginTop: Spacing.three,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#ffffff',
  },
});
