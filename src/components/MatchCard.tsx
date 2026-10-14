import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { CruceMatch, getCompradorDias } from '../types';
import { colors } from '../theme/colors';
import { ExportCardModal } from './ExportCardModal';

interface MatchCardProps {
  cruce: CruceMatch;
  isDerivado?: boolean;
  tramitadorNombre?: string;
  onOpenGestoriaScript: (compradorNombre: string) => void;
  onOpenDetailVendedor: (id: string) => void;
  onOpenDetailComprador: (id: string) => void;
  onSendToFriend: (cruce: CruceMatch) => void;
  onToggleDerivado?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  cruce,
  isDerivado = false,
  tramitadorNombre = 'Gestor Operativo',
  onOpenGestoriaScript,
  onOpenDetailVendedor,
  onOpenDetailComprador,
  onSendToFriend,
  onToggleDerivado,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const { vendedor, comprador, match } = cruce;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const encoded = encodeURIComponent(text);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encoded}`);
  };

  const scoreBadgeColor =
    match.score >= 80 ? colors.success : match.score >= 65 ? colors.accent : colors.secondary;

  const diasComprador = getCompradorDias(comprador);
  const isMultiDias = diasComprador.length > 1;
  const compradorBadgeBg = isMultiDias ? '#4F46E5' : colors.libranza[diasComprador[0]] || colors.primary;
  const compradorBadgeTxt = diasComprador.includes('CUALQUIERA') ? 'Cualquiera' : diasComprador.join(' • ');

  return (
    <View style={[styles.card, isDerivado && styles.cardDerivado]}>
      {/* Header del Match */}
      <View style={styles.header}>
        <View style={styles.scoreRow}>
          <View style={[styles.scorePill, { backgroundColor: `${scoreBadgeColor}20`, borderColor: scoreBadgeColor }]}>
            <Text style={[styles.scoreText, { color: scoreBadgeColor }]}>
              ⚡ {match.score}% MATCH {match.nivel}
            </Text>
          </View>
          {comprador.puedeSenalizarYa && (
            <View style={styles.hotPill}>
              <Text style={styles.hotText}>🔥 SEÑALIZA YA</Text>
            </View>
          )}
          {isDerivado && (
            <View style={styles.derivadoBadge}>
              <Text style={styles.derivadoText}>✓ DERIVADO A GESTIÓN</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.flyerBtn}
            onPress={() => setShowExportModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.flyerBtnText}>🖼️ Flyer Digital</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scriptBtn}
            onPress={() => onOpenGestoriaScript(comprador.nombre)}
            activeOpacity={0.8}
          >
            <Text style={styles.scriptBtnText}>📋 Guión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTÓN ESTRELLA: DERIVAR A GESTOR POR WHATSAPP */}
      <TouchableOpacity
        style={[styles.friendBannerBtn, isDerivado && styles.friendBannerBtnDone]}
        onPress={() => onSendToFriend(cruce)}
        activeOpacity={0.85}
      >
        <Text style={styles.friendBtnIcon}>📤</Text>
        <View style={styles.friendBtnContent}>
          <Text style={styles.friendBtnTitle}>
            {isDerivado ? `Reenviar ficha a ${tramitadorNombre || 'Gestor'} (WhatsApp)` : `Derivar operación a ${tramitadorNombre || 'Gestor'} (WhatsApp)`}
          </Text>
          <Text style={styles.friendBtnSubtitle}>
            Ficha técnica estructurada con teléfonos de ambas partes para tramitación de traspaso
          </Text>
        </View>
        <Text style={styles.friendBtnArrow}>→</Text>
      </TouchableOpacity>

      {/* Bloque comparativo: Comprador ↔ Vendedor */}
      <View style={styles.comparisonGrid}>
        {/* COMPRADOR */}
        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => onOpenDetailComprador(comprador.id)}
          activeOpacity={0.7}
        >
          <View style={styles.profileBoxHeader}>
            <Text style={styles.buyerTag}>COMPRADOR</Text>
            <Text style={styles.perfilBadge}>{comprador.perfil}</Text>
          </View>
          <Text style={styles.personName}>{comprador.nombre}</Text>
          <Text style={styles.phoneText}>📞 {comprador.telefono}</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Libranza:</Text>
            <View style={[styles.dayBadge, { backgroundColor: compradorBadgeBg }]}>
              <Text style={styles.dayText}>{compradorBadgeTxt}</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Presupuesto:</Text>
            <Text style={styles.priceBuyer}>{comprador.precioMaximo.toLocaleString()} €</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Coche:</Text>
            <Text style={styles.itemValue}>
              {comprador.buscaConCoche === 'CON_COCHE'
                ? 'Con coche'
                : comprador.buscaConCoche === 'SOLO_LICENCIA'
                ? 'Solo licencia'
                : 'Indiferente'}
            </Text>
          </View>

          <View style={styles.quickContactRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => handleCall(comprador.telefono)}
            >
              <Text style={styles.contactBtnText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, styles.waBtn]}
              onPress={() =>
                handleWhatsApp(
                  comprador.telefono,
                  `Hola ${comprador.nombre}, te contacto porque tenemos una licencia de taxi que encaja con lo que buscas (Libranza ${vendedor.diaLibranza}, ${vendedor.precio.toLocaleString()}€).`
                )
              }
            >
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.dividerArrow}>
          <Text style={styles.arrowText}>⇄</Text>
        </View>

        {/* VENDEDOR */}
        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => onOpenDetailVendedor(vendedor.id)}
          activeOpacity={0.7}
        >
          <View style={styles.profileBoxHeader}>
            <Text style={styles.sellerTag}>VENDEDOR</Text>
            <Text style={styles.perfilBadge}>{vendedor.perfil}</Text>
          </View>
          <Text style={styles.personName}>{vendedor.nombre}</Text>
          <Text style={styles.phoneText}>📞 {vendedor.telefono}</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Libranza:</Text>
            <View style={[styles.dayBadge, { backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary }]}>
              <Text style={styles.dayText}>{vendedor.diaLibranza}</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Pide:</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceSeller}>{vendedor.precio.toLocaleString()} €</Text>
              {vendedor.precioNegociable ? (
                <Text style={styles.negotiablePill}>Negociable</Text>
              ) : (
                <Text style={styles.fixedPill}>Fijo</Text>
              )}
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Coche:</Text>
            <Text style={styles.itemValue}>
              {vendedor.vendeConCoche ? `Sí (${vendedor.vehiculo?.modelo || 'Coche'})` : 'No (Solo Licencia)'}
            </Text>
          </View>

          <View style={styles.quickContactRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => handleCall(vendedor.telefono)}
            >
              <Text style={styles.contactBtnText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, styles.waBtn]}
              onPress={() =>
                handleWhatsApp(
                  vendedor.telefono,
                  `Hola ${vendedor.nombre}, te contacto porque tengo un comprador calificado para tu licencia con libranza ${vendedor.diaLibranza}.`
                )
              }
            >
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* RAZONES Y ALERTAS */}
      <View style={styles.feedbackSection}>
        {match.razones.length > 0 && (
          <View style={styles.reasonsList}>
            {match.razones.map((r, i) => (
              <View key={`r-${i}`} style={styles.reasonRow}>
                <Text style={styles.reasonCheck}>✓</Text>
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        {match.alertas.length > 0 && (
          <View style={styles.alertsList}>
            {match.alertas.map((a, i) => (
              <View key={`a-${i}`} style={styles.alertRow}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{a}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Toggle si ya fue derivado */}
        {onToggleDerivado && (
          <View style={styles.toggleDerivadoRow}>
            <TouchableOpacity
              style={styles.toggleDerivadoBtn}
              onPress={() => onToggleDerivado(cruce.id)}
            >
              <Text style={styles.toggleDerivadoText}>
                {isDerivado ? '↩️ Marcar como pendiente de derivación' : '☑️ Marcar como derivado a gestión'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ExportCardModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        cruce={cruce}
      />
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
    marginBottom: 16,
  },
  cardDerivado: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#111C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  scorePill: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hotPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hotText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },
  derivadoBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  derivadoText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 6,
  },
  flyerBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  flyerBtnText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  scriptBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scriptBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  friendBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
    gap: 10,
  },
  friendBannerBtnDone: {
    backgroundColor: '#1E293B',
    borderColor: colors.border,
  },
  friendBtnIcon: {
    fontSize: 22,
  },
  friendBtnContent: {
    flex: 1,
  },
  friendBtnTitle: {
    color: '#ECFDF5',
    fontSize: 13,
    fontWeight: '800',
  },
  friendBtnSubtitle: {
    color: '#A7F3D0',
    fontSize: 11,
    marginTop: 2,
  },
  friendBtnArrow: {
    color: '#ECFDF5',
    fontSize: 18,
    fontWeight: '800',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 14,
  },
  profileBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dividerArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  arrowText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  profileBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  buyerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  sellerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  perfilBadge: {
    fontSize: 9,
    color: colors.textMuted,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  phoneText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  itemLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemValue: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  dayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  priceBuyer: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.success,
  },
  priceSeller: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  negotiablePill: {
    fontSize: 9,
    color: colors.accent,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '700',
  },
  fixedPill: {
    fontSize: 9,
    color: colors.textMuted,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  waBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  contactBtnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackSection: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  reasonsList: {
    gap: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reasonCheck: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  reasonText: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
  },
  alertsList: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertIcon: {
    fontSize: 11,
  },
  alertText: {
    color: colors.accent,
    fontSize: 12,
    flex: 1,
  },
  toggleDerivadoRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    alignItems: 'center',
  },
  toggleDerivadoBtn: {
    paddingVertical: 4,
  },
  toggleDerivadoText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
