import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { hs, vs, s } from '@/utils/scale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  width?: number;
  height?: number;
}

export function WideButton({ label, onPress, active = false, icon, width = hs(88), height = vs(40) }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.button, { width: width ?? '100%', height }, active && styles.active, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.93, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={onPress}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#404040',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 5,
  },
  active: {
    borderColor: '#A0A0A0',
    backgroundColor: '#242424',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: s(26),
    fontWeight: '700',
    letterSpacing: 2,
    color: '#888888',
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
