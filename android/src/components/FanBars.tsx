import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  level: number;
  maxLevel?: number;
}

export function FanBars({ level, maxLevel = 7 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxLevel }, (_, i) => {
        const barIndex = i + 1;
        const isActive = barIndex <= level;
        const height = 6 + barIndex * 5;
        return (
          <View
            key={i}
            style={[
              styles.bar,
              { height },
              isActive ? styles.barActive : styles.barInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 9,
    borderRadius: 3,
  },
  barActive: {
    backgroundColor: '#4FC3F7',
  },
  barInactive: {
    backgroundColor: '#2A2A2A',
  },
});
