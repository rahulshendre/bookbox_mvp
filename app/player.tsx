import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ videoId: string | string[] }>();
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const videoId = Array.isArray(params.videoId) ? params.videoId[0] : params.videoId;

  if (!videoId || typeof videoId !== 'string') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.errorText}>
          No video ID provided
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const onStateChange = (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    } else if (state === 'playing') {
      setPlaying(true);
    } else if (state === 'paused') {
      setPlaying(false);
    }
  };

  const onReady = () => {
    setIsReady(true);
    setTimeout(() => {
      setPlaying(true);
    }, 500);
  };

  const onError = (error: string) => {
    setError(error);
    if (error.includes('embed') || error.includes('restricted')) {
      Alert.alert('Player Error', `This video may not be available: ${error}`);
    }
  };

  const togglePlaying = () => {
    setPlaying((prev) => !prev);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕ Close</ThemedText>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorText}>
            Error Loading Video
          </ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.playerContainer}>
            <YoutubePlayer
              height={300}
              width="100%"
              play={playing}
              videoId={videoId}
              onChangeState={onStateChange}
              onReady={onReady}
              onError={onError}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: 0,
                showinfo: 0,
              }}
              webViewStyle={{ opacity: 0.99 }}
              webViewProps={{
                androidLayerType: 'hardware',
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                allowsFullscreenVideo: true,
              }}
            />
          </View>

          {!isReady && (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
            </View>
          )}

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlaying}>
              <ThemedText style={styles.playButtonText}>
                {playing ? '⏸ Pause' : '▶ Play'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

