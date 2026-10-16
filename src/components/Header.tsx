import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isAdmin = userRole === 'ADMIN';

  return (
    <View style={styles.header}>
      {/* Barra Superior: Logo / Título y Controles de Usuario / Avisos */}
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Gestor de Licencias</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Cruces Comprador ↔ Vendedor
            </Text>
          </View>
        </View>

        <View style={styles.rightControls}>
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
              {isMobile ? `${totalMatches} Avisos` : `${totalMatches} ${totalMatches === 1 ? 'Aviso Match' : 'Avisos Match'}`}
            </Text>
            {totalMatches > 0 && <View style={styles.pulseDot} />}
          </TouchableOpacity>

          {/* En Desktop: botones integrados en la misma fila */}
          {!isMobile && isAdmin && (
            <View style={styles.buttonGroupDesktop}>
              <TouchableOpacity
                style={[styles.btn, styles.btnVendedor]}
                onPress={onNewVendedor}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>+ Nueva Licencia</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnComprador]}
                onPress={onNewComprador}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>+ Nuevo Comprador</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* En Mobile: Fila dedicada y destacada con los dos botones principales de añadir */}
      {isMobile && isAdmin && (
        <View style={styles.mobileActionButtonsRow}>
          <TouchableOpacity
            style={[styles.mobileBtn, styles.btnVendedor]}
            onPress={onNewVendedor}
            activeOpacity={0.85}
          >
            <Text style={styles.mobileBtnText}>➕ Nueva Licencia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mobileBtn, styles.btnComprador]}
            onPress={onNewComprador}
            activeOpacity={0.85}
          >
            <Text style={styles.mobileBtnText}>➕ Nuevo Comprador</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 14 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  matchesAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 7,
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
    fontSize: 13,
  },
  matchesAlertText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
  },
  buttonGroupDesktop: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 6,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 12,
  },
  mobileActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  mobileBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  roleTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
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
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },
  roleTagSwitchIcon: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '800',
  },
});
