import { Linking } from 'react-native';
import { CruceMatch, Vendedor, Comprador } from '../types';

function cleanKm(km?: string): string {
  if (!km) return '';
  const num = parseInt(km.replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return km;
  return `${num.toLocaleString('es-ES')} km`;
}

function cleanCargaLicencia(carga: string, detalle?: string): string {
  if (carga === 'SIN_CARGA') return '100% Libre de cargas / préstamos';
  if (carga === 'PRESTAMO') return `Con préstamo (${detalle || 'pendiente de liquidar'})`;
  return detalle || 'Consultar cargas';
}

function cleanCargaVehiculo(carga: string, detalle?: string): string {
  if (carga === 'SIN_CARGA') return 'Totalmente pagado (sin reserva de dominio)';
  if (carga === 'PRESTAMO') return `Con financiación (${detalle || 'reserva de dominio a liquidar'})`;
  return detalle || 'Consultar';
}

function cleanCondicion(condicion: string, fecha?: string, detalle?: string): string {
  if (condicion === 'INMEDIATA') return 'Inmediata para firma y traspaso';
  if (condicion === 'JUBILACION') return `Tras jubilación (${fecha || 'fecha a convenir'})`;
  return detalle || 'Condición a consultar';
}

function cleanPerfil(perfil: string): string {
  return perfil === 'PARTICULAR' ? 'Particular' : 'Profesional / Gestoría';
}

function formatLibranzaSingle(dia: string, turno?: string): string {
  if (dia === 'EUROTAXI') return '♿ EUROTAXI (Exento de libranza)';
  if (dia === 'ELECTRICO_SIN_LIBRANZA') return '⚡ ELÉCTRICO CERO (Exento de libranza)';
  if (dia === 'LIBRE_24H') return '🟢 24H LIBRE (Sin libranza fija)';
  if (dia === 'CUALQUIERA') return 'Cualquiera (Indiferente)';
  const diaNom = dia.charAt(0) + dia.slice(1).toLowerCase();
  return `${diaNom}${turno && turno !== 'INDIFERENTE' ? ' (Turno ' + turno + ')' : ''}`;
}

function formatLibranzaText(dia: string, turno?: string): string {
  if (!dia) return 'Cualquiera (Indiferente)';
  if (dia.includes(',')) {
    const list = dia.split(',').map(d => formatLibranzaSingle(d.trim()));
    const turnoStr = turno && turno !== 'INDIFERENTE' ? ` • Turno ${turno}` : '';
    return `${list.join(' o ')}${turnoStr}`;
  }
  return formatLibranzaSingle(dia, turno);
}

export const shareService = {
  formatLibranzaText,

  generateVendedorReport(vendedor: Vendedor): string {
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    // Libranza
    let libranzaStr = '';
    if (vendedor.diaLibranza === 'EUROTAXI') {
      libranzaStr = '♿ *EUROTAXI (Sin libranza)*\n   _Autorizado para trabajar los 7 días (PMR)_';
    } else if (vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA') {
      libranzaStr = '⚡ *ELÉCTRICO CERO (Sin libranza)*\n   _Exento de descanso obligatorio_';
    } else if (vendedor.diaLibranza === 'LIBRE_24H') {
      libranzaStr = '🟢 *24H LIBRE (Sin libranza fija)*';
    } else {
      const diaNom = vendedor.diaLibranza.charAt(0) + vendedor.diaLibranza.slice(1).toLowerCase();
      libranzaStr = `*${diaNom} • Turno ${vendedor.turnoDescanso || 'PAR'}*`;
    }

    // Precio
    const precioBase = `${vendedor.precio.toLocaleString('es-ES')} €`;
    let precioLines = '';
    if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche) {
      precioLines = `   ▪ *${precioBase}* _(Solo Licencia)_\n   ▪ *${vendedor.precioConCoche.toLocaleString('es-ES')} €* _(Con Vehículo incluido)_`;
    } else if (vendedor.modalidadVentaCoche === 'CON_COCHE') {
      precioLines = `   ▪ *${precioBase}* _(Pack completo con vehículo)_`;
    } else {
      precioLines = `   ▪ *${precioBase}* _(Solo Licencia)_`;
    }
    const negociableStr = vendedor.precioNegociable ? '_(Precio negociable)_' : '_(Precio cerrado / fijo)_';

    // Vehículo
    let vehiculoLines = '';
    if (vendedor.vendeConCoche && vendedor.vehiculo) {
      const kmFormatted = cleanKm(vendedor.vehiculo.kilometros);
      const ano = vendedor.vehiculo.anoMatriculacion ? ` (${vendedor.vehiculo.anoMatriculacion})` : '';
      vehiculoLines = `   ▪ *Modelo:* ${vendedor.vehiculo.modelo}${ano}`;
      if (kmFormatted) vehiculoLines += `\n   ▪ *Kilómetros:* ${kmFormatted}`;
      vehiculoLines += `\n   ▪ *Situación:* ${cleanCargaVehiculo(vendedor.vehiculo.carga, vendedor.vehiculo.detalleCarga)}`;
      if (vendedor.vehiculo.exentoLibranza) {
        vehiculoLines += `\n   ▪ *Exención:* ⚡ ${vendedor.vehiculo.detalleExencion || 'Exento por CERO emisiones'}`;
      }
    } else {
      vehiculoLines = '   ▪ _Venta de solo licencia (vehículo no incluido)_';
    }

    // Contacto
    let contactoLines = `   ▪ *Titular:* ${vendedor.nombre} _(${cleanPerfil(vendedor.perfil)})_`;
    if (vendedor.telefono) {
      contactoLines += `\n   ▪ *Teléfono:* ${vendedor.telefono}`;
    } else {
      const canalNom = vendedor.canalContacto && vendedor.canalContacto !== 'TELEFONO' ? vendedor.canalContacto : 'Chat online';
      contactoLines += `\n   ▪ *Contacto:* Canal ${canalNom} _(Teléfono en gestión)_`;
    }

    // Situación administrativa
    let adminLines = `   ▪ *Cargas licencia:* ${cleanCargaLicencia(vendedor.cargaLicencia, vendedor.detalleCargaLicencia)}`;
    adminLines += `\n   ▪ *Disponibilidad:* ${cleanCondicion(vendedor.condicionVenta, vendedor.fechaJubilacion, vendedor.detalleCondicion)}`;
    if (vendedor.notas) {
      adminLines += `\n   ▪ *Observaciones:* _${vendedor.notas.trim()}_`;
    }

    // Enlace de origen (al pie para no romper la visualización)
    let enlacePie = '';
    if (vendedor.contactoOrigen && vendedor.contactoOrigen.startsWith('http')) {
      enlacePie = `\n\n🔗 *Enlace de origen:*\n${vendedor.contactoOrigen}`;
    }

    return `🚕 *FICHA DE LICENCIA EN VENTA*
${divider}

📍 *LIBRANZA Y TURNO:*
   ▪ ${libranzaStr}

💰 *VALORACIÓN:*
${precioLines}
   ${negociableStr}

🚘 *VEHÍCULO:*
${vehiculoLines}

👤 *DATOS DEL VENDEDOR:*
${contactoLines}

📋 *SITUACIÓN ADMINISTRATIVA:*
${adminLines}
${divider}
📲 _Ficha técnica emitida para formalización de traspaso_${enlacePie}`;
  },

  generateCompradorReport(comprador: Comprador): string {
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    const libranzaStr = `*${formatLibranzaText(comprador.diaLibranzaDeseada, comprador.turnoDescansoDeseado)}*`;

    const cochePref = comprador.buscaConCoche === 'CON_COCHE'
      ? 'Exige vehículo incluido en la compra'
      : comprador.buscaConCoche === 'SOLO_LICENCIA'
      ? 'Busca exclusivamente solo la licencia'
      : 'Indiferente (con o sin vehículo)';

    const senalStr = comprador.puedeSenalizarYa
      ? '🔥 *SÍ, DISPONIBLE PARA SEÑALIZAR DE INMEDIATO*'
      : 'Pendiente de formalizar acuerdo';

    const gestoriaStr = !comprador.tieneGestoria
      ? 'Sin gestoría _(Candidato a tramitar subvención 6.000 €)_'
      : comprador.gestoriaSeleccionada === 'GESTORIA_VIP'
      ? 'Gestoría Asesoría Integral (Subvención 6.000 €)'
      : comprador.gestoriaSeleccionada === 'GESTORIA_TALAMANCA'
      ? 'El Casar de Talamanca'
      : comprador.nombreGestoriaPropia || 'Gestoría propia asignada';

    let contactoLines = `   ▪ *Interesado:* ${comprador.nombre} _(${cleanPerfil(comprador.perfil)})_`;
    if (comprador.telefono) {
      contactoLines += `\n   ▪ *Teléfono:* ${comprador.telefono}`;
    } else {
      const canalNom = comprador.canalContacto && comprador.canalContacto !== 'TELEFONO' ? comprador.canalContacto : 'Chat online';
      contactoLines += `\n   ▪ *Contacto:* Canal ${canalNom} _(Teléfono en gestión)_`;
    }

    let notasStr = '';
    if (comprador.notas) {
      notasStr = `\n   ▪ *Notas:* _${comprador.notas.trim()}_`;
    }

    let enlacePie = '';
    if (comprador.contactoOrigen && comprador.contactoOrigen.startsWith('http')) {
      enlacePie = `\n\n🔗 *Enlace de origen:*\n${comprador.contactoOrigen}`;
    }

    return `👤 *EXPEDIENTE DE COMPRADOR ACTIVO*
${divider}

📍 *DEMANDA DE LIBRANZA:*
   ▪ ${libranzaStr}

💰 *CAPACIDAD FINANCIERA:*
   ▪ *Presupuesto Máximo:* *${comprador.precioMaximo.toLocaleString('es-ES')} €*
   ▪ *Disponibilidad de Señal:* ${senalStr}

🚘 *REQUISITO DE VEHÍCULO:*
   ▪ ${cochePref}

📋 *GESTIÓN & ASESORAMIENTO:*
   ▪ *Gestoría:* ${gestoriaStr}${notasStr}

👤 *DATOS DEL COMPRADOR:*
${contactoLines}
${divider}
📲 _Ficha de demanda remitida para matching y traspaso_${enlacePie}`;
  },

  generateMatchReport(cruce: CruceMatch): string {
    const { vendedor, comprador, match } = cruce;
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    let precioVendStr = `${vendedor.precio.toLocaleString('es-ES')} €`;
    if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' || (vendedor.precioConCoche && vendedor.precioConCoche !== vendedor.precio)) {
      const pCon = (vendedor.precioConCoche || vendedor.precio).toLocaleString('es-ES');
      const pSin = vendedor.precio.toLocaleString('es-ES');
      precioVendStr = `Con coche: ${pCon} € | Sin coche: ${pSin} €`;
      if (match.precioEvaluado) {
        precioVendStr += `\n   ▪ *Precio Evaluado Cruce:* *${match.precioEvaluado.toLocaleString('es-ES')} €* _(${match.modalidadEvaluada === 'CON_COCHE' ? 'Pack con coche' : 'Solo licencia'})_`;
      }
    } else if (vendedor.modalidadVentaCoche === 'CON_COCHE') {
      precioVendStr = `${(vendedor.precioConCoche || vendedor.precio).toLocaleString('es-ES')} € (pack con coche)`;
    } else {
      precioVendStr = `${vendedor.precio.toLocaleString('es-ES')} € (solo licencia)`;
    }
    precioVendStr += vendedor.precioNegociable ? ' _(Negociable)_' : ' _(Fijo)_';

    let cocheVendStr = 'Solo licencia';
    if (vendedor.vendeConCoche && vendedor.vehiculo) {
      const kmFormatted = cleanKm(vendedor.vehiculo.kilometros);
      cocheVendStr = `${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion || 'Coche'}${kmFormatted ? ' • ' + kmFormatted : ''})`;
      if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES') {
        cocheVendStr = `Flexible: ${cocheVendStr}`;
      }
    }

    const contactoVend = vendedor.telefono ? vendedor.telefono : `Canal ${vendedor.canalContacto || 'Chat'}`;
    const contactoComp = comprador.telefono ? comprador.telefono : `Canal ${comprador.canalContacto || 'Chat'}`;

    return `🎯 *INFORME DE CRUCE / MATCH (${match.score}% AFINIDAD)*
${divider}

🚗 *OFERTA (VENDEDOR)*
   ▪ *Titular:* ${vendedor.nombre} _(${cleanPerfil(vendedor.perfil)})_
   ▪ *Contacto:* ${contactoVend}
   ▪ *Libranza:* ${formatLibranzaText(vendedor.diaLibranza, vendedor.turnoDescanso)}
   ▪ *Precio:* *${precioVendStr}*
   ▪ *Vehículo:* ${cocheVendStr}
   ▪ *Cargas:* ${cleanCargaLicencia(vendedor.cargaLicencia, vendedor.detalleCargaLicencia)}

👤 *DEMANDA (COMPRADOR)*
   ▪ *Titular:* ${comprador.nombre} _(${cleanPerfil(comprador.perfil)})_
   ▪ *Contacto:* ${contactoComp}
   ▪ *Libranza:* ${formatLibranzaText(comprador.diaLibranzaDeseada, comprador.turnoDescansoDeseado)}
   ▪ *Presupuesto:* *${comprador.precioMaximo.toLocaleString('es-ES')} €*
   ▪ *Señal:* ${comprador.puedeSenalizarYa ? '🔥 Listo para señalizar ya' : 'Pendiente'}

⚡ *CLAVES DEL ENCAJE:*
${match.razones.map(r => `   ✓ ${r}`).join('\n')}
${match.alertas.length > 0 ? `\n⚠️ *Puntos a coordinar:*\n${match.alertas.map(a => `   • ${a}`).join('\n')}` : ''}
${divider}
📲 _Operación lista para contacto mutuo y formalización del traspaso_`;
  },

  sendWhatsApp(phone: string, text: string) {
    const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : '';
    const encoded = encodeURIComponent(text);
    if (cleanPhone) {
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encoded}`);
    } else {
      Linking.openURL(`https://wa.me/?text=${encoded}`);
    }
  }
};
