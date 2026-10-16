import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color?: string;
  onPress?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.value, { color }]}>{value}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: 130,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  title: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSubtle,
    marginTop: 2,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 15,
  },
});
