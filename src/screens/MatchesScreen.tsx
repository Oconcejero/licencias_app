import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { CruceMatch, ConfigTramitador } from '../types';
import { colors } from '../theme/colors';
import { MatchCard } from '../components/MatchCard';

interface MatchesScreenProps {
  matches: CruceMatch[];
  tramitador: ConfigTramitador;
  derivadosIds: string[];
  onOpenGestoriaScript: (nombre: string) => void;
  onOpenDetailVendedor: (id: string) => void;
  onOpenDetailComprador: (id: string) => void;
  onSendToFriend: (cruce: CruceMatch) => void;
  onToggleDerivado: (matchId: string) => void;
}

type FilterType = 'TODOS' | 'PENDIENTES' | 'EXCELENTES' | 'SENALIZA_YA' | 'NEGOCIABLES';

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  matches,
  tramitador,
  derivadosIds,
  onOpenGestoriaScript,
  onOpenDetailVendedor,
  onOpenDetailComprador,
  onSendToFriend,
  onToggleDerivado,
}) => {
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [search, setSearch] = useState('');

  const safeDerivados = derivadosIds || [];

  const filteredMatches = useMemo(() => {
    return matches.filter(c => {
      const isDerivado = safeDerivados.includes(c.id);

      // Filtro de categoría
      if (filter === 'PENDIENTES' && isDerivado) return false;
      if (filter === 'EXCELENTES' && c.match.score < 80) return false;
      if (filter === 'SENALIZA_YA' && !c.comprador.puedeSenalizarYa) return false;
      if (filter === 'NEGOCIABLES' && !c.vendedor.precioNegociable) return false;

      // Filtro de texto
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchVendedor =
          c.vendedor.nombre.toLowerCase().includes(q) ||
          c.vendedor.diaLibranza.toLowerCase().includes(q) ||
          (c.vendedor.vehiculo?.modelo.toLowerCase().includes(q) ?? false);
        const matchComprador =
          c.comprador.nombre.toLowerCase().includes(q) ||
          c.comprador.diaLibranzaDeseada.toLowerCase().includes(q);

        if (!matchVendedor && !matchComprador) return false;
      }

      return true;
    });
  }, [matches, filter, search, derivadosIds]);

  const pendientesCount = matches.filter(c => !safeDerivados.includes(c.id)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚡ Cruces Inteligentes & Avisos</Text>
          <Text style={styles.subtitle}>
            Detecta coincidencias comerciales y derívalas a {tramitador.nombre || 'Gestión'} en 1 clic
          </Text>
        </View>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, día de libranza, vehículo..."
          placeholderTextColor={colors.textSubtle}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS RÁPIDOS */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'TODOS' && styles.filterChipActive]}
          onPress={() => setFilter('TODOS')}
        >
          <Text style={[styles.filterText, filter === 'TODOS' && styles.filterTextActive]}>
            Todos ({matches.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'PENDIENTES' && styles.filterChipActive, filter === 'PENDIENTES' && { backgroundColor: colors.accent }]}
          onPress={() => setFilter('PENDIENTES')}
        >
          <Text style={[styles.filterText, filter === 'PENDIENTES' && styles.filterTextActive]}>
            ⏳ Pendientes de Pasar ({pendientesCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'EXCELENTES' && styles.filterChipActive]}
          onPress={() => setFilter('EXCELENTES')}
        >
          <Text style={[styles.filterText, filter === 'EXCELENTES' && styles.filterTextActive]}>
            ⭐ Excelentes (≥80%)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'SENALIZA_YA' && styles.filterChipActive]}
          onPress={() => setFilter('SENALIZA_YA')}
        >
          <Text style={[styles.filterText, filter === 'SENALIZA_YA' && styles.filterTextActive]}>
            🔥 Señalizan Ya
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'NEGOCIABLES' && styles.filterChipActive]}
          onPress={() => setFilter('NEGOCIABLES')}
        >
          <Text style={[styles.filterText, filter === 'NEGOCIABLES' && styles.filterTextActive]}>
            💶 Negociables
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTADO DE MATCHES */}
      {filteredMatches.length > 0 ? (
        filteredMatches.map(cruce => (
          <MatchCard
            key={cruce.id}
            cruce={cruce}
            isDerivado={derivadosIds.includes(cruce.id)}
            tramitadorNombre={tramitador.nombre}
            onOpenGestoriaScript={onOpenGestoriaScript}
            onOpenDetailVendedor={onOpenDetailVendedor}
            onOpenDetailComprador={onOpenDetailComprador}
            onSendToFriend={onSendToFriend}
            onToggleDerivado={onToggleDerivado}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No se han encontrado cruces con este filtro</Text>
          <Text style={styles.emptySub}>
            Prueba a seleccionar otro filtro o añade nuevos compradores y vendedores a la base de datos.
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
  },
  clearSearch: {
    color: colors.textMuted,
    fontSize: 14,
    padding: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: colors.surfaceCard,
    padding: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 420,
  },
});
