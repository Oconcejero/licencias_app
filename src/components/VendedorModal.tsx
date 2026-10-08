import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { Vendedor, DiaLibranza, TipoPerfil, TipoCarga, CondicionVenta, EstadoRegistro } from '../types';
import { colors } from '../theme/colors';

interface VendedorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (vendedor: Vendedor) => void;
  vendedorToEdit?: Vendedor | null;
}

const DIAS_LIBRANZA: DiaLibranza[] = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

export const VendedorModal: React.FC<VendedorModalProps> = ({
  visible,
  onClose,
  onSave,
  vendedorToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [perfil, setPerfil] = useState<TipoPerfil>('PARTICULAR');
  const [diaLibranza, setDiaLibranza] = useState<DiaLibranza>('LUNES');
  const [cargaLicencia, setCargaLicencia] = useState<TipoCarga>('SIN_CARGA');
  const [detalleCargaLicencia, setDetalleCargaLicencia] = useState('');

  // Vehículo
  const [vendeConCoche, setVendeConCoche] = useState(false);
  const [modeloVehiculo, setModeloVehiculo] = useState('');
  const [anoVehiculo, setAnoVehiculo] = useState('');
  const [kmVehiculo, setKmVehiculo] = useState('');
  const [cargaVehiculo, setCargaVehiculo] = useState<TipoCarga>('SIN_CARGA');
  const [detalleCargaVehiculo, setDetalleCargaVehiculo] = useState('');

  // Precio
  const [precio, setPrecio] = useState('');
  const [precioNegociable, setPrecioNegociable] = useState(false);

  // Condición
  const [condicionVenta, setCondicionVenta] = useState<CondicionVenta>('INMEDIATA');
  const [fechaJubilacion, setFechaJubilacion] = useState('');
  const [detalleCondicion, setDetalleCondicion] = useState('');

  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState<EstadoRegistro>('DISPONIBLE');

  useEffect(() => {
    if (vendedorToEdit) {
      setNombre(vendedorToEdit.nombre);
      setTelefono(vendedorToEdit.telefono);
      setPerfil(vendedorToEdit.perfil);
      setDiaLibranza(vendedorToEdit.diaLibranza);
      setCargaLicencia(vendedorToEdit.cargaLicencia);
      setDetalleCargaLicencia(vendedorToEdit.detalleCargaLicencia || '');
      setVendeConCoche(vendedorToEdit.vendeConCoche);
      if (vendedorToEdit.vehiculo) {
        setModeloVehiculo(vendedorToEdit.vehiculo.modelo);
        setAnoVehiculo(String(vendedorToEdit.vehiculo.anoMatriculacion));
        setKmVehiculo(String(vendedorToEdit.vehiculo.kilometros));
        setCargaVehiculo(vendedorToEdit.vehiculo.carga);
        setDetalleCargaVehiculo(vendedorToEdit.vehiculo.detalleCarga || '');
      } else {
        setModeloVehiculo('');
        setAnoVehiculo('');
        setKmVehiculo('');
        setCargaVehiculo('SIN_CARGA');
        setDetalleCargaVehiculo('');
      }
      setPrecio(vendedorToEdit.precio ? String(vendedorToEdit.precio) : '');
      setPrecioNegociable(vendedorToEdit.precioNegociable);
      setCondicionVenta(vendedorToEdit.condicionVenta);
      setFechaJubilacion(vendedorToEdit.fechaJubilacion || '');
      setDetalleCondicion(vendedorToEdit.detalleCondicion || '');
      setNotas(vendedorToEdit.notas || '');
      setEstado(vendedorToEdit.estado);
    } else {
      // Valores por defecto para nuevo
      setNombre('');
      setTelefono('');
      setPerfil('PARTICULAR');
      setDiaLibranza('LUNES');
      setCargaLicencia('SIN_CARGA');
      setDetalleCargaLicencia('');
      setVendeConCoche(false);
      setModeloVehiculo('');
      setAnoVehiculo('');
      setKmVehiculo('');
      setCargaVehiculo('SIN_CARGA');
      setDetalleCargaVehiculo('');
      setPrecio('');
      setPrecioNegociable(false);
      setCondicionVenta('INMEDIATA');
      setFechaJubilacion('');
      setDetalleCondicion('');
      setNotas('');
      setEstado('DISPONIBLE');
    }
  }, [vendedorToEdit, visible]);

  const handleSave = () => {
    if (!nombre.trim()) {
      alert('Por favor indica el nombre del vendedor');
      return;
    }
    const precioNum = parseFloat(precio.replace(/[^\d.]/g, '')) || 0;
    if (precioNum <= 0) {
      alert('Por favor introduce un precio válido');
      return;
    }

    const item: Vendedor = {
      id: vendedorToEdit ? vendedorToEdit.id : `v-${Date.now()}`,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      fechaCreacion: vendedorToEdit ? vendedorToEdit.fechaCreacion : new Date().toISOString(),
      perfil,
      diaLibranza,
      cargaLicencia,
      detalleCargaLicencia: cargaLicencia !== 'SIN_CARGA' ? detalleCargaLicencia.trim() : undefined,
      vendeConCoche,
      vehiculo: vendeConCoche
        ? {
            modelo: modeloVehiculo.trim() || 'Vehículo Taxi',
            anoMatriculacion: anoVehiculo.trim() || new Date().getFullYear().toString(),
            kilometros: kmVehiculo.trim() || '0',
            carga: cargaVehiculo,
            detalleCarga: cargaVehiculo !== 'SIN_CARGA' ? detalleCargaVehiculo.trim() : undefined,
          }
        : undefined,
      precio: precioNum,
      precioNegociable,
      condicionVenta,
      fechaJubilacion: condicionVenta === 'JUBILACION' ? fechaJubilacion.trim() : undefined,
      detalleCondicion: condicionVenta !== 'INMEDIATA' ? detalleCondicion.trim() : undefined,
      notas: notas.trim(),
      estado,
    };

    onSave(item);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {vendedorToEdit ? '✏️ Editar Vendedor' : '➕ Nuevo Vendedor / Licencia'}
              </Text>
              <Text style={styles.subtitle}>Introduce los datos de la licencia para venta</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. DATOS DE CONTACTO Y PERFIL</Text>
              
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Ej. Juan Pérez"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="600 000 000"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Vendedor</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, perfil === 'PARTICULAR' && styles.selectorBtnActive]}
                    onPress={() => setPerfil('PARTICULAR')}
                  >
                    <Text style={[styles.selectorText, perfil === 'PARTICULAR' && styles.selectorTextActive]}>
                      Particular
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, perfil === 'INTERMEDIARIO' && styles.selectorBtnActive]}
                    onPress={() => setPerfil('INTERMEDIARIO')}
                  >
                    <Text style={[styles.selectorText, perfil === 'INTERMEDIARIO' && styles.selectorTextActive]}>
                      Intermediario / Gestor
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* SECCIÓN 2: DATOS DE LA LICENCIA */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. DATOS DE LA LICENCIA</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Día de Libranza</Text>
                <View style={styles.diasRow}>
                  {DIAS_LIBRANZA.map(dia => {
                    const isSelected = diaLibranza === dia;
                    return (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.diaBtn,
                          isSelected && { backgroundColor: colors.libranza[dia] || colors.primary, borderColor: colors.libranza[dia] },
                        ]}
                        onPress={() => setDiaLibranza(dia)}
                      >
                        <Text style={[styles.diaBtnText, isSelected && styles.diaBtnTextActive]}>
                          {dia}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Carga de la Licencia (Préstamo / Otro)</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, cargaLicencia === 'SIN_CARGA' && styles.selectorBtnActive]}
                    onPress={() => setCargaLicencia('SIN_CARGA')}
                  >
                    <Text style={[styles.selectorText, cargaLicencia === 'SIN_CARGA' && styles.selectorTextActive]}>
                      Sin Carga (Libre)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, cargaLicencia === 'PRESTAMO' && styles.selectorBtnActive]}
                    onPress={() => setCargaLicencia('PRESTAMO')}
                  >
                    <Text style={[styles.selectorText, cargaLicencia === 'PRESTAMO' && styles.selectorTextActive]}>
                      Con Préstamo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, cargaLicencia === 'OTRO' && styles.selectorBtnActive]}
                    onPress={() => setCargaLicencia('OTRO')}
                  >
                    <Text style={[styles.selectorText, cargaLicencia === 'OTRO' && styles.selectorTextActive]}>
                      Otra Carga
                    </Text>
                  </TouchableOpacity>
                </View>

                {cargaLicencia !== 'SIN_CARGA' && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={detalleCargaLicencia}
                    onChangeText={setDetalleCargaLicencia}
                    placeholder="Detalle de la carga (banco, importe pendiente, mensualidad...)"
                    placeholderTextColor={colors.textSubtle}
                  />
                )}
              </View>
            </View>

            {/* SECCIÓN 3: VEHÍCULO */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.sectionTitle}>3. VEHÍCULO</Text>
                  <Text style={styles.sublabel}>¿Vende la licencia junto con el vehículo?</Text>
                </View>
                <Switch
                  value={vendeConCoche}
                  onValueChange={setVendeConCoche}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>

              {vendeConCoche && (
                <View style={styles.subBox}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Modelo del vehículo</Text>
                    <TextInput
                      style={styles.input}
                      value={modeloVehiculo}
                      onChangeText={setModeloVehiculo}
                      placeholder="Ej. Toyota Corolla Touring Sports / Prius Plus / Skoda..."
                      placeholderTextColor={colors.textSubtle}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Año de Matriculación</Text>
                      <TextInput
                        style={styles.input}
                        value={anoVehiculo}
                        onChangeText={setAnoVehiculo}
                        placeholder="2022"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Kilómetros</Text>
                      <TextInput
                        style={styles.input}
                        value={kmVehiculo}
                        onChangeText={setKmVehiculo}
                        placeholder="95.000"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Carga del Vehículo</Text>
                    <View style={styles.selectorRow}>
                      <TouchableOpacity
                        style={[styles.selectorBtn, cargaVehiculo === 'SIN_CARGA' && styles.selectorBtnActive]}
                        onPress={() => setCargaVehiculo('SIN_CARGA')}
                      >
                        <Text style={[styles.selectorText, cargaVehiculo === 'SIN_CARGA' && styles.selectorTextActive]}>
                          Pagado / Libre
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.selectorBtn, cargaVehiculo === 'PRESTAMO' && styles.selectorBtnActive]}
                        onPress={() => setCargaVehiculo('PRESTAMO')}
                      >
                        <Text style={[styles.selectorText, cargaVehiculo === 'PRESTAMO' && styles.selectorTextActive]}>
                          Financiación / Reserva dominio
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {cargaVehiculo !== 'SIN_CARGA' && (
                      <TextInput
                        style={[styles.input, { marginTop: 8 }]}
                        value={detalleCargaVehiculo}
                        onChangeText={setDetalleCargaVehiculo}
                        placeholder="Importe o cuota pendiente del coche..."
                        placeholderTextColor={colors.textSubtle}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* SECCIÓN 4: PRECIO Y CONDICIONES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. PRECIO Y CONDICIONES GENERALES</Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                  <Text style={styles.label}>Precio de Venta (€) *</Text>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    value={precio}
                    onChangeText={setPrecio}
                    placeholder="Ej. 135.000"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, justifyContent: 'center' }]}>
                  <Text style={styles.label}>¿Es Negociable?</Text>
                  <View style={styles.switchInline}>
                    <Text style={{ color: precioNegociable ? colors.accent : colors.textMuted, fontWeight: '700' }}>
                      {precioNegociable ? 'Negociable' : 'Precio Fijo'}
                    </Text>
                    <Switch
                      value={precioNegociable}
                      onValueChange={setPrecioNegociable}
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor={colors.white}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Condición de Venta</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, condicionVenta === 'INMEDIATA' && styles.selectorBtnActive]}
                    onPress={() => setCondicionVenta('INMEDIATA')}
                  >
                    <Text style={[styles.selectorText, condicionVenta === 'INMEDIATA' && styles.selectorTextActive]}>
                      Inmediata
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, condicionVenta === 'JUBILACION' && styles.selectorBtnActive]}
                    onPress={() => setCondicionVenta('JUBILACION')}
                  >
                    <Text style={[styles.selectorText, condicionVenta === 'JUBILACION' && styles.selectorTextActive]}>
                      Tras Jubilación
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, condicionVenta === 'OTRA' && styles.selectorBtnActive]}
                    onPress={() => setCondicionVenta('OTRA')}
                  >
                    <Text style={[styles.selectorText, condicionVenta === 'OTRA' && styles.selectorTextActive]}>
                      Otra Condición
                    </Text>
                  </TouchableOpacity>
                </View>

                {condicionVenta === 'JUBILACION' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.sublabel}>Fecha prevista de jubilación:</Text>
                    <TextInput
                      style={styles.input}
                      value={fechaJubilacion}
                      onChangeText={setFechaJubilacion}
                      placeholder="Ej. 30/11/2026 o Finales de año..."
                      placeholderTextColor={colors.textSubtle}
                    />
                  </View>
                )}

                {condicionVenta === 'OTRA' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.sublabel}>Especificar condición:</Text>
                    <TextInput
                      style={styles.input}
                      value={detalleCondicion}
                      onChangeText={setDetalleCondicion}
                      placeholder="Ej. Entrega sujeta a entrega de piso / fecha especial..."
                      placeholderTextColor={colors.textSubtle}
                    />
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notas}
                  onChangeText={setNotas}
                  placeholder="Detalles sobre el estado de la licencia, taxímetro, revisiones..."
                  placeholderTextColor={colors.textSubtle}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, estado === 'DISPONIBLE' && styles.selectorBtnActive]}
                    onPress={() => setEstado('DISPONIBLE')}
                  >
                    <Text style={[styles.selectorText, estado === 'DISPONIBLE' && styles.selectorTextActive]}>
                      Disponible
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, estado === 'EN_NEGOCIACION' && styles.selectorBtnActive]}
                    onPress={() => setEstado('EN_NEGOCIACION')}
                  >
                    <Text style={[styles.selectorText, estado === 'EN_NEGOCIACION' && styles.selectorTextActive]}>
                      En Negociación
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, estado === 'CERRADO' && styles.selectorBtnActive]}
                    onPress={() => setEstado('CERRADO')}
                  >
                    <Text style={[styles.selectorText, estado === 'CERRADO' && styles.selectorTextActive]}>
                      Cerrado / Vendida
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer de guardar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {vendedorToEdit ? 'Guardar Cambios' : 'Registrar Vendedor'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 680,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceHighlight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollArea: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  priceInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  selectorBtn: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectorBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  diasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  diaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  diaBtnText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  diaBtnTextActive: {
    color: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
    marginTop: 4,
  },
  switchInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surfaceHighlight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
