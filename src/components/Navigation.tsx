import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';

export type TabType = 'dashboard' | 'matches' | 'vendedores' | 'compradores' | 'ajustes';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  matchesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  matchesCount,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const tabs: { key: TabType; label: string; icon: string; badge?: number }[] = [
    { key: 'dashboard', label: 'Inicio', icon: '📊' },
    { key: 'matches', label: isMobile ? 'Cruces' : 'Cruces & Avisos', icon: '⚡', badge: matchesCount },
    { key: 'vendedores', label: 'Vendedores', icon: '🚕' },
    { key: 'compradores', label: 'Compradores', icon: '👥' },
    { key: 'ajustes', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={[styles.barContent, isMobile ? styles.barContentMobile : styles.barContentDesktop]}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isMobile ? styles.tabItemMobile : styles.tabItemDesktop,
                isActive && styles.tabItemActive,
              ]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{tab.icon}</Text>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isMobile && styles.tabLabelMobile,
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  barContent: {
    flexDirection: 'row',
    width: '100%',
  },
  barContentMobile: {
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  barContentDesktop: {
    justifyContent: 'center',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemMobile: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 8,
    gap: 3,
  },
  tabItemDesktop: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  iconContainer: {
    position: 'relative',
  },
  iconText: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelMobile: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '800',
  },
});
