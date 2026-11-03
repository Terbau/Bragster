import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Keyboard,
  ScrollView,
  type ScrollViewProps,
  type View,
} from "react-native";

/** Space kept between a view scrolled into sight and the keyboard */
const KEYBOARD_GAP = 16;

const ScrollAboveKeyboardContext = createContext<((view: View) => void) | null>(
  null,
);

/**
 * A scroll view for screens with text fields. While the keyboard is open, the
 * content can still be scrolled all the way down, and the focused field is
 * moved above the keyboard. Views using `useAboveKeyboard` inside it are
 * scrolled into sight too.
 */
export function FormScrollView({
  onScroll,
  children,
  ...props
}: ScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const offsetY = useRef(0);

  const scrollAboveKeyboard = useCallback((view: View) => {
    const keyboard = Keyboard.metrics();
    const scrollView = scrollRef.current?.getNativeScrollRef();
    if (!keyboard || keyboard.height === 0 || !scrollView) return;
    scrollView.measureInWindow((_scrollX, scrollTop) =>
      view.measureInWindow((_x, y, _width, height) => {
        const hidden = y + height + KEYBOARD_GAP - keyboard.screenY;
        // When the view doesn't fit, its top is kept in sight, like the field
        const roomAbove = y - scrollTop - KEYBOARD_GAP;
        const distance = Math.min(hidden, roomAbove);
        if (distance > 0) {
          scrollRef.current?.scrollTo({
            y: offsetY.current + distance,
            animated: true,
          });
        }
      }),
    );
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      scrollEventThrottle={16}
      {...props}
      onScroll={(event) => {
        offsetY.current = event.nativeEvent.contentOffset.y;
        onScroll?.(event);
      }}
    >
      <ScrollAboveKeyboardContext.Provider value={scrollAboveKeyboard}>
        {children}
      </ScrollAboveKeyboardContext.Provider>
    </ScrollView>
  );
}

/**
 * For a text field with something under it, like search results. Spread
 * `viewProps` on a view around both and `fieldProps` on the field. While the
 * field is focused, the view is scrolled above the keyboard when it opens and
 * when the view changes size. Does nothing outside a `FormScrollView`.
 */
export function useAboveKeyboard() {
  const scrollAboveKeyboard = useContext(ScrollAboveKeyboardContext);
  const ref = useRef<View>(null);
  const isFocused = useRef(false);

  const scroll = useCallback(() => {
    if (isFocused.current && ref.current) scrollAboveKeyboard?.(ref.current);
  }, [scrollAboveKeyboard]);

  // The keyboard opens after the field is focused
  useEffect(() => {
    if (!scrollAboveKeyboard) return;
    const subscription = Keyboard.addListener("keyboardDidShow", scroll);
    return () => subscription.remove();
  }, [scrollAboveKeyboard, scroll]);

  return {
    viewProps: { ref, onLayout: scroll },
    fieldProps: {
      onFocus: () => {
        isFocused.current = true;
        scroll();
      },
      onBlur: () => {
        isFocused.current = false;
      },
    },
  };
}
