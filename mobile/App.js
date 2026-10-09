import { useEffect, useRef, useState } from 'react';
import { BackHandler, ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://appgastos-gamma.vercel.app/';
const ORIGIN = 'https://appgastos-gamma.vercel.app';

export default function App() {
  const webRef = useRef(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webRef.current?.canGoBack()) { webRef.current.goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, []);

  const abrirExterno = req => {
    if (req.url.startsWith(ORIGIN)) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {carregando && !erro && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4338ca" />
          <Text style={styles.texto}>Carregando AppGastos…</Text>
        </View>
      )}
      {erro && (
        <View style={styles.overlay}>
          <Text style={styles.titulo}>Sem conexão</Text>
          <Text style={styles.texto}>Não foi possível carregar o AppGastos.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => { setErro(false); setCarregando(true); webRef.current?.reload(); }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
      <WebView
        ref={webRef}
        source={{ uri: APP_URL }}
        onShouldStartLoadWithRequest={abrirExterno}
        onLoadStart={() => setCarregando(true)}
        onLoadEnd={() => { setCarregando(false); setErro(false); }}
        onError={() => { setErro(true); setCarregando(false); }}
        onHttpError={e => { if (e.nativeEvent.statusCode >= 500) { setErro(true); setCarregando(false); } }}
        pullToRefreshEnabled
        domStorageEnabled
        javaScriptEnabled
        allowsInlineMediaPlayback
        startInLoadingState={false}
        style={erro ? styles.oculto : styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  web: { flex: 1, backgroundColor: '#0f172a' },
  oculto: { flex: 1, opacity: 0 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0f172a', zIndex: 10 },
  titulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  texto: { color: '#94a3b8', fontSize: 13 },
  btn: { backgroundColor: '#4338ca', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, marginTop: 8 }
});