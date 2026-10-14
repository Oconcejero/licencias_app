import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Comprador, Vendedor, getCompradorDias } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';

interface CompradorCardProps {
  comprador: Comprador;
  allVendedores: Vendedor[];
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CompradorCard: React.FC<CompradorCardProps> = ({
  comprador,
  allVendedores,
  onPress,
  onEdit,
  onDelete,
}) => {
  // Cuántas licencias le encajan
  const matchingSellers = allVendedores.filter(v => {
    if (v.estado === 'CERRADO') return false;
    const res = calculateMatch(v, comprador);
    return res.score >= 45;
  });

  const handleCall = () => {
    if (!comprador.telefono) {
      alert(`Contacto de ${comprador.canalContacto || 'chat'}. Aún no tienes su teléfono; pídeselo en la conversación para llamarle.`);
      return;
    }
    Linking.openURL(`tel:${comprador.telefono.replace(/\s+/g, '')}`);
  };

  const handleWhatsApp = () => {
    if (!comprador.telefono) {
      if (comprador.contactoOrigen && comprador.contactoOrigen.startsWith('http')) {
        Linking.openURL(comprador.contactoOrigen);
        return;
      }
      alert(`Contacto de ${comprador.canalContacto || 'chat'}. Pídele su número en la conversación para contactarle por WhatsApp.`);
      return;
    }
    const cleanPhone = comprador.telefono.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`);
  };

  const diasBuscados = getCompradorDias(comprador);
  const isCualquiera = diasBuscados.includes('CUALQUIERA');
  const isMulti = diasBuscados.length > 1;
  const badgeBg = isMulti
    ? '#4F46E5'
    : colors.libranza[diasBuscados[0]] || colors.primary;

  const badgeText = isCualquiera
    ? 'LIBRANZA CUALQUIERA'
    : isMulti
    ? `DÍAS (${diasBuscados.length}): ${diasBuscados.join(' • ')}`
    : diasBuscados[0] === 'EUROTAXI'
    ? 'EUROTAXI (SIN LIBRANZA)'
    : diasBuscados[0] === 'ELECTRICO_SIN_LIBRANZA'
    ? 'ELÉCTRICO (SIN LIBRANZA)'
    : diasBuscados[0] === 'LIBRE_24H'
    ? '24H LIBRE'
    : `LIBRANZA ${diasBuscados[0]}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Cabecera */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.name}>{comprador.nombre}</Text>
              {comprador.estado !== 'DISPONIBLE' && (
                <View style={[styles.statusBadge, comprador.estado === 'EN_NEGOCIACION' ? styles.statusNegotiating : styles.statusClosed]}>
                  <Text style={styles.statusText}>{comprador.estado.replace('_', ' ')}</Text>
                </View>
              )}
            </View>

            <View style={styles.badgesRow}>
              <View style={[styles.dayBadge, { backgroundColor: badgeBg }]}>
                <Text style={styles.dayText}>{badgeText}</Text>
              </View>
              <View style={styles.perfilBadge}>
                <Text style={styles.perfilText}>{comprador.perfil}</Text>
              </View>
              {comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' && (
                <View style={[styles.canalBadge, { backgroundColor: colors.canales[comprador.canalContacto] || colors.secondary }]}>
                  <Text style={styles.canalText}>
                    {comprador.canalContacto === 'WALLAPOP' ? '🟠 WALLAPOP'
                     : comprador.canalContacto === 'MILANUNCIOS' ? '🟢 MILANUNCIOS'
                     : comprador.canalContacto === 'FACEBOOK' ? '🔵 FACEBOOK'
                     : '💬 ' + comprador.canalContacto}
                  </Text>
                </View>
              )}
              {comprador.puedeSenalizarYa && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>🔥 SEÑALIZA YA</Text>
                </View>
              )}
              {comprador.guardadoEnEspera && (
                <View style={styles.waitingBadge}>
                  <Text style={styles.waitingText}>⏳ EN ESPERA</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{comprador.precioMaximo.toLocaleString()} €</Text>
            <Text style={styles.priceLabel}>Presupuesto Máx</Text>
          </View>
        </View>

        {/* DETALLES COMPLETOS RECOPILADOS */}
        <View style={styles.detailsGrid}>
          {/* Teléfono y Origen */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>📞 Contacto:</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailValue, { fontWeight: '700', color: colors.text }]}>
                {comprador.telefono || 'Sin teléfono guardado'}
              </Text>
              {comprador.contactoOrigen && (
                <Text style={[styles.subValueText, { color: colors.accent }]}>
                  🔗 {comprador.contactoOrigen}
                </Text>
              )}
            </View>
          </View>

          {/* Días y Turno */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>📅 Días libranza:</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontWeight: '700' }]}>
              {isCualquiera ? 'Cualquier día (Indiferente)' : diasBuscados.join(', ')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🔢 Turno finde:</Text>
            <Text style={styles.detailValue}>
              {comprador.turnoDescansoDeseado === 'INDIFERENTE'
                ? 'Indiferente (acepta Par o Impar)'
                : comprador.turnoDescansoDeseado === 'PAR'
                ? 'Busca turno PAR'
                : comprador.turnoDescansoDeseado === 'IMPAR'
                ? 'Busca turno IMPAR'
                : comprador.turnoDescansoDeseado === 'ROTATIVO'
                ? 'Finde alterno rotativo'
                : comprador.turnoDescansoDeseado === 'LIBRE_24H'
                ? 'Libre 24H (sin turnos)'
                : 'Indiferente'}
            </Text>
          </View>

          {/* Preferencia de coche */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🚗 Vehículo:</Text>
            <Text style={[styles.detailValue, comprador.buscaConCoche === 'CON_COCHE' ? styles.blueValue : styles.detailValue]}>
              {comprador.buscaConCoche === 'CON_COCHE'
                ? '🚗 Con coche (imprescindible pack con vehículo)'
                : comprador.buscaConCoche === 'SOLO_LICENCIA'
                ? '📄 Solo licencia (no quiere vehículo)'
                : '🔄 Indiferente (con o sin vehículo)'}
            </Text>
          </View>

          {/* Financiación / Carga */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>⚖️ Financiación:</Text>
            <Text style={[styles.detailValue, comprador.aceptaConPrestamo === true ? styles.greenValue : comprador.aceptaConPrestamo === false ? styles.orangeValue : styles.detailValue]}>
              {comprador.aceptaConPrestamo === true
                ? '💳 Acepta licencia con préstamo existente'
                : comprador.aceptaConPrestamo === false
                ? '🛡️ Exige 100% libre de cargas / sin préstamos'
                : '🔄 Indiferente respecto a cargas'}
            </Text>
          </View>

          {/* Disponibilidad de señal */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>💰 Señalización:</Text>
            <Text style={[styles.detailValue, comprador.puedeSenalizarYa ? styles.hotValue : styles.detailValue]}>
              {comprador.puedeSenalizarYa
                ? '🔥 Disponible para señalizar de INMEDIATO'
                : '⏱️ Normal (evaluando opciones)'}
            </Text>
          </View>

          {/* Fecha de alta */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🗓️ Registrado:</Text>
            <Text style={[styles.detailValue, { color: colors.textMuted }]}>
              {new Date(comprador.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>

          {/* Notas */}
          {comprador.notas ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>
                📝 <Text style={{ fontWeight: '700' }}>Notas:</Text> {comprador.notas}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.matchesBadge} onPress={onPress}>
          <Text style={styles.matchesText}>
            🎯 {matchingSellers.length} {matchingSellers.length === 1 ? 'Licencia encaja' : 'Licencias encajan'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCall}>
            <Text style={styles.btnIconText}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.waBtn]} onPress={handleWhatsApp}>
            <Text style={styles.btnIconText}>💬</Text>
          </TouchableOpacity>
          {onEdit && (
            <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
              <Text style={styles.btnIconText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.iconBtn, styles.delBtn]} onPress={onDelete}>
              <Text style={styles.btnIconText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  perfilBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perfilText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  hotBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  canalBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  canalText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F87171',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  detailsGrid: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  greenValue: {
    color: colors.success,
  },
  orangeValue: {
    color: colors.accent,
  },
  notesText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  matchesBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matchesText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    backgroundColor: colors.surfaceHighlight,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  waBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  delBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  btnIconText: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusNegotiating: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.accent,
  },
  statusClosed: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: colors.textMuted,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text,
  },
  waitingBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#818CF8',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  waitingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  blueValue: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  hotValue: {
    color: '#F87171',
    fontWeight: '800',
  },
  subValueText: {
    fontSize: 11,
    marginTop: 2,
  },
  notesBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
