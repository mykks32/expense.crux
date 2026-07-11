import { createContext, useContext, useEffect, useRef, type PropsWithChildren, type RefObject } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface KeyboardAwareScreenProps extends PropsWithChildren {
  /**
   * Vertically centers short, fixed-height content (e.g. the auth screens).
   * Leave false for scrollable forms — with content taller than the viewport,
   * `justify-center` fights the keyboard as it opens/closes, causing fields
   * to jump instead of settling at a stable scroll position.
   */
  centered?: boolean;
}

interface KeyboardAwareScrollContextValue {
  scrollViewRef: RefObject<ScrollView | null>;
  getScrollY: () => number;
  getKeyboardHeight: () => number;
}

const KeyboardAwareScrollContext = createContext<KeyboardAwareScrollContextValue | null>(null);

/**
 * Lets a descendant field re-trigger scroll-into-view itself — needed for a growing
 * multiline field (e.g. expense notes), since `automaticallyAdjustKeyboardInsets` only
 * computes the scroll offset once, from the field's height at the moment it's focused.
 */
export function useKeyboardAwareScroll() {
  return useContext(KeyboardAwareScrollContext);
}

// `dark:` classNames rely on NativeWind's colorScheme.set(), which delegates to
// RN's Appearance.setColorScheme() — that API is a no-op in Expo Go (needs a
// custom native build), so it silently does nothing there. react-native-paper's
// theme isn't affected — PaperProvider is driven directly by our own theme store —
// so background color is read from `useTheme()` instead, which always works.
export function KeyboardAwareScreen({ children, centered = false }: KeyboardAwareScreenProps) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const contextValueRef = useRef<KeyboardAwareScrollContextValue>({
    scrollViewRef,
    getScrollY: () => scrollYRef.current,
    getKeyboardHeight: () => keyboardHeightRef.current,
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      keyboardHeightRef.current = e.endCoordinates.height;
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAwareScrollContext.Provider value={contextValueRef.current}>
        {/*
          iOS: no `behavior` here — `automaticallyAdjustKeyboardInsets` below already insets
          the ScrollView for the keyboard and scrolls the focused input above it. Stacking
          KeyboardAvoidingView's `padding` behavior on top double-compensates.
          Android still needs `height` since that inset-adjustment prop is iOS-only.
        */}
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : undefined} className="flex-1">
          <ScrollView
            ref={scrollViewRef}
            onScroll={(e) => {
              scrollYRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerClassName={`flex-grow p-6 ${centered ? 'justify-center' : ''}`}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            contentInsetAdjustmentBehavior="automatic"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollContext.Provider>
    </SafeAreaView>
  );
}
