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
import { Comprador, Vendedor, DiaLibranza, UserRole, getCompradorDias } from '../types';
import { colors } from '../theme/colors';
import { CompradorCard } from '../components/CompradorCard';

interface CompradoresScreenProps {
  compradores: Comprador[];
  vendedores: Vendedor[];
  userRole?: UserRole;
  onNewComprador: () => void;
  onEditComprador: (comprador: Comprador) => void;
  onDeleteComprador: (id: string) => void;
  onSelectComprador: (id: string) => void;
}

export const CompradoresScreen: React.FC<CompradoresScreenProps> = ({
  compradores,
  vendedores,
  userRole = 'ADMIN',
  onNewComprador,
  onEditComprador,
  onDeleteComprador,
  onSelectComprador,
}) => {
  const { width } = useWindowDimensions();
  const isTwoCols = width >= 768;
  const [search, setSearch] = useState('');
  const [estadoTab, setEstadoTab] = useState<'ACTIVOS' | 'FINALIZADOS' | 'TODOS'>('ACTIVOS');
  const [selectedDia, setSelectedDia] = useState<string>('TODOS');
  const [onlyHot, setOnlyHot] = useState<boolean>(false);
  const [sortPrice, setSortPrice] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');

  const activosCount = useMemo(() => compradores.filter(c => c.estado !== 'CERRADO').length, [compradores]);
  const finalizadosCount = useMemo(() => compradores.filter(c => c.estado === 'CERRADO').length, [compradores]);

  const filteredCompradores = useMemo(() => {
    const list = compradores.filter(c => {
      if (estadoTab === 'ACTIVOS' && c.estado === 'CERRADO') return false;
      if (estadoTab === 'FINALIZADOS' && c.estado !== 'CERRADO') return false;

      if (selectedDia !== 'TODOS') {
        const dias = getCompradorDias(c);
        if (selectedDia === 'CUALQUIERA') {
          if (!dias.includes('CUALQUIERA')) return false;
        } else {
          if (!dias.includes(selectedDia as any) && !dias.includes('CUALQUIERA')) return false;
        }
      }
      if (onlyHot && !c.puedeSenalizarYa) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.nombre.toLowerCase().includes(q);
        const matchPhone = c.telefono.includes(q);
        const matchNotes = c.notas?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchPhone && !matchNotes) return false;
      }

      return true;
    });

    if (sortPrice === 'ASC') {
      return list.slice().sort((a, b) => (a.precioMaximo || 0) - (b.precioMaximo || 0));
    } else if (sortPrice === 'DESC') {
      return list.slice().sort((a, b) => (b.precioMaximo || 0) - (a.precioMaximo || 0));
    }

    return list;
  }, [compradores, search, selectedDia, onlyHot, sortPrice, estadoTab]);

  const DIAS_OPCIONES = ['TODOS', 'CUALQUIERA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'EUROTAXI', 'ELECTRICO_SIN_LIBRANZA'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👥 Cartera de Compradores</Text>
          <Text style={styles.subtitle}>
            {filteredCompradores.length} {filteredCompradores.length === 1 ? 'comprador' : 'compradores'} {estadoTab === 'FINALIZADOS' ? '(🏁 Finalizados)' : estadoTab === 'ACTIVOS' ? '(🟢 Activos)' : ''} {selectedDia !== 'TODOS' ? `• Libranza ${selectedDia}` : ''} {sortPrice === 'ASC' ? '• 📈 Menor a mayor presupuesto' : sortPrice === 'DESC' ? '• 📉 Mayor a menor presupuesto' : ''}
          </Text>
        </View>
        {userRole === 'ADMIN' && (
          <TouchableOpacity
            style={[styles.addBtn, !isTwoCols && { width: '100%', alignItems: 'center', paddingVertical: 11 }]}
            onPress={onNewComprador}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>➕ Añadir Nuevo Comprador</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PESTAÑAS DE ESTADO: ACTIVOS / FINALIZADOS / TODOS EN UNA SOLA LÍNEA */}
      <View style={styles.statusTabsRow}>
        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'ACTIVOS' && styles.statusTabBtnActive]}
          onPress={() => setEstadoTab('ACTIVOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'ACTIVOS' && styles.statusTabTextActive]} numberOfLines={1}>
            🟢 ACTIVOS ({activosCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'FINALIZADOS' && styles.statusTabBtnActiveFinalizado]}
          onPress={() => setEstadoTab('FINALIZADOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'FINALIZADOS' && styles.statusTabTextActiveFinalizado]} numberOfLines={1}>
            🏁 FINALIZADOS ({finalizadosCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'TODOS' && styles.statusTabBtnActive]}
          onPress={() => setEstadoTab('TODOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'TODOS' && styles.statusTabTextActive]} numberOfLines={1}>
            TODOS ({compradores.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comprador, teléfono, notas..."
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

      {/* FILTROS POR LIBRANZA */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasFilterRow}>
        {DIAS_OPCIONES.map(dia => {
          const isActive = selectedDia === dia;
          return (
            <TouchableOpacity
              key={dia}
              style={[
                styles.diaChip,
                isActive && styles.diaChipActive,
                isActive && dia !== 'TODOS' && { backgroundColor: colors.libranza[dia as DiaLibranza] || colors.primary },
              ]}
              onPress={() => setSelectedDia(dia)}
            >
              <Text style={[styles.diaChipText, isActive && styles.diaChipTextActive]}>
                {dia === 'EUROTAXI'
                  ? '♿ EUROTAXI'
                  : dia === 'ELECTRICO_SIN_LIBRANZA'
                  ? '⚡ ELÉCTRICO'
                  : dia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FILTROS RÁPIDOS */}
      <View style={styles.secondaryFiltersRow}>
        <TouchableOpacity
          style={[styles.secChip, onlyHot && styles.secChipHot]}
          onPress={() => setOnlyHot(!onlyHot)}
        >
          <Text style={[styles.secText, onlyHot && styles.secTextHot]}>
            🔥 Solo Señalizan Ya
          </Text>
        </TouchableOpacity>
      </View>

      {/* ORDENACIÓN POR PRESUPUESTO */}
      <View style={styles.sortContainer}>
        <View style={styles.sortHeader}>
          <Text style={styles.sortTitle}>💶 ORDENAR POR PRESUPUESTO:</Text>
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

      {/* LISTA */}
      {filteredCompradores.length > 0 ? (
        <View style={styles.gridContainer}>
          {filteredCompradores.map(comprador => (
            <View key={comprador.id} style={[styles.gridItem, isTwoCols && styles.gridItemTwoCols]}>
              <CompradorCard
                comprador={comprador}
                allVendedores={vendedores}
                onPress={() => onSelectComprador(comprador.id)}
                onEdit={userRole === 'ADMIN' ? () => onEditComprador(comprador) : undefined}
                onDelete={userRole === 'ADMIN' ? () => onDeleteComprador(comprador.id) : undefined}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No hay compradores con estos criterios</Text>
          <Text style={styles.emptySub}>
            Modifica los filtros o pulsa «+ Nuevo Comprador» para añadir una persona en búsqueda.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
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
  addBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
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
  diasFilterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  diaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  diaChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  diaChipTextActive: {
    color: colors.white,
  },
  secondaryFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
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
  secChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secChipHot: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.danger,
  },
  secText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  secTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  secTextHot: {
    color: '#F87171',
    fontWeight: '800',
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
  },
  statusTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    width: '100%',
  },
  statusTabBtn: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  statusTabBtnActiveFinalizado: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  statusTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusTabTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  statusTabTextActiveFinalizado: {
    color: colors.danger,
    fontWeight: '800',
  },
});
