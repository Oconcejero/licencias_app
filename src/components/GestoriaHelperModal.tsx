import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface GestoriaHelperModalProps {
  visible: boolean;
  onClose: () => void;
  compradorNombre?: string;
  onSelectOption?: (option: 'GESTORIA_VIP' | 'GESTORIA_TALAMANCA') => void;
}

export const GestoriaHelperModal: React.FC<GestoriaHelperModalProps> = ({
  visible,
  onClose,
  compradorNombre = 'Cliente',
  onSelectOption,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const scriptGestorias = `Mira ${compradorNombre}, para el tema del papeleo si no tienes todavía gestoría de confianza, te puedo pasar el contacto de dos opciones que conozco bien para que compares:

1. La primera es la que trabaja casi todo el mundo en el sector porque son especialistas en Taxi, te hacen absolutamente todo de principio a fin (traspaso, Ayuntamiento, Tráfico, Hacienda) y lo más importante: te tramitan la subvención/ayuda inicial a fondo perdido de hasta 6.000€ que dan al iniciar actividad.

2. Luego conozco otra que también funciona bien pero está en El Casar de Talamanca, aunque pillarte te pilla bastante más a desmano.

Si quieres te paso el teléfono directo de los primeros y que te lo miren sin compromiso alguno.`;

  const waGestoria = `Hola ${compradorNombre}, te paso el contacto de la gestoría que te comenté especializada en taxis. Te tramitan el cambio de titularidad completo y la ayuda inicial a fondo perdido de hasta 6.000€:
📌 *Gestoría Especializada Taxi*
📞 Contacto directo: 910 000 000 / 600 000 000
Indícales que vas de mi parte para que te den prioridad máxima en la solicitud de la ayuda.`;

  const scriptEspera = `Perfecto ${compradorNombre}, no te preocupes. Te dejo registrado y guardado en mi cartera prioritaria con lo que me has dicho (tu presupuesto y libranza). En cuanto me entre o me ofrezcan una licencia que encaje exactamente contigo, te pego un toque a ti el primero antes de moverla por ahí. Y si entre tanto te surge cualquier duda o necesitas que te eche una mano con números o información de cara a la compra, guárdate mi teléfono y me llamas cuando quieras.`;

  const waEspera = `Hola ${compradorNombre}, un placer haber hablado contigo. Te confirmo que te he dejado guardado en mi lista prioritaria. En el instante en que entre una licencia que encaje con tus criterios te aviso el primero. Mientras tanto, si necesitas consultar cualquier duda de cara a la compra, cuenta conmigo. ¡Un saludo!`;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🎯 Asistente Comercial & Gestorías</Text>
              <Text style={styles.subtitle}>Estrategia de recomendación y retención de compradores</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* ESTRATEGIA DE LAS 2 GESTORÍAS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>1. ESTRATEGIA COMERCIAL DE GESTORÍAS</Text>
                <Text style={styles.strategyTip}>💡 Objetivo: Ofrecer 2 opciones para que elijan la buena sin parecer comercial</Text>
              </View>

              {/* GESTORIA 1: VIP RECOMENDADA */}
              <View style={[styles.gestoriaCard, styles.gestoriaVip]}>
                <View style={styles.gestoriaTop}>
                  <View style={styles.badgeVip}>
                    <Text style={styles.badgeVipText}>OPCIÓN 1: RECOMENDADA (TOP)</Text>
                  </View>
                  {onSelectOption && (
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => {
                        onSelectOption('GESTORIA_VIP');
                        onClose();
                      }}
                    >
                      <Text style={styles.selectBtnText}>Marcar para cliente</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.gestoriaName}>Gestoría Asesoría Integral del Taxi</Text>
                <Text style={styles.gestoriaDesc}>
                  • Hacen <Text style={styles.bold}>absolutamente TODO</Text> el traspaso y trámites oficiales.{'\n'}
                  • Tramitan la <Text style={styles.boldHighlight}>AYUDA INICIAL DE HASTA 6.000€</Text> a fondo perdido.{'\n'}
                  • Servicio rápido y sin complicaciones para el comprador.
                </Text>
              </View>

              {/* GESTORIA 2: DISUASORIA EL CASAR */}
              <View style={[styles.gestoriaCard, styles.gestoriaTalamanca]}>
                <View style={styles.gestoriaTop}>
                  <View style={styles.badgeTalamanca}>
                    <Text style={styles.badgeTalamancaText}>OPCIÓN 2: DISUASORIA (A DESMANO)</Text>
                  </View>
                  {onSelectOption && (
                    <TouchableOpacity
                      style={styles.selectBtnSecondary}
                      onPress={() => {
                        onSelectOption('GESTORIA_TALAMANCA');
                        onClose();
                      }}
                    >
                      <Text style={styles.selectBtnText}>Marcar</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.gestoriaName}>Gestoría Administrativa El Casar de Talamanca</Text>
                <Text style={styles.gestoriaDesc}>
                  • Ubicada en El Casar de Talamanca (Guadalajara / lejos de Madrid capital).{'\n'}
                  • <Text style={styles.italics}>Propósito comercial:</Text> Dar la alternativa lejana para que descarte esta y elija la Opción 1 de forma 100% natural.
                </Text>
              </View>

              {/* GUIÓN TELEFÓNICO */}
              <View style={styles.scriptBox}>
                <Text style={styles.scriptLabel}>🗣️ Guión para decir por teléfono:</Text>
                <Text style={styles.scriptBody}>{scriptGestorias}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedKey === 'phone_gestoria' && styles.copyBtnDone]}
                  onPress={() => copyToClipboard(scriptGestorias, 'phone_gestoria')}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedKey === 'phone_gestoria' ? '✓ ¡Copiado!' : 'Copiar guión de llamada'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* WHATSAPP RECOMENDACION */}
              <View style={styles.scriptBox}>
                <Text style={styles.scriptLabel}>💬 Mensaje para pasar por WhatsApp:</Text>
                <Text style={styles.scriptBody}>{waGestoria}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedKey === 'wa_gestoria' && styles.copyBtnDone]}
                  onPress={() => copyToClipboard(waGestoria, 'wa_gestoria')}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedKey === 'wa_gestoria' ? '✓ ¡Copiado!' : 'Copiar mensaje WhatsApp'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECCIÓN 2: CUANDO NO LE ENCAJA NINGUNA LICENCIA ACTUAL */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>2. RETENCIÓN EN BOLSA DE ESPERA</Text>
                <Text style={styles.strategyTip}>💡 Si no le cuadra ninguna ahora, fidelízalo para que no compre por otro lado</Text>
              </View>

              <View style={styles.scriptBox}>
                <Text style={styles.scriptLabel}>🗣️ Speech de despedida y fidelización:</Text>
                <Text style={styles.scriptBody}>{scriptEspera}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedKey === 'phone_espera' && styles.copyBtnDone]}
                  onPress={() => copyToClipboard(scriptEspera, 'phone_espera')}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedKey === 'phone_espera' ? '✓ ¡Copiado!' : 'Copiar speech de llamada'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scriptBox}>
                <Text style={styles.scriptLabel}>💬 Mensaje WhatsApp de confirmación:</Text>
                <Text style={styles.scriptBody}>{waEspera}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedKey === 'wa_espera' && styles.copyBtnDone]}
                  onPress={() => copyToClipboard(waEspera, 'wa_espera')}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedKey === 'wa_espera' ? '✓ ¡Copiado!' : 'Copiar WhatsApp fidelización'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Cerrar Asistente</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 720,
    maxHeight: '90%',
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollArea: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  strategyTip: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  gestoriaCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  gestoriaVip: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: colors.success,
  },
  gestoriaTalamanca: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: colors.border,
  },
  gestoriaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeVip: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeVipText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  badgeTalamanca: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTalamancaText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  selectBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectBtnSecondary: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  gestoriaName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  gestoriaDesc: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '700',
  },
  boldHighlight: {
    fontWeight: '800',
    color: colors.success,
  },
  italics: {
    fontStyle: 'italic',
    color: colors.accent,
  },
  scriptBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  scriptLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  scriptBody: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  copyBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtnDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'flex-end',
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
