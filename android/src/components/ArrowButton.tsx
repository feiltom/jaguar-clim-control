import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hs, vs, s } from '@/utils/scale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  direction: 'up' | 'down';
  onPress: () => void;
}

export function ArrowButton({ direction, onPress }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const color = direction === 'up' ? '#E53935' : '#1E88E5';

  return (
    <AnimatedPressable
      style={[styles.button, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={onPress}
    >
      <Ionicons
        name={direction === 'up' ? 'chevron-up' : 'chevron-down'}
        size={s(40)}
        color={color}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: hs(144),
    height: vs(104),
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#404040',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 5,
  },
});
