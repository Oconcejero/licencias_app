import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Vendedor, Comprador, CruceMatch, getCompradorDias } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';
import { shareService } from '../services/shareService';
import { ExportCardModal } from './ExportCardModal';
import { extractContactLink } from '../utils/contactUtils';

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
  onToggleEstadoVendedor?: (v: Vendedor) => void;
  onToggleEstadoComprador?: (c: Comprador) => void;
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
  onToggleEstadoVendedor,
  onToggleEstadoComprador,
  onSendMatchToFriend,
  onOpenConfigTramitador,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);

  if (!vendedor && !comprador) return null;


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
                {vendedor ? `Libranza ${vendedor.diaLibranza} • ${vendedor.perfil}` : `Busca ${comprador ? getCompradorDias(comprador).join(', ') : ''} • ${comprador?.perfil}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* ACCIONES SUPERIORES DE EXPORTACIÓN Y TRAMITACIÓN */}
            <View style={styles.topActionsContainer}>
              <TouchableOpacity
                style={styles.flyerActionBtn}
                onPress={() => setShowExportModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.flyerActionIcon}>🖼️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flyerActionTitle}>
                    Ficha Visual (Flyer Digital) / Exportar WhatsApp
                  </Text>
                  <Text style={styles.flyerActionSub}>
                    Genera imagen PNG de alta calidad para pegar en WhatsApp (Ctrl+V) o copia el texto limpio
                  </Text>
                </View>
                <Text style={styles.flyerActionArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendFriendBtn}
                onPress={handleSendSingleToFriend}
                activeOpacity={0.85}
              >
                <Text style={styles.sendFriendIcon}>📤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sendFriendTitle}>
                    Derivar directamente a {tramitadorNombre || 'Gestor'} (WhatsApp)
                  </Text>
                  <Text style={styles.sendFriendSub}>
                    Envía este expediente limpio por WhatsApp a su teléfono
                  </Text>
                </View>
                <Text style={styles.sendFriendArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {/* VENDEDOR EXPEDIENTE */}
            {vendedor && (() => {
              const contactInfo = extractContactLink(vendedor.contactoOrigen || vendedor.telefono, vendedor.canalContacto);
              const hasValidPhone = vendedor.telefono && !vendedor.telefono.toLowerCase().includes('http');
              const isClosed = vendedor.estado === 'CERRADO';

              return (
              <View style={styles.profileSection}>
                <View style={[styles.profileHeader, isClosed && styles.profileHeaderClosed]}>
                  <View style={styles.profileInfoRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={styles.name}>{vendedor.nombre}</Text>
                        {isClosed ? (
                          <View style={styles.closedPill}>
                            <Text style={styles.closedPillText}>🏁 CONCLUIDO / FINALIZADO</Text>
                          </View>
                        ) : vendedor.estado === 'EN_NEGOCIACION' ? (
                          <View style={styles.negotiatingPill}>
                            <Text style={styles.negotiatingPillText}>🤝 EN NEGOCIACIÓN</Text>
                          </View>
                        ) : null}
                        {vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' && (
                          <View style={[styles.dayPill, { backgroundColor: colors.canales[vendedor.canalContacto] || colors.secondary }]}>
                            <Text style={styles.dayPillText}>{vendedor.canalContacto}</Text>
                          </View>
                        )}
                      </View>

                      {hasValidPhone ? (
                        <Text style={styles.phone}>📞 {vendedor.telefono}</Text>
                      ) : null}

                      {contactInfo.hasUrl && contactInfo.url ? (
                        <TouchableOpacity
                          style={[styles.linkBtn, { backgroundColor: contactInfo.badgeBg || colors.primary, marginTop: 6, alignSelf: 'flex-start' }]}
                          onPress={() => Linking.openURL(contactInfo.url!)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.linkBtnText}>
                            {contactInfo.icon} {contactInfo.platformLabel} ↗
                          </Text>
                        </TouchableOpacity>
                      ) : !hasValidPhone ? (
                        <Text style={[styles.phone, { color: colors.textMuted, marginTop: 4 }]}>
                          💬 Chat {vendedor.canalContacto || ''} (Sin teléfono guardado)
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    {onToggleEstadoVendedor && (
                      <TouchableOpacity
                        style={[styles.btnAction, isClosed ? styles.btnReopen : styles.btnCloseDeal]}
                        onPress={() => onToggleEstadoVendedor(vendedor)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnActionText}>
                          {isClosed ? '🔄 Reabrir a Disponible' : '🏁 Marcar como Concluido'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onEditVendedor && (
                      <TouchableOpacity
                        style={styles.btnAction}
                        onPress={() => {
                          onClose();
                          onEditVendedor(vendedor);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnActionText}>✏️ Editar Expediente</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Grid de especificaciones */}
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Precio</Text>
                    {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche ? (
                      <View>
                        <Text style={styles.specValue}>
                          {vendedor.precio.toLocaleString()} € <Text style={{ fontSize: 11, color: colors.textMuted }}>(Solo lic.)</Text>
                        </Text>
                        <Text style={[styles.specValue, { color: colors.primary, fontSize: 13, marginTop: 2 }]}>
                          {vendedor.precioConCoche.toLocaleString()} € <Text style={{ fontSize: 10, color: colors.textMuted }}>(Con coche)</Text>
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.specValue}>
                        {vendedor.precio.toLocaleString()} €
                        {vendedor.modalidadVentaCoche === 'CON_COCHE' ? ' (Pack)' : ''}
                      </Text>
                    )}
                    <Text style={vendedor.precioNegociable ? styles.greenPill : styles.subtlePill}>
                      {vendedor.precioNegociable ? 'Negociable' : 'No negociable'}
                    </Text>
                  </View>

                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>Libranza y Turno</Text>
                    <View style={[styles.dayPill, { backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary }]}>
                      <Text style={styles.dayPillText}>
                        {vendedor.diaLibranza === 'EUROTAXI'
                          ? '♿ EUROTAXI (Sin libranza)'
                          : vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
                          ? '⚡ ELÉCTRICO (Sin libranza)'
                          : vendedor.diaLibranza === 'LIBRE_24H'
                          ? '24H LIBRE'
                          : `${vendedor.diaLibranza} (${vendedor.turnoDescanso || 'PAR'})`}
                      </Text>
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
                    <Text style={styles.specLabel}>Vehículo / Pack</Text>
                    <Text style={styles.specValue}>
                      {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES'
                        ? 'Ambas Opciones'
                        : vendedor.vendeConCoche ? 'Con Coche' : 'Solo Licencia'}
                    </Text>
                    {vendedor.vehiculo && (
                      <Text style={styles.specSub}>
                        {vendedor.vehiculo.modelo} ({vendedor.vehiculo.anoMatriculacion})
                      </Text>
                    )}
                    {vendedor.vehiculo?.exentoLibranza && (
                      <Text style={[styles.specSub, { color: colors.accent, fontWeight: '700' }]}>
                        ⚡ {vendedor.vehiculo.detalleExencion || 'Exento libranza'}
                      </Text>
                    )}
                    {vendedor.vehiculo?.carga === 'PRESTAMO' && (
                      <Text style={[styles.specSub, { color: colors.warning }]}>
                        🚗 Préstamo: {vendedor.vehiculo.detalleCarga || 'con reserva'}
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
                          <View style={{ flex: 1 }}>
                            <Text style={styles.candidateName}>{c.nombre}</Text>
                          </View>
                          <View style={styles.candidateScore}>
                            <Text style={styles.candidateScoreText}>{match.score}% MATCH</Text>
                            {c.puedeSenalizarYa && <Text style={styles.hotTag}>🔥 SEÑALIZA YA</Text>}
                          </View>
                        </View>

                        <View style={styles.candidateSummaryBox}>
                          <Text style={styles.candidateInfo}>
                            Busca: {getCompradorDias(c).join(', ')} • Hasta {c.precioMaximo.toLocaleString()} € •{' '}
                            {c.buscaConCoche === 'CON_COCHE'
                              ? '🚗 Con coche'
                              : c.buscaConCoche === 'SOLO_LICENCIA'
                              ? '📄 Solo licencia'
                              : 'Coche indiferente'}
                          </Text>
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
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No hay compradores en espera con estos criterios actualmente.</Text>
                  )}
                </View>
              </View>
              );
            })()}

            {/* COMPRADOR EXPEDIENTE */}
            {comprador && (() => {
              const contactInfo = extractContactLink(comprador.contactoOrigen || comprador.telefono, comprador.canalContacto);
              const hasValidPhone = comprador.telefono && !comprador.telefono.toLowerCase().includes('http');
              const isClosed = comprador.estado === 'CERRADO';

              return (
              <View style={styles.profileSection}>
                <View style={[styles.profileHeader, isClosed && styles.profileHeaderClosed]}>
                  <View style={styles.profileInfoRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={styles.name}>{comprador.nombre}</Text>
                        {isClosed ? (
                          <View style={styles.closedPill}>
                            <Text style={styles.closedPillText}>🏁 CONCLUIDO / FINALIZADO</Text>
                          </View>
                        ) : comprador.estado === 'EN_NEGOCIACION' ? (
                          <View style={styles.negotiatingPill}>
                            <Text style={styles.negotiatingPillText}>🤝 EN NEGOCIACIÓN</Text>
                          </View>
                        ) : null}
                        {comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' && (
                          <View style={[styles.dayPill, { backgroundColor: colors.canales[comprador.canalContacto] || colors.secondary }]}>
                            <Text style={styles.dayPillText}>{comprador.canalContacto}</Text>
                          </View>
                        )}
                      </View>

                      {hasValidPhone ? (
                        <Text style={styles.phone}>📞 {comprador.telefono}</Text>
                      ) : null}

                      {contactInfo.hasUrl && contactInfo.url ? (
                        <TouchableOpacity
                          style={[styles.linkBtn, { backgroundColor: contactInfo.badgeBg || colors.primary, marginTop: 6, alignSelf: 'flex-start' }]}
                          onPress={() => Linking.openURL(contactInfo.url!)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.linkBtnText}>
                            {contactInfo.icon} {contactInfo.platformLabel} ↗
                          </Text>
                        </TouchableOpacity>
                      ) : !hasValidPhone ? (
                        <Text style={[styles.phone, { color: colors.textMuted, marginTop: 4 }]}>
                          💬 Chat {comprador.canalContacto || ''} (Sin teléfono guardado)
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    {onToggleEstadoComprador && (
                      <TouchableOpacity
                        style={[styles.btnAction, isClosed ? styles.btnReopen : styles.btnCloseDeal]}
                        onPress={() => onToggleEstadoComprador(comprador)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnActionText}>
                          {isClosed ? '🔄 Reabrir a Disponible' : '🏁 Marcar como Concluido'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onEditComprador && (
                      <TouchableOpacity
                        style={styles.btnAction}
                        onPress={() => {
                          onClose();
                          onEditComprador(comprador);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnActionText}>✏️ Editar Expediente</Text>
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
                    {(() => {
                      const diasBuscados = getCompradorDias(comprador);
                      const isMulti = diasBuscados.length > 1;
                      const isCualquiera = diasBuscados.includes('CUALQUIERA');
                      const bg = isMulti ? '#4F46E5' : colors.libranza[diasBuscados[0]] || colors.primary;
                      const txt = isCualquiera
                        ? (comprador.turnoDescansoDeseado && comprador.turnoDescansoDeseado !== 'INDIFERENTE'
                            ? `Cualquiera • ${comprador.turnoDescansoDeseado}`
                            : 'Cualquiera (Indiferente)')
                        : isMulti
                        ? `${diasBuscados.join(', ')} (${comprador.turnoDescansoDeseado || 'Indiferente'})`
                        : diasBuscados[0] === 'EUROTAXI'
                        ? '♿ EUROTAXI (Sin libranza)'
                        : diasBuscados[0] === 'ELECTRICO_SIN_LIBRANZA'
                        ? '⚡ ELÉCTRICO (Sin libranza)'
                        : diasBuscados[0] === 'LIBRE_24H'
                        ? '24H LIBRE'
                        : `${diasBuscados[0]} (${comprador.turnoDescansoDeseado || 'Indiferente'})`;
                      return (
                        <View style={[styles.dayPill, { backgroundColor: bg }]}>
                          <Text style={styles.dayPillText}>{txt}</Text>
                        </View>
                      );
                    })()}
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
                    <Text style={styles.specLabel}>Financiación / Carga</Text>
                    <Text style={styles.specValue}>
                      {comprador.aceptaConPrestamo === true
                        ? 'Acepta préstamo'
                        : comprador.aceptaConPrestamo === false
                        ? 'Limpia sin cargas'
                        : 'Indiferente'}
                    </Text>
                  </View>
                </View>

                {/* LICENCIAS COMPATIBLES */}
                <View style={styles.matchesSection}>
                  <Text style={styles.matchesSectionTitle}>
                    ⚡ Licencias activas que encajan con este comprador ({matchingSellers.length})
                  </Text>
                  {matchingSellers.length > 0 ? (
                    matchingSellers.map(({ vendedor: v, match }) => (
                      <View key={v.id} style={styles.candidateCard}>
                        <View style={styles.candidateTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.candidateName}>{v.nombre}</Text>
                          </View>
                          <View style={styles.candidateScore}>
                            <Text style={styles.candidateScoreText}>{match.score}% MATCH</Text>
                          </View>
                        </View>

                        <View style={styles.candidateSummaryBox}>
                          <Text style={styles.candidateInfo}>
                            Libranza {v.diaLibranza} •{' '}
                            {v.modalidadVentaCoche === 'AMBAS_OPCIONES' || (v.precioConCoche && v.precioConCoche !== v.precio)
                              ? `🚗 Con coche: ${(v.precioConCoche || v.precio).toLocaleString()} € | 📄 Sin coche: ${v.precio.toLocaleString()} €`
                              : `Pide ${(match.precioEvaluado || v.precio).toLocaleString()} € (${v.modalidadVentaCoche === 'CON_COCHE' ? 'Con coche' : 'Solo lic.'})`}{' '}
                            {v.precioNegociable ? '(Negociable)' : '(Fijo)'}
                          </Text>
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
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No hay licencias en venta con estos requisitos ahora mismo.</Text>
                  )}
                </View>
              </View>
              );
            })()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Cerrar Expediente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ExportCardModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        vendedor={vendedor}
        comprador={comprador}
        recipientPhone={tramitadorTelefono}
      />
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
  topActionsContainer: {
    gap: 8,
    marginBottom: 14,
  },
  flyerActionBtn: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flyerActionIcon: {
    fontSize: 22,
  },
  flyerActionTitle: {
    color: '#EEF2FF',
    fontSize: 13,
    fontWeight: '800',
  },
  flyerActionSub: {
    color: '#C7D2FE',
    fontSize: 11,
    marginTop: 2,
  },
  flyerActionArrow: {
    color: '#EEF2FF',
    fontSize: 18,
    fontWeight: '800',
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
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
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
    gap: 8,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    width: '100%',
  },
  btnAction: {
    flex: 1,
    minWidth: 120,
    minHeight: 36,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReopen: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: colors.primary,
  },
  btnCloseDeal: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  profileHeaderClosed: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: '#161F2E',
  },
  closedPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  closedPillText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  negotiatingPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  negotiatingPillText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  linkBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  waBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  btnActionText: {
    fontSize: 12,
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
    alignItems: 'center',
    gap: 8,
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  candidateSummaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    padding: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  candidateInfo: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
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
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  candBtn: {
    flex: 1,
    minWidth: 90,
    minHeight: 34,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
