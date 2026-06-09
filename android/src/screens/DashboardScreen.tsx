import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { hs, vs, s } from '@/utils/scale';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KnobButton } from '@/components/KnobButton';
import { ArrowButton } from '@/components/ArrowButton';
import { WideButton } from '@/components/WideButton';
import { BottomBar } from '@/components/BottomBar';
import { SerialOverlay } from '@/components/SerialOverlay';
import { useDashboardStore } from '@/store';

export function DashboardScreen() {
  const [serialVisible, setSerialVisible] = useState(false);
  const {
    tempDriver, tempPassenger, fanLevel, isAuto, isMaxAC, isRear, isRecirculation, acOn,
    radioOn, volume,
    setTempDriver, setTempPassenger, setFanLevel,
    setAuto, setMaxAC, setRear, setRecirculation, setAcOn,
    setRadioOn, setVolume,
  } = useDashboardStore();

  return (
    <View style={styles.screen}>
      <View style={styles.row} >

        {/* ══════════════════ RADIO PANEL ══════════════════ */}
        <View style={styles.panelOuter}>
          <LinearGradient
            colors={['#4A4A4A', '#1E1E1E', '#3A3A3A', '#181818']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chromeBevel}
          >
            <View style={styles.panelInner}>

              {/* Top section */}
              <View style={styles.topSection}>

                {/* Left group: |<< and MODE */}
                <View style={styles.buttonColumn}>
                  <WideButton label="|<<" onPress={() => {}} width={hs(176)} height={vs(112)} />
                  <WideButton label="MODE" onPress={() => {}} width={hs(176)} height={vs(96)} />
                </View>

                {/* Center: power knob (rotation = volume) */}
                <View style={styles.centerColumn}>
                  <KnobButton
                    onPress={() => setRadioOn(!radioOn)}
                    onIncrement={() => setVolume(Math.min(40, volume + 1))}
                    onDecrement={() => setVolume(Math.max(0, volume - 1))}
                    active={radioOn}
                  >
                    <Ionicons name="power" size={s(50)} color={radioOn ? '#CCCCCC' : '#444444'} />
                  </KnobButton>
                </View>

                {/* Right group: >>| and AV */}
                <View style={styles.buttonColumn}>
                  <WideButton label=">>|" onPress={() => {}} width={hs(176)} height={vs(112)} />
                  <WideButton label="AV" onPress={() => {}} width={hs(176)} height={vs(96)} />
                </View>
              </View>

              {/* Bottom section */}
              <View style={styles.bottomSection}>
                <WideButton
                  label="MAX"
                  onPress={() => setMaxAC(!isMaxAC)}
                  active={isMaxAC}
                  width={s(140)}
                  height={s(140)}
                  icon={<MaterialCommunityIcons name="car-windshield-outline" size={s(38)} color={isMaxAC ? '#FFF' : '#666'} />}
                />
                <WideButton
                  label="R"
                  onPress={() => setRear(!isRear)}
                  active={isRear}
                  width={s(140)}
                  height={s(140)}
                  icon={<MaterialCommunityIcons name="car-windshield-outline" size={s(38)} color={isRear ? '#FFF' : '#666'} />}
                />
              </View>

            </View>
          </LinearGradient>
        </View>

        {/* ══════════════════ CLIM PANEL ══════════════════ */}
        <View style={styles.panelOuter}>
          <LinearGradient
            colors={['#4A4A4A', '#1E1E1E', '#3A3A3A', '#181818']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chromeBevel}
          >
            <View style={styles.panelInner}>

              {/* Top section */}
              <View style={styles.topSection}>

                {/* Driver temp */}
                <View style={styles.tempColumn}>
                  <ArrowButton direction="up" onPress={() => setTempDriver(Math.min(30, tempDriver + 0.5))} />
                  <ArrowButton direction="down" onPress={() => setTempDriver(Math.max(16, tempDriver - 0.5))} />
                </View>

                {/* Center: fan knob (rotation = niveau ventilo) */}
                <View style={styles.centerColumn}>
                  <KnobButton
                    onPress={() => setAcOn(!acOn)}
                    onIncrement={() => setFanLevel(Math.min(7, fanLevel + 1))}
                    onDecrement={() => setFanLevel(Math.max(0, fanLevel - 1))}
                    active={acOn}
                  >
                    <MaterialCommunityIcons name="fan" size={s(50)} color={acOn ? '#CCCCCC' : '#444444'} />
                  </KnobButton>
                </View>

                {/* Passenger temp */}
                <View style={styles.tempColumn}>
                  <ArrowButton direction="up" onPress={() => setTempPassenger(Math.min(30, tempPassenger + 0.5))} />
                  <ArrowButton direction="down" onPress={() => setTempPassenger(Math.max(16, tempPassenger - 0.5))} />
                </View>

              </View>

              {/* Bottom section */}
              <View style={styles.bottomSection}>
                <WideButton
                  label="AUTO"
                  onPress={() => setAuto(!isAuto)}
                  active={isAuto}
                  width={s(140)}
                  height={s(140)}
                />
                <WideButton
                  label=""
                  onPress={() => setRecirculation(!isRecirculation)}
                  active={isRecirculation}
                  width={s(140)}
                  height={s(140)}
                  icon={
                    <MaterialCommunityIcons
                      name="sync"
                      size={s(38)}
                      color={isRecirculation ? '#FFF' : '#666'}
                    />
                  }
                />
              </View>

            </View>
          </LinearGradient>
        </View>

      </View>
      <BottomBar serialVisible={serialVisible} onToggleSerial={() => setSerialVisible(v => !v)} />
      {serialVisible && <SerialOverlay onClose={() => setSerialVisible(false)} />}
    </View>
  );
}

const CHROME_BORDER = 5;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: hs(16),
    padding: s(48),
    paddingBottom: vs(12),
  },
  panelOuter: {
    flex: 1,
    overflow: 'hidden',
  },
  chromeBevel: {
    flex: 1,
    padding: CHROME_BORDER,
  },
  panelInner: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: hs(24),
    paddingVertical: vs(20),
    gap: vs(14),
  },
  topSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(12),
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(10),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  bottomRow: {
    width: '75%',
    flexDirection: 'row',
    gap: 10,
  },
  bottomBtn: {
    flex: 1,
  },
  buttonColumn: {
    alignItems: 'center',
    gap: 8,
  },
  centerColumn: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tempColumn: {
    alignItems: 'center',
    gap: 8,
  },
});
