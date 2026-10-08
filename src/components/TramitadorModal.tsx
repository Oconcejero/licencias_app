import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ConfigTramitador } from '../types';
import { colors } from '../theme/colors';

interface TramitadorModalProps {
  visible: boolean;
  onClose: () => void;
  config: ConfigTramitador;
  onSave: (config: ConfigTramitador) => void;
}

export const TramitadorModal: React.FC<TramitadorModalProps> = ({
  visible,
  onClose,
  config,
  onSave,
}) => {
  const [nombre, setNombre] = useState(config.nombre || '');
  const [telefono, setTelefono] = useState(config.telefono || '');

  useEffect(() => {
    setNombre(config.nombre || '');
    setTelefono(config.telefono || '');
  }, [config, visible]);

  const handleSave = () => {
    if (!telefono.trim()) {
      alert('Por favor introduce el número de WhatsApp del gestor para poder enviarle las fichas directamente.');
      return;
    }
    onSave({
      nombre: nombre.trim() || 'Gestor de Operaciones',
      telefono: telefono.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>👤 Contacto del Gestor de Operaciones</Text>
              <Text style={styles.subtitle}>
                Configura los datos del gestor para derivarle las operaciones en 1 clic
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Gestor / Responsable</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej. Carlos / Gestoría Integral"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Teléfono / WhatsApp *</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ej. 600 123 456"
                placeholderTextColor={colors.textSubtle}
                keyboardType="phone-pad"
              />
              <Text style={styles.helpText}>
                💡 Al pulsar "Derivar operación", se abrirá WhatsApp con este número y el informe técnico redactado automáticamente.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Guardar Contacto Gestor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceHighlight,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    padding: 18,
    gap: 14,
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
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  helpText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
  footer: {
    padding: 14,
    backgroundColor: colors.surfaceHighlight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
