import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Comprador, Vendedor } from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';

interface CompradorCardProps {
  comprador: Comprador;
  allVendedores: Vendedor[];
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenGestoriaScript: () => void;
}

export const CompradorCard: React.FC<CompradorCardProps> = ({
  comprador,
  allVendedores,
  onPress,
  onEdit,
  onDelete,
  onOpenGestoriaScript,
}) => {
  // Cuántas licencias le encajan
  const matchingSellers = allVendedores.filter(v => {
    if (v.estado === 'CERRADO') return false;
    const res = calculateMatch(v, comprador);
    return res.score >= 50;
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

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Cabecera */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{comprador.nombre}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.dayBadge, { backgroundColor: colors.libranza[comprador.diaLibranzaDeseada] || colors.primary }]}>
                <Text style={styles.dayText}>BUSCA {comprador.diaLibranzaDeseada}</Text>
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
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{comprador.precioMaximo.toLocaleString()} €</Text>
            <Text style={styles.priceLabel}>Presupuesto Máx</Text>
          </View>
        </View>

        {/* Detalles */}
        <View style={styles.detailsGrid}>
          {!comprador.telefono && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Contacto:</Text>
              <Text style={[styles.detailValue, { color: colors.accent, fontWeight: '700' }]}>
                {comprador.contactoOrigen ? `${comprador.contactoOrigen} (${comprador.canalContacto || 'Chat'})` : `Chat ${comprador.canalContacto || 'online'} (Teléfono pendiente)`}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Coche:</Text>
            <Text style={styles.detailValue}>
              {comprador.buscaConCoche === 'CON_COCHE'
                ? 'Con coche imprescindible'
                : comprador.buscaConCoche === 'SOLO_LICENCIA'
                ? 'Solo licencia'
                : 'Indiferente (con o sin)'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Financiación/Préstamo:</Text>
            <Text style={styles.detailValue}>
              {comprador.aceptaConPrestamo === true
                ? 'Acepta licencia con préstamo'
                : comprador.aceptaConPrestamo === false
                ? 'Solo limpia sin cargas'
                : 'Indiferente'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gestoría:</Text>
            <Text style={[styles.detailValue, !comprador.tieneGestoria ? styles.orangeValue : styles.greenValue]}>
              {!comprador.tieneGestoria
                ? 'No tiene (Ofrecer Gestoría VIP 6.000€)'
                : comprador.gestoriaSeleccionada === 'GESTORIA_VIP'
                ? 'VIP Recomendada (Ayuda 6.000€)'
                : comprador.gestoriaSeleccionada === 'GESTORIA_TALAMANCA'
                ? 'El Casar de Talamanca'
                : comprador.nombreGestoriaPropia || 'Tiene gestoría propia'}
            </Text>
          </View>

          {comprador.notas ? (
            <Text style={styles.notesText} numberOfLines={2}>
              📝 {comprador.notas}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity style={styles.matchesBadge} onPress={onPress}>
            <Text style={styles.matchesText}>
              🎯 {matchingSellers.length} {matchingSellers.length === 1 ? 'Licencia encaja' : 'Licencias encajan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.scriptBtn} onPress={onOpenGestoriaScript}>
            <Text style={styles.scriptBtnText}>📋 Guión & Ayuda</Text>
          </TouchableOpacity>
        </View>

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
  scriptBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scriptBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
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
