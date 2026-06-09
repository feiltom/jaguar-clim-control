import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { s } from '@/utils/scale';

interface Props {
  value: number;
  label?: string;
}

export function TempDisplay({ value, label }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value.toFixed(1)}°</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: s(32),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: s(11),
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#666666',
    textTransform: 'uppercase',
  },
});
