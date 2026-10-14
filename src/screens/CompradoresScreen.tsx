import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
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
  onOpenGestoriaScript: (nombre: string) => void;
}

export const CompradoresScreen: React.FC<CompradoresScreenProps> = ({
  compradores,
  vendedores,
  userRole = 'ADMIN',
  onNewComprador,
  onEditComprador,
  onDeleteComprador,
  onSelectComprador,
  onOpenGestoriaScript,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDia, setSelectedDia] = useState<string>('TODOS');
  const [onlyHot, setOnlyHot] = useState<boolean>(false);
  const [filterGestoria, setFilterGestoria] = useState<'TODOS' | 'SIN_GESTORIA' | 'CON_GESTORIA'>('TODOS');

  const filteredCompradores = useMemo(() => {
    return compradores.filter(c => {
      if (selectedDia !== 'TODOS') {
        const dias = getCompradorDias(c);
        if (selectedDia === 'CUALQUIERA') {
          if (!dias.includes('CUALQUIERA')) return false;
        } else {
          if (!dias.includes(selectedDia as any) && !dias.includes('CUALQUIERA')) return false;
        }
      }
      if (onlyHot && !c.puedeSenalizarYa) return false;
      if (filterGestoria === 'SIN_GESTORIA' && c.tieneGestoria) return false;
      if (filterGestoria === 'CON_GESTORIA' && !c.tieneGestoria) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.nombre.toLowerCase().includes(q);
        const matchPhone = c.telefono.includes(q);
        const matchNotes = c.notas?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchPhone && !matchNotes) return false;
      }

      return true;
    });
  }, [compradores, search, selectedDia, onlyHot, filterGestoria]);

  const DIAS_OPCIONES = ['TODOS', 'CUALQUIERA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'EUROTAXI', 'ELECTRICO_SIN_LIBRANZA'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👥 Cartera de Compradores</Text>
          <Text style={styles.subtitle}>
            {compradores.length} {compradores.length === 1 ? 'comprador registrado' : 'compradores registrados'} en búsqueda activa o bolsa de espera
          </Text>
        </View>
        {userRole === 'ADMIN' && (
          <TouchableOpacity style={styles.addBtn} onPress={onNewComprador} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Nuevo Comprador</Text>
          </TouchableOpacity>
        )}
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

        <TouchableOpacity
          style={[styles.secChip, filterGestoria === 'SIN_GESTORIA' && styles.secChipActive]}
          onPress={() => setFilterGestoria(filterGestoria === 'SIN_GESTORIA' ? 'TODOS' : 'SIN_GESTORIA')}
        >
          <Text style={[styles.secText, filterGestoria === 'SIN_GESTORIA' && styles.secTextActive]}>
            ⚠️ Sin Gestoría (Ofrecer VIP 6.000€)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secChip, filterGestoria === 'CON_GESTORIA' && styles.secChipActive]}
          onPress={() => setFilterGestoria(filterGestoria === 'CON_GESTORIA' ? 'TODOS' : 'CON_GESTORIA')}
        >
          <Text style={[styles.secText, filterGestoria === 'CON_GESTORIA' && styles.secTextActive]}>
            ✓ Con Gestoría
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      {filteredCompradores.length > 0 ? (
        filteredCompradores.map(comprador => (
          <CompradorCard
            key={comprador.id}
            comprador={comprador}
            allVendedores={vendedores}
            onPress={() => onSelectComprador(comprador.id)}
            onEdit={userRole === 'ADMIN' ? () => onEditComprador(comprador) : undefined}
            onDelete={userRole === 'ADMIN' ? () => onDeleteComprador(comprador.id) : undefined}
            onOpenGestoriaScript={() => onOpenGestoriaScript(comprador.nombre)}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No hay compradores con estos criterios</Text>
          <Text style={styles.emptySub}>
            Modifica los filtros o pulsa "+ Nuevo Comprador" para añadir una persona en búsqueda.
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
});
