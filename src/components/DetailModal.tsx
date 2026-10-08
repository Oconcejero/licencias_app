import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Vendedor, Comprador, CruceMatch } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';
import { shareService } from '../services/shareService';

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  vendedor?: Vendedor | null;
  comprador?: Comprador | null;
  allVendedores: Vendedor[];
  allCompradores: Comprador[];
  tramitadorNombre?: string;
  tramitadorTelefono?: string;
  onEditVendedor?: (v: Vendedor) => void;
  onEditComprador?: (c: Comprador) => void;
  onOpenGestoriaScript?: (nombre: string) => void;
  onSendMatchToFriend?: (cruce: CruceMatch) => void;
  onOpenConfigTramitador?: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  onClose,
  vendedor,
  comprador,
  allVendedores,
  allCompradores,
  tramitadorNombre = 'Gestor Operativo',
  tramitadorTelefono = '',
  onEditVendedor,
  onEditComprador,
  onOpenGestoriaScript,
  onSendMatchToFriend,
  onOpenConfigTramitador,
}) => {
  if (!vendedor && !comprador) return null;

  const handleCall = (phone: string, canal?: string) => {
    if (!phone) {
      alert(`Contacto de ${canal || 'chat'}. Aún no tienes su teléfono; pídeselo en la conversación para llamarle.`);
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleWhatsApp = (phone: string, text: string, canal?: string, link?: string) => {
    if (!phone) {
      if (link && link.startsWith('http')) {
        Linking.openURL(link);
        return;
      }
      alert(`Contacto de ${canal || 'chat'}. Pídele su número de WhatsApp en la conversación para continuar el trámite.`);
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`);
  };

  const handleSendSingleToFriend = () => {
    if (!tramitadorTelefono && onOpenConfigTramitador) {
      onOpenConfigTramitador();
      return;
    }
    if (vendedor) {
      const text = shareService.generateVendedorReport(vendedor);
      shareService.sendWhatsApp(tramitadorTelefono, text);
    } else if (comprador) {
      const text = shareService.generateCompradorReport(comprador);
      shareService.sendWhatsApp(tramitadorTelefono, text);
    }
  };

  // Si estamos viendo un VENDEDOR: buscar todos los compradores que le encajan
  const matchingBuyers = vendedor
    ? allCompradores
        .filter(c => c.estado !== 'CERRADO')
        .map(c => ({ comprador: c, match: calculateMatch(vendedor, c) }))
        .filter(item => item.match.score >= 50)
        .sort((a, b) => b.match.score - a.match.score)
    : [];

  // Si estamos viendo un COMPRADOR: buscar todos los vendedores que le encajan
  const matchingSellers = comprador
    ? allVendedores
        .filter(v => v.estado !== 'CERRADO')
        .map(v => ({ vendedor: v, match: calculateMatch(v, comprador) }))
        .filter(item => item.match.score >= 50)
        .sort((a, b) => b.match.score - a.match.score)
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {vendedor ? `🚕 Licencia de ${vendedor.nombre}` : `👤 Comprador: ${comprador?.nombre}`}
              </Text>
              <Text style={styles.subtitle}>
                {vendedor ? `Libranza ${vendedor.diaLibranza} • ${vendedor.perfil}` : `Busca ${comprador?.diaLibranzaDeseada} • ${comprador?.perfil}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* BOTÓN SUPERIOR: DERIVAR ESTE EXPEDIENTE A GESTIÓN */}
            <TouchableOpacity
              style={styles.sendFriendBtn}
              onPress={handleSendSingleToFriend}
              activeOpacity={0.8}
            >
              <Text style={styles.sendFriendIcon}>📤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sendFriendTitle}>
                  Derivar ficha técnica a {tramitadorNombre || 'Gestor'} (WhatsApp)
                </Text>
                <Text style={styles.sendFriendSub}>
                  Envía todos los datos de este {vendedor ? 'vendedor' : 'comprador'} para tramitación oficial
                </Text>
              </View>
              <Text style={styles.sendFriendArrow}>→</Text>
            </TouchableOpacity>

            {/* VENDEDOR EXPEDIENTE */}
            {vendedor && (
              <View style={styles.profileSection}>
                <View style={styles.profileHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.name}>{vendedor.nombre}</Text>
                      {vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' && (
                        <View style={[styles.dayPill, { backgroundColor: colors.canales[vendedor.canalContacto] || colors.secondary }]}>
                          <Text style={styles.dayPillText}>{vendedor.canalContacto}</Text>
                        </View>
                      )}
                    </View>
                    {vendedor.telefono ? (
                      <Text style={styles.phone}>📞 {vendedor.telefono}</Text>
                    ) : (
                      <Text style={[styles.phone, { color: colors.accent, fontWeight: '700' }]}>
                        💬 {vendedor.contactoOrigen ? `${vendedor.contactoOrigen}` : `Chat ${vendedor.canalContacto || ''} (Teléfono pendiente)`}
                      </Text>
                    )}
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.btnAction}
                      onPress={() => handleCall(vendedor.telefono, vendedor.canalContacto)}
                    >
                      <Text style={styles.btnActionText}>Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnAction, styles.waBtn]}
                      onPress={() => handleWhatsApp(
                        vendedor.telefono,
                        `Hola ${vendedor.nombre}, te contacto sobre la venta de tu licencia con libranza ${vendedor.diaLibranza}.`,
                        vendedor.canalContacto,
                        vendedor.contactoOrigen
                      )}
                    >
                      <Text style={styles.btnActionText}>
                        {vendedor.telefono ? 'WhatsApp' : vendedor.contactoOrigen?.startsWith('http') ? 'Abrir Chat' : 'WhatsApp'}
                      </Text>
                    </TouchableOpacity>
                    {onEditVendedor && (
                      <TouchableOpacity
                        style={styles.btnAction}
                        onPress={() => {
                          onClose();
                          onEditVendedor(vendedor);
                        }}
                      >
                        <Text style={styles.btnActionText}>Editar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Grid de especificaciones */}
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Precio</Text>
                    <Text style={styles.specValue}>{vendedor.precio.toLocaleString()} €</Text>
                    <Text style={vendedor.precioNegociable ? styles.greenPill : styles.subtlePill}>
                      {vendedor.precioNegociable ? 'Negociable' : 'No negociable'}
                    </Text>
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Libranza</Text>
                    <View style={[styles.dayPill, { backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary }]}>
                      <Text style={styles.dayPillText}>{vendedor.diaLibranza}</Text>
                    </View>
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Carga Licencia</Text>
                    <Text style={styles.specValue}>
                      {vendedor.cargaLicencia === 'SIN_CARGA' ? 'Libre' : vendedor.cargaLicencia}
                    </Text>
                    {vendedor.detalleCargaLicencia ? (
                      <Text style={styles.specSub}>{vendedor.detalleCargaLicencia}</Text>
                    ) : null}
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Vehículo</Text>
                    <Text style={styles.specValue}>
                      {vendedor.vendeConCoche ? 'Con Coche' : 'Solo Licencia'}
                    </Text>
                    {vendedor.vehiculo && (
                      <Text style={styles.specSub}>
                        {vendedor.vehiculo.modelo} ({vendedor.vehiculo.anoMatriculacion})
                      </Text>
                    )}
                  </View>
                </View>

                {/* Condición de venta */}
                {vendedor.condicionVenta !== 'INMEDIATA' && (
                  <View style={styles.conditionBanner}>
                    <Text style={styles.conditionTitle}>⚠️ Condición de venta:</Text>
                    <Text style={styles.conditionText}>
                      {vendedor.condicionVenta === 'JUBILACION'
                        ? `Sujeta a fecha de jubilación (${vendedor.fechaJubilacion || 'prevista'})`
                        : vendedor.detalleCondicion || 'Especial'}
                    </Text>
                  </View>
                )}

                {vendedor.notas ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Notas:</Text>
                    <Text style={styles.notesText}>{vendedor.notas}</Text>
                  </View>
                ) : null}

                {/* COMPRADORES COMPATIBLES */}
                <View style={styles.matchesSection}>
                  <Text style={styles.matchesSectionTitle}>
                    🎯 Compradores que encajan con esta licencia ({matchingBuyers.length})
                  </Text>
                  {matchingBuyers.length > 0 ? (
                    matchingBuyers.map(({ comprador: c, match }) => (
                      <View key={c.id} style={styles.candidateCard}>
                        <View style={styles.candidateTop}>
                          <View>
                            <Text style={styles.candidateName}>{c.nombre}</Text>
                            <Text style={styles.candidateInfo}>
                              Busca: {c.diaLibranzaDeseada} • Presupuesto máx: {c.precioMaximo.toLocaleString()} €
                            </Text>
                          </View>
                          <View style={styles.candidateScore}>
                            <Text style={styles.candidateScoreText}>{match.score}% MATCH</Text>
                            {c.puedeSenalizarYa && <Text style={styles.hotTag}>🔥 SEÑALIZA YA</Text>}
                          </View>
                        </View>

                        <View style={styles.candidateFooter}>
                          {onSendMatchToFriend && (
                            <TouchableOpacity
                              style={[styles.candBtn, styles.candFriendBtn]}
                              onPress={() =>
                                onSendMatchToFriend({
                                  id: `${vendedor.id}_${c.id}`,
                                  vendedor,
                                  comprador: c,
                                  match,
                                })
                              }
                            >
                              <Text style={styles.candFriendText}>📤 Derivar Cruce a Gestión</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.candBtn}
                            onPress={() => handleCall(c.telefono)}
                          >
                            <Text style={styles.candBtnText}>📞 Llamar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No hay compradores en espera con estos criterios actualmente.</Text>
                  )}
                </View>
              </View>
            )}

            {/* COMPRADOR EXPEDIENTE */}
            {comprador && (
              <View style={styles.profileSection}>
                <View style={styles.profileHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.name}>{comprador.nombre}</Text>
                      {comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' && (
                        <View style={[styles.dayPill, { backgroundColor: colors.canales[comprador.canalContacto] || colors.secondary }]}>
                          <Text style={styles.dayPillText}>{comprador.canalContacto}</Text>
                        </View>
                      )}
                    </View>
                    {comprador.telefono ? (
                      <Text style={styles.phone}>📞 {comprador.telefono}</Text>
                    ) : (
                      <Text style={[styles.phone, { color: colors.accent, fontWeight: '700' }]}>
                        💬 {comprador.contactoOrigen ? `${comprador.contactoOrigen}` : `Chat ${comprador.canalContacto || ''} (Teléfono pendiente)`}
                      </Text>
                    )}
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.btnAction}
                      onPress={() => handleCall(comprador.telefono, comprador.canalContacto)}
                    >
                      <Text style={styles.btnActionText}>Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnAction, styles.waBtn]}
                      onPress={() => handleWhatsApp(
                        comprador.telefono,
                        `Hola ${comprador.nombre}, te escribo con respecto a la búsqueda de licencia de taxi.`,
                        comprador.canalContacto,
                        comprador.contactoOrigen
                      )}
                    >
                      <Text style={styles.btnActionText}>
                        {comprador.telefono ? 'WhatsApp' : comprador.contactoOrigen?.startsWith('http') ? 'Abrir Chat' : 'WhatsApp'}
                      </Text>
                    </TouchableOpacity>
                    {onEditComprador && (
                      <TouchableOpacity
                        style={styles.btnAction}
                        onPress={() => {
                          onClose();
                          onEditComprador(comprador);
                        }}
                      >
                        <Text style={styles.btnActionText}>Editar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Specs Comprador */}
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Presupuesto Máx</Text>
                    <Text style={[styles.specValue, { color: colors.success }]}>
                      {comprador.precioMaximo.toLocaleString()} €
                    </Text>
                    {comprador.puedeSenalizarYa && (
                      <Text style={styles.hotTag}>🔥 SEÑALIZA YA</Text>
                    )}
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Libranza Buscada</Text>
                    <View style={[styles.dayPill, { backgroundColor: colors.libranza[comprador.diaLibranzaDeseada] || colors.primary }]}>
                      <Text style={styles.dayPillText}>{comprador.diaLibranzaDeseada}</Text>
                    </View>
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Vehículo</Text>
                    <Text style={styles.specValue}>
                      {comprador.buscaConCoche === 'CON_COCHE'
                        ? 'Con coche'
                        : comprador.buscaConCoche === 'SOLO_LICENCIA'
                        ? 'Solo licencia'
                        : 'Indiferente'}
                    </Text>
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Gestoría</Text>
                    <Text style={styles.specValue}>
                      {!comprador.tieneGestoria
                        ? 'Sin Gestoría'
                        : comprador.gestoriaSeleccionada === 'GESTORIA_VIP'
                        ? 'VIP 6.000€'
                        : comprador.gestoriaSeleccionada === 'GESTORIA_TALAMANCA'
                        ? 'El Casar'
                        : 'Propia'}
                    </Text>
                  </View>
                </View>

                {onOpenGestoriaScript && (
                  <TouchableOpacity
                    style={styles.gestoriaHelperBtn}
                    onPress={() => onOpenGestoriaScript(comprador.nombre)}
                  >
                    <Text style={styles.gestoriaHelperText}>
                      📋 Abrir Guión Comercial & Estrategia de Gestoría (Ayuda hasta 6.000€)
                    </Text>
                  </TouchableOpacity>
                )}

                {/* LICENCIAS COMPATIBLES */}
                <View style={styles.matchesSection}>
                  <Text style={styles.matchesSectionTitle}>
                    ⚡ Licencias activas que encajan con este comprador ({matchingSellers.length})
                  </Text>
                  {matchingSellers.length > 0 ? (
                    matchingSellers.map(({ vendedor: v, match }) => (
                      <View key={v.id} style={styles.candidateCard}>
                        <View style={styles.candidateTop}>
                          <View>
                            <Text style={styles.candidateName}>{v.nombre}</Text>
                            <Text style={styles.candidateInfo}>
                              Libranza {v.diaLibranza} • Pide {v.precio.toLocaleString()} €{' '}
                              {v.precioNegociable ? '(Negociable)' : '(Fijo)'} •{' '}
                              {v.vendeConCoche ? `Con coche` : 'Solo Licencia'}
                            </Text>
                          </View>
                          <View style={styles.candidateScore}>
                            <Text style={styles.candidateScoreText}>{match.score}% MATCH</Text>
                          </View>
                        </View>

                        <View style={styles.candidateFooter}>
                          {onSendMatchToFriend && (
                            <TouchableOpacity
                              style={[styles.candBtn, styles.candFriendBtn]}
                              onPress={() =>
                                onSendMatchToFriend({
                                  id: `${v.id}_${comprador.id}`,
                                  vendedor: v,
                                  comprador,
                                  match,
                                })
                              }
                            >
                              <Text style={styles.candFriendText}>📤 Derivar Cruce a Gestión</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.candBtn}
                            onPress={() => handleCall(v.telefono)}
                          >
                            <Text style={styles.candBtnText}>📞 Llamar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No hay licencias en venta con estos requisitos ahora mismo.</Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Cerrar Expediente</Text>
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
    maxWidth: 720,
    maxHeight: '92%',
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
  sendFriendBtn: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sendFriendIcon: {
    fontSize: 22,
  },
  sendFriendTitle: {
    color: '#ECFDF5',
    fontSize: 13,
    fontWeight: '800',
  },
  sendFriendSub: {
    color: '#A7F3D0',
    fontSize: 11,
    marginTop: 2,
  },
  sendFriendArrow: {
    color: '#ECFDF5',
    fontSize: 18,
    fontWeight: '800',
  },
  profileSection: {
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  phone: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnAction: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: colors.surfaceCard,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  specSub: {
    fontSize: 10,
    color: colors.textSubtle,
    marginTop: 2,
  },
  dayPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  dayPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  greenPill: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  subtlePill: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  conditionBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: colors.accent,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  conditionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  conditionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: colors.surfaceCard,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  notesText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  gestoriaHelperBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: colors.primary,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  gestoriaHelperText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  matchesSection: {
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  matchesSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  candidateCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  candidateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  candidateInfo: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  candidateScore: {
    alignItems: 'flex-end',
    gap: 2,
  },
  candidateScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  hotTag: {
    fontSize: 9,
    color: colors.danger,
    fontWeight: '800',
  },
  candidateFooter: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  candBtn: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  candFriendBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
    flex: 2,
  },
  candFriendText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  candBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  footer: {
    padding: 14,
    backgroundColor: colors.surfaceHighlight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  closeFooterBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeFooterText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
