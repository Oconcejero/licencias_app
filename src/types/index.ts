export type DiaLibranza =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'EUROTAXI'
  | 'ELECTRICO_SIN_LIBRANZA'
  | 'LIBRE_24H'
  | 'CUALQUIERA'
  | 'SABADO'
  | 'DOMINGO';

export type TurnoDescanso = 'PAR' | 'IMPAR' | 'ROTATIVO' | 'LIBRE_24H';

export type TurnoDescansoDeseado = 'INDIFERENTE' | 'PAR' | 'IMPAR' | 'ROTATIVO' | 'LIBRE_24H';

export type TipoPerfil = 'PARTICULAR' | 'INTERMEDIARIO';

export type TipoCarga = 'SIN_CARGA' | 'PRESTAMO' | 'OTRO';

export type EstadoRegistro = 'DISPONIBLE' | 'EN_NEGOCIACION' | 'CERRADO';

export type CondicionVenta = 'INMEDIATA' | 'JUBILACION' | 'OTRA';

export type TipoPreferenciaCoche = 'SOLO_LICENCIA' | 'CON_COCHE' | 'INDIFERENTE';

export type ModalidadVentaCoche = 'SOLO_LICENCIA' | 'CON_COCHE' | 'AMBAS_OPCIONES';

export type TipoGestoria = 'NINGUNA' | 'PROPIA' | 'GESTORIA_VIP' | 'GESTORIA_TALAMANCA';

export type CanalContacto = 'TELEFONO' | 'WALLAPOP' | 'MILANUNCIOS' | 'FACEBOOK' | 'OTRO';

export interface VehiculoVendedor {
  modelo: string;
  anoMatriculacion: string;
  kilometros: string;
  carga: TipoCarga;
  detalleCarga?: string;
  exentoLibranza?: boolean;
  detalleExencion?: string;
}

export interface Vendedor {
  id: string;
  nombre: string;
  telefono: string;
  canalContacto?: CanalContacto;
  contactoOrigen?: string;
  fechaCreacion: string;
  perfil: TipoPerfil;
  diaLibranza: DiaLibranza;
  turnoDescanso?: TurnoDescanso;
  cargaLicencia: TipoCarga;
  detalleCargaLicencia?: string;
  
  vendeConCoche: boolean;
  modalidadVentaCoche?: ModalidadVentaCoche;
  vehiculo?: VehiculoVendedor;
  
  precio: number;
  precioConCoche?: number;
  precioNegociable: boolean;
  
  condicionVenta: CondicionVenta;
  fechaJubilacion?: string;
  detalleCondicion?: string;
  
  notas?: string;
  estado: EstadoRegistro;
}

export interface Comprador {
  id: string;
  nombre: string;
  telefono: string;
  canalContacto?: CanalContacto;
  contactoOrigen?: string;
  fechaCreacion: string;
  perfil: TipoPerfil;
  
  diaLibranzaDeseada: DiaLibranza | string;
  diasLibranzaDeseados?: DiaLibranza[];
  turnoDescansoDeseado?: TurnoDescansoDeseado;
  precioMaximo: number;
  
  aceptaConPrestamo: boolean | 'INDIFERENTE';
  puedeSenalizarYa: boolean;
  buscaConCoche: TipoPreferenciaCoche;
  
  tieneGestoria: boolean;
  gestoriaSeleccionada: TipoGestoria;
  nombreGestoriaPropia?: string;
  
  guardadoEnEspera: boolean;
  notas?: string;
  estado: EstadoRegistro;
}

export interface MatchScore {
  score: number; // 0 - 100
  nivel: 'EXCELENTE' | 'BUENO' | 'POTENCIAL';
  razones: string[];
  alertas: string[];
  diferenciaPrecio: number; // precioEvaluado - comprador.precioMaximo
  precioEvaluado?: number;
  modalidadEvaluada?: 'CON_COCHE' | 'SOLO_LICENCIA';
  precioEncaja: boolean;
  libranzaEncaja: boolean;
  turnoEncaja?: boolean;
  cocheEncaja: boolean;
  cargaEncaja: boolean;
}

export interface CruceMatch {
  id: string;
  vendedor: Vendedor;
  comprador: Comprador;
  match: MatchScore;
  derivado?: boolean;
}

export interface ConfigTramitador {
  nombre: string;
  telefono: string;
}

export type UserRole = 'ADMIN' | 'SOCIO';

export function getCompradorDias(comprador: { diaLibranzaDeseada?: string; diasLibranzaDeseados?: DiaLibranza[] }): DiaLibranza[] {
  if (comprador.diasLibranzaDeseados && comprador.diasLibranzaDeseados.length > 0) {
    return comprador.diasLibranzaDeseados.map(d => String(d).trim().toUpperCase() as DiaLibranza);
  }
  if (comprador.diaLibranzaDeseada) {
    if (comprador.diaLibranzaDeseada.includes(',')) {
      return comprador.diaLibranzaDeseada
        .split(',')
        .map(s => s.trim().toUpperCase() as DiaLibranza)
        .filter(Boolean);
    }
    return [comprador.diaLibranzaDeseada.trim().toUpperCase() as DiaLibranza];
  }
  return ['CUALQUIERA'];
}
