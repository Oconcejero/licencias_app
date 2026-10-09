import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { UserRole } from '../types';
import { storageService, DEFAULT_ADMIN_PIN, DEFAULT_SOCIO_PIN } from '../services/storage';

interface AuthModalProps {
  visible: boolean;
  onSuccess: (role: UserRole) => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onSuccess,
  onClose,
  canCancel = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleLogin = async () => {
    setErrorMsg(null);
    const { adminPin, socioPin } = await storageService.getPins();

    const expectedPin = selectedRole === 'ADMIN' ? adminPin : socioPin;

    if (pin.trim() !== expectedPin.trim()) {
      setErrorMsg(
        selectedRole === 'ADMIN'
          ? 'PIN de Administrador incorrecto (por defecto: 2026)'
          : 'PIN de Socio incorrecto (por defecto: 1234)'
      );
      return;
    }

    if (rememberDevice) {
      await storageService.setUserRole(selectedRole);
    }
    setPin('');
    onSuccess(selectedRole);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>🚕 TAXIS MADRID</Text>
            </View>
            <Text style={styles.title}>Control de Acceso</Text>
            <Text style={styles.subtitle}>
              Selecciona tu perfil para ingresar a la plataforma
            </Text>
          </View>

          {/* Selector de Rol */}
          <View style={styles.rolesRow}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'ADMIN' && styles.roleCardActive,
                selectedRole === 'ADMIN' && { borderColor: colors.primary },
              ]}
              onPress={() => {
                setSelectedRole('ADMIN');
                setErrorMsg(null);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconWrap}>
                <Text style={styles.roleIcon}>👑</Text>
              </View>
              <Text style={styles.roleTitle}>Administrador</Text>
              <Text style={styles.roleSub}>Gestión total</Text>
              <View style={[styles.roleBadge, { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                <Text style={[styles.roleBadgeText, { color: colors.primaryLight }]}>Alta / Edición</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'SOCIO' && styles.roleCardActive,
                selectedRole === 'SOCIO' && { borderColor: colors.accent },
              ]}
              onPress={() => {
                setSelectedRole('SOCIO');
                setErrorMsg(null);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconWrap}>
                <Text style={styles.roleIcon}>👤</Text>
              </View>
              <Text style={styles.roleTitle}>Socio</Text>
              <Text style={styles.roleSub}>Solo consulta</Text>
              <View style={[styles.roleBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={[styles.roleBadgeText, { color: colors.accent }]}>Navegar / Fichas</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Formulario de PIN */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>
              {selectedRole === 'ADMIN' ? 'PIN de Administrador:' : 'PIN de Acceso Socio:'}
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder={selectedRole === 'ADMIN' ? 'PIN Admin (def: 2026)' : 'PIN Socio (def: 1234)'}
              placeholderTextColor={colors.textSubtle}
              value={pin}
              onChangeText={t => {
                setPin(t);
                setErrorMsg(null);
              }}
              secureTextEntry
              keyboardType="numeric"
              maxLength={12}
              onSubmitEditing={handleLogin}
              autoFocus
            />

            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* Checkbox recordar */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberDevice(!rememberDevice)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberDevice && styles.checkboxActive]}>
                {rememberDevice && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Mantener sesión iniciada en este dispositivo</Text>
            </TouchableOpacity>

            {/* Botón de Entrada */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: selectedRole === 'ADMIN' ? colors.primary : colors.accent },
              ]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, selectedRole === 'SOCIO' && { color: '#000' }]}>
                Entrar como {selectedRole === 'ADMIN' ? 'Administrador' : 'Socio'}
              </Text>
            </TouchableOpacity>

            {canCancel && onClose && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            {/* Pista de credenciales iniciales */}
            <View style={styles.helpBox}>
              <Text style={styles.helpText}>
                🔐 PINs iniciales: <Text style={{ fontWeight: '800' }}>Admin: {DEFAULT_ADMIN_PIN}</Text> •{' '}
                <Text style={{ fontWeight: '800' }}>Socio: {DEFAULT_SOCIO_PIN}</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoBadgeText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: colors.surfaceHighlight,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  roleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  formSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  pinInput: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  rememberText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  helpBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
});
