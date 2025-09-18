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
  Dimensions,
} from 'react-native';

import { PdfView } from 'react-native-pdf-light';

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
  const [pdfSource, setPdfSource] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  const fileUrl = `https://edu-api.qalb.uz/api/v1/lecture-files/download/${lectureId}`;
  const isPdf = file_type && typeof file_type === 'string' && file_type.toLowerCase().includes('pdf');

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

  async function handlePdfOpen() {
    try {
      setIsDownloading(true);
      
      const localFilePath = `${RNFS.DocumentDirectoryPath}/${lectureId}${file_type}`;
      // Set PDF source directly to server URL with headers
      setPdfSource(localFilePath);
      setShowPdf(true);
    } catch (error: any) {
      Alert.alert('PDF Error', error.message || 'Unable to load PDF');
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleFileDownload() {
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

  const handleFileAction = () => {
    if (isPdf) {
      handlePdfOpen();
    } else {
      handleFileDownload();
    }
  };

  // Auto-open when page loads
  useEffect(() => {
    handleFileAction();
  }, []);

  // If PDF is loaded, show PDF viewer
  if (showPdf && pdfSource) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', padding: 16, backgroundColor: '#f8f9fa' }}>
          <TouchableOpacity
            onPress={() => setShowPdf(false)}
            style={{
              backgroundColor: '#6c757d',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {t('Back')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleFileDownload}
            disabled={isDownloading}
            style={{
              backgroundColor: isDownloading ? '#bbb' : '#28a745',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {t('Download')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      
          <PdfView
            source={pdfSource}

   

           resizeMode="fitWidth"
              style={{ flex: 1}}

      

  

            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded with ${numberOfPages} pages`);
            }}
            onError={(error) => {
              console.error('PDF Error:', error);
              Alert.alert('PDF Error', 'Unable to display PDF');
              setShowPdf(false);
            }}
           
          />
    
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[virtualClassroomQuery, teacherQuery]} manual />}
      contentContainerStyle={[GlobalStyles.fillHeight, { flexGrow: 1 }]}
    >
      <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleFileAction}
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
                {isPdf ? t('Open PDF') : t('Download Lecture File')}
              </Text>
            )}
          </TouchableOpacity>

          {lecture && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                {lecture.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                {t('File type')}: {file_type}
              </Text>
            </View>
          )}
        </View>

        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};