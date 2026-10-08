import { Vendedor, Comprador, MatchScore, CruceMatch } from '../types';

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

  // 1. LIBRANZA (Hasta 35 puntos)
  let libranzaEncaja = false;
  if (comprador.diaLibranzaDeseada === 'CUALQUIERA' || comprador.diaLibranzaDeseada === vendedor.diaLibranza) {
    libranzaEncaja = true;
    score += 35;
    if (comprador.diaLibranzaDeseada === 'CUALQUIERA') {
      razones.push(`Comprador busca cualquier libranza (Vendedor tiene ${vendedor.diaLibranza})`);
    } else {
      razones.push(`Día de libranza coincide exactamente: ${vendedor.diaLibranza}`);
    }
  } else {
    alertas.push(`Libranza diferente: Vendedor tiene ${vendedor.diaLibranza}, comprador prefiere ${comprador.diaLibranzaDeseada}`);
  }

  // 2. PRECIO (Hasta 35 puntos)
  const diferenciaPrecio = vendedor.precio - comprador.precioMaximo;
  let precioEncaja = false;

  if (diferenciaPrecio <= 0) {
    precioEncaja = true;
    score += 35;
    const ahorro = Math.abs(diferenciaPrecio);
    if (ahorro > 0) {
      razones.push(`Precio en rango: Vendedor pide ${vendedor.precio.toLocaleString()}€ (Comprador tiene hasta ${comprador.precioMaximo.toLocaleString()}€, sobran ${ahorro.toLocaleString()}€)`);
    } else {
      razones.push(`Precio exacto en presupuesto: ${vendedor.precio.toLocaleString()}€`);
    }
  } else {
    // El vendedor pide más de lo que el comprador quiere pagar
    const pctExceso = (diferenciaPrecio / comprador.precioMaximo) * 100;
    if (vendedor.precioNegociable) {
      if (pctExceso <= 6) {
        // Exceso menor y negociable
        score += 25;
        alertas.push(`Precio supera en ${diferenciaPrecio.toLocaleString()}€ pero el vendedor es NEGOCIABLE (margen salvable)`);
      } else if (pctExceso <= 12) {
        score += 15;
        alertas.push(`Precio supera en ${diferenciaPrecio.toLocaleString()}€ (negociable, requiere acuerdo)`);
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
  if (comprador.buscaConCoche === 'INDIFERENTE') {
    cocheEncaja = true;
    score += 15;
    razones.push(vendedor.vendeConCoche ? `Incluye coche (${vendedor.vehiculo?.modelo || 'Vehículo'}) y comprador es indiferente` : 'Vende solo licencia y comprador es indiferente');
  } else if (comprador.buscaConCoche === 'CON_COCHE') {
    if (vendedor.vendeConCoche) {
      cocheEncaja = true;
      score += 15;
      razones.push(`Ambos coinciden: incluye vehículo ${vendedor.vehiculo?.modelo || ''} (${vendedor.vehiculo?.anoMatriculacion || ''})`);
    } else {
      alertas.push('Comprador exige coche pero el vendedor vende SOLO licencia');
    }
  } else if (comprador.buscaConCoche === 'SOLO_LICENCIA') {
    if (!vendedor.vendeConCoche) {
      cocheEncaja = true;
      score += 15;
      razones.push('Ambos coinciden: solo licencia sin vehículo');
    } else {
      score += 5;
      alertas.push(`Vendedor incluye coche (${vendedor.vehiculo?.modelo || ''}), consultar si aceptaría vender solo licencia`);
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
