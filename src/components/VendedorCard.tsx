import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Vendedor, Comprador } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';

interface VendedorCardProps {
  vendedor: Vendedor;
  allCompradores: Comprador[];
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const VendedorCard: React.FC<VendedorCardProps> = ({
  vendedor,
  allCompradores,
  onPress,
  onEdit,
  onDelete,
}) => {
  // Calcular cuántos compradores encajan con este vendedor
  const matchingBuyers = allCompradores.filter(c => {
    if (c.estado === 'CERRADO') return false;
    const res = calculateMatch(vendedor, c);
    return res.score >= 50;
  });

  const handleCall = () => {
    if (!vendedor.telefono) {
      alert(`Contacto de ${vendedor.canalContacto || 'chat'}. Aún no tienes su teléfono; pídeselo en la conversación para llamarle.`);
      return;
    }
    Linking.openURL(`tel:${vendedor.telefono.replace(/\s+/g, '')}`);
  };

  const handleWhatsApp = () => {
    if (!vendedor.telefono) {
      if (vendedor.contactoOrigen && vendedor.contactoOrigen.startsWith('http')) {
        Linking.openURL(vendedor.contactoOrigen);
        return;
      }
      alert(`Contacto de ${vendedor.canalContacto || 'chat'}. Pídele su número en la conversación para contactarle por WhatsApp.`);
      return;
    }
    const cleanPhone = vendedor.telefono.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Cabecera */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{vendedor.nombre}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.dayBadge, { backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary }]}>
                <Text style={styles.dayText}>
                  {vendedor.diaLibranza === 'EUROTAXI'
                    ? '♿ EUROTAXI (SIN LIBRANZA)'
                    : vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
                    ? '⚡ ELÉCTRICO (SIN LIBRANZA)'
                    : vendedor.diaLibranza === 'LIBRE_24H'
                    ? '24H LIBRE'
                    : `LIBRANZA ${vendedor.diaLibranza} • ${vendedor.turnoDescanso || 'PAR'}`}
                </Text>
              </View>
              <View style={styles.perfilBadge}>
                <Text style={styles.perfilText}>{vendedor.perfil}</Text>
              </View>
              {vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' && (
                <View style={[styles.canalBadge, { backgroundColor: colors.canales[vendedor.canalContacto] || colors.secondary }]}>
                  <Text style={styles.canalText}>
                    {vendedor.canalContacto === 'WALLAPOP' ? '🟠 WALLAPOP'
                     : vendedor.canalContacto === 'MILANUNCIOS' ? '🟢 MILANUNCIOS'
                     : vendedor.canalContacto === 'FACEBOOK' ? '🔵 FACEBOOK'
                     : '💬 ' + vendedor.canalContacto}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.priceContainer}>
            {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>
                  {vendedor.precio.toLocaleString()} € <Text style={{ fontSize: 10, color: colors.textMuted }}>lic.</Text>
                </Text>
                <Text style={[styles.price, { fontSize: 13, color: colors.primary }]}>
                  {vendedor.precioConCoche.toLocaleString()} € <Text style={{ fontSize: 9, color: colors.textMuted }}>+coche</Text>
                </Text>
              </View>
            ) : (
              <Text style={styles.price}>
                {vendedor.precio.toLocaleString()} €
                {vendedor.modalidadVentaCoche === 'CON_COCHE' ? (
                  <Text style={{ fontSize: 11, color: colors.textMuted }}> (pack)</Text>
                ) : null}
              </Text>
            )}
            <Text style={vendedor.precioNegociable ? styles.negotiable : styles.fixed}>
              {vendedor.precioNegociable ? 'Negociable' : 'Precio Fijo'}
            </Text>
          </View>
        </View>

        {/* Cargas y Condiciones */}
        <View style={styles.detailsGrid}>
          {!vendedor.telefono && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Contacto:</Text>
              <Text style={[styles.detailValue, { color: colors.accent, fontWeight: '700' }]}>
                {vendedor.contactoOrigen ? `${vendedor.contactoOrigen} (${vendedor.canalContacto || 'Chat'})` : `Chat ${vendedor.canalContacto || 'online'} (Teléfono pendiente)`}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Carga Licencia:</Text>
            <Text style={[styles.detailValue, vendedor.cargaLicencia === 'SIN_CARGA' ? styles.greenValue : styles.orangeValue]}>
              {vendedor.cargaLicencia === 'SIN_CARGA'
                ? 'Libre de cargas'
                : `Con préstamo (${vendedor.detalleCargaLicencia || 'Pendiente'})`}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vehículo:</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailValue}>
                {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES'
                  ? `Flexible: solo lic. o con ${vendedor.vehiculo?.modelo || 'coche'} (${vendedor.vehiculo?.anoMatriculacion || ''})`
                  : vendedor.vendeConCoche && vendedor.vehiculo
                  ? `Pack coche: ${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion || ''} - ${vendedor.vehiculo.kilometros || '0'} km)`
                  : 'Solo licencia (sin coche)'}
              </Text>
              {vendedor.vehiculo?.exentoLibranza && (
                <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                  ⚡ {vendedor.vehiculo.detalleExencion || 'Exento de descanso (CERO)'}
                </Text>
              )}
              {vendedor.vehiculo?.carga === 'PRESTAMO' && (
                <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                  🚗 Deuda coche: {vendedor.vehiculo.detalleCarga || 'con reserva de dominio'}
                </Text>
              )}
            </View>
          </View>

          {vendedor.condicionVenta !== 'INMEDIATA' && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Condición venta:</Text>
              <Text style={[styles.detailValue, styles.orangeValue]}>
                {vendedor.condicionVenta === 'JUBILACION'
                  ? `Tras jubilación (${vendedor.fechaJubilacion || 'Prevista'})`
                  : vendedor.detalleCondicion || 'Condición especial'}
              </Text>
            </View>
          )}

          {vendedor.notas ? (
            <Text style={styles.notesText} numberOfLines={2}>
              📝 {vendedor.notas}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Footer de acción y matches */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.matchesBadge} onPress={onPress}>
          <Text style={styles.matchesText}>
            🎯 {matchingBuyers.length} {matchingBuyers.length === 1 ? 'Comprador encaja' : 'Compradores encajan'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCall}>
            <Text style={styles.btnIconText}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.waBtn]} onPress={handleWhatsApp}>
            <Text style={styles.btnIconText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
            <Text style={styles.btnIconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.delBtn]} onPress={onDelete}>
            <Text style={styles.btnIconText}>🗑️</Text>
          </TouchableOpacity>
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
  },
  negotiable: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  fixed: {
    fontSize: 11,
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
  matchesBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matchesText: {
    color: '#93C5FD',
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
});
