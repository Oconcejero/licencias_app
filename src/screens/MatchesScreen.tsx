import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { CruceMatch, ConfigTramitador } from '../types';
import { colors } from '../theme/colors';
import { MatchCard } from '../components/MatchCard';

interface MatchesScreenProps {
  matches: CruceMatch[];
  tramitador: ConfigTramitador;
  derivadosIds: string[];
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
  onOpenDetailVendedor,
  onOpenDetailComprador,
  onSendToFriend,
  onToggleDerivado,
}) => {
  const { width } = useWindowDimensions();
  const isTwoCols = width >= 768;
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [search, setSearch] = useState('');
  const [sortPrice, setSortPrice] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');

  const safeDerivados = useMemo(() => derivadosIds || [], [derivadosIds]);

  const filteredMatches = useMemo(() => {
    const list = matches.filter(c => {
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

    if (sortPrice === 'ASC') {
      return list.slice().sort((a, b) => {
        const pA = a.match.precioEvaluado || a.vendedor.precio || 0;
        const pB = b.match.precioEvaluado || b.vendedor.precio || 0;
        return pA - pB;
      });
    } else if (sortPrice === 'DESC') {
      return list.slice().sort((a, b) => {
        const pA = a.match.precioEvaluado || a.vendedor.precio || 0;
        const pB = b.match.precioEvaluado || b.vendedor.precio || 0;
        return pB - pA;
      });
    }

    return list;
  }, [matches, filter, search, safeDerivados, sortPrice]);

  const pendientesCount = matches.filter(c => !safeDerivados.includes(c.id)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚡ Cruces Inteligentes & Avisos</Text>
          <Text style={styles.subtitle}>
            {filteredMatches.length} {filteredMatches.length === 1 ? 'cruce detectado' : 'cruces detectados'} {sortPrice === 'ASC' ? '• 📈 Menor a mayor precio' : sortPrice === 'DESC' ? '• 📉 Mayor a menor precio' : ''}
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

      {/* ORDENACIÓN POR PRECIO */}
      <View style={styles.sortContainer}>
        <View style={styles.sortHeader}>
          <Text style={styles.sortTitle}>💶 ORDENAR POR PRECIO DE LA OPERACIÓN:</Text>
          {sortPrice !== 'NONE' && (
            <TouchableOpacity onPress={() => setSortPrice('NONE')} style={styles.clearSortBtn}>
              <Text style={styles.clearSortText}>Resetear orden ✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.sortButtonsRow}>
          <TouchableOpacity
            style={[styles.sortBtn, sortPrice === 'ASC' && styles.sortBtnActiveAsc]}
            onPress={() => setSortPrice(prev => prev === 'ASC' ? 'NONE' : 'ASC')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortBtnText, sortPrice === 'ASC' && styles.sortBtnTextActive]}>
              📈 Menor a Mayor (€ → €€€) {sortPrice === 'ASC' ? '✓' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn, sortPrice === 'DESC' && styles.sortBtnActiveDesc]}
            onPress={() => setSortPrice(prev => prev === 'DESC' ? 'NONE' : 'DESC')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortBtnText, sortPrice === 'DESC' && styles.sortBtnTextActive]}>
              📉 Mayor a Menor (€€€ → €) {sortPrice === 'DESC' ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTADO DE MATCHES */}
      {filteredMatches.length > 0 ? (
        <View style={styles.gridContainer}>
          {filteredMatches.map(cruce => (
            <View key={cruce.id} style={[styles.gridItem, isTwoCols && styles.gridItemTwoCols]}>
              <MatchCard
                cruce={cruce}
                isDerivado={derivadosIds.includes(cruce.id)}
                tramitadorNombre={tramitador.nombre}
                onOpenDetailVendedor={onOpenDetailVendedor}
                onOpenDetailComprador={onOpenDetailComprador}
                onSendToFriend={onSendToFriend}
                onToggleDerivado={onToggleDerivado}
              />
            </View>
          ))}
        </View>
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
    maxWidth: 1350,
    alignSelf: 'center',
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  gridItem: {
    width: '100%',
  },
  gridItemTwoCols: {
    width: '49%',
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
    marginBottom: 10,
  },
  sortContainer: {
    backgroundColor: colors.surfaceCard,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    gap: 8,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  clearSortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearSortText: {
    fontSize: 10,
    color: '#F87171',
    fontWeight: '700',
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtnActiveAsc: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  sortBtnActiveDesc: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: colors.primary,
  },
  sortBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  sortBtnTextActive: {
    color: colors.white,
    fontWeight: '800',
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
