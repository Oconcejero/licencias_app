import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Vendedor, Comprador, CruceMatch, getCompradorDias } from '../types';
import { colors } from '../theme/colors';
import { shareService } from '../services/shareService';

interface ExportCardModalProps {
  visible: boolean;
  onClose: () => void;
  vendedor?: Vendedor | null;
  comprador?: Comprador | null;
  cruce?: CruceMatch | null;
  recipientPhone?: string;
}

export const ExportCardModal: React.FC<ExportCardModalProps> = ({
  visible,
  onClose,
  vendedor,
  comprador,
  cruce,
  recipientPhone,
}) => {
  const [activeTab, setActiveTab] = useState<'CARD' | 'TEXT'>('CARD');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [comisionText, setComisionText] = useState<string>('');
  const comision = parseInt(comisionText.replace(/[^\d]/g, ''), 10) || 0;

  useEffect(() => {
    if (visible) {
      setComisionText('');
      setCopiedStatus(null);
    }
  }, [visible]);

  // Vendedor ajustado con la comisión añadida (solo para la imagen/texto exportado)
  const curVendedor = useMemo(() => {
    if (!vendedor) return null;
    if (!comision) return vendedor;
    return {
      ...vendedor,
      precio: vendedor.precio + comision,
      precioConCoche: vendedor.precioConCoche ? vendedor.precioConCoche + comision : undefined,
    };
  }, [vendedor, comision]);

  // Cruce ajustado con la comisión añadida al precio del vendedor
  const curCruce = useMemo(() => {
    if (!cruce) return null;
    if (!comision) return cruce;
    return {
      ...cruce,
      vendedor: {
        ...cruce.vendedor,
        precio: cruce.vendedor.precio + comision,
        precioConCoche: cruce.vendedor.precioConCoche ? cruce.vendedor.precioConCoche + comision : undefined,
      },
    };
  }, [cruce, comision]);

  // Generar el texto formateado con el precio ya ajustado
  const messageText = useMemo(() => {
    if (curVendedor) {
      return shareService.generateVendedorReport(curVendedor);
    } else if (comprador) {
      return shareService.generateCompradorReport(comprador);
    } else if (curCruce) {
      return shareService.generateMatchReport(curCruce);
    }
    return '';
  }, [curVendedor, comprador, curCruce]);

  // Título del modal
  const title = vendedor
    ? `Ficha Técnica • ${vendedor.nombre}`
    : comprador
    ? `Demanda • ${comprador.nombre}`
    : `Cruce Match • ${cruce?.vendedor.nombre} & ${cruce?.comprador.nombre}`;

  // Helper para copiar texto
  const handleCopyText = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(messageText);
        setCopiedStatus('¡Texto copiado al portapapeles!');
        setTimeout(() => setCopiedStatus(null), 3000);
      } else {
        Alert.alert('Copiado', 'Texto listo para pegar en WhatsApp.');
      }
    } catch {
      Alert.alert('Atención', 'No se pudo copiar automáticamente.');
    }
  };

  // Helper para enviar directo a WhatsApp
  const handleOpenWhatsApp = () => {
    shareService.sendWhatsApp(recipientPhone || '', messageText);
  };

  // Generador de imagen en Canvas (Web)
  const generateCanvasImage = async (): Promise<HTMLCanvasElement | null> => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fondo degradado Dark Luxury
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0A1128');
    bgGrad.addColorStop(0.5, '#101F42');
    bgGrad.addColorStop(1, '#070D1F');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Borde exterior fino con acento
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Marco interior dorado/esmeralda
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Cabecera: Marca y Tagline
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('🚖  EXPEDIENTE PROFESIONAL • LICENCIAS TAXI MADRID (APC)', 60, 80);

    ctx.fillStyle = '#64748B';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`ID REF: #${vendedor?.id || comprador?.id || 'EXP'} • ${new Date().toLocaleDateString('es-ES')}`, width - 320, 80);

    // Línea separadora
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 105);
    ctx.lineTo(width - 60, 105);
    ctx.stroke();

    if (curVendedor) {
      // 1. Badge de Libranza
      const badgeY = 145;
      const diaTexto =
        curVendedor.diaLibranza === 'EUROTAXI'
          ? '♿ EUROTAXI • EXENTO DE LIBRANZA (7 DÍAS)'
          : curVendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
          ? '⚡ ELÉCTRICO CERO • EXENTO DE LIBRANZA'
          : curVendedor.diaLibranza === 'LIBRE_24H'
          ? '🟢 24H LIBRE • SIN DESCANSO OBLIGATORIO'
          : `LIBRANZA ${curVendedor.diaLibranza} • TURNO ${curVendedor.turnoDescanso || 'PAR'}`;

      ctx.fillStyle = colors.libranza[curVendedor.diaLibranza] || '#10B981';
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 480, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(diaTexto, 80, badgeY + 32);

      // 2. Bloque de Precio Gigante (con comisión ya sumada si corresponde)
      const priceBoxY = 225;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(60, priceBoxY, width - 120, 150, 14);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('VALORACIÓN / PRECIO DE SALIDA', 90, priceBoxY + 40);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 50px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${curVendedor.precio.toLocaleString('es-ES')} €`, 90, priceBoxY + 102);

      if (curVendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && curVendedor.precioConCoche) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`(Solo Licencia)`, 400, priceBoxY + 102);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillText(`•  ${curVendedor.precioConCoche.toLocaleString('es-ES')} €`, 580, priceBoxY + 102);
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`(Con Vehículo)`, 860, priceBoxY + 102);
      } else {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(
          curVendedor.modalidadVentaCoche === 'CON_COCHE'
            ? '(Pack con Vehículo)'
            : '(Solo Licencia)',
          420,
          priceBoxY + 102
        );
      }

      ctx.fillStyle = curVendedor.precioNegociable ? '#10B981' : '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.precioNegociable ? '✓ PRECIO NEGOCIABLE' : '• PRECIO FIJO',
        90,
        priceBoxY + 132
      );

      // 3. Grid de Especificaciones (4 Cajas)
      const gridY = 405;
      const colW = (width - 150) / 2;
      const boxH = 110;

      // Caja 1: Vehículo
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚗 VEHÍCULO', 80, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      const vehText = curVendedor.vendeConCoche && curVendedor.vehiculo
        ? `${curVendedor.vehiculo.modelo} (${curVendedor.vehiculo.anoMatriculacion || 'Coche'})`
        : 'Solo licencia (sin coche)';
      ctx.fillText(vehText, 80, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const vehSub = curVendedor.vendeConCoche && curVendedor.vehiculo
        ? `${curVendedor.vehiculo.kilometros || '0'} km • ${curVendedor.vehiculo.carga === 'SIN_CARGA' ? 'Sin deuda' : 'Con reserva'}`
        : 'El comprador aporta su vehículo';
      ctx.fillText(vehSub, 80, gridY + 92);

      // Caja 2: Cargas Licencia
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('⚖️ SITUACIÓN DE CARGAS', 60 + colW + 50, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.cargaLicencia === 'SIN_CARGA' ? '100% Libre de Cargas' : 'Con Préstamo Bancario',
        60 + colW + 50,
        gridY + 65
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.detalleCargaLicencia || 'Acreditación al día para traspaso',
        60 + colW + 50,
        gridY + 92
      );

      // Caja 3: Titular y Contacto
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY + boxH + 20, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('👤 TITULAR / VENDEDOR', 80, gridY + boxH + 55);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${curVendedor.nombre} (${curVendedor.perfil})`, 80, gridY + boxH + 85);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.telefono ? `📞 ${curVendedor.telefono}` : `💬 Canal: ${curVendedor.canalContacto || 'Chat'}`,
        80,
        gridY + boxH + 112
      );

      // Caja 4: Disponibilidad
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY + boxH + 20, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#A855F7';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('⏱️ DISPONIBILIDAD DE ENTREGA', 60 + colW + 50, gridY + boxH + 55);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.condicionVenta === 'INMEDIATA' ? 'Inmediata para Firma' : 'Tras Jubilación',
        60 + colW + 50,
        gridY + boxH + 85
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curVendedor.notas ? `📝 ${curVendedor.notas.slice(0, 45)}...` : 'Trámite notarial y municipal',
        60 + colW + 50,
        gridY + boxH + 112
      );

      // 4. Pie de Seguridad y Marca
      const footerY = 720;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(60, footerY, width - 120, 110, 10);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 DOCUMENTO OFICIAL PARA INTERMEDIACIÓN Y TRASPASO', 90, footerY + 40);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        'Datos verificados para gestión de compraventa de licencias de autotaxi del Área de Prestación Conjunta de Madrid.',
        90,
        footerY + 70
      );
    } else if (comprador) {
      // 1. Badge de Demanda de Libranza
      const badgeY = 145;
      const diasBuscados = getCompradorDias(comprador);
      const isMulti = diasBuscados.length > 1;
      const isCualquiera = diasBuscados.includes('CUALQUIERA');
      const diaTexto = isCualquiera
        ? '🔄 DEMANDA: CUALQUIER DÍA (INDIFERENTE)'
        : isMulti
        ? `DEMANDA (${diasBuscados.length}): ${diasBuscados.join(' • ')}`
        : diasBuscados[0] === 'EUROTAXI'
        ? '♿ DEMANDA: EUROTAXI • EXENTO DE LIBRANZA'
        : diasBuscados[0] === 'ELECTRICO_SIN_LIBRANZA'
        ? '⚡ DEMANDA: ELÉCTRICO CERO • SIN LIBRANZA'
        : diasBuscados[0] === 'LIBRE_24H'
        ? '🟢 DEMANDA: 24H LIBRE'
        : `DEMANDA: ${diasBuscados[0]} • TURNO ${comprador.turnoDescansoDeseado || 'INDIFERENTE'}`;

      ctx.fillStyle = isMulti ? '#4F46E5' : colors.libranza[diasBuscados[0]] || '#3B82F6';
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 520, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(diaTexto, 80, badgeY + 32);

      // 2. Bloque de Presupuesto Gigante
      const priceBoxY = 225;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(60, priceBoxY, width - 120, 150, 14);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('PRESUPUESTO MÁXIMO DISPONIBLE', 90, priceBoxY + 40);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 50px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${comprador.precioMaximo.toLocaleString('es-ES')} €`, 90, priceBoxY + 102);

      ctx.fillStyle = comprador.puedeSenalizarYa ? '#F59E0B' : '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        comprador.puedeSenalizarYa ? '🔥 DISPONIBLE PARA SEÑALIZAR DE INMEDIATO' : '• PENDIENTE DE ACUERDO',
        90,
        priceBoxY + 132
      );

      // 3. Grid
      const gridY = 405;
      const colW = (width - 150) / 2;
      const boxH = 110;

      // Caja 1: Requisito Vehículo
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚗 REQUISITO DE VEHÍCULO', 80, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      const prefText =
        comprador.buscaConCoche === 'CON_COCHE'
          ? 'Exige con Coche Incluido'
          : comprador.buscaConCoche === 'SOLO_LICENCIA'
          ? 'Solo Licencia'
          : 'Indiferente (Con o Sin Coche)';
      ctx.fillText(prefText, 80, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Preferencia de adquisición', 80, gridY + 92);

      // Caja 2: Gestoría / Asesoría
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('📋 FINANCIACIÓN / SUBROGACIÓN', 60 + colW + 50, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      const cargaText = comprador.aceptaConPrestamo === true
        ? 'Acepta Préstamo'
        : comprador.aceptaConPrestamo === false
        ? 'Solo Sin Cargas'
        : 'Indiferente / Negociable';
      ctx.fillText(cargaText, 60 + colW + 50, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Condición de compra', 60 + colW + 50, gridY + 92);

      // Caja 3: Titular
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY + boxH + 20, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('👤 INTERESADO / COMPRADOR', 80, gridY + boxH + 55);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${comprador.nombre} (${comprador.perfil})`, 80, gridY + boxH + 85);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        comprador.telefono ? `📞 ${comprador.telefono}` : `💬 Canal: ${comprador.canalContacto || 'Chat'}`,
        80,
        gridY + boxH + 112
      );

      // Caja 4: Notas
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY + boxH + 20, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#A855F7';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('⏱️ OBSERVACIONES DE DEMANDA', 60 + colW + 50, gridY + boxH + 55);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        comprador.notas ? `${comprador.notas.slice(0, 42)}...` : 'Listo para matching',
        60 + colW + 50,
        gridY + boxH + 85
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Cartera activa de compradores', 60 + colW + 50, gridY + boxH + 112);

      // Footer
      const footerY = 720;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(60, footerY, width - 120, 110, 10);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 EXPEDIENTE OFICIAL DE DEMANDA • TAXIS MADRID', 90, footerY + 40);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        'Demanda activa verificada para adquisición y formalización de licencia de autotaxi.',
        90,
        footerY + 70
      );
    } else if (curCruce) {
      // 1. Badge de afinidad
      const badgeY = 145;
      ctx.fillStyle = curCruce.match.score >= 80 ? '#10B981' : '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 480, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`⚡ MATCH ${curCruce.match.score}% ${curCruce.match.nivel}`, 80, badgeY + 32);

      // 2. Bloque dual de precios
      const priceBoxY = 215;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(60, priceBoxY, width - 120, 165, 14);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('OFERTA (VENDEDOR)  vs  DEMANDA (COMPRADOR)', 90, priceBoxY + 32);

      const precioVendEval = curCruce.match.precioEvaluado ? curCruce.match.precioEvaluado + comision : curCruce.vendedor.precio;
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${precioVendEval.toLocaleString('es-ES')} €`, 90, priceBoxY + 80);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('↔', 390, priceBoxY + 78);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${curCruce.comprador.precioMaximo.toLocaleString('es-ES')} €`, 450, priceBoxY + 80);

      // Subetiquetas de precios y coche
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      const vendPriceSub = curCruce.vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES'
        ? `🚗 Con coche: ${(curCruce.vendedor.precioConCoche || curCruce.vendedor.precio).toLocaleString('es-ES')}€ | 📄 Sin coche: ${curCruce.vendedor.precio.toLocaleString('es-ES')}€`
        : curCruce.vendedor.modalidadVentaCoche === 'CON_COCHE'
        ? '🚗 Pack con vehículo incluido'
        : '📄 Solo licencia (sin vehículo)';
      ctx.fillText(vendPriceSub, 90, priceBoxY + 112);

      const compPrefSub = curCruce.comprador.buscaConCoche === 'CON_COCHE'
        ? '🚗 Demanda: Pack con coche'
        : curCruce.comprador.buscaConCoche === 'SOLO_LICENCIA'
        ? '📄 Demanda: Solo licencia'
        : 'Demanda: Coche indiferente';
      ctx.fillText(compPrefSub, 450, priceBoxY + 112);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        curCruce.comprador.puedeSenalizarYa ? '🔥 Comprador listo para señalizar de inmediato' : '• Operación viable comercialmente',
        90,
        priceBoxY + 145
      );

      // 3. Grid
      const gridY = 405;
      const colW = (width - 150) / 2;
      const boxH = 110;

      // Caja 1: Vendedor
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚗 OFERTA: ' + curCruce.vendedor.nombre, 80, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Libranza: ${curCruce.vendedor.diaLibranza} (${curCruce.vendedor.turnoDescanso || 'PAR'})`, 80, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(curCruce.vendedor.telefono ? `📞 ${curCruce.vendedor.telefono}` : 'Chat online', 80, gridY + 92);

      // Caja 2: Comprador
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('👤 DEMANDA: ' + curCruce.comprador.nombre, 60 + colW + 50, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Busca: ${getCompradorDias(curCruce.comprador).join(', ')}`, 60 + colW + 50, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(curCruce.comprador.telefono ? `📞 ${curCruce.comprador.telefono}` : 'Chat online', 60 + colW + 50, gridY + 92);

      // Caja 3 & 4: Claves del match
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60, gridY + boxH + 20, width - 120, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('⚡ MOTIVOS DEL ENCAJE', 80, gridY + boxH + 55);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillText(curCruce.match.razones.slice(0, 2).map(r => `✓ ${r}`).join('   |   '), 80, gridY + boxH + 85);

      // Footer
      const footerY = 720;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(60, footerY, width - 120, 110, 10);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 CRUCE COMERCIAL LISTO PARA TRASPASO', 90, footerY + 40);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        'Informe generado para intermediación y cierre de operación entre comprador y vendedor.',
        90,
        footerY + 70
      );
    }

    return canvas;
  };

  // Copiar imagen PNG al portapapeles
  const handleCopyImageToClipboard = async () => {
    try {
      const canvas = await generateCanvasImage();
      if (!canvas) {
        Alert.alert('Aviso', 'Generación visual disponible en navegador web.');
        return;
      }

      canvas.toBlob(async blob => {
        if (!blob) {
          Alert.alert('Error', 'No se pudo generar la imagen.');
          return;
        }

        try {
          // Copiar imagen nativa al portapapeles
          // @ts-ignore
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedStatus('¡Imagen copiada! Abre WhatsApp y pulsa Ctrl + V para pegarla');
          setTimeout(() => setCopiedStatus(null), 4000);
        } catch {
          // Fallback a descarga si el navegador tiene permisos estrictos
          handleDownloadImage();
        }
      }, 'image/png');
    } catch {
      handleDownloadImage();
    }
  };

  // Descargar imagen PNG
  const handleDownloadImage = async () => {
    try {
      const canvas = await generateCanvasImage();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filenameBase = vendedor
        ? `Ficha_Taxi_Venta_${vendedor.nombre?.replace(/\s+/g, '_')}`
        : comprador
        ? `Ficha_Taxi_Demanda_${comprador.nombre?.replace(/\s+/g, '_')}`
        : `Match_Taxi_${cruce?.vendedor.nombre}_y_${cruce?.comprador.nombre}`;
      link.download = `${filenameBase}.png`;
      link.href = dataUrl;
      link.click();

      setCopiedStatus('¡Ficha descargada en PNG!');
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch {
      Alert.alert('Error', 'No se pudo descargar la imagen.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>📤 {title}</Text>
              <Text style={styles.subtitle}>Formato ejecutivo de exportación para WhatsApp y clientes</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Notificación de copiado */}
          {copiedStatus && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>✨ {copiedStatus}</Text>
            </View>
          )}

          {/* BLOQUE DE COMISIÓN (Para Vendedor o Cruce) */}
          {(vendedor || cruce) && (
            <View style={styles.comisionCard}>
              <View style={styles.comisionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.comisionTitle}>💰 ¿Cuánto quieres añadir de comisión?</Text>
                  <Text style={styles.comisionSubtitle}>
                    Se sumará directamente al precio de la ficha exportada (la BD queda intacta).
                  </Text>
                </View>
                {comision > 0 && (
                  <View style={styles.comisionBadge}>
                    <Text style={styles.comisionBadgeText}>+{comision.toLocaleString('es-ES')} €</Text>
                  </View>
                )}
              </View>

              <View style={styles.comisionRow}>
                <View style={styles.comisionInputBox}>
                  <TextInput
                    style={styles.comisionInput}
                    value={comisionText}
                    onChangeText={setComisionText}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={styles.comisionEuro}>€</Text>
                </View>

                <View style={styles.quickChipsWrap}>
                  <TouchableOpacity
                    style={[styles.quickChip, comision === 1000 && styles.quickChipActive]}
                    onPress={() => setComisionText('1000')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, comision === 1000 && styles.quickChipTextActive]}>+1.000 €</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickChip, comision === 2000 && styles.quickChipActive]}
                    onPress={() => setComisionText('2000')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, comision === 2000 && styles.quickChipTextActive]}>+2.000 €</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickChip, comision === 3000 && styles.quickChipActive]}
                    onPress={() => setComisionText('3000')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, comision === 3000 && styles.quickChipTextActive]}>+3.000 €</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickChip, comision === 5000 && styles.quickChipActive]}
                    onPress={() => setComisionText('5000')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, comision === 5000 && styles.quickChipTextActive]}>+5.000 €</Text>
                  </TouchableOpacity>

                  {comision > 0 && (
                    <TouchableOpacity
                      style={styles.resetChip}
                      onPress={() => setComisionText('')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.resetChipText}>✕ Quitar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {comision > 0 && curVendedor && (
                <View style={styles.comisionFeedback}>
                  <Text style={styles.comisionFeedbackText}>
                    Precio original: <Text style={{ textDecorationLine: 'line-through', color: colors.textMuted }}>{vendedor?.precio.toLocaleString('es-ES')} €</Text>
                    {' ➔ '}
                    <Text style={{ fontWeight: '800', color: '#34D399' }}>
                      Precio en ficha exportada: {curVendedor.precio.toLocaleString('es-ES')} €
                    </Text>
                    {curVendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && curVendedor.precioConCoche
                      ? ` (Con coche: ${curVendedor.precioConCoche.toLocaleString('es-ES')} €)`
                      : ''}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Selector de pestañas */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CARD' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CARD')}
            >
              <Text style={[styles.tabText, activeTab === 'CARD' && styles.tabTextActive]}>
                🖼️ Ficha Gráfica (Flyer Digital)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TEXT' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TEXT')}
            >
              <Text style={[styles.tabText, activeTab === 'TEXT' && styles.tabTextActive]}>
                💬 Mensaje WhatsApp Ejecutivo
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentArea}>
            {activeTab === 'CARD' ? (
              <View style={styles.cardPreviewContainer}>
                {/* VISTA PREVIA DEL FLYER DIGITAL PARA VENDEDOR */}
                {curVendedor && (
                  <View style={styles.flyerCard}>
                    {/* Cabecera flyer */}
                    <View style={styles.flyerHeader}>
                      <Text style={styles.flyerBrand}>🚖 TAXI MADRID • EXPEDIENTE OFICIAL</Text>
                      <Text style={styles.flyerDate}>REF: #{curVendedor.id?.slice(-6) || 'APC'}</Text>
                    </View>

                    {/* Badge de libranza */}
                    <View
                      style={[
                        styles.flyerLibranzaBadge,
                        {
                          backgroundColor: colors.libranza[curVendedor.diaLibranza] || colors.primary,
                        },
                      ]}
                    >
                      <Text style={styles.flyerLibranzaText}>
                        {curVendedor.diaLibranza === 'EUROTAXI'
                          ? '♿ EUROTAXI • EXENTO DE LIBRANZA (7 DÍAS)'
                          : curVendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
                          ? '⚡ ELÉCTRICO CERO • EXENTO DE LIBRANZA'
                          : curVendedor.diaLibranza === 'LIBRE_24H'
                          ? '🟢 24H LIBRE • SIN RESTRICCIÓN'
                          : `LIBRANZA ${curVendedor.diaLibranza} • TURNO ${curVendedor.turnoDescanso || 'PAR'}`}
                      </Text>
                    </View>

                    {/* Precio Callout */}
                    <View style={styles.flyerPriceBox}>
                      <Text style={styles.flyerPriceLabel}>VALORACIÓN / PRECIO DE SALIDA</Text>
                      <View style={styles.flyerPriceRow}>
                        <Text style={styles.flyerPriceValue}>
                          {curVendedor.precio.toLocaleString('es-ES')} €
                        </Text>
                        {curVendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && curVendedor.precioConCoche ? (
                          <View style={{ marginLeft: 16 }}>
                            <Text style={styles.flyerPriceSubValue}>
                              • {curVendedor.precioConCoche.toLocaleString('es-ES')} €
                            </Text>
                            <Text style={styles.flyerPriceNote}>(Con Vehículo)</Text>
                          </View>
                        ) : (
                          <Text style={styles.flyerPriceNote}>
                            {curVendedor.modalidadVentaCoche === 'CON_COCHE' ? '(Pack con Coche)' : '(Solo Licencia)'}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.flyerNegotiable,
                          { color: curVendedor.precioNegociable ? colors.accent : colors.textMuted },
                        ]}
                      >
                        {curVendedor.precioNegociable ? '✓ Precio Negociable' : '• Precio Fijo'}
                      </Text>
                    </View>

                    {/* Grid de Datos */}
                    <View style={styles.flyerGrid}>
                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>🚗 VEHÍCULO</Text>
                        <Text style={styles.flyerGridMain}>
                          {curVendedor.vendeConCoche && curVendedor.vehiculo
                            ? `${curVendedor.vehiculo.modelo} (${curVendedor.vehiculo.anoMatriculacion || ''})`
                            : 'Solo licencia (sin coche)'}
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {curVendedor.vendeConCoche && curVendedor.vehiculo
                            ? `${curVendedor.vehiculo.kilometros || '0'} km • ${curVendedor.vehiculo.carga === 'SIN_CARGA' ? 'Sin deuda' : 'Financiado'}`
                            : 'Comprador aporta vehículo'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>⚖️ SITUACIÓN DE CARGAS</Text>
                        <Text style={styles.flyerGridMain}>
                          {curVendedor.cargaLicencia === 'SIN_CARGA' ? '100% Libre de Cargas' : 'Con Préstamo'}
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {curVendedor.detalleCargaLicencia || 'Acreditación al día'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>👤 TITULAR / CONTACTO</Text>
                        <Text style={styles.flyerGridMain}>
                          {curVendedor.nombre} ({curVendedor.perfil})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {curVendedor.telefono ? `📞 ${curVendedor.telefono}` : `💬 Canal: ${curVendedor.canalContacto || 'Chat'}`}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>⏱️ DISPONIBILIDAD</Text>
                        <Text style={styles.flyerGridMain}>
                          {curVendedor.condicionVenta === 'INMEDIATA' ? 'Inmediata para Firma' : 'Tras Jubilación'}
                        </Text>
                        <Text style={styles.flyerGridSub} numberOfLines={1}>
                          {curVendedor.notas ? `📝 ${curVendedor.notas}` : 'Traspaso municipal'}
                        </Text>
                      </View>
                    </View>

                    {/* Pie flyer */}
                    <View style={styles.flyerFooter}>
                      <Text style={styles.flyerFooterText}>
                        🔒 EXPEDIENTE OFICIAL DE INTERMEDIACIÓN • TAXIS MADRID
                      </Text>
                    </View>
                  </View>
                )}

                {/* VISTA PREVIA DEL FLYER DIGITAL PARA COMPRADOR */}
                {comprador && (
                  <View style={styles.flyerCard}>
                    <View style={styles.flyerHeader}>
                      <Text style={styles.flyerBrand}>🚖 TAXI MADRID • EXPEDIENTE DE COMPRADOR</Text>
                      <Text style={styles.flyerDate}>REF: #{comprador.id?.slice(-6) || 'APC'}</Text>
                    </View>

                    {(() => {
                      const diasBuscados = getCompradorDias(comprador);
                      const isMulti = diasBuscados.length > 1;
                      const isCualquiera = diasBuscados.includes('CUALQUIERA');
                      const bg = isMulti ? '#4F46E5' : colors.libranza[diasBuscados[0]] || colors.primary;
                      const txt = isCualquiera
                        ? '🔄 BUSCA CUALQUIER DÍA (INDIFERENTE)'
                        : isMulti
                        ? `BUSCA (${diasBuscados.length}): ${diasBuscados.join(' • ')}`
                        : diasBuscados[0] === 'EUROTAXI'
                        ? '♿ BUSCA EUROTAXI • EXENTO DE LIBRANZA'
                        : diasBuscados[0] === 'ELECTRICO_SIN_LIBRANZA'
                        ? '⚡ BUSCA ELÉCTRICO CERO • SIN LIBRANZA'
                        : diasBuscados[0] === 'LIBRE_24H'
                        ? '🟢 BUSCA 24H LIBRE'
                        : `BUSCA ${diasBuscados[0]} • TURNO ${comprador.turnoDescansoDeseado || 'INDIFERENTE'}`;
                      return (
                        <View style={[styles.flyerLibranzaBadge, { backgroundColor: bg }]}>
                          <Text style={styles.flyerLibranzaText}>{txt}</Text>
                        </View>
                      );
                    })()}

                    <View style={styles.flyerPriceBox}>
                      <Text style={styles.flyerPriceLabel}>PRESUPUESTO MÁXIMO DISPONIBLE</Text>
                      <View style={styles.flyerPriceRow}>
                        <Text style={[styles.flyerPriceValue, { color: colors.success }]}>
                          {comprador.precioMaximo.toLocaleString('es-ES')} €
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.flyerNegotiable,
                          { color: comprador.puedeSenalizarYa ? colors.accent : colors.textMuted },
                        ]}
                      >
                        {comprador.puedeSenalizarYa ? '🔥 Listo para señalizar de inmediato' : '• En búsqueda activa'}
                      </Text>
                    </View>

                    <View style={styles.flyerGrid}>
                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>🚗 REQUISITO VEHÍCULO</Text>
                        <Text style={styles.flyerGridMain}>
                          {comprador.buscaConCoche === 'CON_COCHE'
                            ? 'Con Coche Incluido'
                            : comprador.buscaConCoche === 'SOLO_LICENCIA'
                            ? 'Solo Licencia'
                            : 'Indiferente'}
                        </Text>
                        <Text style={styles.flyerGridSub}>Preferencia de compra</Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>📋 FINANCIACIÓN / CARGAS</Text>
                        <Text style={styles.flyerGridMain}>
                          {comprador.aceptaConPrestamo === true
                            ? 'Acepta Préstamo'
                            : comprador.aceptaConPrestamo === false
                            ? 'Solo Sin Cargas'
                            : 'Indiferente'}
                        </Text>
                        <Text style={styles.flyerGridSub}>Condición de compra</Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>👤 INTERESADO / CONTACTO</Text>
                        <Text style={styles.flyerGridMain}>
                          {comprador.nombre} ({comprador.perfil})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {comprador.telefono ? `📞 ${comprador.telefono}` : `💬 Canal: ${comprador.canalContacto || 'Chat'}`}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>⏱️ ESTADO OPERACIÓN</Text>
                        <Text style={styles.flyerGridMain}>
                          {comprador.puedeSenalizarYa ? 'Listo para Señal' : 'En Búsqueda'}
                        </Text>
                        <Text style={styles.flyerGridSub} numberOfLines={1}>
                          {comprador.notas ? `📝 ${comprador.notas}` : 'Cartera activa'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.flyerFooter}>
                      <Text style={styles.flyerFooterText}>
                        🔒 EXPEDIENTE OFICIAL DE DEMANDA • TAXIS MADRID
                      </Text>
                    </View>
                  </View>
                )}

                {/* VISTA PREVIA DEL FLYER DIGITAL PARA MATCH */}
                {curCruce && (
                  <View style={styles.flyerCard}>
                    <View style={styles.flyerHeader}>
                      <Text style={styles.flyerBrand}>🚖 TAXI MADRID • CRUCE / MATCH COMERCIAL</Text>
                      <Text style={styles.flyerDate}>AFINIDAD: {curCruce.match.score}%</Text>
                    </View>

                    <View
                      style={[
                        styles.flyerLibranzaBadge,
                        {
                          backgroundColor: curCruce.match.score >= 80 ? colors.success : colors.accent,
                        },
                      ]}
                    >
                      <Text style={styles.flyerLibranzaText}>
                        ⚡ {curCruce.match.score}% MATCH {curCruce.match.nivel.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.flyerPriceBox}>
                      <Text style={styles.flyerPriceLabel}>OFERTA (VENDEDOR) vs DEMANDA (COMPRADOR)</Text>
                      <View style={styles.flyerPriceRow}>
                        <Text style={[styles.flyerPriceValue, { fontSize: 26 }]}>
                          {curCruce.vendedor.precio.toLocaleString('es-ES')} €
                        </Text>
                        <Text style={{ color: colors.textMuted, marginHorizontal: 12, fontSize: 20 }}>↔</Text>
                        <Text style={[styles.flyerPriceValue, { fontSize: 26, color: colors.success }]}>
                          {curCruce.comprador.precioMaximo.toLocaleString('es-ES')} €
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.flyerNegotiable,
                          { color: curCruce.comprador.puedeSenalizarYa ? colors.accent : colors.textMuted },
                        ]}
                      >
                        {curCruce.comprador.puedeSenalizarYa ? '🔥 Comprador listo para señalizar ya' : '• Operación viable'}
                      </Text>
                    </View>

                    <View style={styles.flyerGrid}>
                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>🚗 OFERTA (VENDEDOR)</Text>
                        <Text style={styles.flyerGridMain}>
                          {curCruce.vendedor.nombre} ({curCruce.vendedor.diaLibranza})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {curCruce.vendedor.telefono || 'Canal online'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>👤 DEMANDA (COMPRADOR)</Text>
                        <Text style={styles.flyerGridMain}>
                          {curCruce.comprador.nombre} ({getCompradorDias(curCruce.comprador).join(', ')})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {curCruce.comprador.telefono || 'Canal online'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.flyerFooter}>
                      <Text style={styles.flyerFooterText}>
                        🔒 CRUCE OFICIAL PARA CIERRE Y TRASPASO • TAXIS MADRID
                      </Text>
                    </View>
                  </View>
                )}

                {/* Acciones para el flyer */}
                <View style={styles.flyerActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryBtn]}
                    onPress={handleCopyImageToClipboard}
                  >
                    <Text style={styles.btnText}>📋 Copiar Imagen (para pegar en WhatsApp)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryBtn]}
                    onPress={handleDownloadImage}
                  >
                    <Text style={styles.btnTextSecondary}>📥 Descargar PNG</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.textPreviewContainer}>
                <Text style={styles.textPreviewNotice}>
                  Este es el mensaje estructurado con tipografía limpia y sin caracteres rotos:
                </Text>

                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{messageText}</Text>
                </View>

                <View style={styles.textActionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryBtn, { flex: 1 }]}
                    onPress={handleCopyText}
                  >
                    <Text style={styles.btnTextSecondary}>📋 Copiar Texto</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.waBtn, { flex: 1.2 }]}
                    onPress={handleOpenWhatsApp}
                  >
                    <Text style={styles.btnText}>💬 Enviar a WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer general */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Cerrar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 760,
    maxHeight: '94%',
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
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  toast: {
    backgroundColor: '#065F46',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#059669',
  },
  toastText: {
    color: '#D1FAE5',
    fontWeight: '700',
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '800',
  },
  contentArea: {
    padding: 20,
  },
  cardPreviewContainer: {
    alignItems: 'center',
  },
  flyerCard: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 22,
    borderWidth: 2,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  flyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 12,
    marginBottom: 14,
  },
  flyerBrand: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  flyerDate: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  flyerLibranzaBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 16,
  },
  flyerLibranzaText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  flyerPriceBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  flyerPriceLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flyerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  flyerPriceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F59E0B',
  },
  flyerPriceSubValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  flyerPriceNote: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
    marginLeft: 8,
  },
  flyerNegotiable: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  flyerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  flyerGridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  flyerGridTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 4,
  },
  flyerGridMain: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  flyerGridSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  flyerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  flyerFooterText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flyerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    width: '100%',
    maxWidth: 680,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waBtn: {
    backgroundColor: '#10B981',
  },
  btnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  btnTextSecondary: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  textPreviewContainer: {
    gap: 14,
  },
  textPreviewNotice: {
    fontSize: 12,
    color: colors.textMuted,
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  textActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceHighlight,
  },
  closeFooterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeFooterText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  comisionCard: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  comisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  comisionTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  comisionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  comisionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comisionBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  comisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  comisionInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 110,
    height: 36,
  },
  comisionInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    padding: 0,
  },
  comisionEuro: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  quickChipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  quickChip: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  quickChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  quickChipTextActive: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  resetChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetChipText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  comisionFeedback: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  comisionFeedbackText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
});
