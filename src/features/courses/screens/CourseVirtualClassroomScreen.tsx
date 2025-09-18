import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useApiContext } from '~/core/contexts/ApiContext';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseVirtualClassroom'>;

export const CourseVirtualClassroomScreen = ({ route }: Props) => {
  const { courseId, lectureId, teacherId, file_type } = route.params;
  const { t } = useTranslation();
  const { token } = useApiContext();

  const virtualClassroomQuery = useGetCourseVirtualClassrooms(courseId);
  const teacherQuery = useGetPerson(teacherId);

  const lecture = useMemo(
    () => virtualClassroomQuery.data?.find(l => l.id === lectureId),
    [lectureId, virtualClassroomQuery.data]
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const fileUrl = `https://edu-api.qalb.uz/api/v1/lecture-files/download/${lectureId}`;

  function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return global.btoa(binary);
  }

  async function handleExternalOpen() {
    try {
      setIsDownloading(true);

      const localFilePath = `${RNFS.DocumentDirectoryPath}/${lectureId}${file_type}`;
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      await RNFS.writeFile(localFilePath, base64, 'base64');

      await FileViewer.open(localFilePath, { showOpenWithDialog: true });
    } catch (error: any) {
      Alert.alert('Download Error', error.message || 'Unable to open file');
    } finally {
      setIsDownloading(false);
    }
  }

  // ✅ Auto-download when page opens
  useEffect(() => {
    handleExternalOpen();
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[virtualClassroomQuery, teacherQuery]} manual />}
      contentContainerStyle={[GlobalStyles.fillHeight, { flexGrow: 1 }]}
    >
      <SafeAreaView style={{justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleExternalOpen}
            disabled={isDownloading}
            style={{
              backgroundColor: isDownloading ? '#bbb' : '#007AFF',
              marginTop: 100,
              paddingVertical: 14,
              paddingHorizontal: 30,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
     
            }}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                {t('Download Lecture File')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
