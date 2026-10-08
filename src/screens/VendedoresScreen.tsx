import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Vendedor, Comprador, DiaLibranza } from '../types';
import { colors } from '../theme/colors';
import { VendedorCard } from '../components/VendedorCard';

interface VendedoresScreenProps {
  vendedores: Vendedor[];
  compradores: Comprador[];
  onNewVendedor: () => void;
  onEditVendedor: (vendedor: Vendedor) => void;
  onDeleteVendedor: (id: string) => void;
  onSelectVendedor: (id: string) => void;
}

export const VendedoresScreen: React.FC<VendedoresScreenProps> = ({
  vendedores,
  compradores,
  onNewVendedor,
  onEditVendedor,
  onDeleteVendedor,
  onSelectVendedor,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDia, setSelectedDia] = useState<string>('TODOS');
  const [filterCoche, setFilterCoche] = useState<'TODOS' | 'CON_COCHE' | 'SIN_COCHE'>('TODOS');

  const filteredVendedores = useMemo(() => {
    return vendedores.filter(v => {
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
  }, [vendedores, search, selectedDia, filterCoche]);

  const DIAS_OPCIONES = ['TODOS', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🚕 Cartera de Vendedores (Licencias)</Text>
          <Text style={styles.subtitle}>
            {vendedores.length} {vendedores.length === 1 ? 'licencia registrada' : 'licencias registradas'} en la base de datos
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onNewVendedor} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Nueva Licencia</Text>
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
                {dia}
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

      {/* LISTA */}
      {filteredVendedores.length > 0 ? (
        filteredVendedores.map(vendedor => (
          <VendedorCard
            key={vendedor.id}
            vendedor={vendedor}
            allCompradores={compradores}
            onPress={() => onSelectVendedor(vendedor.id)}
            onEdit={() => onEditVendedor(vendedor)}
            onDelete={() => onDeleteVendedor(vendedor.id)}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🚕</Text>
          <Text style={styles.emptyTitle}>No hay licencias con estos criterios</Text>
          <Text style={styles.emptySub}>
            Modifica los filtros o pulsa "+ Nueva Licencia" para añadir un nuevo vendedor.
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
    marginBottom: 16,
    flexWrap: 'wrap',
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
});
