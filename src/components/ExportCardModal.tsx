import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Vendedor, Comprador, CruceMatch } from '../types';
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

  // Generar el texto formateado
  let messageText = '';
  if (vendedor) {
    messageText = shareService.generateVendedorReport(vendedor);
  } else if (comprador) {
    messageText = shareService.generateCompradorReport(comprador);
  } else if (cruce) {
    messageText = shareService.generateMatchReport(cruce);
  }

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

    if (vendedor) {
      // 1. Badge de Libranza
      const badgeY = 145;
      const diaTexto =
        vendedor.diaLibranza === 'EUROTAXI'
          ? '♿ EUROTAXI • EXENTO DE LIBRANZA (7 DÍAS)'
          : vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
          ? '⚡ ELÉCTRICO CERO • EXENTO DE LIBRANZA'
          : vendedor.diaLibranza === 'LIBRE_24H'
          ? '🟢 24H LIBRE • SIN DESCANSO OBLIGATORIO'
          : `LIBRANZA ${vendedor.diaLibranza} • TURNO ${vendedor.turnoDescanso || 'PAR'}`;

      ctx.fillStyle = colors.libranza[vendedor.diaLibranza] || '#10B981';
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 480, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(diaTexto, 80, badgeY + 32);

      // 2. Bloque de Precio Gigante
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
      ctx.fillText(`${vendedor.precio.toLocaleString('es-ES')} €`, 90, priceBoxY + 102);

      if (vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`(Solo Licencia)`, 400, priceBoxY + 102);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillText(`•  ${vendedor.precioConCoche.toLocaleString('es-ES')} €`, 580, priceBoxY + 102);
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`(Con Vehículo)`, 860, priceBoxY + 102);
      } else {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(
          vendedor.modalidadVentaCoche === 'CON_COCHE'
            ? '(Pack con Vehículo)'
            : '(Solo Licencia)',
          420,
          priceBoxY + 102
        );
      }

      ctx.fillStyle = vendedor.precioNegociable ? '#10B981' : '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        vendedor.precioNegociable ? '✓ PRECIO NEGOCIABLE' : '• PRECIO FIJO',
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
      const vehText = vendedor.vendeConCoche && vendedor.vehiculo
        ? `${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion || 'Coche'})`
        : 'Solo licencia (sin coche)';
      ctx.fillText(vehText, 80, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const vehSub = vendedor.vendeConCoche && vendedor.vehiculo
        ? `${vendedor.vehiculo.kilometros || '0'} km • ${vendedor.vehiculo.carga === 'SIN_CARGA' ? 'Sin deuda' : 'Con reserva'}`
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
        vendedor.cargaLicencia === 'SIN_CARGA' ? '100% Libre de Cargas' : 'Con Préstamo Bancario',
        60 + colW + 50,
        gridY + 65
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        vendedor.detalleCargaLicencia || 'Acreditación al día para traspaso',
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
      ctx.fillText(`${vendedor.nombre} (${vendedor.perfil})`, 80, gridY + boxH + 85);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        vendedor.telefono ? `📞 ${vendedor.telefono}` : `💬 Canal: ${vendedor.canalContacto || 'Chat'}`,
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
        vendedor.condicionVenta === 'INMEDIATA' ? 'Inmediata para Firma' : 'Tras Jubilación',
        60 + colW + 50,
        gridY + boxH + 85
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        vendedor.notas ? `📝 ${vendedor.notas.slice(0, 45)}...` : 'Trámite notarial y municipal',
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
      const diaTexto =
        comprador.diaLibranzaDeseada === 'EUROTAXI'
          ? '♿ DEMANDA: EUROTAXI • EXENTO DE LIBRANZA'
          : comprador.diaLibranzaDeseada === 'ELECTRICO_SIN_LIBRANZA'
          ? '⚡ DEMANDA: ELÉCTRICO CERO • SIN LIBRANZA'
          : comprador.diaLibranzaDeseada === 'LIBRE_24H'
          ? '🟢 DEMANDA: 24H LIBRE'
          : comprador.diaLibranzaDeseada === 'CUALQUIERA'
          ? '🔄 DEMANDA: CUALQUIER DÍA (INDIFERENTE)'
          : `DEMANDA: ${comprador.diaLibranzaDeseada} • TURNO ${comprador.turnoDescansoDeseado || 'INDIFERENTE'}`;

      ctx.fillStyle = colors.libranza[comprador.diaLibranzaDeseada] || '#3B82F6';
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
      ctx.fillText('📋 ASESORÍA / TRAMITACIÓN', 60 + colW + 50, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      const gestText = !comprador.tieneGestoria
        ? 'Sin Gestoría (Opta a 6.000€)'
        : 'Gestoría Asignada';
      ctx.fillText(gestText, 60 + colW + 50, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Apta para tramitación exprés', 60 + colW + 50, gridY + 92);

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
    } else if (cruce) {
      // 1. Badge de afinidad
      const badgeY = 145;
      ctx.fillStyle = cruce.match.score >= 80 ? '#10B981' : '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(60, badgeY, 480, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`⚡ MATCH ${cruce.match.score}% ${cruce.match.nivel}`, 80, badgeY + 32);

      // 2. Bloque dual de precios
      const priceBoxY = 225;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(60, priceBoxY, width - 120, 150, 14);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('OFERTA (VENDEDOR)  vs  DEMANDA (COMPRADOR)', 90, priceBoxY + 40);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${cruce.vendedor.precio.toLocaleString('es-ES')} €`, 90, priceBoxY + 100);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText('↔', 400, priceBoxY + 98);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${cruce.comprador.precioMaximo.toLocaleString('es-ES')} €`, 470, priceBoxY + 100);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        cruce.comprador.puedeSenalizarYa ? '🔥 Comprador listo para señalizar de inmediato' : '• Operación viable',
        90,
        priceBoxY + 132
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
      ctx.fillText('🚗 OFERTA: ' + cruce.vendedor.nombre, 80, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Libranza: ${cruce.vendedor.diaLibranza} (${cruce.vendedor.turnoDescanso || 'PAR'})`, 80, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(cruce.vendedor.telefono ? `📞 ${cruce.vendedor.telefono}` : 'Chat online', 80, gridY + 92);

      // Caja 2: Comprador
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(60 + colW + 30, gridY, colW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('👤 DEMANDA: ' + cruce.comprador.nombre, 60 + colW + 50, gridY + 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Busca: ${cruce.comprador.diaLibranzaDeseada}`, 60 + colW + 50, gridY + 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(cruce.comprador.telefono ? `📞 ${cruce.comprador.telefono}` : 'Chat online', 60 + colW + 50, gridY + 92);

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
      ctx.fillText(cruce.match.razones.slice(0, 2).map(r => `✓ ${r}`).join('   |   '), 80, gridY + boxH + 85);

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
                {vendedor && (
                  <View style={styles.flyerCard}>
                    {/* Cabecera flyer */}
                    <View style={styles.flyerHeader}>
                      <Text style={styles.flyerBrand}>🚖 TAXI MADRID • EXPEDIENTE OFICIAL</Text>
                      <Text style={styles.flyerDate}>REF: #{vendedor.id?.slice(-6) || 'APC'}</Text>
                    </View>

                    {/* Badge de libranza */}
                    <View
                      style={[
                        styles.flyerLibranzaBadge,
                        {
                          backgroundColor: colors.libranza[vendedor.diaLibranza] || colors.primary,
                        },
                      ]}
                    >
                      <Text style={styles.flyerLibranzaText}>
                        {vendedor.diaLibranza === 'EUROTAXI'
                          ? '♿ EUROTAXI • EXENTO DE LIBRANZA (7 DÍAS)'
                          : vendedor.diaLibranza === 'ELECTRICO_SIN_LIBRANZA'
                          ? '⚡ ELÉCTRICO CERO • EXENTO DE LIBRANZA'
                          : vendedor.diaLibranza === 'LIBRE_24H'
                          ? '🟢 24H LIBRE • SIN RESTRICCIÓN'
                          : `LIBRANZA ${vendedor.diaLibranza} • TURNO ${vendedor.turnoDescanso || 'PAR'}`}
                      </Text>
                    </View>

                    {/* Precio Callout */}
                    <View style={styles.flyerPriceBox}>
                      <Text style={styles.flyerPriceLabel}>VALORACIÓN / PRECIO DE SALIDA</Text>
                      <View style={styles.flyerPriceRow}>
                        <Text style={styles.flyerPriceValue}>
                          {vendedor.precio.toLocaleString('es-ES')} €
                        </Text>
                        {vendedor.modalidadVentaCoche === 'AMBAS_OPCIONES' && vendedor.precioConCoche ? (
                          <View style={{ marginLeft: 16 }}>
                            <Text style={styles.flyerPriceSubValue}>
                              • {vendedor.precioConCoche.toLocaleString('es-ES')} €
                            </Text>
                            <Text style={styles.flyerPriceNote}>(Con Vehículo)</Text>
                          </View>
                        ) : (
                          <Text style={styles.flyerPriceNote}>
                            {vendedor.modalidadVentaCoche === 'CON_COCHE' ? '(Pack con Coche)' : '(Solo Licencia)'}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.flyerNegotiable,
                          { color: vendedor.precioNegociable ? colors.accent : colors.textMuted },
                        ]}
                      >
                        {vendedor.precioNegociable ? '✓ Precio Negociable' : '• Precio Fijo'}
                      </Text>
                    </View>

                    {/* Grid de Datos */}
                    <View style={styles.flyerGrid}>
                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>🚗 VEHÍCULO</Text>
                        <Text style={styles.flyerGridMain}>
                          {vendedor.vendeConCoche && vendedor.vehiculo
                            ? `${vendedor.vehiculo.modelo} (${vendedor.vehiculo.anoMatriculacion || ''})`
                            : 'Solo licencia (sin coche)'}
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {vendedor.vendeConCoche && vendedor.vehiculo
                            ? `${vendedor.vehiculo.kilometros || '0'} km • ${vendedor.vehiculo.carga === 'SIN_CARGA' ? 'Sin deuda' : 'Financiado'}`
                            : 'Comprador aporta vehículo'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>⚖️ SITUACIÓN DE CARGAS</Text>
                        <Text style={styles.flyerGridMain}>
                          {vendedor.cargaLicencia === 'SIN_CARGA' ? '100% Libre de Cargas' : 'Con Préstamo'}
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {vendedor.detalleCargaLicencia || 'Acreditación al día'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>👤 TITULAR / CONTACTO</Text>
                        <Text style={styles.flyerGridMain}>
                          {vendedor.nombre} ({vendedor.perfil})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {vendedor.telefono ? `📞 ${vendedor.telefono}` : `💬 Canal: ${vendedor.canalContacto || 'Chat'}`}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>⏱️ DISPONIBILIDAD</Text>
                        <Text style={styles.flyerGridMain}>
                          {vendedor.condicionVenta === 'INMEDIATA' ? 'Inmediata para Firma' : 'Tras Jubilación'}
                        </Text>
                        <Text style={styles.flyerGridSub} numberOfLines={1}>
                          {vendedor.notas ? `📝 ${vendedor.notas}` : 'Traspaso municipal'}
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

                    <View
                      style={[
                        styles.flyerLibranzaBadge,
                        {
                          backgroundColor: colors.libranza[comprador.diaLibranzaDeseada] || colors.primary,
                        },
                      ]}
                    >
                      <Text style={styles.flyerLibranzaText}>
                        {comprador.diaLibranzaDeseada === 'EUROTAXI'
                          ? '♿ BUSCA EUROTAXI • EXENTO DE LIBRANZA'
                          : comprador.diaLibranzaDeseada === 'ELECTRICO_SIN_LIBRANZA'
                          ? '⚡ BUSCA ELÉCTRICO CERO • SIN LIBRANZA'
                          : comprador.diaLibranzaDeseada === 'LIBRE_24H'
                          ? '🟢 BUSCA 24H LIBRE'
                          : comprador.diaLibranzaDeseada === 'CUALQUIERA'
                          ? '🔄 BUSCA CUALQUIER DÍA (INDIFERENTE)'
                          : `BUSCA ${comprador.diaLibranzaDeseada} • TURNO ${comprador.turnoDescansoDeseado || 'INDIFERENTE'}`}
                      </Text>
                    </View>

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
                        <Text style={styles.flyerGridTitle}>📋 GESTORÍA / ASESORÍA</Text>
                        <Text style={styles.flyerGridMain}>
                          {!comprador.tieneGestoria ? 'Sin Gestoría (Opta a 6.000€)' : 'Gestoría Asignada'}
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {comprador.gestoriaSeleccionada === 'GESTORIA_VIP' ? 'Asesoría Integral' : 'Trámite oficial'}
                        </Text>
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
                {cruce && (
                  <View style={styles.flyerCard}>
                    <View style={styles.flyerHeader}>
                      <Text style={styles.flyerBrand}>🚖 TAXI MADRID • CRUCE / MATCH COMERCIAL</Text>
                      <Text style={styles.flyerDate}>AFINIDAD: {cruce.match.score}%</Text>
                    </View>

                    <View
                      style={[
                        styles.flyerLibranzaBadge,
                        {
                          backgroundColor: cruce.match.score >= 80 ? colors.success : colors.accent,
                        },
                      ]}
                    >
                      <Text style={styles.flyerLibranzaText}>
                        ⚡ {cruce.match.score}% MATCH {cruce.match.nivel.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.flyerPriceBox}>
                      <Text style={styles.flyerPriceLabel}>OFERTA (VENDEDOR) vs DEMANDA (COMPRADOR)</Text>
                      <View style={styles.flyerPriceRow}>
                        <Text style={[styles.flyerPriceValue, { fontSize: 26 }]}>
                          {cruce.vendedor.precio.toLocaleString('es-ES')} €
                        </Text>
                        <Text style={{ color: colors.textMuted, marginHorizontal: 12, fontSize: 20 }}>↔</Text>
                        <Text style={[styles.flyerPriceValue, { fontSize: 26, color: colors.success }]}>
                          {cruce.comprador.precioMaximo.toLocaleString('es-ES')} €
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.flyerNegotiable,
                          { color: cruce.comprador.puedeSenalizarYa ? colors.accent : colors.textMuted },
                        ]}
                      >
                        {cruce.comprador.puedeSenalizarYa ? '🔥 Comprador listo para señalizar ya' : '• Operación viable'}
                      </Text>
                    </View>

                    <View style={styles.flyerGrid}>
                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>🚗 OFERTA (VENDEDOR)</Text>
                        <Text style={styles.flyerGridMain}>
                          {cruce.vendedor.nombre} ({cruce.vendedor.diaLibranza})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {cruce.vendedor.telefono || 'Canal online'}
                        </Text>
                      </View>

                      <View style={styles.flyerGridItem}>
                        <Text style={styles.flyerGridTitle}>👤 DEMANDA (COMPRADOR)</Text>
                        <Text style={styles.flyerGridMain}>
                          {cruce.comprador.nombre} ({cruce.comprador.diaLibranzaDeseada})
                        </Text>
                        <Text style={styles.flyerGridSub}>
                          {cruce.comprador.telefono || 'Canal online'}
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
});
