import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDashboardStore } from '@/store';
import { hs, vs, s } from '@/utils/scale';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  onClose: () => void;
}

export function SerialOverlay({ onClose }: Props) {
  const logs = useDashboardStore((state) => state.serialLogs);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [logs]);

  return (
    <View style={[styles.overlay, { top: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SERIAL DEBUG</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={s(18)} color="#666" />
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.25,
    backgroundColor: 'rgba(6, 6, 6, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A1E',
    zIndex: 999,
    paddingHorizontal: hs(12),
    paddingBottom: vs(6),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(4),
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginBottom: vs(4),
  },
  title: {
    color: '#4ADE80',
    fontSize: s(9),
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: s(4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(4),
  },
  line: {
    fontSize: s(11),
    fontFamily: 'monospace',
    lineHeight: s(16),
  },
  tx: {
    color: '#4ADE80',
  },
  rx: {
    color: '#60A5FA',
  },
});
