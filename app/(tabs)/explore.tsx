import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SobreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Sobre
      </ThemedText>
      <ThemedText style={styles.p}>
        Esta calculadora roda inteiramente no dispositivo: não há chamadas de rede para realizar
        operações. No Android e iOS, após instalada, continua disponível sem internet.
      </ThemedText>
      <ThemedText style={styles.p}>
        Na web, o conteúdo é servido como app estático; depois do primeiro carregamento, o
        navegador pode reutilizar os arquivos em cache. Para instalar como atalho na tela inicial,
        use o menu do navegador (por exemplo, “Instalar app” ou “Adicionar à tela inicial”) quando
        disponível.
      </ThemedText>
      <ThemedText style={styles.p}>
        Ative o modo <ThemedText type="defaultSemiBold">Científica</ThemedText> para funções
        trigonométricas, logaritmos, potência e constantes π e e. Use o selo{' '}
        <ThemedText type="defaultSemiBold">DEG</ThemedText> /{' '}
        <ThemedText type="defaultSemiBold">RAD</ThemedText> para graus ou radianos nas funções
        trigonométricas.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  p: {
    lineHeight: 24,
  },
});
