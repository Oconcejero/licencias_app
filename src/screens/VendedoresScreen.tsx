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
import { Vendedor, Comprador, DiaLibranza, UserRole } from '../types';
import { colors } from '../theme/colors';
import { VendedorCard } from '../components/VendedorCard';

interface VendedoresScreenProps {
  vendedores: Vendedor[];
  compradores: Comprador[];
  userRole?: UserRole;
  onNewVendedor: () => void;
  onEditVendedor: (vendedor: Vendedor) => void;
  onDeleteVendedor: (id: string) => void;
  onSelectVendedor: (id: string) => void;
}

export const VendedoresScreen: React.FC<VendedoresScreenProps> = ({
  vendedores,
  compradores,
  userRole = 'ADMIN',
  onNewVendedor,
  onEditVendedor,
  onDeleteVendedor,
  onSelectVendedor,
}) => {
  const { width } = useWindowDimensions();
  const isTwoCols = width >= 768;
  const [search, setSearch] = useState('');
  const [estadoTab, setEstadoTab] = useState<'ACTIVOS' | 'CONCLUIDOS' | 'TODOS'>('ACTIVOS');
  const [selectedDia, setSelectedDia] = useState<string>('TODOS');
  const [filterCoche, setFilterCoche] = useState<'TODOS' | 'CON_COCHE' | 'SIN_COCHE'>('TODOS');
  const [sortPrice, setSortPrice] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');

  const activosCount = useMemo(() => vendedores.filter(v => v.estado !== 'CERRADO').length, [vendedores]);
  const concluidosCount = useMemo(() => vendedores.filter(v => v.estado === 'CERRADO').length, [vendedores]);

  const filteredVendedores = useMemo(() => {
    const list = vendedores.filter(v => {
      if (estadoTab === 'ACTIVOS' && v.estado === 'CERRADO') return false;
      if (estadoTab === 'CONCLUIDOS' && v.estado !== 'CERRADO') return false;
      if (selectedDia !== 'TODOS' && v.diaLibranza !== selectedDia) return false;
      if (filterCoche === 'CON_COCHE' && !v.vendeConCoche) return false;
      if (filterCoche === 'SIN_COCHE' && v.vendeConCoche) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = v.nombre.toLowerCase().includes(q);
        const matchPhone = v.telefono.includes(q);
        const matchCar = v.vehiculo?.modelo.toLowerCase().includes(q) ?? false;
        const matchNotes = v.notas?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchPhone && !matchCar && !matchNotes) return false;
      }

      return true;
    });

    if (sortPrice === 'ASC') {
      return list.slice().sort((a, b) => {
        const priceA = (filterCoche === 'CON_COCHE' && a.precioConCoche) ? a.precioConCoche : a.precio;
        const priceB = (filterCoche === 'CON_COCHE' && b.precioConCoche) ? b.precioConCoche : b.precio;
        return (priceA || 0) - (priceB || 0);
      });
    } else if (sortPrice === 'DESC') {
      return list.slice().sort((a, b) => {
        const priceA = (filterCoche === 'CON_COCHE' && a.precioConCoche) ? a.precioConCoche : a.precio;
        const priceB = (filterCoche === 'CON_COCHE' && b.precioConCoche) ? b.precioConCoche : b.precio;
        return (priceB || 0) - (priceA || 0);
      });
    }

    return list;
  }, [vendedores, search, selectedDia, filterCoche, sortPrice, estadoTab]);

  const DIAS_OPCIONES = ['TODOS', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'EUROTAXI', 'ELECTRICO_SIN_LIBRANZA'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🚕 Cartera de Vendedores (Licencias)</Text>
          <Text style={styles.subtitle}>
            {filteredVendedores.length} {filteredVendedores.length === 1 ? 'licencia' : 'licencias'} {estadoTab === 'CONCLUIDOS' ? '(🏁 Concluidas / Finalizadas)' : estadoTab === 'ACTIVOS' ? '(🟢 Activas)' : ''} {selectedDia !== 'TODOS' ? `• Libranza ${selectedDia}` : ''} {sortPrice === 'ASC' ? '• 📈 Menor a mayor' : sortPrice === 'DESC' ? '• 📉 Mayor a menor' : ''}
          </Text>
        </View>
        {userRole === 'ADMIN' && (
          <TouchableOpacity
            style={[styles.addBtn, !isTwoCols && { width: '100%', alignItems: 'center', paddingVertical: 11 }]}
            onPress={onNewVendedor}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>➕ Añadir Nueva Licencia (Vendedor)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PESTAÑAS DE ESTADO: ACTIVOS vs CONCLUIDOS / FINALIZADOS */}
      <View style={styles.statusTabsRow}>
        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'ACTIVOS' && styles.statusTabBtnActive]}
          onPress={() => setEstadoTab('ACTIVOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'ACTIVOS' && styles.statusTabTextActive]}>
            🟢 Activas ({activosCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'CONCLUIDOS' && styles.statusTabBtnActiveConcluido]}
          onPress={() => setEstadoTab('CONCLUIDOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'CONCLUIDOS' && styles.statusTabTextActiveConcluido]}>
            🏁 Concluidas / Finalizadas ({concluidosCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusTabBtn, estadoTab === 'TODOS' && styles.statusTabBtnActive]}
          onPress={() => setEstadoTab('TODOS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusTabText, estadoTab === 'TODOS' && styles.statusTabTextActive]}>
            Todas ({vendedores.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por vendedor, teléfono, modelo de coche, notas..."
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

      {/* FILTROS POR VEHICULO */}
      <View style={styles.secondaryFiltersRow}>
        <TouchableOpacity
          style={[styles.secChip, filterCoche === 'TODOS' && styles.secChipActive]}
          onPress={() => setFilterCoche('TODOS')}
        >
          <Text style={[styles.secText, filterCoche === 'TODOS' && styles.secTextActive]}>
            Todos los tipos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secChip, filterCoche === 'CON_COCHE' && styles.secChipActive]}
          onPress={() => setFilterCoche('CON_COCHE')}
        >
          <Text style={[styles.secText, filterCoche === 'CON_COCHE' && styles.secTextActive]}>
            🚗 Solo con coche
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secChip, filterCoche === 'SIN_COCHE' && styles.secChipActive]}
          onPress={() => setFilterCoche('SIN_COCHE')}
        >
          <Text style={[styles.secText, filterCoche === 'SIN_COCHE' && styles.secTextActive]}>
            📄 Solo licencia
          </Text>
        </TouchableOpacity>
      </View>

      {/* ORDENACIÓN POR PRECIO */}
      <View style={styles.sortContainer}>
        <View style={styles.sortHeader}>
          <Text style={styles.sortTitle}>💶 ORDENAR POR PRECIO:</Text>
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
      {filteredVendedores.length > 0 ? (
        <View style={styles.gridContainer}>
          {filteredVendedores.map(vendedor => (
            <View key={vendedor.id} style={[styles.gridItem, isTwoCols && styles.gridItemTwoCols]}>
              <VendedorCard
                vendedor={vendedor}
                allCompradores={compradores}
                onPress={() => onSelectVendedor(vendedor.id)}
                onEdit={userRole === 'ADMIN' ? () => onEditVendedor(vendedor) : undefined}
                onDelete={userRole === 'ADMIN' ? () => onDeleteVendedor(vendedor.id) : undefined}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🚕</Text>
          <Text style={styles.emptyTitle}>No hay licencias con estos criterios</Text>
          <Text style={styles.emptySub}>
            Modifica los filtros o pulsa «+ Nueva Licencia» para añadir un nuevo vendedor.
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
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
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statusTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTabBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  statusTabBtnActiveConcluido: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  statusTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTabTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  statusTabTextActiveConcluido: {
    color: colors.danger,
    fontWeight: '800',
  },
});
