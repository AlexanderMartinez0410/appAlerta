import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { OpenStreetMap, HotspotZone, ReporteIncident } from '../components/OpenStreetMap';
import { EcuadorColors } from '../constants/theme';
import { useAuth } from '../presentation/context/AuthContext';
import { API_CONFIG } from '../infrastructure/config/api.config';

interface MotivoDB {
  id: string;
  codigo: string;
  nombre: string;
  campoExtraLabel: string | null;
  orden: number;
}

interface CategoriaDB {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  colorHex: string;
  orden: number;
  motivos: MotivoDB[];
}

export default function Index() {
  const { user, isAuthenticated, login, logout, isLoading, error, clearError } = useAuth();

  // Categorías dinámicas desde Backend / Base de Datos
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaDB | null>(null);
  const [selectedMotivo, setSelectedMotivo] = useState<MotivoDB | null>(null);
  const [campoExtraValor, setCampoExtraValor] = useState('');

  // Filtro activo en el mapa
  const [filtroMapa, setFiltroMapa] = useState<'TODAS' | 'SEGURIDAD' | 'TRANSITO' | 'TRANSPORTE'>('TODAS');

  // Estados de Modales
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<ReporteIncident | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Modalidad de Ubicación al Reportar
  const [modalidadUbicacion, setModalidadUbicacion] = useState<'GPS_ACTUAL' | 'DIFERIDO'>('GPS_ACTUAL');
  const [lugarSuceso, setLugarSuceso] = useState('');
  const [tiempoOcurrido, setTiempoOcurrido] = useState('Hace pocos minutos');

  // Campos de Autenticación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');

  // Campos de Reporte
  const [detalleReporte, setDetalleReporte] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [reporteEnviado, setReporteEnviado] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/incidentes/categorias`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategorias(data);
          setSelectedCategoria(data[0]);
          if (data[0].motivos && data[0].motivos.length > 0) {
            setSelectedMotivo(data[0].motivos[0]);
          }
        }
      } catch (err) {
        console.warn('Categorías locales:', err);
      }
    };
    fetchCategorias();
  }, []);

  const handleSelectCategoria = (cat: CategoriaDB) => {
    setSelectedCategoria(cat);
    if (cat.motivos && cat.motivos.length > 0) {
      setSelectedMotivo(cat.motivos[0]);
    } else {
      setSelectedMotivo(null);
    }
    setCampoExtraValor('');
  };

  const handleBotonReporte = () => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
    } else {
      setReporteEnviado(false);
      setReportModalVisible(true);
    }
  };

  const handleLoginSubmit = async () => {
    clearError();
    const success = await login(email, password);
    if (success) {
      setAuthModalVisible(false);
      setTimeout(() => {
        setReportModalVisible(true);
      }, 250);
    }
  };

  const handleQuickDev = async (emailDev: string, passDev: string) => {
    setEmail(emailDev);
    setPassword(passDev);
    clearError();
    const success = await login(emailDev, passDev);
    if (success) {
      setAuthModalVisible(false);
      setTimeout(() => {
        setReportModalVisible(true);
      }, 250);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnviarReporte = () => {
    setReporteEnviado(true);
  };

  return (
    <View style={styles.screen}>
      {/* 1. MAPA CON ZOOM DINÁMICO Y FILTROS */}
      <View style={styles.mapContainer}>
        <OpenStreetMap
          centerLat={-0.195}
          centerLng={-78.488}
          zoom={13}
          filtroCategoria={filtroMapa}
          onSelectHotspot={(zone) => setSelectedHotspot(zone)}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
        />
      </View>

      {/* 2. BARRA SUPERIOR DE FILTROS EN VIVO */}
      <SafeAreaView style={styles.topFilterBarWrapper}>
        <View style={styles.filterPillCard}>
          {(['TODAS', 'SEGURIDAD', 'TRANSITO', 'TRANSPORTE'] as const).map((tipo) => {
            const isActive = filtroMapa === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                  isActive && tipo === 'SEGURIDAD' && { backgroundColor: EcuadorColors.red.primary },
                  isActive && tipo === 'TRANSITO' && { backgroundColor: '#EA580C' },
                  isActive && tipo === 'TRANSPORTE' && { backgroundColor: '#D97706' },
                ]}
                onPress={() => setFiltroMapa(tipo)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tipo === 'TODAS' ? 'Todas' : tipo === 'SEGURIDAD' ? 'Seguridad' : tipo === 'TRANSITO' ? 'Tránsito' : 'Transporte'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pastilla de usuario si está logueado */}
        {isAuthenticated && user && (
          <View style={styles.userPill}>
            <View style={styles.userPillDot} />
            <Text style={styles.userPillText} numberOfLines={1}>
              {user.persona?.nombres || user.email}
            </Text>
            <TouchableOpacity onPress={logout} style={styles.userPillLogout}>
              <Text style={styles.userPillLogoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* 3. ZONA INFERIOR: Botón Principal Generar Reporte */}
      <SafeAreaView style={styles.bottomBarWrapper}>
        <View style={styles.bottomCard}>
          <TouchableOpacity
            style={styles.btnReporte}
            onPress={handleBotonReporte}
            activeOpacity={0.88}
          >
            <Text style={styles.btnReporteText}>Generar reporte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 4. MODAL DETALLE DE ZONA MACRO (Al tocar burbuja grande) */}
      <Modal
        visible={!!selectedHotspot}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedHotspot(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{selectedHotspot?.nombreZona}</Text>
                <Text style={styles.sheetSubtitle}>
                  {selectedHotspot?.ciudad} • {selectedHotspot?.totalReportes} reportes agrupados en esta área
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedHotspot(null)}
                style={styles.sheetCloseBtn}
              >
                <Text style={styles.sheetCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.categoryBanner,
                {
                  backgroundColor: (selectedHotspot?.colorHex || '#DA291C') + '20',
                  borderColor: selectedHotspot?.colorHex || '#DA291C',
                },
              ]}
            >
              <Text style={[styles.categoryBannerText, { color: selectedHotspot?.colorHex || '#DA291C' }]}>
                Zona de Incidencia: {selectedHotspot?.categoriaCodigo} (Acércate con zoom para ver cada calle)
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.incidentsList} showsVerticalScrollIndicator={false}>
              {selectedHotspot?.reportes.map((rep) => (
                <View key={rep.id} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentType}>{rep.tipoLabel}</Text>
                    <Text style={[styles.incidentTime, { color: selectedHotspot?.colorHex || EcuadorColors.red.primary }]}>
                      {rep.hora}
                    </Text>
                  </View>
                  <Text style={styles.incidentSector}>{rep.sector}</Text>
                  {rep.campoExtra && (
                    <Text style={styles.incidentExtra}>Detalle: {rep.campoExtra}</Text>
                  )}
                  <Text style={styles.incidentDetail}>"{rep.detalle}"</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. MODAL DETALLE DE INCIDENTE PUNTUAL (Al tocar marcador específico de calle con zoom) */}
      <Modal
        visible={!!selectedIncident}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedIncident(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{selectedIncident?.tipoLabel}</Text>
                <Text style={styles.sheetSubtitle}>
                  Ubicación exacta: {selectedIncident?.sector}, {selectedIncident?.ciudad}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedIncident(null)}
                style={styles.sheetCloseBtn}
              >
                <Text style={styles.sheetCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.singleIncidentBody}>
              <View style={styles.timeTag}>
                <Text style={styles.timeTagText}>Reportado: {selectedIncident?.hora}</Text>
              </View>

              {selectedIncident?.campoExtra && (
                <View style={styles.extraBox}>
                  <Text style={styles.extraBoxText}>Identificador: {selectedIncident.campoExtra}</Text>
                </View>
              )}

              <Text style={styles.singleIncidentDetailTitle}>Detalle del reporte ciudadano:</Text>
              <Text style={styles.singleIncidentDetailText}>"{selectedIncident?.detalle}"</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. MODAL: INICIAR SESIÓN / CREAR CUENTA */}
      <Modal
        visible={authModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {authTab === 'LOGIN' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
              <TouchableOpacity
                onPress={() => setAuthModalVisible(false)}
                style={styles.sheetCloseBtn}
              >
                <Text style={styles.sheetCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentTab, authTab === 'LOGIN' && styles.segmentTabActive]}
                onPress={() => {
                  setAuthTab('LOGIN');
                  clearError();
                }}
              >
                <Text style={[styles.segmentText, authTab === 'LOGIN' && styles.segmentTextActive]}>
                  Ingresar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentTab, authTab === 'REGISTER' && styles.segmentTabActive]}
                onPress={() => {
                  setAuthTab('REGISTER');
                  clearError();
                }}
              >
                <Text style={[styles.segmentText, authTab === 'REGISTER' && styles.segmentTextActive]}>
                  Crear Cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.sheetForm} showsVerticalScrollIndicator={false}>
              {authTab === 'REGISTER' && (
                <>
                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Nombres y Apellidos</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ej: Carlos Mendoza"
                      placeholderTextColor="#94A3B8"
                      value={nombres}
                      onChangeText={setNombres}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Cédula de Identidad</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="1729334373"
                      placeholderTextColor="#94A3B8"
                      value={cedula}
                      onChangeText={setCedula}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Teléfono Celular</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+593 96 996 2799"
                      placeholderTextColor="#94A3B8"
                      value={telefono}
                      onChangeText={setTelefono}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.btnSubmit}
                onPress={handleLoginSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSubmitText}>
                    {authTab === 'LOGIN' ? 'Ingresar a mi cuenta' : 'Completar Registro'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.quickFillBox}>
                <Text style={styles.quickFillLabel}>Cuentas de prueba:</Text>
                <View style={styles.quickFillRow}>
                  <TouchableOpacity
                    style={styles.quickFillBtn}
                    onPress={() => handleQuickDev('alkut202@gmail.com', 'Admin1234!')}
                  >
                    <Text style={styles.quickFillBtnText}>Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickFillBtn}
                    onPress={() => handleQuickDev('policia@alerta.gob.ec', 'Policia1234!')}
                  >
                    <Text style={styles.quickFillBtnText}>Policía</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. MODAL FORMULARIO: UBICACIÓN ACTUAL VS REPORTE DIFERIDO (ZONA SEGURA) */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Generar Reporte Comunitario</Text>
                <Text style={styles.sheetSubtitle}>Avisa y ayuda a otros ciudadanos en tiempo real</Text>
              </View>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.sheetCloseBtn}
              >
                <Text style={styles.sheetCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            {reporteEnviado ? (
              <View style={styles.successView}>
                <Text style={styles.successTitle}>Reporte Publicado en la Comunidad</Text>
                <Text style={styles.successText}>
                  Tu aviso ha sido registrado exitosamente y ya alerta a los transeúntes de la zona.
                </Text>
                <TouchableOpacity
                  style={[styles.btnSubmit, { backgroundColor: selectedCategoria?.colorHex || EcuadorColors.blue.primary }]}
                  onPress={() => setReportModalVisible(false)}
                >
                  <Text style={styles.btnSubmitText}>Volver al Mapa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.sheetForm} showsVerticalScrollIndicator={false}>
                {/* 1. Selector de Modalidad de Ubicación (Seguridad de la Víctima) */}
                <Text style={styles.inputLabel}>1. ¿Dónde y cuándo ocurrió?</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[styles.segmentTab, modalidadUbicacion === 'GPS_ACTUAL' && styles.segmentTabActive]}
                    onPress={() => setModalidadUbicacion('GPS_ACTUAL')}
                  >
                    <Text style={[styles.segmentText, modalidadUbicacion === 'GPS_ACTUAL' && styles.segmentTextActive]}>
                      En este lugar exacto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentTab, modalidadUbicacion === 'DIFERIDO' && styles.segmentTabActive]}
                    onPress={() => setModalidadUbicacion('DIFERIDO')}
                  >
                    <Text style={[styles.segmentText, modalidadUbicacion === 'DIFERIDO' && styles.segmentTextActive]}>
                      Ocurrió en otro sitio
                    </Text>
                  </TouchableOpacity>
                </View>

                {modalidadUbicacion === 'DIFERIDO' ? (
                  <View style={styles.diferidoBox}>
                    <Text style={styles.diferidoNotice}>
                      Reporte desde zona segura: Indica la calle o esquina donde ocurrió el suceso.
                    </Text>
                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>Calle o Sector del Suceso</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ej: Av. Amazonas y Foch / La Mariscal"
                        placeholderTextColor="#94A3B8"
                        value={lugarSuceso}
                        onChangeText={setLugarSuceso}
                      />
                    </View>

                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>¿Hace cuánto tiempo?</Text>
                      <View style={styles.tiempoChipsRow}>
                        {['Hace 15 min', 'Hace 1 hora', 'Hace 2 horas', 'Hoy temprano'].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.tiempoChip, tiempoOcurrido === t && styles.tiempoChipActive]}
                            onPress={() => setTiempoOcurrido(t)}
                          >
                            <Text style={[styles.tiempoChipText, tiempoOcurrido === t && styles.tiempoChipTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.gpsAutoBox}>
                    <Text style={styles.gpsAutoText}>
                      Ubicación GPS automática: Se fijará tu punto geográfico actual con alta precisión.
                    </Text>
                  </View>
                )}

                {/* 2. Selector de Categorías Dinámicas desde BD */}
                <Text style={styles.inputLabel}>2. Categoría de Ayuda</Text>
                <View style={styles.categoryTabs}>
                  {categorias.map((cat) => {
                    const isSelected = selectedCategoria?.id === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catTab,
                          isSelected && {
                            backgroundColor: cat.colorHex,
                            borderColor: cat.colorHex,
                          },
                        ]}
                        onPress={() => handleSelectCategoria(cat)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.catTabText,
                            isSelected && { color: '#FFFFFF', fontWeight: '800' },
                          ]}
                        >
                          {cat.nombre.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Selector de Motivos Dinámicos */}
                {selectedCategoria && (
                  <View style={styles.motivosBox}>
                    <Text style={styles.inputLabel}>3. ¿Qué deseas avisar?</Text>
                    <View style={styles.tipoGrid}>
                      {selectedCategoria.motivos.map((mot) => {
                        const isSelected = selectedMotivo?.id === mot.id;
                        return (
                          <TouchableOpacity
                            key={mot.id}
                            style={[
                              styles.tipoChip,
                              isSelected && {
                                borderColor: selectedCategoria.colorHex,
                                backgroundColor: selectedCategoria.colorHex + '15',
                              },
                            ]}
                            onPress={() => setSelectedMotivo(mot)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.tipoChipText,
                                isSelected && {
                                  color: selectedCategoria.colorHex,
                                  fontWeight: '800',
                                },
                              ]}
                            >
                              {mot.nombre}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 4. Campo Extra Dinámico (Línea de Bus si aplica) */}
                {selectedMotivo?.campoExtraLabel && (
                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>{selectedMotivo.campoExtraLabel}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ej: Línea 14 - Disco 22 / Ecovía"
                      placeholderTextColor="#94A3B8"
                      value={campoExtraValor}
                      onChangeText={setCampoExtraValor}
                    />
                  </View>
                )}

                {/* 5. Campo de Detalle Opcional */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Detalle o Referencia (Opcional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Describe lo ocurrido para alertar a los demás..."
                    placeholderTextColor="#94A3B8"
                    value={detalleReporte}
                    onChangeText={setDetalleReporte}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* 6. Subida de Fotografía Opcional */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Fotografía (Opcional)</Text>
                  {Platform.OS === 'web' && (
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={(ref) => { fileInputRef.current = ref; }}
                      onChange={handleFileChange}
                    />
                  )}

                  {fotoPreview ? (
                    <View style={styles.photoPreviewCard}>
                      <Image source={{ uri: fotoPreview }} style={styles.photoThumbnail} resizeMode="cover" />
                      <View style={styles.photoActions}>
                        <Text style={styles.photoAttachedText}>Fotografía adjunta</Text>
                        <TouchableOpacity onPress={() => setFotoPreview(null)} style={styles.photoRemoveBtn}>
                          <Text style={styles.photoRemoveText}>Eliminar foto</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnPhotoPicker}
                      onPress={() => {
                        if (Platform.OS === 'web' && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnPhotoPickerText}>Tomar o seleccionar foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.btnSubmit,
                    { backgroundColor: selectedCategoria?.colorHex || EcuadorColors.red.primary },
                  ]}
                  onPress={handleEnviarReporte}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnSubmitText}>Publicar Reporte para la Comunidad</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  topFilterBarWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPillCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 3,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 2,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 6,
  },
  userPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userPillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 140,
  },
  userPillLogout: {
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  userPillLogoutText: {
    color: EcuadorColors.red.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
  },
  bottomCard: {
    width: '100%',
    maxWidth: 420,
  },
  btnReporte: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EcuadorColors.red.primary,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: EcuadorColors.red.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnReporteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        alignItems: 'center',
      },
    }),
  },
  modalSheet: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: '90%',
  },
  sheetGrabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCloseBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBanner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  categoryBannerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  incidentsList: {
    gap: 10,
  },
  incidentCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  incidentTime: {
    fontSize: 11,
    fontWeight: '700',
  },
  incidentSector: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  incidentExtra: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '700',
    marginTop: 1,
  },
  incidentDetail: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  singleIncidentBody: {
    paddingVertical: 8,
    gap: 10,
  },
  timeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  timeTagText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  extraBox: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  extraBoxText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '700',
  },
  singleIncidentDetailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
  singleIncidentDetailText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  diferidoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },
  diferidoNotice: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  tiempoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tiempoChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tiempoChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tiempoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tiempoChipTextActive: {
    color: '#FFFFFF',
  },
  gpsAutoBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  gpsAutoText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: EcuadorColors.red.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sheetForm: {
    gap: 12,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  catTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  catTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  motivosBox: {
    gap: 6,
  },
  inputField: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  btnPhotoPicker: {
    height: 44,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPhotoPickerText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  photoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
  },
  photoThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  photoActions: {
    flex: 1,
    gap: 4,
  },
  photoAttachedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  photoRemoveBtn: {
    alignSelf: 'flex-start',
  },
  photoRemoveText: {
    color: EcuadorColors.red.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  btnSubmit: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  quickFillBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  quickFillLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  quickFillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFillBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickFillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tipoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tipoChip: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tipoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  successView: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  successText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
});
