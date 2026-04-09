import * as Haptics from 'expo-haptics';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCalculator } from '@/hooks/use-calculator';
import { formatDisplay } from '@/lib/calculator-engine';

type BtnVariant = 'num' | 'fn' | 'op';

function hapticLight() {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function CalculatorApp() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [scientific, setScientific] = useState(false);
  const calc = useCalculator();

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            bg: '#080C10',
            displayBg: '#121920',
            displayBorder: '#1E2835',
            text: '#F1F5F9',
            muted: '#94A3B8',
            keyNum: '#1A222D',
            keyNumBorder: '#243040',
            keyFn: '#243040',
            keyOp: '#F59E0B',
            keyOpText: '#0C0F12',
          }
        : {
            bg: '#E8EDF3',
            displayBg: '#FFFFFF',
            displayBorder: '#D8DEE8',
            text: '#0F172A',
            muted: '#64748B',
            keyNum: '#FFFFFF',
            keyNumBorder: '#D8DEE8',
            keyFn: '#D8DEE8',
            keyOp: '#EA580C',
            keyOpText: '#FFFFFF',
          },
    [colorScheme]
  );

  const gap = 10;
  const padH = 16;
  const cols = 4;
  const usable = width - padH * 2 - gap * (cols - 1);
  const btnSize = Math.min(88, Math.floor(usable / cols));

  const CalButton = ({
    label,
    onPress,
    variant,
    flex,
    accessibilityLabel,
  }: {
    label: string;
    onPress: () => void;
    variant: BtnVariant;
    flex?: number;
    accessibilityLabel?: string;
  }) => {
    const isOp = variant === 'op';
    const isFn = variant === 'fn';
    const w = flex ? undefined : btnSize;
    const h = btnSize;
    const bg = isOp ? palette.keyOp : isFn ? palette.keyFn : palette.keyNum;
    const fg = isOp ? palette.keyOpText : palette.text;
    const borderColor = !isOp && !isFn ? palette.keyNumBorder : 'transparent';

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={() => {
          hapticLight();
          onPress();
        }}
        style={({ pressed }) => [
          styles.btnOuter,
          {
            flex: flex != null ? flex : undefined,
            minWidth: flex != null ? 0 : w,
            width: flex != null ? undefined : w,
            height: h,
            opacity: pressed ? 0.88 : 1,
            shadowColor: isOp ? palette.keyOp : '#000',
            shadowOffset: { width: 0, height: isOp ? 4 : 2 },
            shadowOpacity: colorScheme === 'dark' ? (isOp ? 0.45 : 0.35) : isOp ? 0.35 : 0.12,
            shadowRadius: isOp ? 10 : 4,
            elevation: isOp ? 6 : 2,
          },
        ]}>
        <View style={[styles.btnInner, { backgroundColor: bg, borderColor, flex: flex ? 1 : undefined }]}>
          <Text style={[styles.btnLabel, { color: fg }]}>{label}</Text>
        </View>
      </Pressable>
    );
  };

  const row = (children: ReactNode) => (
    <View style={[styles.row, { gap, marginBottom: gap }]}>{children}</View>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: palette.muted }]}>Calculadora</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={scientific ? 'Ocultar funções científicas' : 'Mostrar funções científicas'}
          onPress={() => {
            hapticLight();
            setScientific((s) => !s);
          }}
          style={({ pressed }) => [
            styles.modeChip,
            {
              backgroundColor: scientific ? palette.keyOp : palette.keyFn,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <Text
            style={[
              styles.modeChipText,
              { color: scientific ? palette.keyOpText : palette.text },
            ]}>
            {scientific ? 'Científica' : 'Básica'}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.displayWrap,
          {
            backgroundColor: palette.displayBg,
            borderColor: palette.displayBorder,
            shadowColor: '#000000',
          },
        ]}>
        <View style={styles.displayMeta}>
          <Pressable
            onPress={() => {
              hapticLight();
              calc.toggleAngle();
            }}
            style={({ pressed }) => [
              styles.angleBadge,
              { backgroundColor: palette.keyFn, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Text style={[styles.angleBadgeText, { color: palette.text }]}>
              {calc.state.angleMode === 'deg' ? 'DEG' : 'RAD'}
            </Text>
          </Pressable>
        </View>
        <Text
          style={[styles.display, { color: palette.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.35}>
          {calc.state.display}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {scientific && (
          <View style={styles.sciBlock}>
            {row(
              <>
                <CalButton label="sin" variant="fn" onPress={() => calc.unaryOp('sin')} />
                <CalButton label="cos" variant="fn" onPress={() => calc.unaryOp('cos')} />
                <CalButton label="tan" variant="fn" onPress={() => calc.unaryOp('tan')} />
                <CalButton label="log" variant="fn" onPress={() => calc.unaryOp('log10')} />
              </>
            )}
            {row(
              <>
                <CalButton label="ln" variant="fn" onPress={() => calc.unaryOp('ln')} />
                <CalButton label="√" variant="fn" onPress={() => calc.unaryOp('sqrt')} />
                <CalButton label="x²" variant="fn" onPress={() => calc.unaryOp('square')} />
                <CalButton label="1/x" variant="fn" onPress={() => calc.unaryOp('inv')} />
              </>
            )}
            <View style={[styles.row, { gap, marginBottom: gap }]}>
              <CalButton
                label="π"
                variant="fn"
                flex={1}
                onPress={() => calc.constant(formatDisplay(Math.PI))}
              />
              <CalButton
                label="e"
                variant="fn"
                flex={1}
                onPress={() => calc.constant(formatDisplay(Math.E))}
              />
            </View>
          </View>
        )}

        <View style={styles.pad}>
          {row(
            <>
              <CalButton label="AC" variant="fn" onPress={calc.clear} accessibilityLabel="Limpar tudo" />
              <CalButton label="⌫" variant="fn" onPress={calc.backspace} accessibilityLabel="Apagar último dígito" />
              <CalButton label="%" variant="fn" onPress={calc.percent} />
              <CalButton label="÷" variant="op" onPress={() => calc.setOperator('/')} />
            </>
          )}
          {row(
            <>
              <CalButton label="7" variant="num" onPress={() => calc.inputDigit('7')} />
              <CalButton label="8" variant="num" onPress={() => calc.inputDigit('8')} />
              <CalButton label="9" variant="num" onPress={() => calc.inputDigit('9')} />
              <CalButton label="×" variant="op" onPress={() => calc.setOperator('*')} />
            </>
          )}
          {row(
            <>
              <CalButton label="4" variant="num" onPress={() => calc.inputDigit('4')} />
              <CalButton label="5" variant="num" onPress={() => calc.inputDigit('5')} />
              <CalButton label="6" variant="num" onPress={() => calc.inputDigit('6')} />
              <CalButton label="−" variant="op" onPress={() => calc.setOperator('-')} />
            </>
          )}
          {row(
            <>
              <CalButton label="1" variant="num" onPress={() => calc.inputDigit('1')} />
              <CalButton label="2" variant="num" onPress={() => calc.inputDigit('2')} />
              <CalButton label="3" variant="num" onPress={() => calc.inputDigit('3')} />
              <CalButton label="+" variant="op" onPress={() => calc.setOperator('+')} />
            </>
          )}
          {row(
            <>
              <CalButton label="±" variant="fn" onPress={calc.toggleSign} accessibilityLabel="Inverter sinal" />
              <CalButton label="0" variant="num" onPress={() => calc.inputDigit('0')} flex={1} />
              <CalButton label="." variant="num" onPress={calc.inputDecimal} />
              <CalButton label="=" variant="op" onPress={calc.equals} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  displayWrap: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  displayMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  angleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  angleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  display: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sciBlock: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  pad: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnOuter: {
    borderRadius: 16,
  },
  btnInner: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: 22,
    fontWeight: '600',
  },
});
