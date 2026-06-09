import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { hs, s } from '@/utils/scale';

interface Props {
  source: string;
  track?: string;
}

export function SourceDisplay({ source, track }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.source}>{source}</Text>
      {!!track && (
        <Text style={styles.track} numberOfLines={1}>
          {track}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
    maxWidth: hs(120),
  },
  source: {
    fontSize: s(26),
    fontWeight: '700',
    color: '#CCCCCC',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  track: {
    fontSize: s(16),
    color: '#666666',
    letterSpacing: 0.5,
  },
});
