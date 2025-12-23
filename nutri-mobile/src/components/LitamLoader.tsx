import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const LITAM = ['l', 'i', 't', 'a', 'm'];
const CIRCLE_SIZE = 120;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const LitamLoader: React.FC<{ showText?: boolean }> = ({ showText = true }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const letterAnims = useRef(LITAM.map(() => new Animated.Value(100))).current;

  useEffect(() => {
    // Animar círculo de progreso
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();
    // Animar letras una por una
    Animated.stagger(100, letterAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    )).start();
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.container}>
      {showText && (
        <View style={styles.litamText}>
          {LITAM.map((char, i) => (
            <Animated.View
              key={char + i}
              style={{
                overflow: 'hidden',
                transform: [{ translateY: letterAnims[i] }],
              }}
            >
              <Text style={styles.litamChar}>{char}</Text>
            </Animated.View>
          ))}
        </View>
      )}
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.logoSvg}>
        <G>
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke="#e6e6e6"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke="#673AB7"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 220,
    alignSelf: 'center',
  },
  litamText: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  litamChar: {
    fontSize: 38,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Poppins',
    marginHorizontal: 2,
  },
  logoSvg: {
    marginTop: 0,
  },
});

export default LitamLoader; 