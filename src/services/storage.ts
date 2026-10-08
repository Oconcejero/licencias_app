import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vendedor, Comprador, ConfigTramitador } from '../types';
import { initialVendedores, initialCompradores } from './demoData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const VENDEDORES_KEY = '@licencias_vendedores_v1';
const COMPRADORES_KEY = '@licencias_compradores_v1';
const TRAMITADOR_KEY = '@licencias_tramitador_v1';
const DERIVADOS_KEY = '@licencias_matches_derivados_v1';

// Mapeos Supabase <-> TypeScript
function mapVendedorToRow(v: Vendedor) {
  return {
    id: v.id,
    nombre: v.nombre,
    telefono: v.telefono,
    fecha_creacion: v.fechaCreacion,
    perfil: v.perfil,
    dia_libranza: v.diaLibranza,
    carga_licencia: v.cargaLicencia,
    detalle_carga_licencia: v.detalleCargaLicencia || null,
    vende_con_coche: v.vendeConCoche,
    vehiculo: v.vehiculo || null,
    precio: v.precio,
    precio_negociable: v.precioNegociable,
    condicion_venta: v.condicionVenta,
    fecha_jubilacion: v.fechaJubilacion || null,
    detalle_condicion: v.detalleCondicion || null,
    notas: v.notas || null,
    estado: v.estado,
  };
}

function mapRowToVendedor(row: any): Vendedor {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono || '',
    fechaCreacion: row.fecha_creacion || new Date().toISOString(),
    perfil: row.perfil || 'PARTICULAR',
    diaLibranza: row.dia_libranza || 'LUNES',
    cargaLicencia: row.carga_licencia || 'SIN_CARGA',
    detalleCargaLicencia: row.detalle_carga_licencia || undefined,
    vendeConCoche: Boolean(row.vende_con_coche),
    vehiculo: row.vehiculo || undefined,
    precio: Number(row.precio) || 0,
    precioNegociable: Boolean(row.precio_negociable),
    condicionVenta: row.condicion_venta || 'INMEDIATA',
    fechaJubilacion: row.fecha_jubilacion || undefined,
    detalleCondicion: row.detalle_condicion || undefined,
    notas: row.notas || undefined,
    estado: row.estado || 'DISPONIBLE',
  };
}

function mapCompradorToRow(c: Comprador) {
  return {
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    fecha_creacion: c.fechaCreacion,
    perfil: c.perfil,
    dia_libranza_deseada: c.diaLibranzaDeseada,
    precio_maximo: c.precioMaximo,
    acepta_con_prestamo: String(c.aceptaConPrestamo),
    puede_senalizar_ya: c.puedeSenalizarYa,
    busca_con_coche: c.buscaConCoche,
    tiene_gestoria: c.tieneGestoria,
    gestoria_seleccionada: c.gestoriaSeleccionada,
    nombre_gestoria_propia: c.nombreGestoriaPropia || null,
    guardado_en_espera: c.guardadoEnEspera,
    notas: c.notas || null,
    estado: c.estado,
  };
}

function mapRowToComprador(row: any): Comprador {
  let aceptaPrestamo: boolean | 'INDIFERENTE' = 'INDIFERENTE';
  if (row.acepta_con_prestamo === 'true') aceptaPrestamo = true;
  else if (row.acepta_con_prestamo === 'false') aceptaPrestamo = false;

  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono || '',
    fechaCreacion: row.fecha_creacion || new Date().toISOString(),
    perfil: row.perfil || 'PARTICULAR',
    diaLibranzaDeseada: row.dia_libranza_deseada || 'CUALQUIERA',
    precioMaximo: Number(row.precio_maximo) || 0,
    aceptaConPrestamo: aceptaPrestamo,
    puedeSenalizarYa: Boolean(row.puede_senalizar_ya),
    buscaConCoche: row.busca_con_coche || 'INDIFERENTE',
    tieneGestoria: Boolean(row.tiene_gestoria),
    gestoriaSeleccionada: row.gestoria_seleccionada || 'NINGUNA',
    nombreGestoriaPropia: row.nombre_gestoria_propia || undefined,
    guardadoEnEspera: Boolean(row.guardado_en_espera),
    notas: row.notas || undefined,
    estado: row.estado || 'DISPONIBLE',
  };
}

