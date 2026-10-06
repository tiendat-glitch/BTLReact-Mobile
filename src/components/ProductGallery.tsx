// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ImageOff } from "lucide-react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  images: string[];
  /** Optional fallback emoji (for products without images) */
  fallbackEmoji?: string;
  /** Image alt label for accessibility */
  alt: string;
  /** Aspect ratio width / height (e.g. 1 = square, 1.33 = 4:3) */
  aspectRatio?: number;
  /** Background tone when no image is loaded */
  backgroundColor?: string;
  /** Hide dot indicators (e.g. when only 1 image) */
  showDots?: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ProductGallery({
  images,
  fallbackEmoji,
  alt,
  aspectRatio = 1,
  backgroundColor = colors.surfaceMuted,
  showDots = true,
}: Props) {
  const safeList = (images || []).filter(Boolean);
  const hasImages = safeList.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<ScrollView | null>(null);
  const fadeAnims = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    setActiveIndex(0);
    setFailed({});
    setLoading({});
  }, [images?.join("|")]);

  const getOrCreateFade = (key: string) => {
    if (!fadeAnims[key]) fadeAnims[key] = new Animated.Value(0);
    return fadeAnims[key];
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const next = Math.round(x / SCREEN_WIDTH);
    if (next !== activeIndex) setActiveIndex(next);
  };

  if (!hasImages) {
    return (
      <View
        style={[
          styles.container,
          { aspectRatio, backgroundColor },
        ]}
        accessibilityLabel={alt}
        accessibilityRole="image"
      >
        {fallbackEmoji ? (
          <Text style={styles.fallbackEmoji}>{fallbackEmoji}</Text>
        ) : (
          <View style={styles.fallbackBox}>
            <ImageOff color={colors.muted} size={48} strokeWidth={1.6} />
            <Text style={styles.fallbackText}>Chưa có ảnh</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[styles.wrapper, { backgroundColor, aspectRatio }]}
      accessibilityLabel={alt}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        accessibilityRole="image"
      >
        {safeList.map((uri, index) => {
          const key = `${uri}-${index}`;
          const isFailed = failed[key];
          const isLoading = loading[key] && !isFailed;
          const fade = getOrCreateFade(key);
          return (
            <View key={key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              {isFailed ? (
                <View style={styles.fallbackBox}>
                  <ImageOff color={colors.muted} size={40} strokeWidth={1.6} />
                  <Text style={styles.fallbackText}>Không tải được ảnh</Text>
                </View>
              ) : (
                <View style={styles.imageHolder}>
                  <Animated.View style={[styles.imageHolder, { opacity: fade }]}>
                    <Image
                      source={{ uri }}
                      style={styles.image}
                      resizeMode="contain"
                      onLoadStart={() => {
                        setLoading((current) => ({ ...current, [key]: true }));
                        fade.setValue(0);
                      }}
                      onLoad={() => {
                        setLoading((current) => ({ ...current, [key]: false }));
                        Animated.timing(fade, {
                          toValue: 1,
                          duration: 200,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onError={() => {
                        setLoading((current) => ({ ...current, [key]: false }));
                        setFailed((current) => ({ ...current, [key]: true }));
                      }}
                      accessibilityLabel={`${alt} - ảnh ${index + 1}`}
                    />
                  </Animated.View>
                  {isLoading ? (
                    <View style={styles.loadingOverlay} pointerEvents="none">
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {showDots && safeList.length > 1 ? (
        <View style={styles.dots}>
          {safeList.map((uri, index) => (
            <View
              key={`dot-${uri}-${index}`}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {activeIndex + 1}/{safeList.length}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", position: "relative" },
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  slide: { alignItems: "center", justifyContent: "center" },
  imageHolder: { width: "100%", flex: 1, position: "relative" },
  image: { width: "100%", height: "100%" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  fallbackBox: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.px16,
  },
  fallbackEmoji: { fontSize: 110 },
  fallbackText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
  },
  dots: {
    position: "absolute",
    bottom: spacing.px12,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.px6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 22,
  },
  counter: {
    position: "absolute",
    right: spacing.px16,
    bottom: 0,
    paddingHorizontal: spacing.px8,
    paddingVertical: 2,
    borderRadius: colors.radius.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  counterText: {
    ...typography.micro,
    color: colors.white,
  },
});
