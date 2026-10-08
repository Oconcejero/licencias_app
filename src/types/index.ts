export type DiaLibranza = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO' | 'CUALQUIERA';

export type TipoPerfil = 'PARTICULAR' | 'INTERMEDIARIO';

export type TipoCarga = 'SIN_CARGA' | 'PRESTAMO' | 'OTRO';

export type EstadoRegistro = 'DISPONIBLE' | 'EN_NEGOCIACION' | 'CERRADO';

export type CondicionVenta = 'INMEDIATA' | 'JUBILACION' | 'OTRA';

export type TipoPreferenciaCoche = 'SOLO_LICENCIA' | 'CON_COCHE' | 'INDIFERENTE';

export type TipoGestoria = 'NINGUNA' | 'PROPIA' | 'GESTORIA_VIP' | 'GESTORIA_TALAMANCA';

export interface VehiculoVendedor {
  modelo: string;
  anoMatriculacion: string;
  kilometros: string;
  carga: TipoCarga;
  detalleCarga?: string;
}

export interface Vendedor {
  id: string;
  nombre: string;
  telefono: string;
  fechaCreacion: string;
  perfil: TipoPerfil;
  diaLibranza: DiaLibranza;
  cargaLicencia: TipoCarga;
  detalleCargaLicencia?: string;
  
  vendeConCoche: boolean;
  vehiculo?: VehiculoVendedor;
  
  precio: number;
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
  fechaCreacion: string;
  perfil: TipoPerfil;
  
  diaLibranzaDeseada: DiaLibranza;
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
  diferenciaPrecio: number; // vendedor.precio - comprador.precioMaximo
  precioEncaja: boolean;
  libranzaEncaja: boolean;
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
