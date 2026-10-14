import { Vendedor, Comprador, MatchScore, CruceMatch, getCompradorDias } from '../types';

export function calculateMatch(vendedor: Vendedor, comprador: Comprador): MatchScore {
  let score = 0;
  const razones: string[] = [];
  const alertas: string[] = [];

  // Solo cruzar si ambos están disponibles o en negociación
  if (vendedor.estado === 'CERRADO' || comprador.estado === 'CERRADO') {
    return {
      score: 0,
      nivel: 'POTENCIAL',
      razones: [],
      alertas: ['Uno de los perfiles ya está cerrado'],
      diferenciaPrecio: vendedor.precio - comprador.precioMaximo,
      precioEncaja: false,
      libranzaEncaja: false,
      cocheEncaja: false,
      cargaEncaja: false,
    };
  }

  // 1. LIBRANZA Y TURNO (Hasta 35 puntos: 25 por día + 10 por turno Par/Impar)
  // PREMISA INDISPENSABLE: Si el día de LIBRANZA no coincide, el encaje es 0 absoluto.
  let diaEncaja = false;
  let turnoEncaja = false;

  // 1.1 Día entre semana
  const diasBuscados = getCompradorDias(comprador);

  const isVendedorExento =
    vendedor.diaLibranza === 'EUROTAXI' ||
    vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA' ||
    vendedor.diaLibranza === 'LIBRE_24H';

  const isCompradorExento =
    diasBuscados.includes('EUROTAXI') ||
    diasBuscados.includes('ELECTRICO_SIN_LIBRANZA') ||
    diasBuscados.includes('LIBRE_24H');

  const diaCoincide =
    diasBuscados.includes('CUALQUIERA') ||
    diasBuscados.includes(vendedor.diaLibranza);

  if (diaCoincide) {
    diaEncaja = true;
    score += 25;
    if (diasBuscados.includes('CUALQUIERA')) {
      razones.push(`Comprador busca cualquier libranza (Vendedor tiene ${vendedor.diaLibranza})`);
    } else if (diasBuscados.length > 1) {
      razones.push(`Día de libranza coincide: ${vendedor.diaLibranza} (entre sus opciones: ${diasBuscados.join(', ')})`);
    } else {
      razones.push(`Día de libranza coincide exactamente: ${vendedor.diaLibranza}`);
    }
  } else {
    // Si el día de libranza no coincide, el encaje es 0
    return {
      score: 0,
      nivel: 'POTENCIAL',
      razones: [],
      alertas: [
        `Día de libranza no coincide: Vendedor tiene ${vendedor.diaLibranza}, comprador busca ${diasBuscados.join(', ')}`,
      ],
      diferenciaPrecio: vendedor.precio - comprador.precioMaximo,
      precioEncaja: false,
      libranzaEncaja: false,
      turnoEncaja: false,
      cocheEncaja: false,
      cargaEncaja: false,
    };
  }

  // 1.2 Turno de fin de semana (Par / Impar / Rotativo / Libre 24h)
  const turnoVend = vendedor.turnoDescanso || 'PAR';
  const turnoComp = comprador.turnoDescansoDeseado || 'INDIFERENTE';

  if (isVendedorExento) {
    turnoEncaja = true;
    score += 10;
    razones.push(`Licencia exenta de libranza: autorizada para trabajar los 7 días sin descanso obligatorio`);
  } else if (turnoComp === 'INDIFERENTE') {
    turnoEncaja = true;
    score += 10;
    razones.push(`Comprador acepta cualquier turno de fin de semana (Vendedor es ${turnoVend})`);
  } else if (turnoComp === turnoVend) {
    turnoEncaja = true;
    score += 10;
    razones.push(`Turno de fin de semana coincide exactamente: ${turnoVend}`);
  } else {
    alertas.push(`Turno fin de semana dispar: Vendedor es ${turnoVend}, comprador busca ${turnoComp}`);
  }

  const libranzaEncaja = diaEncaja && turnoEncaja;

  // Determinar modalidad de venta respecto al vehículo
  const modalidadVend = vendedor.modalidadVentaCoche || (vendedor.vendeConCoche ? 'CON_COCHE' : 'SOLO_LICENCIA');
  const buscaCocheComp = comprador.buscaConCoche;

  // Seleccionar qué precio del vendedor aplica para este comprador
  let precioComparar = vendedor.precio;
  let evaluandoConCoche = false;

  if (modalidadVend === 'AMBAS_OPCIONES') {
    if (buscaCocheComp === 'CON_COCHE') {
      precioComparar = vendedor.precioConCoche || vendedor.precio;
      evaluandoConCoche = true;
    } else if (buscaCocheComp === 'SOLO_LICENCIA') {
      precioComparar = vendedor.precio;
      evaluandoConCoche = false;
    } else {
      // INDIFERENTE: comprobamos si el comprador puede permitirse el pack con coche o solo la licencia
      const precioPack = vendedor.precioConCoche || vendedor.precio;
      if (comprador.precioMaximo >= precioPack) {
        precioComparar = precioPack;
        evaluandoConCoche = true;
      } else {
        precioComparar = vendedor.precio;
        evaluandoConCoche = false;
      }
    }
  } else if (modalidadVend === 'CON_COCHE') {
    precioComparar = vendedor.precioConCoche || vendedor.precio;
    evaluandoConCoche = true;
  } else {
    // SOLO_LICENCIA
    precioComparar = vendedor.precio;
    evaluandoConCoche = false;
  }

  // 2. PRECIO (Hasta 35 puntos)
  const diferenciaPrecio = precioComparar - comprador.precioMaximo;
  let precioEncaja = false;

  if (diferenciaPrecio <= 0) {
    precioEncaja = true;
    score += 35;
    const ahorro = Math.abs(diferenciaPrecio);
    if (ahorro > 0) {
      razones.push(
        `Precio en rango: ${precioComparar.toLocaleString()}€ ${evaluandoConCoche ? '(con coche)' : '(solo licencia)'} (Comprador tiene hasta ${comprador.precioMaximo.toLocaleString()}€, sobran ${ahorro.toLocaleString()}€)`
      );
    } else {
      razones.push(`Precio exacto en presupuesto: ${precioComparar.toLocaleString()}€ ${evaluandoConCoche ? '(con coche)' : '(solo licencia)'}`);
    }
  } else {
    // El vendedor pide más de lo que el comprador quiere pagar
    const pctExceso = (diferenciaPrecio / comprador.precioMaximo) * 100;
    if (vendedor.precioNegociable) {
      if (pctExceso <= 6) {
        score += 25;
        alertas.push(`Precio (${precioComparar.toLocaleString()}€) supera en ${diferenciaPrecio.toLocaleString()}€ pero el vendedor es NEGOCIABLE (margen salvable)`);
      } else if (pctExceso <= 12) {
        score += 15;
        alertas.push(`Precio (${precioComparar.toLocaleString()}€) supera en ${diferenciaPrecio.toLocaleString()}€ (negociable, requiere acuerdo)`);
      } else {
        score += 5;
        alertas.push(`Supera presupuesto en ${diferenciaPrecio.toLocaleString()}€ aunque vendedor indica negociable`);
      }
    } else {
      if (pctExceso <= 5) {
        score += 10;
        alertas.push(`Supera presupuesto en ${diferenciaPrecio.toLocaleString()}€ y NO es negociable`);
      } else {
        alertas.push(`Supera presupuesto en ${diferenciaPrecio.toLocaleString()}€ (NO negociable)`);
      }
    }
  }

  // 3. VEHÍCULO (Hasta 15 puntos)
  let cocheEncaja = false;
  if (modalidadVend === 'AMBAS_OPCIONES') {
    cocheEncaja = true;
    score += 15;
    if (buscaCocheComp === 'SOLO_LICENCIA') {
      razones.push(`Vendedor acepta vender solo licencia por ${vendedor.precio.toLocaleString()}€`);
    } else if (buscaCocheComp === 'CON_COCHE') {
      razones.push(`Vendedor incluye vehículo ${vendedor.vehiculo?.modelo || ''} por ${precioComparar.toLocaleString()}€`);
    } else {
      razones.push(`Vendedor flexible: opción solo licencia (${vendedor.precio.toLocaleString()}€) o con coche (${(vendedor.precioConCoche || vendedor.precio).toLocaleString()}€)`);
    }
  } else if (buscaCocheComp === 'INDIFERENTE') {
    cocheEncaja = true;
    score += 15;
    razones.push(modalidadVend === 'CON_COCHE' ? `Incluye coche (${vendedor.vehiculo?.modelo || 'Vehículo'}) y comprador es indiferente` : 'Vende solo licencia y comprador es indiferente');
  } else if (buscaCocheComp === 'CON_COCHE') {
    if (modalidadVend === 'CON_COCHE') {
      cocheEncaja = true;
      score += 15;
      razones.push(`Ambos coinciden: incluye vehículo ${vendedor.vehiculo?.modelo || ''} (${vendedor.vehiculo?.anoMatriculacion || ''})`);
    } else {
      alertas.push('Comprador exige coche pero el vendedor vende SOLO licencia');
    }
  } else if (buscaCocheComp === 'SOLO_LICENCIA') {
    if (modalidadVend === 'SOLO_LICENCIA') {
      cocheEncaja = true;
      score += 15;
      razones.push('Ambos coinciden: solo licencia sin vehículo');
    } else {
      score += 5;
      alertas.push(`Vendedor exige venta con coche incluido (${vendedor.vehiculo?.modelo || ''})`);
    }
  }

  // Valor añadido del vehículo (exenciones o alertas de préstamo de coche)
  if (evaluandoConCoche && vendedor.vehiculo) {
    if (vendedor.vehiculo.exentoLibranza) {
      razones.push(`⚡ Coche con exención de descanso (${vendedor.vehiculo.detalleExencion || 'CERO Emisiones'}): ¡permite trabajar sin libranza obligatoria!`);
    }
    if (vendedor.vehiculo.carga === 'PRESTAMO') {
      alertas.push(`🚗 Vehículo con financiación/reserva de dominio: ${vendedor.vehiculo.detalleCarga || 'cancelar con el precio'}`);
    }
  }

  // 4. CARGAS Y FINANCIACIÓN (Hasta 15 puntos)
  let cargaEncaja = false;
  if (vendedor.cargaLicencia === 'SIN_CARGA') {
    cargaEncaja = true;
    score += 15;
    razones.push('Licencia libre de cargas/préstamos');
  } else {
    // Vendedor tiene préstamo u otra carga
    if (comprador.aceptaConPrestamo === true || comprador.aceptaConPrestamo === 'INDIFERENTE') {
      cargaEncaja = true;
      score += 15;
      razones.push(`Licencia con ${vendedor.cargaLicencia === 'PRESTAMO' ? 'préstamo' : 'carga'} asumible por el comprador`);
    } else {
      alertas.push(`Licencia con ${vendedor.cargaLicencia === 'PRESTAMO' ? 'préstamo bancario' : 'otra carga'} pendiente (${vendedor.detalleCargaLicencia || 'consultar'})`);
    }
  }

  // 5. BONUS COMERCIAL: SEÑALIZACIÓN INMEDIATA
  if (comprador.puedeSenalizarYa) {
    razones.push('⭐ Comprador listo para SEÑALIZAR DE INMEDIATO');
  }

  // 6. AVISO CONDICIÓN DE VENTA (Jubilación, etc.)
  if (vendedor.condicionVenta === 'JUBILACION') {
    alertas.push(`Venta tras jubilación del vendedor${vendedor.fechaJubilacion ? ` (${vendedor.fechaJubilacion})` : ''}`);
  } else if (vendedor.condicionVenta === 'OTRA' && vendedor.detalleCondicion) {
    alertas.push(`Condición del vendedor: ${vendedor.detalleCondicion}`);
  }

  // Nivel
  let nivel: 'EXCELENTE' | 'BUENO' | 'POTENCIAL' = 'POTENCIAL';
  if (score >= 80) {
    nivel = 'EXCELENTE';
  } else if (score >= 60) {
    nivel = 'BUENO';
  }

  return {
    score,
    nivel,
    razones,
    alertas,
    diferenciaPrecio,
    precioEncaja,
    libranzaEncaja,
    turnoEncaja,
    cocheEncaja,
    cargaEncaja,
  };
}

export function findMatches(vendedores: Vendedor[], compradores: Comprador[]): CruceMatch[] {
  const matches: CruceMatch[] = [];

  for (const comprador of compradores) {
    if (comprador.estado === 'CERRADO') continue;

    for (const vendedor of vendedores) {
      if (vendedor.estado === 'CERRADO') continue;

      const match = calculateMatch(vendedor, comprador);
      // Filtramos cruces que tengan al menos una afinidad mínima (score >= 50)
      if (match.score >= 50) {
        matches.push({
          id: `${vendedor.id}_${comprador.id}`,
          vendedor,
          comprador,
          match,
        });
      }
    }
  }

  // Ordenar por puntuación descendente
  return matches.sort((a, b) => b.match.score - a.match.score);
}
