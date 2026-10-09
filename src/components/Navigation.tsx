import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  const tabs: { key: TabType; label: string; icon: string; badge?: number }[] = [
    { key: 'dashboard', label: 'Inicio', icon: '📊' },
    { key: 'matches', label: 'Cruces & Avisos', icon: '⚡', badge: matchesCount },
    { key: 'vendedores', label: 'Vendedores', icon: '🏷️' },
    { key: 'compradores', label: 'Compradores', icon: '👥' },
    { key: 'ajustes', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <View style={styles.navContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
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
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
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
    top: -6,
    right: -10,
    backgroundColor: colors.accent,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
