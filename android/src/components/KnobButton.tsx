import React, { useRef, useEffect } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { s } from '@/utils/scale';

const STEP_PX = 12;

interface Props {
  onPress?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  children: React.ReactNode;
  size?: number;
  active?: boolean;
}

export function KnobButton({
  onPress,
  onIncrement,
  onDecrement,
  children,
  size = s(138),
  active = false,
}: Props) {
  const rotation = useSharedValue(0);
  const lastDy = useRef(0);
  const isDragging = useRef(false);

  const onIncrementRef = useRef(onIncrement);
  const onDecrementRef = useRef(onDecrement);
  const onPressRef = useRef(onPress);
  useEffect(() => { onIncrementRef.current = onIncrement; }, [onIncrement]);
  useEffect(() => { onDecrementRef.current = onDecrement; }, [onDecrement]);
  useEffect(() => { onPressRef.current = onPress; }, [onPress]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 3,
      onPanResponderGrant: () => {
        lastDy.current = 0;
        isDragging.current = false;
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dy) > 8) isDragging.current = true;
        const diff = gs.dy - lastDy.current;

        if (Math.abs(diff) >= STEP_PX) {
          if (diff < 0) {
            onIncrementRef.current?.();
          } else {
            onDecrementRef.current?.();
          }
          lastDy.current = gs.dy;
        }

        rotation.value = rotation.value - diff * 0.8;
      },
      onPanResponderRelease: (_, gs) => {
        if (!isDragging.current && Math.abs(gs.dx) < 5 && Math.abs(gs.dy) < 5) {
          onPressRef.current?.();
        }
        isDragging.current = false;
      },
    })
  ).current;

  // La couche rotative a exactement la taille du knob :
  // React Native tourne autour de son propre centre = centre du knob.
  // Le point est positionné en haut → il orbite autour du centre.
  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.knob,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.active,
      ]}
    >
      {/* Couche rotative — même taille que le knob */}
      <Animated.View
        style={[
          styles.rotatingLayer,
          { width: size, height: size },
          rotatingStyle,
        ]}
        pointerEvents="none"
      >
        <View style={styles.markerDot} />
      </Animated.View>

      {/* Icône centrale fixe */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.iconCenter}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  knob: {
    backgroundColor: '#0F0F0F',
    borderWidth: 4,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 12,
    opacity: 0.5,
  },
  active: {
    borderColor: '#A0A0A0',
    backgroundColor: '#1A1A1A',
    opacity: 1,
  },
  rotatingLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  markerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D0D0D0',
  },
  iconCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
