import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { storageService } from '../services/storage';
import { Vendedor, Comprador, ConfigTramitador, UserRole } from '../types';

interface SettingsScreenProps {
  vendedores: Vendedor[];
  compradores: Comprador[];
  tramitador: ConfigTramitador;
  userRole?: UserRole;
  onUpdateTramitador: (config: ConfigTramitador) => void;
  onRefreshData: () => void;
  onOpenGestoriaHelper: () => void;
  onSwitchRole?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  vendedores,
  compradores,
  tramitador,
  userRole = 'ADMIN',
  onUpdateTramitador,
  onRefreshData,
  onOpenGestoriaHelper,
  onSwitchRole,
}) => {
  const isAdmin = userRole === 'ADMIN';
  const [friendName, setFriendName] = useState(tramitador.nombre);
  const [friendPhone, setFriendPhone] = useState(tramitador.telefono);
  const [savedFriendStatus, setSavedFriendStatus] = useState(false);

  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  const handleSaveFriend = async () => {
    const updated: ConfigTramitador = {
      nombre: friendName.trim() || 'Gestor de Operaciones',
      telefono: friendPhone.trim(),
    };
    await storageService.saveTramitador(updated);
    onUpdateTramitador(updated);
    setSavedFriendStatus(true);
    setTimeout(() => setSavedFriendStatus(false), 2500);
  };

  const handleExport = async () => {
    try {
      const json = await storageService.exportAllData();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `licencias_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportedStatus('✓ Archivo JSON descargado con éxito');
      } else {
        setExportedStatus('✓ Copia de seguridad generada');
      }
      setTimeout(() => setExportedStatus(null), 3500);
    } catch (e) {
      alert('Error exportando datos: ' + String(e));
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      alert('Por favor pega el código JSON de la copia de seguridad.');
      return;
    }
    try {
      await storageService.importData(importJson);
      setImportJson('');
      setShowImportBox(false);
      onRefreshData();
      alert('¡Copia de seguridad restaurada correctamente!');
    } catch (e) {
      alert('Error importando: formato no válido.');
    }
  };

  const handleResetDemo = async () => {
    const confirmReset = () => {
      storageService.resetDemoData().then(() => {
        onRefreshData();
        alert('Datos de ejemplo restaurados con éxito.');
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Quieres restaurar los datos de ejemplo iniciales?')) {
        confirmReset();
      }
    } else {
      Alert.alert(
        'Restaurar Datos Ejemplo',
        '¿Quieres restaurar los perfiles de ejemplo iniciales?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Restaurar', onPress: confirmReset },
        ]
      );
    }
  };

  const handleClearAll = async () => {
    const confirmClear = () => {
      storageService.clearAll().then(() => {
        onRefreshData();
        alert('Todos los datos han sido borrados.');
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que deseas eliminar TODOS los vendedores y compradores?')) {
        confirmClear();
      }
    } else {
      Alert.alert(
        'Eliminar Todo',
        '¿Seguro que deseas eliminar TODOS los registros?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar Todo', style: 'destructive', onPress: confirmClear },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Ajustes & Configuración</Text>
        <Text style={styles.subtitle}>
          Configura el contacto del gestor operativo, copias de seguridad y guiones
        </Text>
      </View>

      {/* BLOQUE DE PERFIL Y SESIÓN ACTIVA */}
      <View style={styles.card}>
        <View style={styles.sessionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>👤 PERFIL DE SESIÓN ACTIVA</Text>
            <Text style={styles.descText}>
              {isAdmin
                ? 'Conectado con permisos totales de Administrador (puedes crear, editar y borrar).'
                : 'Conectado en Modo Socio (solo consulta: puedes ver cruces, cartera y exportar fichas).'}
            </Text>
          </View>
          <View style={[styles.roleBadgeBox, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeSocio]}>
            <Text style={styles.roleBadgeText}>
              {isAdmin ? '👑 Administrador' : '👀 Socio (Consulta)'}
            </Text>
          </View>
        </View>

        {onSwitchRole && (
          <TouchableOpacity style={styles.switchBtn} onPress={onSwitchRole} activeOpacity={0.8}>
            <Text style={styles.switchBtnText}>⇄ Cambiar de Perfil / Cerrar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SECCIÓN ESTRELLA: GESTOR DE OPERACIONES */}
      <View style={[styles.card, styles.friendCard]}>
        <View style={styles.friendHeader}>
          <Text style={styles.friendIcon}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendCardTitle}>CONTACTO DEL GESTOR DE OPERACIONES</Text>
            <Text style={styles.descText}>
              A este contacto se derivarán las fichas técnicas de los cruces con 1 solo clic en WhatsApp para la formalización del traspaso.
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Nombre del Gestor / Responsable</Text>
            <TextInput
              style={styles.input}
              value={friendName}
              onChangeText={setFriendName}
              placeholder="Ej. Carlos / Gestoría"
              placeholderTextColor={colors.textSubtle}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Teléfono / WhatsApp *</Text>
            <TextInput
              style={styles.input}
              value={friendPhone}
              onChangeText={setFriendPhone}
              placeholder="600 123 456"
              placeholderTextColor={colors.textSubtle}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveFriendBtn} onPress={handleSaveFriend}>
          <Text style={styles.saveFriendText}>
            {savedFriendStatus ? '✓ ¡Contacto Guardado!' : 'Guardar Contacto del Gestor'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ESTADO DE LA BASE DE DATOS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 ESTADO DE TU BASE DE DATOS</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Licencias en venta (Vendedores):</Text>
          <Text style={styles.statusValue}>{vendedores.length}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Compradores registrados:</Text>
          <Text style={styles.statusValue}>{compradores.length}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Almacenamiento:</Text>
          <Text style={[styles.statusValue, { color: storageService.isCloudConnected() ? colors.success : colors.secondary }]}>
            {storageService.isCloudConnected() ? '☁️ Sincronizado en Supabase (Nube)' : '📱 Local (En este dispositivo)'}
          </Text>
        </View>
      </View>

      {/* COPIA DE SEGURIDAD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💾 COPIA DE SEGURIDAD Y RESPALDO</Text>
        <Text style={styles.descText}>
          Descarga un archivo con todos tus contactos y licencias para no perderlos nunca o para pasarlos entre tu móvil y el ordenador.
        </Text>

        <View style={styles.btnsRow}>
          <TouchableOpacity style={[styles.btn, styles.exportBtn]} onPress={handleExport}>
            <Text style={styles.btnText}>⬇️ Exportar Copia de Seguridad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.importBtn]}
            onPress={() => setShowImportBox(!showImportBox)}
          >
            <Text style={styles.btnText}>⬆️ Importar Copia de Seguridad</Text>
          </TouchableOpacity>
        </View>

        {exportedStatus && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{exportedStatus}</Text>
          </View>
        )}

        {showImportBox && (
          <View style={styles.importBox}>
            <Text style={styles.importLabel}>Pega el contenido JSON de tu copia de seguridad:</Text>
            <TextInput
              style={styles.importInput}
              value={importJson}
              onChangeText={setImportJson}
              placeholder='{"vendedores": [...], "compradores": [...]}'
              placeholderTextColor={colors.textSubtle}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.confirmImportBtn} onPress={handleImport}>
              <Text style={styles.confirmImportText}>Confirmar e Importar Datos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* GUIONES Y ESTRATEGIA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 ASISTENTE COMERCIAL Y GUIÓN</Text>
        <Text style={styles.descText}>
          Accede al asistente con los guiones de llamada y la estrategia de las dos gestorías (Gestoría VIP con subvención de hasta 6.000€ vs Gestoría en El Casar de Talamanca disuasoria).
        </Text>
        <TouchableOpacity style={styles.scriptBtn} onPress={onOpenGestoriaHelper}>
          <Text style={styles.scriptBtnText}>📖 Abrir Asistente Comercial Completo</Text>
        </TouchableOpacity>
      </View>

      {/* ACCIONES DE DATOS (SOLO ADMIN) */}
      {isAdmin && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛠️ GESTIÓN DE EJEMPLOS Y LIMPIEZA</Text>
          <View style={styles.btnsRow}>
            <TouchableOpacity style={[styles.btn, styles.demoBtn]} onPress={handleResetDemo}>
              <Text style={styles.btnText}>🔄 Cargar Datos de Demostración</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={handleClearAll}>
              <Text style={[styles.btnText, { color: colors.danger }]}>🗑️ Borrar Toda la Base</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  header: {
    marginBottom: 4,
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
  card: {
    backgroundColor: colors.surfaceCard,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  friendCard: {
    backgroundColor: '#0F231D',
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  friendHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  friendIcon: {
    fontSize: 26,
  },
  friendCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
  },
  saveFriendBtn: {
    backgroundColor: colors.success,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveFriendText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  btnsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportBtn: {
    backgroundColor: colors.primary,
  },
  importBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  statusBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  statusBannerText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  importBox: {
    marginTop: 10,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  importLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  importInput: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    color: colors.text,
    fontSize: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmImportBtn: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmImportText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  scriptBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  scriptBtnText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '800',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  roleBadgeBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeAdmin: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: colors.accent,
  },
  roleBadgeSocio: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#818CF8',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  switchBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  switchBtnText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
});
