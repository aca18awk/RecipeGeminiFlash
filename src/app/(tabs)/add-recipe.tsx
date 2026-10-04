import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { Ingredient, Step } from '@/types/recipe';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function AddRecipeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { addRecipe } = useRecipes();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('2');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('30');
  const [sourceUrl, setSourceUrl] = useState('');
  const [vegetarian, setVegetarian] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [ingredients, setIngredients] = useState<Array<{ name: string; quantity: string; unit: string }>>([
    { name: '', quantity: '', unit: '' },
  ]);
  const [steps, setSteps] = useState<Array<{ text: string; timerSeconds: string }>>([
    { text: '', timerSeconds: '' },
  ]);

  const [error, setError] = useState('');

  const addIngredientField = () => {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '' }]);
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setIngredients(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const addStepField = () => {
    setSteps(prev => [...prev, { text: '', timerSeconds: '' }]);
  };

  const updateStep = (index: number, field: string, value: string) => {
    setSteps(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Recipe title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Recipe description is required.');
      return;
    }
    const parsedServings = parseInt(servings, 10);
    const parsedTime = parseInt(cookingTimeMinutes, 10);

    if (isNaN(parsedServings) || parsedServings <= 0) {
      setError('Please enter valid servings.');
      return;
    }
    if (isNaN(parsedTime) || parsedTime <= 0) {
      setError('Please enter valid cooking time.');
      return;
    }

    const validIngredients: Ingredient[] = ingredients
      .filter(i => i.name.trim() !== '')
      .map(i => ({
        name: i.name.trim(),
        quantity: i.quantity ? parseFloat(i.quantity) : null,
        unit: i.unit.trim() || null,
      }));

    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const validSteps: Step[] = steps
      .filter(s => s.text.trim() !== '')
      .map(s => ({
        text: s.text.trim(),
        timerSeconds: s.timerSeconds ? parseInt(s.timerSeconds, 10) : null,
      }));

    if (validSteps.length === 0) {
      setError('Please add at least one cooking step.');
      return;
    }

    setError('');
    addRecipe({
      title: title.trim(),
      description: description.trim(),
      image: 'assets/images/recipes/shakshuka.jpeg', // default placeholder image
      altText: title.trim(),
      cookingTimeMinutes: parsedTime,
      difficulty,
      vegetarian,
      featured: false,
      servings: parsedServings,
      video: null,
      ingredients: validIngredients,
      steps: validSteps,
      sourceUrl: sourceUrl.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setServings('2');
    setCookingTimeMinutes('30');
    setSourceUrl('');
    setVegetarian(false);
    setDifficulty('medium');
    setIngredients([{ name: '', quantity: '', unit: '' }]);
    setSteps([{ text: '', timerSeconds: '' }]);

    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">✨ Add New Recipe</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Share your culinary creation with Recipe Flash
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <ThemedText type="smallBold" style={{ color: '#ef4444' }}>{error}</ThemedText>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <ThemedText type="smallBold">Recipe Title *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="e.g. Grandma's Apple Pie"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="smallBold">Description *</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="Briefly describe the recipe..."
            placeholderTextColor="#888"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <ThemedText type="smallBold">Servings *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              keyboardType="numeric"
              value={servings}
              onChangeText={setServings}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <ThemedText type="smallBold">Time (mins) *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              keyboardType="numeric"
              value={cookingTimeMinutes}
              onChangeText={setCookingTimeMinutes}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="smallBold">Source URL (optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="https://example.com/recipe"
            placeholderTextColor="#888"
            value={sourceUrl}
            onChangeText={setSourceUrl}
          />
        </View>

        <View style={styles.rowBetween}>
          <ThemedText type="smallBold">Vegetarian</ThemedText>
          <Switch value={vegetarian} onValueChange={setVegetarian} />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="smallBold">Difficulty</ThemedText>
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <Pressable
                key={diff}
                style={[styles.diffChip, difficulty === diff && styles.diffChipActive]}
                onPress={() => setDifficulty(diff)}>
                <ThemedText style={[styles.diffText, difficulty === diff && styles.diffTextActive]}>
                  {diff.toUpperCase()}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ingredients section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={{ fontSize: 16 }}>Ingredients</ThemedText>
          <Pressable onPress={addIngredientField} style={styles.addButton}>
            <ThemedText type="smallBold" style={{ color: '#ea580c' }}>+ Add Ingredient</ThemedText>
          </Pressable>
        </View>

        {ingredients.map((ing, idx) => (
          <View key={idx} style={styles.ingredientRow}>
            <TextInput
              style={[styles.inputQty, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              placeholder="Qty"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={ing.quantity}
              onChangeText={v => updateIngredient(idx, 'quantity', v)}
            />
            <TextInput
              style={[styles.inputUnit, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              placeholder="Unit (g, tbsp)"
              placeholderTextColor="#888"
              value={ing.unit}
              onChangeText={v => updateIngredient(idx, 'unit', v)}
            />
            <TextInput
              style={[styles.inputName, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              placeholder="Ingredient name"
              placeholderTextColor="#888"
              value={ing.name}
              onChangeText={v => updateIngredient(idx, 'name', v)}
            />
            {ingredients.length > 1 && (
              <Pressable onPress={() => removeIngredient(idx)} style={styles.removeRowButton}>
                <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={16} tintColor="#ef4444" />
              </Pressable>
            )}
          </View>
        ))}

        {/* Steps section */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
          <ThemedText type="subtitle" style={{ fontSize: 16 }}>Cooking Steps</ThemedText>
          <Pressable onPress={addStepField} style={styles.addButton}>
            <ThemedText type="smallBold" style={{ color: '#ea580c' }}>+ Add Step</ThemedText>
          </Pressable>
        </View>

        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepBlock}>
            <View style={styles.stepTopRow}>
              <ThemedText type="smallBold">Step {idx + 1}</ThemedText>
              {steps.length > 1 && (
                <Pressable onPress={() => removeStep(idx)}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={16} tintColor="#ef4444" />
                </Pressable>
              )}
            </View>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.backgroundElement, color: colors.text }]}
              placeholder="Describe step instructions..."
              placeholderTextColor="#888"
              multiline
              value={step.text}
              onChangeText={v => updateStep(idx, 'text', v)}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, marginTop: 6 }]}
              placeholder="Timer (seconds, optional e.g. 300)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={step.timerSeconds}
              onChangeText={v => updateStep(idx, 'timerSeconds', v)}
            />
          </View>
        ))}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 16 }}>Save Recipe</ThemedText>
        </Pressable>
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
  scrollContent: {
    paddingBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  errorBox: {
    padding: Spacing.three,
    backgroundColor: '#fee2e2',
    borderRadius: Spacing.three,
  },
  formGroup: {
    gap: 6,
  },
  input: {
    height: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  diffChip: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  diffChipActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  diffText: {
    fontSize: 13,
    color: '#334155',
  },
  diffTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  addButton: {
    padding: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  inputQty: {
    width: 60,
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  inputUnit: {
    width: 90,
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  inputName: {
    flex: 1,
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  removeRowButton: {
    padding: 6,
  },
  stepBlock: {
    gap: 6,
    padding: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Spacing.three,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#ea580c',
    height: 50,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
});
