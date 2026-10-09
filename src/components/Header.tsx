import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';

import { UserRole } from '../types';

interface HeaderProps {
  totalMatches: number;
  onOpenMatches: () => void;
  onNewVendedor: () => void;
  onNewComprador: () => void;
  userRole?: UserRole | null;
  onSwitchRole?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalMatches,
  onOpenMatches,
  onNewVendedor,
  onNewComprador,
  userRole = 'ADMIN',
  onSwitchRole,
}) => {
  const isAdmin = userRole === 'ADMIN';

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>🚕 TAXI</Text>
        </View>
        <View>
          <Text style={styles.title}>Gestor de Licencias</Text>
          <Text style={styles.subtitle}>Cruces inteligentes Comprador ↔ Vendedor</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Badge de Rol y Cambio de Perfil */}
        {userRole && onSwitchRole && (
          <TouchableOpacity
            style={[
              styles.roleTagBtn,
              isAdmin ? styles.roleTagAdmin : styles.roleTagSocio,
            ]}
            onPress={onSwitchRole}
            activeOpacity={0.8}
            accessibilityLabel="Pulsar para cambiar perfil"
          >
            <Text style={styles.roleTagText}>
              {isAdmin ? '👑 Admin' : '👀 Socio'}
            </Text>
            <Text style={styles.roleTagSwitchIcon}>⇄</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.matchesAlertBtn, totalMatches > 0 && styles.matchesAlertBtnActive]}
          onPress={onOpenMatches}
          activeOpacity={0.8}
        >
          <Text style={styles.matchesBellIcon}>🔔</Text>
          <Text style={styles.matchesAlertText}>
            {totalMatches} {totalMatches === 1 ? 'Aviso Match' : 'Avisos Match'}
          </Text>
          {totalMatches > 0 && <View style={styles.pulseDot} />}
        </TouchableOpacity>

        {isAdmin && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.btn, styles.btnVendedor]}
              onPress={onNewVendedor}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>+ Vendedor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnComprador]}
              onPress={onNewComprador}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>+ Comprador</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoBadgeText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  matchesAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  matchesAlertBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.accent,
  },
  matchesBellIcon: {
    fontSize: 14,
  },
  matchesAlertText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnVendedor: {
    backgroundColor: colors.primary,
  },
  btnComprador: {
    backgroundColor: colors.success,
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  roleTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  roleTagAdmin: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: colors.primary,
  },
  roleTagSocio: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.accent,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  roleTagSwitchIcon: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '800',
  },
});
