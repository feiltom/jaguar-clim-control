import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDashboardStore } from '@/store';

export function SerialDebugBar() {
  const logs = useDashboardStore((s) => s.serialLogs);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [logs]);

  return (
    <>
    <View style={styles.bar}>
      <Text style={styles.label}>SERIAL</Text>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((entry, i) => (
          <Text key={i} style={[styles.line, entry.direction === 'TX' ? styles.tx : styles.rx]}>
            {entry.direction === 'TX' ? '→ ' : '← '}
            {entry.message}
          </Text>
        ))}
      </ScrollView>
    </View>
    {insets.bottom > 0 && <View style={[styles.safeBottom, { height: insets.bottom }]} />}
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 100,
    backgroundColor: '#060606',
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 10,
  },
  label: {
    color: '#444',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    alignSelf: 'center',
    writingDirection: 'ltr',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  line: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  tx: {
    color: '#4ADE80',
  },
  rx: {
    color: '#60A5FA',
  },
  safeBottom: {
    backgroundColor: '#060606',
  },
});
