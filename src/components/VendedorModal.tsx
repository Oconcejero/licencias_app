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
import {
  Vendedor,
  DiaLibranza,
  TipoPerfil,
  TipoCarga,
  CondicionVenta,
  EstadoRegistro,
  CanalContacto,
  TurnoDescanso,
  ModalidadVentaCoche,
} from '../types';
import { colors } from '../theme/colors';
import { sanitizeContactInput } from '../utils/contactUtils';

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
  'EUROTAXI',
  'ELECTRICO_SIN_LIBRANZA',
];

export const VendedorModal: React.FC<VendedorModalProps> = ({
  visible,
  onClose,
  onSave,
  vendedorToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [canalContacto, setCanalContacto] = useState<CanalContacto>('TELEFONO');
  const [contactoOrigen, setContactoOrigen] = useState('');
  const [perfil, setPerfil] = useState<TipoPerfil>('PARTICULAR');
  const [diaLibranza, setDiaLibranza] = useState<DiaLibranza>('LUNES');
  const [turnoDescanso, setTurnoDescanso] = useState<TurnoDescanso>('PAR');
  const [cargaLicencia, setCargaLicencia] = useState<TipoCarga>('SIN_CARGA');
  const [detalleCargaLicencia, setDetalleCargaLicencia] = useState('');

  // Vehículo
  const [modalidadVentaCoche, setModalidadVentaCoche] = useState<ModalidadVentaCoche>('SOLO_LICENCIA');
  const [modeloVehiculo, setModeloVehiculo] = useState('');
  const [anoVehiculo, setAnoVehiculo] = useState('');
  const [kmVehiculo, setKmVehiculo] = useState('');
  const [cargaVehiculo, setCargaVehiculo] = useState<TipoCarga>('SIN_CARGA');
  const [detalleCargaVehiculo, setDetalleCargaVehiculo] = useState('');
  const [exentoLibranza, setExentoLibranza] = useState(false);
  const [detalleExencion, setDetalleExencion] = useState('');

  // Precio
  const [precio, setPrecio] = useState('');
  const [precioConCoche, setPrecioConCoche] = useState('');
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
      setCanalContacto(vendedorToEdit.canalContacto || 'TELEFONO');
      setContactoOrigen(vendedorToEdit.contactoOrigen || '');
      setPerfil(vendedorToEdit.perfil);
      setDiaLibranza(vendedorToEdit.diaLibranza);
      setTurnoDescanso(vendedorToEdit.turnoDescanso || 'PAR');
      setCargaLicencia(vendedorToEdit.cargaLicencia);
      setDetalleCargaLicencia(vendedorToEdit.detalleCargaLicencia || '');
      
      const mod = vendedorToEdit.modalidadVentaCoche || (vendedorToEdit.vendeConCoche ? 'CON_COCHE' : 'SOLO_LICENCIA');
      setModalidadVentaCoche(mod);

      if (vendedorToEdit.vehiculo) {
        setModeloVehiculo(vendedorToEdit.vehiculo.modelo);
        setAnoVehiculo(String(vendedorToEdit.vehiculo.anoMatriculacion));
        setKmVehiculo(String(vendedorToEdit.vehiculo.kilometros));
        setCargaVehiculo(vendedorToEdit.vehiculo.carga);
        setDetalleCargaVehiculo(vendedorToEdit.vehiculo.detalleCarga || '');
        setExentoLibranza(Boolean(vendedorToEdit.vehiculo.exentoLibranza));
        setDetalleExencion(vendedorToEdit.vehiculo.detalleExencion || '');
      } else {
        setModeloVehiculo('');
        setAnoVehiculo('');
        setKmVehiculo('');
        setCargaVehiculo('SIN_CARGA');
        setDetalleCargaVehiculo('');
        setExentoLibranza(false);
        setDetalleExencion('');
      }
      setPrecio(vendedorToEdit.precio ? String(vendedorToEdit.precio) : '');
      setPrecioConCoche(vendedorToEdit.precioConCoche ? String(vendedorToEdit.precioConCoche) : '');
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
      setCanalContacto('TELEFONO');
      setContactoOrigen('');
      setPerfil('PARTICULAR');
      setDiaLibranza('LUNES');
      setTurnoDescanso('PAR');
      setCargaLicencia('SIN_CARGA');
      setDetalleCargaLicencia('');
      setModalidadVentaCoche('SOLO_LICENCIA');
      setModeloVehiculo('');
      setAnoVehiculo('');
      setKmVehiculo('');
      setCargaVehiculo('SIN_CARGA');
      setDetalleCargaVehiculo('');
      setExentoLibranza(false);
      setDetalleExencion('');
      setPrecio('');
      setPrecioConCoche('');
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
      alert('Por favor introduce un precio válido para la licencia');
      return;
    }

    const tieneCoche = modalidadVentaCoche !== 'SOLO_LICENCIA';
    const precioConCocheNum = modalidadVentaCoche === 'AMBAS_OPCIONES'
      ? parseFloat(precioConCoche.replace(/[^\d.]/g, '')) || undefined
      : modalidadVentaCoche === 'CON_COCHE'
      ? precioNum
      : undefined;

    const item: Vendedor = {
      id: vendedorToEdit ? vendedorToEdit.id : `v-${Date.now()}`,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      canalContacto,
      contactoOrigen: canalContacto !== 'TELEFONO' ? sanitizeContactInput(contactoOrigen) || undefined : undefined,
      fechaCreacion: vendedorToEdit ? vendedorToEdit.fechaCreacion : new Date().toISOString(),
      perfil,
      diaLibranza,
      turnoDescanso,
      cargaLicencia,
      detalleCargaLicencia: cargaLicencia !== 'SIN_CARGA' ? detalleCargaLicencia.trim() : undefined,
      vendeConCoche: tieneCoche,
      modalidadVentaCoche,
      vehiculo: tieneCoche
        ? {
            modelo: modeloVehiculo.trim() || 'Vehículo Taxi',
            anoMatriculacion: anoVehiculo.trim() || new Date().getFullYear().toString(),
            kilometros: kmVehiculo.trim() || '0',
            carga: cargaVehiculo,
            detalleCarga: cargaVehiculo !== 'SIN_CARGA' ? detalleCargaVehiculo.trim() : undefined,
            exentoLibranza,
            detalleExencion: exentoLibranza ? (detalleExencion.trim() || 'Exento CERO Emisiones') : undefined,
          }
        : undefined,
      precio: precioNum,
      precioConCoche: precioConCocheNum,
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
            {/* SECCIÓN 1: DATOS PERSONALES Y CANAL */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. CANAL DE CONTACTO Y PERFIL</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Canal / Plataforma de Origen</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      canalContacto === 'TELEFONO' && { backgroundColor: colors.canales.TELEFONO, borderColor: colors.canales.TELEFONO },
                    ]}
                    onPress={() => setCanalContacto('TELEFONO')}
                  >
                    <Text style={[styles.selectorText, canalContacto === 'TELEFONO' && styles.selectorTextActive]}>
                      📞 Teléfono
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      canalContacto === 'WALLAPOP' && { backgroundColor: colors.canales.WALLAPOP, borderColor: colors.canales.WALLAPOP },
                    ]}
                    onPress={() => setCanalContacto('WALLAPOP')}
                  >
                    <Text style={[styles.selectorText, canalContacto === 'WALLAPOP' && styles.selectorTextActive]}>
                      🟠 Wallapop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      canalContacto === 'MILANUNCIOS' && { backgroundColor: colors.canales.MILANUNCIOS, borderColor: colors.canales.MILANUNCIOS },
                    ]}
                    onPress={() => setCanalContacto('MILANUNCIOS')}
                  >
                    <Text style={[styles.selectorText, canalContacto === 'MILANUNCIOS' && styles.selectorTextActive]}>
                      🟢 Milanuncios
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      canalContacto === 'FACEBOOK' && { backgroundColor: colors.canales.FACEBOOK, borderColor: colors.canales.FACEBOOK },
                    ]}
                    onPress={() => setCanalContacto('FACEBOOK')}
                  >
                    <Text style={[styles.selectorText, canalContacto === 'FACEBOOK' && styles.selectorTextActive]}>
                      🔵 Facebook
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      canalContacto === 'OTRO' && { backgroundColor: colors.canales.OTRO, borderColor: colors.canales.OTRO },
                    ]}
                    onPress={() => setCanalContacto('OTRO')}
                  >
                    <Text style={[styles.selectorText, canalContacto === 'OTRO' && styles.selectorTextActive]}>
                      💬 Otro
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Nombre o Alias *</Text>
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder={canalContacto === 'TELEFONO' ? "Ej. Juan Pérez" : "Ej. Carlos (Wallapop)"}
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>
                    {canalContacto === 'TELEFONO' ? 'Teléfono / WhatsApp' : 'Teléfono (Opcional)'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder={canalContacto === 'TELEFONO' ? "600 000 000" : "Pendiente de pedir"}
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {canalContacto !== 'TELEFONO' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Usuario o Enlace del chat ({canalContacto === 'WALLAPOP' ? 'Wallapop' : canalContacto === 'MILANUNCIOS' ? 'Milanuncios' : canalContacto === 'FACEBOOK' ? 'Facebook' : 'Plataforma'})
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={contactoOrigen}
                    onChangeText={setContactoOrigen}
                    placeholder="Ej. @carlos_taxi o enlace del chat / anuncio..."
                    placeholderTextColor={colors.textSubtle}
                  />
                  <Text style={styles.sublabel}>
                    💡 Puedes guardarlo sin teléfono ahora y añadirlo cuando te lo facilite en la conversación.
                  </Text>
                </View>
              )}

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
                <Text style={styles.label}>Día de Libranza Semanal</Text>
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
                        onPress={() => {
                          setDiaLibranza(dia);
                          if (dia === 'EUROTAXI' || dia === 'ELECTRICO_SIN_LIBRANZA') {
                            setTurnoDescanso('LIBRE_24H');
                          } else if (turnoDescanso === 'LIBRE_24H') {
                            setTurnoDescanso('PAR');
                          }
                        }}
                      >
                        <Text style={[styles.diaBtnText, isSelected && styles.diaBtnTextActive]}>
                          {dia === 'EUROTAXI'
                            ? '♿ EUROTAXI'
                            : dia === 'ELECTRICO_SIN_LIBRANZA'
                            ? '⚡ ELÉCTRICO (Sin libranza)'
                            : dia}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* RÉGIMEN DE TURNO / FIN DE SEMANA */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Régimen de Turno / Fin de Semana (Par o Impar)</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, turnoDescanso === 'PAR' && styles.selectorBtnActive]}
                    onPress={() => setTurnoDescanso('PAR')}
                  >
                    <Text style={[styles.selectorText, turnoDescanso === 'PAR' && styles.selectorTextActive]}>
                      🔢 PAR (Finde Par)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, turnoDescanso === 'IMPAR' && styles.selectorBtnActive]}
                    onPress={() => setTurnoDescanso('IMPAR')}
                  >
                    <Text style={[styles.selectorText, turnoDescanso === 'IMPAR' && styles.selectorTextActive]}>
                      🔢 IMPAR (Finde Impar)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, turnoDescanso === 'ROTATIVO' && styles.selectorBtnActive]}
                    onPress={() => setTurnoDescanso('ROTATIVO')}
                  >
                    <Text style={[styles.selectorText, turnoDescanso === 'ROTATIVO' && styles.selectorTextActive]}>
                      🔄 Finde alterno
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, turnoDescanso === 'LIBRE_24H' && styles.selectorBtnActive]}
                    onPress={() => setTurnoDescanso('LIBRE_24H')}
                  >
                    <Text style={[styles.selectorText, turnoDescanso === 'LIBRE_24H' && styles.selectorTextActive]}>
                      🟢 Libre / 24h
                    </Text>
                  </TouchableOpacity>
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
              <Text style={styles.sectionTitle}>3. VEHÍCULO / PACK DE VENTA</Text>
              <Text style={styles.sublabel}>¿Cómo comercializa la licencia respecto al vehículo?</Text>

              <View style={styles.selectorRow}>
                <TouchableOpacity
                  style={[styles.selectorBtn, modalidadVentaCoche === 'SOLO_LICENCIA' && styles.selectorBtnActive]}
                  onPress={() => setModalidadVentaCoche('SOLO_LICENCIA')}
                >
                  <Text style={[styles.selectorText, modalidadVentaCoche === 'SOLO_LICENCIA' && styles.selectorTextActive]}>
                    Solo Licencia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorBtn, modalidadVentaCoche === 'CON_COCHE' && styles.selectorBtnActive]}
                  onPress={() => setModalidadVentaCoche('CON_COCHE')}
                >
                  <Text style={[styles.selectorText, modalidadVentaCoche === 'CON_COCHE' && styles.selectorTextActive]}>
                    Con Coche (Pack)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorBtn, modalidadVentaCoche === 'AMBAS_OPCIONES' && styles.selectorBtnActive]}
                  onPress={() => setModalidadVentaCoche('AMBAS_OPCIONES')}
                >
                  <Text style={[styles.selectorText, modalidadVentaCoche === 'AMBAS_OPCIONES' && styles.selectorTextActive]}>
                    ✨ Ambas Opciones
                  </Text>
                </TouchableOpacity>
              </View>

              {modalidadVentaCoche === 'AMBAS_OPCIONES' && (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerText}>
                    💡 <Text style={{ fontWeight: '700' }}>Venta Flexible:</Text> El vendedor ofrece vender solo la licencia (se queda su vehículo) o vender el pack completo con coche. Podrás fijar ambos precios a continuación.
                  </Text>
                </View>
              )}

              {modalidadVentaCoche !== 'SOLO_LICENCIA' && (
                <View style={styles.subBox}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Modelo del vehículo</Text>
                    <TextInput
                      style={styles.input}
                      value={modeloVehiculo}
                      onChangeText={setModeloVehiculo}
                      placeholder="Ej. Tesla Model Y / Toyota Corolla / Prius..."
                      placeholderTextColor={colors.textSubtle}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Año o Antigüedad</Text>
                      <TextInput
                        style={styles.input}
                        value={anoVehiculo}
                        onChangeText={setAnoVehiculo}
                        placeholder="Ej. 2023 o 3.5 años"
                        placeholderTextColor={colors.textSubtle}
                      />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.label}>Kilómetros</Text>
                      <TextInput
                        style={styles.input}
                        value={kmVehiculo}
                        onChangeText={setKmVehiculo}
                        placeholder="Ej. 95.000"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Carga o Financiación del Vehículo</Text>
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
                        placeholder="Ej. Debe 30.000€ de préstamo a liquidar de Tesla..."
                        placeholderTextColor={colors.textSubtle}
                      />
                    )}
                  </View>

                  {/* Exención de descanso por vehículo CERO emisiones / Eurotaxi */}
                  <View style={[styles.inputGroup, { marginTop: 4 }]}>
                    <View style={styles.switchRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.label}>⚡ Exención de Libranza (CERO Emisiones / Eurotaxi)</Text>
                        <Text style={styles.sublabel}>¿Permite trabajar sin libranza obligatoria?</Text>
                      </View>
                      <Switch
                        value={exentoLibranza}
                        onValueChange={setExentoLibranza}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                      />
                    </View>
                    {exentoLibranza && (
                      <TextInput
                        style={[styles.input, { marginTop: 8 }]}
                        value={detalleExencion}
                        onChangeText={setDetalleExencion}
                        placeholder="Ej. Exenta de libranza hasta 2033 por 100% eléctrico"
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

              {modalidadVentaCoche === 'AMBAS_OPCIONES' ? (
                <View>
                  <View style={styles.row}>
                    <View style={[styles.col, { flex: 1 }]}>
                      <Text style={styles.label}>Precio Solo Licencia (€) *</Text>
                      <TextInput
                        style={[styles.input, styles.priceInput]}
                        value={precio}
                        onChangeText={setPrecio}
                        placeholder="Ej. 190.000"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="numeric"
                      />
                      <Text style={styles.sublabel}>Si se queda el coche</Text>
                    </View>

                    <View style={[styles.col, { flex: 1 }]}>
                      <Text style={styles.label}>Precio Con Coche (€) *</Text>
                      <TextInput
                        style={[styles.input, styles.priceInput]}
                        value={precioConCoche}
                        onChangeText={setPrecioConCoche}
                        placeholder="Ej. 225.000"
                        placeholderTextColor={colors.textSubtle}
                        keyboardType="numeric"
                      />
                      <Text style={styles.sublabel}>Pack completo con coche</Text>
                    </View>
                  </View>

                  <View style={[styles.switchBox, { marginTop: 8 }]}>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                      ¿Precios negociables?
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: precioNegociable ? colors.accent : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
                        {precioNegociable ? 'Negociables' : 'Precios Fijos'}
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
              ) : (
                <View style={styles.row}>
                  <View style={[styles.col, { flex: 1.4 }]}>
                    <Text style={styles.label}>
                      {modalidadVentaCoche === 'CON_COCHE'
                        ? 'Precio Total con Coche (€) *'
                        : 'Precio de Venta Licencia (€) *'}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={precio}
                      onChangeText={setPrecio}
                      placeholder="Ej. 190.000"
                      placeholderTextColor={colors.textSubtle}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.col, { flex: 1 }]}>
                    <Text style={styles.label}>¿Es Negociable?</Text>
                    <View style={styles.switchBox}>
                      <Text style={{ color: precioNegociable ? colors.accent : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
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
              )}

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
                      🏁 Finalizada
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  col: {
    flex: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
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
    height: 44,
  },
  priceInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  textArea: {
    minHeight: 85,
    height: 85,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectorBtn: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.surface,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 7,
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
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
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
  infoBanner: {
    backgroundColor: '#0F2942',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  infoBannerText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
  },
});
