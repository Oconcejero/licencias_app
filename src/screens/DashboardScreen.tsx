import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Vendedor, Comprador, CruceMatch, ConfigTramitador, UserRole } from '../types';
import { colors } from '../theme/colors';
import { StatsCard } from '../components/StatsCard';
import { MatchCard } from '../components/MatchCard';

interface DashboardScreenProps {
  vendedores: Vendedor[];
  compradores: Comprador[];
  matches: CruceMatch[];
  tramitador: ConfigTramitador;
  derivadosIds: string[];
  userRole?: UserRole;
  onNavigateTab: (tab: 'dashboard' | 'matches' | 'vendedores' | 'compradores' | 'ajustes') => void;
  onNewVendedor: () => void;
  onNewComprador: () => void;
  onOpenDetailVendedor: (id: string) => void;
  onOpenDetailComprador: (id: string) => void;
  onSendToFriend: (cruce: CruceMatch) => void;
  onOpenConfigTramitador: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  vendedores,
  compradores,
  matches,
  tramitador,
  derivadosIds,
  userRole = 'ADMIN',
  onNavigateTab,
  onNewVendedor,
  onNewComprador,
  onOpenDetailVendedor,
  onOpenDetailComprador,
  onSendToFriend,
  onOpenConfigTramitador,
}) => {
  const hotCompradores = compradores.filter(c => c.puedeSenalizarYa && c.estado !== 'CERRADO');
  const activeSellers = vendedores.filter(v => v.estado !== 'CERRADO');
  const safeDerivados = derivadosIds || [];
  const pendientesMatches = matches.filter(c => !safeDerivados.includes(c.id));
  const isAdmin = userRole === 'ADMIN';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* BANNER DE BIENVENIDA Y ACCIONES RÁPIDAS */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeGreeting}>Panel de Control Comercial</Text>
          <Text style={styles.welcomeText}>
            Gestión de corretaje de licencias: Registro de perfiles, cálculo de compatibilidad y derivación directa al{' '}
            <Text style={styles.friendHighlight}>{tramitador.nombre || 'Gestor Operativo'}</Text> para formalización de traspaso.
          </Text>
        </View>

        {isAdmin ? (
          <View style={styles.quickActionBtns}>
            <View style={styles.quickActionMainRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnSeller]}
                onPress={onNewVendedor}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>➕ Nueva Licencia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnBuyer]}
                onPress={onNewComprador}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>➕ Nuevo Comprador</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnTramitador]}
              onPress={onOpenConfigTramitador}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                👤 {tramitador.nombre && tramitador.nombre !== 'Gestor Operativo' ? `Gestor: ${tramitador.nombre}` : 'Contacto Gestor Operativo'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.socioBadgeRow}>
            <View style={styles.socioBadge}>
              <Text style={styles.socioBadgeText}>👀 Conectado como Socio (Modo Solo Lectura)</Text>
            </View>
          </View>
        )}
      </View>

      {/* MÉTRICAS PRINCIPALES */}
      <View style={styles.statsGrid}>
        <StatsCard
          title="Pendientes de Derivar"
          value={pendientesMatches.length}
          subtitle={`Listos para ${tramitador.nombre || 'Gestor'}`}
          icon="📤"
          color={colors.accent}
          onPress={() => onNavigateTab('matches')}
        />
        <StatsCard
          title="Compradores Calientes"
          value={hotCompradores.length}
          subtitle="Listos para señalizar YA"
          icon="🔥"
          color={colors.danger}
          onPress={() => onNavigateTab('compradores')}
        />
        <StatsCard
          title="Licencias en Venta"
          value={activeSellers.length}
          subtitle="En cartera activas"
          icon="🚕"
          color={colors.primary}
          onPress={() => onNavigateTab('vendedores')}
        />
        <StatsCard
          title="Total Cruces Detectados"
          value={matches.length}
          subtitle="Afinidades calculadas"
          icon="⚡"
          color={colors.success}
          onPress={() => onNavigateTab('matches')}
        />
      </View>

      {/* SECCIÓN CRUCES DESTACADOS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>⚡ CRUCES LISTOS PARA DERIVAR</Text>
          <Text style={styles.sectionSubtitle}>
            Pulsa en cualquiera para derivar la operación a {tramitador.nombre || 'Gestor'} con informe en WhatsApp
          </Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => onNavigateTab('matches')}
        >
          <Text style={styles.seeAllText}>Ver todos ({matches.length}) →</Text>
        </TouchableOpacity>
      </View>

      {matches.length > 0 ? (
        <View>
          {matches.slice(0, 3).map((cruce) => (
            <MatchCard
              key={cruce.id}
              cruce={cruce}
              isDerivado={derivadosIds.includes(cruce.id)}
              tramitadorNombre={tramitador.nombre}
              onOpenDetailVendedor={onOpenDetailVendedor}
              onOpenDetailComprador={onOpenDetailComprador}
              onSendToFriend={onSendToFriend}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No hay cruces en este instante</Text>
          <Text style={styles.emptyDesc}>
            Añade más vendedores o compradores para que el algoritmo busque afinidades por libranza, precio y condiciones.
          </Text>
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
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeBanner: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  welcomeLeft: {
    flex: 1,
    minWidth: 260,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  welcomeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  friendHighlight: {
    color: colors.success,
    fontWeight: '800',
  },
  quickActionBtns: {
    width: '100%',
    gap: 8,
    marginTop: 10,
  },
  quickActionMainRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSeller: {
    backgroundColor: colors.primary,
  },
  btnBuyer: {
    backgroundColor: colors.success,
  },
  btnTramitador: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    borderWidth: 1,
    flex: undefined,
    width: '100%',
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  socioBadgeRow: {
    marginTop: 4,
  },
  socioBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  socioBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  emptyCard: {
    backgroundColor: colors.surfaceCard,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 400,
  },
  strategyBanner: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginTop: 10,
    gap: 8,
  },
  strategyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  strategyLink: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '700',
  },
  strategyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  strategyText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  highlightText: {
    fontWeight: '800',
    color: colors.success,
  },
});
