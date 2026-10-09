import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors } from './src/theme/colors';
import { Vendedor, Comprador, CruceMatch, ConfigTramitador, UserRole } from './src/types';
import { storageService } from './src/services/storage';
import { findMatches } from './src/services/matchEngine';
import { shareService } from './src/services/shareService';

import { Header } from './src/components/Header';
import { Navigation, TabType } from './src/components/Navigation';
import { VendedorModal } from './src/components/VendedorModal';
import { CompradorModal } from './src/components/CompradorModal';
import { GestoriaHelperModal } from './src/components/GestoriaHelperModal';
import { DetailModal } from './src/components/DetailModal';
import { TramitadorModal } from './src/components/TramitadorModal';
import { AuthModal } from './src/components/AuthModal';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { VendedoresScreen } from './src/screens/VendedoresScreen';
import { CompradoresScreen } from './src/screens/CompradoresScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [tramitador, setTramitador] = useState<ConfigTramitador>({ nombre: 'Gestor Operativo', telefono: '' });
  const [derivadosIds, setDerivadosIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Rol y Acceso (ADMIN vs SOCIO)
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const isAdmin = userRole === 'ADMIN';

  // Modales
  const [vendedorModalVisible, setVendedorModalVisible] = useState(false);
  const [vendedorToEdit, setVendedorToEdit] = useState<Vendedor | null>(null);

  const [compradorModalVisible, setCompradorModalVisible] = useState(false);
  const [compradorToEdit, setCompradorToEdit] = useState<Comprador | null>(null);

  const [gestoriaHelperVisible, setGestoriaHelperVisible] = useState(false);
  const [gestoriaClientName, setGestoriaClientName] = useState<string>('Cliente');

  const [tramitadorModalVisible, setTramitadorModalVisible] = useState(false);
  const [pendingCruceToSend, setPendingCruceToSend] = useState<CruceMatch | null>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailVendedor, setDetailVendedor] = useState<Vendedor | null>(null);
  const [detailComprador, setDetailComprador] = useState<Comprador | null>(null);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      const v = await storageService.getVendedores();
      const c = await storageService.getCompradores();
      const t = await storageService.getTramitador();
      const d = await storageService.getDerivadosIds();
      setVendedores(v);
      setCompradores(c);
      setTramitador(t);
      setDerivadosIds(d);
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    storageService.getUserRole().then((savedRole) => {
      if (savedRole) {
        setUserRole(savedRole);
      } else {
        setAuthModalVisible(true);
      }
    });
  }, [loadData]);

  const handleAuthSuccess = (role: UserRole) => {
    setUserRole(role);
    setAuthModalVisible(false);
  };

  const handleSwitchRole = () => {
    setAuthModalVisible(true);
  };

  // Matches calculados
  const matches = useMemo(() => {
    return findMatches(vendedores, compradores);
  }, [vendedores, compradores]);

  // Handlers Vendedores
  const handleSaveVendedor = async (vendedor: Vendedor) => {
    const updated = await storageService.saveVendedor(vendedor);
    setVendedores(updated);
    setVendedorModalVisible(false);
    setVendedorToEdit(null);
  };

  const handleDeleteVendedor = async (id: string) => {
    const updated = await storageService.deleteVendedor(id);
    setVendedores(updated);
    if (detailVendedor?.id === id) {
      setDetailModalVisible(false);
    }
  };

  // Handlers Compradores
  const handleSaveComprador = async (comprador: Comprador) => {
    const updated = await storageService.saveComprador(comprador);
    setCompradores(updated);
    setCompradorModalVisible(false);
    setCompradorToEdit(null);
  };

  const handleDeleteComprador = async (id: string) => {
    const updated = await storageService.deleteComprador(id);
    setCompradores(updated);
    if (detailComprador?.id === id) {
      setDetailModalVisible(false);
    }
  };

  // Apertura de detalles
  const handleOpenDetailVendedor = (id: string) => {
    const found = vendedores.find(v => v.id === id);
    if (found) {
      setDetailVendedor(found);
      setDetailComprador(null);
      setDetailModalVisible(true);
    }
  };

  const handleOpenDetailComprador = (id: string) => {
    const found = compradores.find(c => c.id === id);
    if (found) {
      setDetailComprador(found);
      setDetailVendedor(null);
      setDetailModalVisible(true);
    }
  };

  const handleOpenGestoriaHelper = (nombre?: string) => {
    setGestoriaClientName(nombre || 'Cliente');
    setGestoriaHelperVisible(true);
  };

  // Enviar a mi amigo por WhatsApp
  const handleSendToFriend = (cruce: CruceMatch) => {
    if (!tramitador.telefono) {
      setPendingCruceToSend(cruce);
      setTramitadorModalVisible(true);
      return;
    }

    const text = shareService.generateMatchReport(cruce);
    shareService.sendWhatsApp(tramitador.telefono, text);

    // Marcar como derivado
    if (!derivadosIds.includes(cruce.id)) {
      storageService.toggleDerivado(cruce.id).then(setDerivadosIds);
    }
  };

  const handleSaveTramitador = async (config: ConfigTramitador) => {
    await storageService.saveTramitador(config);
    setTramitador(config);
    setTramitadorModalVisible(false);

    if (pendingCruceToSend) {
      const text = shareService.generateMatchReport(pendingCruceToSend);
      shareService.sendWhatsApp(config.telefono, text);
      if (!derivadosIds.includes(pendingCruceToSend.id)) {
        storageService.toggleDerivado(pendingCruceToSend.id).then(setDerivadosIds);
      }
      setPendingCruceToSend(null);
    }
  };

  const handleToggleDerivado = async (matchId: string) => {
    const updated = await storageService.toggleDerivado(matchId);
    setDerivadosIds(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        {/* Header Superior */}
        <Header
          totalMatches={matches.length}
          userRole={userRole || undefined}
          onSwitchRole={handleSwitchRole}
          onOpenMatches={() => setCurrentTab('matches')}
          onNewVendedor={() => {
            setVendedorToEdit(null);
            setVendedorModalVisible(true);
          }}
          onNewComprador={() => {
            setCompradorToEdit(null);
            setCompradorModalVisible(true);
          }}
        />

        {/* Barra de Navegación de Pestañas */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          matchesCount={matches.length}
        />

        {/* Pantalla Activa */}
        <View style={styles.screenContainer}>
          {currentTab === 'dashboard' && (
            <DashboardScreen
              vendedores={vendedores}
              compradores={compradores}
              matches={matches}
              tramitador={tramitador}
              derivadosIds={derivadosIds}
              userRole={userRole || 'ADMIN'}
              onNavigateTab={setCurrentTab}
              onNewVendedor={() => {
                setVendedorToEdit(null);
                setVendedorModalVisible(true);
              }}
              onNewComprador={() => {
                setCompradorToEdit(null);
                setCompradorModalVisible(true);
              }}
              onOpenGestoriaHelper={handleOpenGestoriaHelper}
              onOpenDetailVendedor={handleOpenDetailVendedor}
              onOpenDetailComprador={handleOpenDetailComprador}
              onSendToFriend={handleSendToFriend}
              onOpenConfigTramitador={() => setTramitadorModalVisible(true)}
            />
          )}

          {currentTab === 'matches' && (
            <MatchesScreen
              matches={matches}
              tramitador={tramitador}
              derivadosIds={derivadosIds}
              onOpenGestoriaScript={handleOpenGestoriaHelper}
              onOpenDetailVendedor={handleOpenDetailVendedor}
              onOpenDetailComprador={handleOpenDetailComprador}
              onSendToFriend={handleSendToFriend}
              onToggleDerivado={handleToggleDerivado}
            />
          )}

          {currentTab === 'vendedores' && (
            <VendedoresScreen
              vendedores={vendedores}
              compradores={compradores}
              userRole={userRole || 'ADMIN'}
              onNewVendedor={() => {
                setVendedorToEdit(null);
                setVendedorModalVisible(true);
              }}
              onEditVendedor={(v) => {
                setVendedorToEdit(v);
                setVendedorModalVisible(true);
              }}
              onDeleteVendedor={handleDeleteVendedor}
              onSelectVendedor={handleOpenDetailVendedor}
            />
          )}

          {currentTab === 'compradores' && (
            <CompradoresScreen
              compradores={compradores}
              vendedores={vendedores}
              userRole={userRole || 'ADMIN'}
              onNewComprador={() => {
                setCompradorToEdit(null);
                setCompradorModalVisible(true);
              }}
              onEditComprador={(c) => {
                setCompradorToEdit(c);
                setCompradorModalVisible(true);
              }}
              onDeleteComprador={handleDeleteComprador}
              onSelectComprador={handleOpenDetailComprador}
              onOpenGestoriaScript={handleOpenGestoriaHelper}
            />
          )}

          {currentTab === 'ajustes' && (
            <SettingsScreen
              vendedores={vendedores}
              compradores={compradores}
              tramitador={tramitador}
              userRole={userRole || 'ADMIN'}
              onUpdateTramitador={setTramitador}
              onRefreshData={loadData}
              onOpenGestoriaHelper={() => handleOpenGestoriaHelper()}
              onSwitchRole={handleSwitchRole}
            />
          )}
        </View>

        {/* Modales */}
        <VendedorModal
          visible={vendedorModalVisible}
          onClose={() => setVendedorModalVisible(false)}
          onSave={handleSaveVendedor}
          vendedorToEdit={vendedorToEdit}
        />

        <CompradorModal
          visible={compradorModalVisible}
          onClose={() => setCompradorModalVisible(false)}
          onSave={handleSaveComprador}
          compradorToEdit={compradorToEdit}
          allVendedores={vendedores}
          onOpenGestoriaHelper={handleOpenGestoriaHelper}
        />

        <GestoriaHelperModal
          visible={gestoriaHelperVisible}
          onClose={() => setGestoriaHelperVisible(false)}
          compradorNombre={gestoriaClientName}
        />

        <TramitadorModal
          visible={tramitadorModalVisible}
          onClose={() => {
            setTramitadorModalVisible(false);
            setPendingCruceToSend(null);
          }}
          config={tramitador}
          onSave={handleSaveTramitador}
        />

        <DetailModal
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          vendedor={detailVendedor}
          comprador={detailComprador}
          allVendedores={vendedores}
          allCompradores={compradores}
          tramitadorNombre={tramitador.nombre}
          tramitadorTelefono={tramitador.telefono}
          onEditVendedor={isAdmin ? (v) => {
            setVendedorToEdit(v);
            setVendedorModalVisible(true);
          } : undefined}
          onEditComprador={isAdmin ? (c) => {
            setCompradorToEdit(c);
            setCompradorModalVisible(true);
          } : undefined}
          onOpenGestoriaScript={handleOpenGestoriaHelper}
          onSendMatchToFriend={handleSendToFriend}
          onOpenConfigTramitador={() => setTramitadorModalVisible(true)}
        />

        {/* Modal de Autenticación / Cambio de Rol */}
        <AuthModal
          visible={authModalVisible}
          onSuccess={handleAuthSuccess}
          canCancel={userRole !== null}
          onClose={() => setAuthModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
