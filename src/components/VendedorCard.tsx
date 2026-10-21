import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Vendedor, Comprador } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';
import { extractContactLink } from '../utils/contactUtils';

interface VendedorCardProps {
  vendedor: Vendedor;
  allCompradores: Comprador[];
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

  const contactInfo = extractContactLink(vendedor.contactoOrigen || vendedor.telefono, vendedor.canalContacto);
  const hasValidPhone = vendedor.telefono && !vendedor.telefono.toLowerCase().includes('http');

  const isClosed = vendedor.estado === 'CERRADO';
  const isNegotiating = vendedor.estado === 'EN_NEGOCIACION';

  return (
    <View style={[styles.card, isClosed && styles.cardClosed]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.cardTouchable}>
        {/* Cabecera: Nombre y Precio */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, isClosed && styles.nameClosed]}>{vendedor.nombre}</Text>
              {isClosed ? (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>🏁 FINALIZADA</Text>
                </View>
              ) : isNegotiating ? (
                <View style={styles.negotiatingBadge}>
                  <Text style={styles.negotiatingBadgeText}>🤝 NEGOCIACIÓN</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.priceContainer}>
            {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>
                  {vendedor.precio.toLocaleString()} € <Text style={{ fontSize: 10, color: colors.textMuted }}>lic.</Text>
                </Text>
                <Text style={[styles.price, { fontSize: 13, color: colors.secondary }]}>
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

        {/* Fila de Insignias Clave (Visual y Limpia) */}
        <View style={styles.badgesRow}>
          {/* Libranza */}
          <View style={[styles.dayBadge, { backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary }]}>
            <Text style={styles.dayText}>
              {vendedor.diaLibranza === 'EUROTAXI'
                ? '♿ EUROTAXI'
                : vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
                ? '⚡ ELÉCTRICO CERO'
                : vendedor.diaLibranza === 'LIBRE_24H'
                ? '24H LIBRE'
                : `${vendedor.diaLibranza} • ${vendedor.turnoDescanso || 'PAR'}`}
            </Text>
          </View>

          {/* Vehículo */}
          <View style={styles.attrPill}>
            <Text style={styles.attrPillText}>
              {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES'
                ? '🚗 Con o sin coche'
                : vendedor.vendeConCoche && vendedor.vehiculo
                ? `🚗 ${vendedor.vehiculo.modelo}`
                : '📄 Solo licencia'}
            </Text>
          </View>

          {/* Carga */}
          <View style={[styles.attrPill, vendedor.cargaLicencia === 'SIN_CARGA' ? styles.pillGreen : styles.pillOrange]}>
            <Text style={[styles.attrPillText, vendedor.cargaLicencia === 'SIN_CARGA' ? styles.pillGreenText : styles.pillOrangeText]}>
              {vendedor.cargaLicencia === 'SIN_CARGA' ? '⚖️ Libre de cargas' : '⚖️ Con préstamo'}
            </Text>
          </View>

          {/* Perfil */}
          <View style={styles.perfilBadge}>
            <Text style={styles.perfilText}>{vendedor.perfil}</Text>
          </View>
        </View>

        {/* Fila de Contacto Limpio (Sin textos largos de Wallapop ni enlaces rotos) */}
        <View style={styles.contactRow}>
          {contactInfo.hasUrl && contactInfo.url ? (
            <TouchableOpacity
              style={[styles.linkBtn, { backgroundColor: contactInfo.badgeBg || colors.primary }]}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (contactInfo.url) Linking.openURL(contactInfo.url);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.linkBtnText}>
                {contactInfo.icon} {contactInfo.platformLabel} ↗
              </Text>
            </TouchableOpacity>
          ) : null}

          {hasValidPhone ? (
            <View style={styles.phoneChip}>
              <Text style={styles.phoneChipText}>📱 {vendedor.telefono}</Text>
            </View>
          ) : !contactInfo.hasUrl ? (
            <View style={styles.chatChip}>
              <Text style={styles.chatChipText}>
                💬 {vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' ? vendedor.canalContacto : 'Sin teléfono'}
              </Text>
            </View>
          ) : null}

          <Text style={styles.tapDetailHint}>Toca para ver detalles completos ›</Text>
        </View>
      </TouchableOpacity>

      {/* Footer: Matches y SOLO botones de Editar y Borrar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.matchesBadge} onPress={onPress} activeOpacity={0.75}>
          <Text style={styles.matchesText}>
            🎯 {matchingBuyers.length} {matchingBuyers.length === 1 ? 'Comprador encaja' : 'Compradores encajan'}
          </Text>
        </TouchableOpacity>

        {/* Solo Editar y Borrar */}
        <View style={styles.actionBtns}>
          {onEdit && (
            <TouchableOpacity style={styles.iconBtn} onPress={onEdit} activeOpacity={0.7} accessibilityLabel="Editar">
              <Text style={styles.btnIconText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.iconBtn, styles.delBtn]} onPress={onDelete} activeOpacity={0.7} accessibilityLabel="Eliminar">
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
    padding: 14,
    marginBottom: 12,
  },
  cardClosed: {
    opacity: 0.75,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: '#161F2E',
  },
  cardTouchable: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  nameClosed: {
    color: colors.textMuted,
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  closedBadgeText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  negotiatingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  negotiatingBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.secondary,
  },
  fixed: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  negotiable: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dayText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  attrPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attrPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  pillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pillGreenText: {
    color: '#34D399',
  },
  pillOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  pillOrangeText: {
    color: colors.accent,
  },
  perfilBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  perfilText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
    marginBottom: 8,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  linkBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  phoneChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  chatChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatChipText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  tapDetailHint: {
    marginLeft: 'auto',
    fontSize: 11,
    color: colors.textSubtle,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  matchesBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchesText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  delBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  btnIconText: {
    fontSize: 16,
  },
});
