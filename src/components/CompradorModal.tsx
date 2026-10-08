import React, { useState, useEffect, useMemo } from 'react';
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
  Comprador,
  Vendedor,
  DiaLibranza,
  TipoPerfil,
  TipoPreferenciaCoche,
  TipoGestoria,
  EstadoRegistro,
  CanalContacto,
} from '../types';
import { colors } from '../theme/colors';
import { calculateMatch } from '../services/matchEngine';

interface CompradorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (comprador: Comprador) => void;
  compradorToEdit?: Comprador | null;
  allVendedores: Vendedor[];
  onOpenGestoriaHelper: (nombre: string) => void;
}

const DIAS_LIBRANZA: DiaLibranza[] = [
  'CUALQUIERA',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

export const CompradorModal: React.FC<CompradorModalProps> = ({
  visible,
  onClose,
  onSave,
  compradorToEdit,
  allVendedores,
  onOpenGestoriaHelper,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [canalContacto, setCanalContacto] = useState<CanalContacto>('TELEFONO');
  const [contactoOrigen, setContactoOrigen] = useState('');
  const [perfil, setPerfil] = useState<TipoPerfil>('PARTICULAR');

  const [diaLibranzaDeseada, setDiaLibranzaDeseada] = useState<DiaLibranza>('CUALQUIERA');
  const [precioMaximo, setPrecioMaximo] = useState('');

  // Financiación / Carga
  const [aceptaConPrestamo, setAceptaConPrestamo] = useState<boolean | 'INDIFERENTE'>('INDIFERENTE');

  // Señalizar ya
  const [puedeSenalizarYa, setPuedeSenalizarYa] = useState(false);

  // Coche
  const [buscaConCoche, setBuscaConCoche] = useState<TipoPreferenciaCoche>('INDIFERENTE');

  // Gestoría
  const [tieneGestoria, setTieneGestoria] = useState(false);
  const [gestoriaSeleccionada, setGestoriaSeleccionada] = useState<TipoGestoria>('NINGUNA');
  const [nombreGestoriaPropia, setNombreGestoriaPropia] = useState('');

  const [guardadoEnEspera, setGuardadoEnEspera] = useState(false);
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState<EstadoRegistro>('DISPONIBLE');

  useEffect(() => {
    if (compradorToEdit) {
      setNombre(compradorToEdit.nombre);
      setTelefono(compradorToEdit.telefono);
      setCanalContacto(compradorToEdit.canalContacto || 'TELEFONO');
      setContactoOrigen(compradorToEdit.contactoOrigen || '');
      setPerfil(compradorToEdit.perfil);
      setDiaLibranzaDeseada(compradorToEdit.diaLibranzaDeseada);
      setPrecioMaximo(compradorToEdit.precioMaximo ? String(compradorToEdit.precioMaximo) : '');
      setAceptaConPrestamo(compradorToEdit.aceptaConPrestamo);
      setPuedeSenalizarYa(compradorToEdit.puedeSenalizarYa);
      setBuscaConCoche(compradorToEdit.buscaConCoche);
      setTieneGestoria(compradorToEdit.tieneGestoria);
      setGestoriaSeleccionada(compradorToEdit.gestoriaSeleccionada);
      setNombreGestoriaPropia(compradorToEdit.nombreGestoriaPropia || '');
      setGuardadoEnEspera(compradorToEdit.guardadoEnEspera);
      setNotas(compradorToEdit.notas || '');
      setEstado(compradorToEdit.estado);
    } else {
      setNombre('');
      setTelefono('');
      setCanalContacto('TELEFONO');
      setContactoOrigen('');
      setPerfil('PARTICULAR');
      setDiaLibranzaDeseada('CUALQUIERA');
      setPrecioMaximo('');
      setAceptaConPrestamo('INDIFERENTE');
      setPuedeSenalizarYa(false);
      setBuscaConCoche('INDIFERENTE');
      setTieneGestoria(false);
      setGestoriaSeleccionada('NINGUNA');
      setNombreGestoriaPropia('');
      setGuardadoEnEspera(false);
      setNotas('');
      setEstado('DISPONIBLE');
    }
  }, [compradorToEdit, visible]);

  // Cálculo en vivo de qué licencias le encajan con lo que tiene introducido
  const liveMatches = useMemo(() => {
    const pMax = parseFloat(precioMaximo.replace(/[^\d.]/g, '')) || 0;
    if (pMax === 0 && diaLibranzaDeseada === 'CUALQUIERA') {
      return [];
    }

    const dummyComprador: Comprador = {
      id: 'preview',
      nombre: nombre || 'Preview',
      telefono: telefono || '',
      fechaCreacion: new Date().toISOString(),
      perfil,
      diaLibranzaDeseada,
      precioMaximo: pMax || 999999,
      aceptaConPrestamo,
      puedeSenalizarYa,
      buscaConCoche,
      tieneGestoria,
      gestoriaSeleccionada,
      guardadoEnEspera,
      estado: 'DISPONIBLE',
    };

    return allVendedores
      .filter(v => v.estado !== 'CERRADO')
      .map(v => ({ vendedor: v, match: calculateMatch(v, dummyComprador) }))
      .filter(item => item.match.score >= 50)
      .sort((a, b) => b.match.score - a.match.score);
  }, [
    allVendedores,
    nombre,
    telefono,
    perfil,
    diaLibranzaDeseada,
    precioMaximo,
    aceptaConPrestamo,
    puedeSenalizarYa,
    buscaConCoche,
    tieneGestoria,
    gestoriaSeleccionada,
    guardadoEnEspera,
  ]);

  const handleSave = () => {
    if (!nombre.trim()) {
      alert('Por favor indica el nombre del comprador');
      return;
    }
    const precioNum = parseFloat(precioMaximo.replace(/[^\d.]/g, '')) || 0;
    if (precioNum <= 0) {
      alert('Por favor introduce un presupuesto máximo válido');
      return;
    }

    const item: Comprador = {
      id: compradorToEdit ? compradorToEdit.id : `c-${Date.now()}`,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      canalContacto,
      contactoOrigen: canalContacto !== 'TELEFONO' ? contactoOrigen.trim() || undefined : undefined,
      fechaCreacion: compradorToEdit ? compradorToEdit.fechaCreacion : new Date().toISOString(),
      perfil,
      diaLibranzaDeseada,
      precioMaximo: precioNum,
      aceptaConPrestamo,
      puedeSenalizarYa,
      buscaConCoche,
      tieneGestoria,
      gestoriaSeleccionada,
      nombreGestoriaPropia: tieneGestoria && gestoriaSeleccionada === 'PROPIA' ? nombreGestoriaPropia.trim() : undefined,
      guardadoEnEspera,
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
                {compradorToEdit ? '✏️ Editar Comprador' : '➕ Nuevo Comprador'}
              </Text>
              <Text style={styles.subtitle}>Introduce los requerimientos y presupuesto del comprador</Text>
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
                    placeholder={canalContacto === 'TELEFONO' ? "Ej. David Sánchez" : "Ej. David (Wallapop)"}
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
                    placeholder="Ej. @david_inversor o enlace del chat / anuncio..."
                    placeholderTextColor={colors.textSubtle}
                  />
                  <Text style={styles.sublabel}>
                    💡 Puedes guardarlo sin teléfono ahora y añadirlo cuando te lo facilite en la conversación.
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Comprador</Text>
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
                      Intermediario / Inversor
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* SECCIÓN 2: CRITERIOS DE BÚSQUEDA */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. CRITERIOS DE LICENCIA Y PRESUPUESTO</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Qué día de libranza busca?</Text>
                <View style={styles.diasRow}>
                  {DIAS_LIBRANZA.map(dia => {
                    const isSelected = diaLibranzaDeseada === dia;
                    return (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.diaBtn,
                          isSelected && {
                            backgroundColor: colors.libranza[dia] || colors.primary,
                            borderColor: colors.libranza[dia] || colors.primary,
                          },
                        ]}
                        onPress={() => setDiaLibranzaDeseada(dia)}
                      >
                        <Text style={[styles.diaBtnText, isSelected && styles.diaBtnTextActive]}>
                          {dia === 'CUALQUIERA' ? 'CUALQUIERA / INDIFERENTE' : dia}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Presupuesto Máximo que quiere/puede pagar (€) *</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={precioMaximo}
                  onChangeText={setPrecioMaximo}
                  placeholder="Ej. 130.000"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="numeric"
                />
              </View>

              {/* SEÑALIZACIÓN INMEDIATA */}
              <View style={styles.hotBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotTitle}>🔥 ¿Puede SEÑALIZAR YA si sale la licencia?</Text>
                  <Text style={styles.hotDesc}>
                    Indica si tiene el dinero disponible para dar señal de forma inmediata.
                  </Text>
                </View>
                <Switch
                  value={puedeSenalizarYa}
                  onValueChange={setPuedeSenalizarYa}
                  trackColor={{ false: colors.border, true: colors.danger }}
                  thumbColor={colors.white}
                />
              </View>

              {/* COCHE */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Busca con o sin vehículo?</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, buscaConCoche === 'INDIFERENTE' && styles.selectorBtnActive]}
                    onPress={() => setBuscaConCoche('INDIFERENTE')}
                  >
                    <Text style={[styles.selectorText, buscaConCoche === 'INDIFERENTE' && styles.selectorTextActive]}>
                      Indiferente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, buscaConCoche === 'SOLO_LICENCIA' && styles.selectorBtnActive]}
                    onPress={() => setBuscaConCoche('SOLO_LICENCIA')}
                  >
                    <Text style={[styles.selectorText, buscaConCoche === 'SOLO_LICENCIA' && styles.selectorTextActive]}>
                      Solo Licencia
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, buscaConCoche === 'CON_COCHE' && styles.selectorBtnActive]}
                    onPress={() => setBuscaConCoche('CON_COCHE')}
                  >
                    <Text style={[styles.selectorText, buscaConCoche === 'CON_COCHE' && styles.selectorTextActive]}>
                      Con Coche
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* PRESTAMO / CARGA */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Acepta licencia con préstamo existente?</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, aceptaConPrestamo === 'INDIFERENTE' && styles.selectorBtnActive]}
                    onPress={() => setAceptaConPrestamo('INDIFERENTE')}
                  >
                    <Text style={[styles.selectorText, aceptaConPrestamo === 'INDIFERENTE' && styles.selectorTextActive]}>
                      Indiferente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, aceptaConPrestamo === false && styles.selectorBtnActive]}
                    onPress={() => setAceptaConPrestamo(false)}
                  >
                    <Text style={[styles.selectorText, aceptaConPrestamo === false && styles.selectorTextActive]}>
                      Solo Sin Cargas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorBtn, aceptaConPrestamo === true && styles.selectorBtnActive]}
                    onPress={() => setAceptaConPrestamo(true)}
                  >
                    <Text style={[styles.selectorText, aceptaConPrestamo === true && styles.selectorTextActive]}>
                      Acepta Préstamo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* SECCIÓN 3: ESTRATEGIA DE GESTORÍA */}
            <View style={styles.section}>
              <View style={styles.gestoriaHeader}>
                <View>
                  <Text style={styles.sectionTitle}>3. SITUACIÓN DE GESTORÍA</Text>
                  <Text style={styles.sublabel}>Recomendación de las 2 gestorías y ayuda hasta 6.000€</Text>
                </View>
                <TouchableOpacity
                  style={styles.helpBtn}
                  onPress={() => onOpenGestoriaHelper(nombre || 'el comprador')}
                >
                  <Text style={styles.helpBtnText}>📖 Ver Guión Comercial</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorRow}>
                <TouchableOpacity
                  style={[styles.selectorBtn, !tieneGestoria && styles.selectorBtnActive]}
                  onPress={() => {
                    setTieneGestoria(false);
                    setGestoriaSeleccionada('NINGUNA');
                  }}
                >
                  <Text style={[styles.selectorText, !tieneGestoria && styles.selectorTextActive]}>
                    No tiene todavía
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorBtn, tieneGestoria && gestoriaSeleccionada === 'GESTORIA_VIP' && styles.selectorBtnActive]}
                  onPress={() => {
                    setTieneGestoria(true);
                    setGestoriaSeleccionada('GESTORIA_VIP');
                  }}
                >
                  <Text style={[styles.selectorText, tieneGestoria && gestoriaSeleccionada === 'GESTORIA_VIP' && styles.selectorTextActive]}>
                    VIP (Ayuda 6.000€)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorBtn, tieneGestoria && gestoriaSeleccionada === 'GESTORIA_TALAMANCA' && styles.selectorBtnActive]}
                  onPress={() => {
                    setTieneGestoria(true);
                    setGestoriaSeleccionada('GESTORIA_TALAMANCA');
                  }}
                >
                  <Text style={[styles.selectorText, tieneGestoria && gestoriaSeleccionada === 'GESTORIA_TALAMANCA' && styles.selectorTextActive]}>
                    El Casar (Disuasoria)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorBtn, tieneGestoria && gestoriaSeleccionada === 'PROPIA' && styles.selectorBtnActive]}
                  onPress={() => {
                    setTieneGestoria(true);
                    setGestoriaSeleccionada('PROPIA');
                  }}
                >
                  <Text style={[styles.selectorText, tieneGestoria && gestoriaSeleccionada === 'PROPIA' && styles.selectorTextActive]}>
                    Tiene la suya propia
                  </Text>
                </TouchableOpacity>
              </View>

              {tieneGestoria && gestoriaSeleccionada === 'PROPIA' && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={nombreGestoriaPropia}
                  onChangeText={setNombreGestoriaPropia}
                  placeholder="Nombre de su gestoría..."
                  placeholderTextColor={colors.textSubtle}
                />
              )}
            </View>

            {/* SECCIÓN 4: MATCHES EN TIEMPO REAL DURANTE LA LLAMADA */}
            <View style={[styles.section, styles.liveMatchesBox]}>
              <View style={styles.liveMatchesHeader}>
                <Text style={styles.liveMatchesTitle}>
                  ⚡ LICENCIAS COINCIDENTES EN DIRECTO ({liveMatches.length})
                </Text>
                <Text style={styles.liveMatchesSub}>
                  Ofrécele directamente estas licencias que ya tienes en cartera:
                </Text>
              </View>

              {liveMatches.length > 0 ? (
                <View style={styles.matchesList}>
                  {liveMatches.slice(0, 3).map(({ vendedor, match }) => (
                    <View key={vendedor.id} style={styles.matchItem}>
                      <View style={styles.matchItemLeft}>
                        <Text style={styles.matchSellerName}>
                          {vendedor.nombre} ({vendedor.diaLibranza})
                        </Text>
                        <Text style={styles.matchSellerPrice}>
                          {vendedor.precio.toLocaleString()}€{' '}
                          {vendedor.precioNegociable ? '(Negociable)' : '(Fijo)'} •{' '}
                          {vendedor.vendeConCoche ? `Con coche (${vendedor.vehiculo?.modelo || ''})` : 'Solo licencia'}
                        </Text>
                      </View>
                      <View style={styles.matchItemRight}>
                        <Text style={styles.matchScoreText}>{match.score}% MATCH</Text>
                      </View>
                    </View>
                  ))}
                  {liveMatches.length > 3 && (
                    <Text style={styles.moreMatchesText}>
                      +{liveMatches.length - 3} licencias más disponibles en la pestaña de Cruces
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.noMatchesBox}>
                  <Text style={styles.noMatchesText}>
                    No hay licencias exactas en este momento con estos filtros.
                  </Text>
                  <Text style={styles.noMatchesSub}>
                    Guárdalo en la bolsa de espera para que el sistema te lance un aviso automático en cuanto entre un vendedor compatible.
                  </Text>
                </View>
              )}

              {/* RETENCIÓN EN BOLSA DE ESPERA */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boldText}>📌 Guardar en bolsa de espera</Text>
                  <Text style={styles.sublabel}>
                    Para tenerle presente y avisarle el primero si sale algo.
                  </Text>
                </View>
                <Switch
                  value={guardadoEnEspera}
                  onValueChange={setGuardadoEnEspera}
                  trackColor={{ false: colors.border, true: colors.secondary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {/* SECCIÓN 5: NOTAS Y ESTADO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. NOTAS Y SEGUIMIENTO</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notas}
                  onChangeText={setNotas}
                  placeholder="Anotaciones de la conversación, si tiene dinero listo, si está comparando..."
                  placeholderTextColor={colors.textSubtle}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado del Comprador</Text>
                <View style={styles.selectorRow}>
                  <TouchableOpacity
                    style={[styles.selectorBtn, estado === 'DISPONIBLE' && styles.selectorBtnActive]}
                    onPress={() => setEstado('DISPONIBLE')}
                  >
                    <Text style={[styles.selectorText, estado === 'DISPONIBLE' && styles.selectorTextActive]}>
                      Buscando Activo
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
                      Cerrado / Compró
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.success }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {compradorToEdit ? 'Guardar Cambios' : 'Registrar Comprador'}
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
    color: colors.success,
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
    color: colors.success,
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
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  selectorText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  hotBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hotTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F87171',
  },
  hotDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  gestoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  helpBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  helpBtnText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  liveMatchesBox: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderColor: colors.secondary,
  },
  liveMatchesHeader: {
    marginBottom: 4,
  },
  liveMatchesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  liveMatchesSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  matchesList: {
    gap: 8,
  },
  matchItem: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  matchItemLeft: {
    flex: 1,
  },
  matchSellerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  matchSellerPrice: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  matchItemRight: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  moreMatchesText: {
    fontSize: 11,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  noMatchesBox: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  noMatchesSub: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 6,
  },
  boldText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
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