export const storageService = {
  isCloudConnected(): boolean {
    return isSupabaseConfigured;
  },

  async getVendedores(): Promise<Vendedor[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vendedores')
          .select('*')
          .order('fecha_creacion', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToVendedor);
          await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Fallo conectando a Supabase para vendedores, usando local:', e);
      }
    }

    // Modo local / Fallback
    try {
      const data = await AsyncStorage.getItem(VENDEDORES_KEY);
      if (!data) {
        await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveVendedor(vendedor: Vendedor): Promise<Vendedor[]> {
    if (supabase) {
      try {
        await supabase.from('vendedores').upsert(mapVendedorToRow(vendedor));
      } catch (e) {
        console.warn('Error guardando vendedor en Supabase:', e);
      }
    }

    const list = await this.getVendedores();
    const index = list.findIndex(v => v.id === vendedor.id);
    let updated: Vendedor[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = vendedor;
    } else {
      updated = [vendedor, ...list];
    }
    await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify(updated));
    return updated;
  },

  async deleteVendedor(id: string): Promise<Vendedor[]> {
    if (supabase) {
      try {
        await supabase.from('vendedores').delete().eq('id', id);
      } catch (e) {
        console.warn('Error borrando en Supabase:', e);
      }
    }

    const list = await this.getVendedores();
    const updated = list.filter(v => v.id !== id);
    await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify(updated));
    return updated;
  },

  async getCompradores(): Promise<Comprador[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('compradores')
          .select('*')
          .order('fecha_creacion', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToComprador);
          await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Fallo conectando a Supabase para compradores, usando local:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(COMPRADORES_KEY);
      if (!data) {
        await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveComprador(comprador: Comprador): Promise<Comprador[]> {
    if (supabase) {
      try {
        await supabase.from('compradores').upsert(mapCompradorToRow(comprador));
      } catch (e) {
        console.warn('Error guardando comprador en Supabase:', e);
      }
    }

    const list = await this.getCompradores();
    const index = list.findIndex(c => c.id === comprador.id);
    let updated: Comprador[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = comprador;
    } else {
      updated = [comprador, ...list];
    }
    await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify(updated));
    return updated;
  },

  async deleteComprador(id: string): Promise<Comprador[]> {
    if (supabase) {
      try {
        await supabase.from('compradores').delete().eq('id', id);
      } catch (e) {
        console.warn('Error borrando comprador en Supabase:', e);
      }
    }

    const list = await this.getCompradores();
    const updated = list.filter(c => c.id !== id);
    await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify(updated));
    return updated;
  },

  // Tramitador
  async getTramitador(): Promise<ConfigTramitador> {
    if (supabase) {
      try {
        const { data } = await supabase.from('app_config').select('value').eq('key', 'tramitador').maybeSingle();
        if (data?.value) {
          await AsyncStorage.setItem(TRAMITADOR_KEY, JSON.stringify(data.value));
          return data.value;
        }
      } catch {}
    }

    try {
      const data = await AsyncStorage.getItem(TRAMITADOR_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return { nombre: 'Gestor Operativo', telefono: '' };
  },

  async saveTramitador(config: ConfigTramitador): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('app_config').upsert({ key: 'tramitador', value: config });
      } catch {}
    }
    await AsyncStorage.setItem(TRAMITADOR_KEY, JSON.stringify(config));
  },

  // Derivados
  async getDerivadosIds(): Promise<string[]> {
    if (supabase) {
      try {
        const { data } = await supabase.from('app_config').select('value').eq('key', 'derivados').maybeSingle();
        if (data?.value && Array.isArray(data.value)) {
          await AsyncStorage.setItem(DERIVADOS_KEY, JSON.stringify(data.value));
          return data.value;
        }
      } catch {}
    }

    try {
      const data = await AsyncStorage.getItem(DERIVADOS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  async toggleDerivado(matchId: string): Promise<string[]> {
    const list = await this.getDerivadosIds();
    const updated = list.includes(matchId) ? list.filter(id => id !== matchId) : [...list, matchId];

    if (supabase) {
      try {
        await supabase.from('app_config').upsert({ key: 'derivados', value: updated });
      } catch {}
    }
    await AsyncStorage.setItem(DERIVADOS_KEY, JSON.stringify(updated));
    return updated;
  },

  async resetDemoData(): Promise<{ vendedores: Vendedor[]; compradores: Comprador[] }> {
    if (supabase) {
      try {
        await supabase.from('vendedores').delete().neq('id', '___');
        await supabase.from('compradores').delete().neq('id', '___');
        for (const v of initialVendedores) {
          await supabase.from('vendedores').upsert(mapVendedorToRow(v));
        }
        for (const c of initialCompradores) {
          await supabase.from('compradores').upsert(mapCompradorToRow(c));
        }
      } catch {}
    }
    await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify(initialVendedores));
    await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify(initialCompradores));
    return { vendedores: initialVendedores, compradores: initialCompradores };
  },

  async clearAll(): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('vendedores').delete().neq('id', '___');
        await supabase.from('compradores').delete().neq('id', '___');
      } catch {}
    }
    await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify([]));
    await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify([]));
    await AsyncStorage.setItem(DERIVADOS_KEY, JSON.stringify([]));
  },

  async exportAllData(): Promise<string> {
    const vendedores = await this.getVendedores();
    const compradores = await this.getCompradores();
    const tramitador = await this.getTramitador();
    const derivados = await this.getDerivadosIds();
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      vendedores,
      compradores,
      tramitador,
      derivados,
    }, null, 2);
  },

  async importData(jsonString: string): Promise<{ vendedores: Vendedor[]; compradores: Comprador[] }> {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.vendedores) && Array.isArray(parsed.compradores)) {
      if (supabase) {
        for (const v of parsed.vendedores) {
          await supabase.from('vendedores').upsert(mapVendedorToRow(v));
        }
        for (const c of parsed.compradores) {
          await supabase.from('compradores').upsert(mapCompradorToRow(c));
        }
      }
      await AsyncStorage.setItem(VENDEDORES_KEY, JSON.stringify(parsed.vendedores));
      await AsyncStorage.setItem(COMPRADORES_KEY, JSON.stringify(parsed.compradores));
      return {
        vendedores: parsed.vendedores,
        compradores: parsed.compradores,
      };
    }
    throw new Error('Formato inválido.');
  }
};
