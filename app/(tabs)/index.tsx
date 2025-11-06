import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import VideoItem from '@/components/video-item';
import { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } from '@/config/youtube';

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideo[];
  error?: {
    message: string;
  };
}

export default function HomeScreen() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, [YOUTUBE_CHANNEL_ID]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = typeof YOUTUBE_API_KEY === 'string' ? YOUTUBE_API_KEY.trim() : '';
      if (!apiKey || apiKey === 'your_youtube_api_key_here') {
        throw new Error('Please set your YouTube API key in .env file');
      }

      const channelId = typeof YOUTUBE_CHANNEL_ID === 'string' ? YOUTUBE_CHANNEL_ID.trim() : '';
      if (!channelId) {
        throw new Error('Please set your YouTube Channel ID in .env file');
      }

      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data: YouTubeApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch videos');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.items && data.items.length > 0) {
        setVideos(data.items);
      } else {
        setError('No videos found for this channel');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (videoId: string) => {
    router.push({
      pathname: '/player',
      params: { videoId: String(videoId) },
    });
  };

  const renderVideoItem = ({ item }: { item: YouTubeVideo }) => (
    <VideoItem
      video={item}
      onPress={() => handleVideoPress(item.id.videoId)}
    />
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <ThemedText style={styles.loadingText}>Loading videos...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="title" style={styles.errorTitle}>Error</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText style={styles.helpText}>
          Make sure you have set YOUTUBE_API_KEY in your .env file
        </ThemedText>
      </ThemedView>
    );
  }

  if (videos.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="title">No Videos</ThemedText>
        <ThemedText>No videos found for this channel.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Educational Videos</ThemedText>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <ThemedText style={styles.refreshButtonText}>🔄 Refresh</ThemedText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.videoId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF0000']}
            tintColor="#FF0000"
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF0000',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    marginBottom: 8,
    color: '#FF0000',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
