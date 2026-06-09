import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hs, vs, s } from '@/utils/scale';
import { launchApp } from '@/utils/launchApp';

interface Props {
  serialVisible: boolean;
  onToggleSerial: () => void;
}

const APPS = [
  { label: 'ZLINK5',   icon: 'car-wireless',  pkg: 'com.zjinnova.zlink'      },
  { label: 'FILES',    icon: 'folder-outline', pkg: 'com.mediatek.filemanager' },
];

export function BottomBar({ serialVisible, onToggleSerial }: Props) {
  return (
    <View style={styles.bar}>
      {APPS.map((app) => (
        <Pressable key={app.pkg} style={styles.btn} onPress={() => launchApp(app.pkg)}>
          <MaterialCommunityIcons name={app.icon as any} size={s(66)} color="#888" />
          <Text style={styles.label}>{app.label}</Text>
        </Pressable>
      ))}

      <View style={styles.separator} />

      <Pressable
        style={[styles.btn, serialVisible && styles.btnActive]}
        onPress={onToggleSerial}
      >
        <MaterialCommunityIcons
          name="console-line"
          size={s(66)}
          color={serialVisible ? '#4ADE80' : '#888'}
        />
        <Text style={[styles.label, serialVisible && styles.labelActive]}>SERIAL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: vs(108),
    backgroundColor: '#060606',
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(24),
    gap: hs(12),
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(9),
    paddingHorizontal: hs(21),
    paddingVertical: vs(9),
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  btnActive: {
    borderColor: '#4ADE80',
    backgroundColor: '#0D1F13',
  },
  label: {
    fontSize: s(16),
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    color: '#666',
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#4ADE80',
  },
  separator: {
    flex: 1,
  },
});
