import { Linking } from 'react-native';
import { CruceMatch, Vendedor, Comprador } from '../types';

export const shareService = {
  generateMatchReport(cruce: CruceMatch): string {
    const { vendedor, comprador, match } = cruce;

    let precioVendedorStr = `${vendedor.precio.toLocaleString()} €`;
    if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche) {
      precioVendedorStr = `${vendedor.precio.toLocaleString()} € (solo lic.) / ${vendedor.precioConCoche.toLocaleString()} € (con coche)`;
    } else if (vendedor.modalidadVentaCoche === 'CON_COCHE') {
      precioVendedorStr = `${vendedor.precio.toLocaleString()} € (pack con coche)`;
    }
    precioVendedorStr += ` (${vendedor.precioNegociable ? 'Negociable' : 'Precio fijo'})`;

    let cocheVendedor = 'Solo licencia';
    if (vendedor.vendeConCoche && vendedor.vehiculo) {
      const exencionStr = vendedor.vehiculo.exentoLibranza ? ` • ⚡ ${vendedor.vehiculo.detalleExencion || 'Exento libranza'}` : '';
      const cargaStr = vendedor.vehiculo.carga === 'PRESTAMO' ? ` • 🚗 Préstamo coche: ${vendedor.vehiculo.detalleCarga || 'con reserva'}` : '';
      cocheVendedor = `${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion}, ${vendedor.vehiculo.kilometros} km)${exencionStr}${cargaStr}`;
      if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES') {
        cocheVendedor = `Flexible (con o sin coche): ${cocheVendedor}`;
      }
    }

    const cargaVendedor = vendedor.cargaLicencia === 'SIN_CARGA'
      ? 'Libre de cargas'
      : `Con préstamo (${vendedor.detalleCargaLicencia || 'Pendiente'})`;

    const condicionVendedor = vendedor.condicionVenta === 'JUBILACION'
      ? `Tras jubilación (${vendedor.fechaJubilacion || 'Prevista'})`
      : vendedor.condicionVenta === 'OTRA'
      ? vendedor.detalleCondicion || 'Especial'
      : 'Inmediata';

    const cocheComprador = comprador.buscaConCoche === 'CON_COCHE'
      ? 'Con vehículo'
      : comprador.buscaConCoche === 'SOLO_LICENCIA'
      ? 'Solo licencia'
      : 'Indiferente';

    const gestoriaComprador = !comprador.tieneGestoria
      ? 'Sin gestoría (Tramitar ayuda 6.000€)'
      : comprador.gestoriaSeleccionada === 'GESTORIA_VIP'
      ? 'Gestoría Asesoría Integral (Subvención 6.000€)'
      : comprador.gestoriaSeleccionada === 'GESTORIA_TALAMANCA'
      ? 'El Casar de Talamanca'
      : comprador.nombreGestoriaPropia || 'Gestoría propia';

    const formatContactoVendedor = vendedor.telefono
      ? `• *Teléfono:* ${vendedor.telefono} (${vendedor.perfil}${vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' ? ' • ' + vendedor.canalContacto : ''})`
      : `• *Contacto:* Pendiente de pedir (${vendedor.canalContacto || 'Chat'}${vendedor.contactoOrigen ? ': ' + vendedor.contactoOrigen : ''}) (${vendedor.perfil})`;

    const formatContactoComprador = comprador.telefono
      ? `• *Teléfono:* ${comprador.telefono} (${comprador.perfil}${comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' ? ' • ' + comprador.canalContacto : ''})`
      : `• *Contacto:* Pendiente de pedir (${comprador.canalContacto || 'Chat'}${comprador.contactoOrigen ? ': ' + comprador.contactoOrigen : ''}) (${comprador.perfil})`;

    return `🚕 *FICHA TÉCNICA DE COINCIDENCIA / TRASPASO DE LICENCIA* 🚕
(Afinidad calculada: *${match.score}% MATCH*)

👤 *PARTE COMPRADORA:*
• *Titular:* ${comprador.nombre}
${formatContactoComprador}
• *Libranza requerida:* ${comprador.diaLibranzaDeseada}${comprador.turnoDescansoDeseado && comprador.turnoDescansoDeseado !== 'INDIFERENTE' ? ' (Turno ' + comprador.turnoDescansoDeseado + ')' : ''}
• *Presupuesto máximo:* ${comprador.precioMaximo.toLocaleString()} €
• *Disponibilidad de señal:* ${comprador.puedeSenalizarYa ? '🔥 SÍ, DISPONIBLE PARA SEÑALIZAR DE INMEDIATO' : 'Pendiente de acordar'}
• *Requerimiento vehículo:* ${cocheComprador}
• *Gestoría:* ${gestoriaComprador}
${comprador.notas ? `• *Observaciones:* ${comprador.notas}\n` : ''}
🚗 *PARTE VENDEDORA:*
• *Titular:* ${vendedor.nombre}
${formatContactoVendedor}
• *Día libranza:* ${vendedor.diaLibranza}${vendedor.diaLibranza !== 'LIBRE_24H' ? ' (Turno ' + (vendedor.turnoDescanso || 'PAR') + ')' : ''}
• *Precio salida:* ${precioVendedorStr}
• *Situación de cargas:* ${cargaVendedor}
• *Vehículo:* ${cocheVendedor}
• *Condición de entrega:* ${condicionVendedor}
${vendedor.notas ? `• *Observaciones:* ${vendedor.notas}\n` : ''}
⚡ *COMPATIBILIDAD Y PUNTOS CLAVE:*
${match.razones.map(r => `✓ ${r}`).join('\n')}
${match.alertas.length > 0 ? `\n⚠️ *Puntos de atención para el cierre:*\n${match.alertas.map(a => `• ${a}`).join('\n')}` : ''}

Se remite la información de ambas partes para valoración, contacto directo y formalización del traspaso.`;
  },

  generateVendedorReport(vendedor: Vendedor): string {
    let coche = 'Solo licencia';
    if (vendedor.vendeConCoche && vendedor.vehiculo) {
      const exencionStr = vendedor.vehiculo.exentoLibranza ? ` • ⚡ ${vendedor.vehiculo.detalleExencion || 'Exento libranza'}` : '';
      const cargaStr = vendedor.vehiculo.carga === 'PRESTAMO' ? ` • 🚗 Préstamo coche: ${vendedor.vehiculo.detalleCarga || 'con reserva'}` : '';
      coche = `${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion}, ${vendedor.vehiculo.kilometros} km, carga: ${vendedor.vehiculo.carga})${exencionStr}${cargaStr}`;
      if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES') {
        coche = `Flexible (con o sin coche): ${coche}`;
      }
    }

    let precioStr = `${vendedor.precio.toLocaleString()} €`;
    if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche) {
      precioStr = `${vendedor.precio.toLocaleString()} € (solo lic.) / ${vendedor.precioConCoche.toLocaleString()} € (con coche)`;
    } else if (vendedor.modalidadVentaCoche === 'CON_COCHE') {
      precioStr = `${vendedor.precio.toLocaleString()} € (pack con coche)`;
    }
    precioStr += ` (${vendedor.precioNegociable ? 'Negociable' : 'Precio fijo'})`;

    const contacto = vendedor.telefono
      ? `• *Teléfono:* ${vendedor.telefono} (${vendedor.perfil}${vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' ? ' • ' + vendedor.canalContacto : ''})`
      : `• *Contacto:* Pendiente de pedir (${vendedor.canalContacto || 'Chat'}${vendedor.contactoOrigen ? ': ' + vendedor.contactoOrigen : ''}) (${vendedor.perfil})`;

    return `🚕 *EXPEDIENTE DE LICENCIA EN VENTA:*
• *Titular:* ${vendedor.nombre}
${contacto}
• *Libranza:* ${vendedor.diaLibranza}${vendedor.diaLibranza !== 'LIBRE_24H' ? ' (Turno ' + (vendedor.turnoDescanso || 'PAR') + ')' : ''}
• *Precio:* ${precioStr}
• *Carga Licencia:* ${vendedor.cargaLicencia === 'SIN_CARGA' ? 'Libre' : vendedor.detalleCargaLicencia || 'Con préstamo'}
• *Vehículo:* ${coche}
• *Condición de venta:* ${vendedor.condicionVenta === 'JUBILACION' ? `Tras jubilación (${vendedor.fechaJubilacion || ''})` : vendedor.condicionVenta}
${vendedor.notas ? `• *Observaciones:* ${vendedor.notas}\n` : ''}
Se remite la ficha para incorporación a cartera y búsqueda de contraparte.`;
  },

  generateCompradorReport(comprador: Comprador): string {
    const contacto = comprador.telefono
      ? `• *Teléfono:* ${comprador.telefono} (${comprador.perfil}${comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' ? ' • ' + comprador.canalContacto : ''})`
      : `• *Contacto:* Pendiente de pedir (${comprador.canalContacto || 'Chat'}${comprador.contactoOrigen ? ': ' + comprador.contactoOrigen : ''}) (${comprador.perfil})`;

    return `👤 *EXPEDIENTE DE COMPRADOR ACTIVO:*
• *Interesado:* ${comprador.nombre}
${contacto}
• *Libranza solicitada:* ${comprador.diaLibranzaDeseada}${comprador.turnoDescansoDeseado && comprador.turnoDescansoDeseado !== 'INDIFERENTE' ? ' (Turno ' + comprador.turnoDescansoDeseado + ')' : ''}
• *Presupuesto máximo:* ${comprador.precioMaximo.toLocaleString()} €
• *Disponibilidad de señal:* ${comprador.puedeSenalizarYa ? '🔥 SÍ, LISTO PARA SEÑALIZAR' : 'No'}
• *Preferencia vehículo:* ${comprador.buscaConCoche}
• *Gestoría:* ${!comprador.tieneGestoria ? 'Sin gestoría (Tramitar ayuda 6.000€)' : comprador.gestoriaSeleccionada}
${comprador.notas ? `• *Observaciones:* ${comprador.notas}\n` : ''}
Se remite el expediente de demanda para matching y tramitación.`;
  },

  sendWhatsApp(phone: string, text: string) {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const encoded = encodeURIComponent(text);
    if (cleanPhone) {
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encoded}`);
    } else {
      Linking.openURL(`https://wa.me/?text=${encoded}`);
    }
  }
};
