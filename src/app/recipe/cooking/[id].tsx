import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/RecipeContext';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { recipes } = useRecipes();
  const recipe = recipes.find(r => r.id === id);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Timer state for current step
  const currentStep = recipe ? recipe.steps[currentStepIndex] : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(currentStep?.timerSeconds || null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    if (currentStep) {
      setTimeLeft(currentStep.timerSeconds);
      setIsTimerRunning(false);
      setTimerFinished(false);
    }
  }, [currentStepIndex, currentStep]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            setIsTimerRunning(false);
            setTimerFinished(true);
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText type="subtitle">Recipe not found</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.exitButton}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>Exit</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={22} tintColor={colors.text} />
        </Pressable>
        <ThemedText type="smallBold">
          Step {currentStepIndex + 1} of {recipe.steps.length}
        </ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` },
          ]}
        />
      </View>

      {/* Step Content */}
      <View style={styles.contentContainer}>
        <View style={[styles.stepCard, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText type="smallBold" style={styles.stepBadge}>STEP {currentStepIndex + 1}</ThemedText>
          <ThemedText style={styles.stepText}>
            {currentStep?.text}
          </ThemedText>

          {/* Timer Component */}
          {currentStep?.timerSeconds !== null && (
            <View style={[styles.timerBox, { backgroundColor: colors.background }]}>
              <View style={styles.timerHeader}>
                <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={20} tintColor="#ea580c" />
                <ThemedText type="smallBold">Timer: {formatTime(timeLeft || 0)}</ThemedText>
              </View>

              {timerFinished ? (
                <ThemedText type="smallBold" style={styles.timerFinishedText}>
                  🔔 Timer Finished!
                </ThemedText>
              ) : (
                <View style={styles.timerControls}>
                  <Pressable
                    style={[styles.timerButton, { backgroundColor: isTimerRunning ? '#ef4444' : '#22c55e' }]}
                    onPress={() => setIsTimerRunning(!isTimerRunning)}>
                    <ThemedText type="smallBold" style={{ color: '#fff' }}>
                      {isTimerRunning ? 'Pause' : 'Start Timer'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.timerResetButton}
                    onPress={() => {
                      setIsTimerRunning(false);
                      if (currentStep) {
                        setTimeLeft(currentStep.timerSeconds);
                      }
                      setTimerFinished(false);
                    }}>
                    <ThemedText type="smallBold">Reset</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.navButton, currentStepIndex === 0 && styles.disabledButton]}
          disabled={currentStepIndex === 0}
          onPress={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} tintColor={currentStepIndex === 0 ? '#aaa' : colors.text} />
          <ThemedText style={[styles.navButtonText, currentStepIndex === 0 && { color: '#aaa' }]}>Previous</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.navButton, styles.nextButton]}
          onPress={() => {
            if (currentStepIndex < recipe.steps.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
            } else {
              router.back();
            }
          }}>
          <ThemedText style={[styles.navButtonText, { color: '#fff' }]}>
            {currentStepIndex === recipe.steps.length - 1 ? 'Finish' : 'Next Step'}
          </ThemedText>
          <SymbolView
            name={{ ios: currentStepIndex === recipe.steps.length - 1 ? 'checkmark' : 'chevron.right', android: 'check', web: 'check' }}
            size={18}
            tintColor="#fff"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  closeButton: {
    padding: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ea580c',
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  stepCard: {
    padding: Spacing.five,
    borderRadius: Spacing.five,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepBadge: {
    color: '#ea580c',
    letterSpacing: 1,
  },
  stepText: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '500',
  },
  timerBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timerControls: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  timerButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  timerResetButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  timerFinishedText: {
    color: '#22c55e',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButton: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginTop: Spacing.three,
  },
});
