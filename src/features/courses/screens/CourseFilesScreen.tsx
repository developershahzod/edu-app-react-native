import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, Alert } from 'react-native';

import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { CourseDirectory, CourseFileOverview } from '../../lib/api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { CourseFilesCacheContext } from '../contexts/CourseFilesCacheContext';
import { FileStackParamList } from '../navigation/FileNavigator';

type Props = NativeStackScreenProps<FileStackParamList, 'RecentFiles'>;


import { LecturesApi } from '../../../lib/api-client/apis/LecturesApi';


export const CourseFilesScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { clearNotificationScope } = useNotifications();
  const { updatePreference } = usePreferencesContext();
  const { refresh } = useContext(CourseFilesCacheContext);
  const courseId = route.params.courseId;
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const lecturesApi = new LecturesApi();

  useOnLeaveScreen(() => {
    clearNotificationScope(['teaching', 'courses', courseId, 'files']);
  });

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const onSwipeEnd = useCallback(() => setScrollEnabled(true), []);

  const handleDownload = async (lectureId: number, filename: string) => {
    try {
      const blob = await lecturesApi.downloadLectureFile({ lectureId, filename });
      // Use React Native's file system or share API to save or open the file
      // For now, just alert success
      Alert.alert(t('courseFilesTab.downloadSuccess', { filename }));
    } catch (error) {
      Alert.alert(t('courseFilesTab.downloadError'), String(error));
    }
  };

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={recentFilesQuery.data}
        contentContainerStyle={paddingHorizontal}
   
        keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={4}
        renderItem={({ item }) => {
          return (
            <CourseRecentFileListItem
              item={item}
              onSwipeStart={onSwipeStart}
              onSwipeEnd={onSwipeEnd}
              onDownload={() => handleDownload(item.lectureId, item.filename)}
            />
          );
        }}
        refreshControl={<RefreshControl queries={[recentFilesQuery]} />}
        ItemSeparatorComponent={Platform.select({
          ios: IndentedDivider,
        })}
        ListFooterComponent={
          <>
            <CtaButtonSpacer />
            <BottomBarSpacer />
          </>
        }
        ListEmptyComponent={
          !recentFilesQuery.isLoading ? (
            <OverviewList emptyStateText={t('courseFilesTab.empty')} />
          ) : null
        }
      />
      {recentFilesQuery.data && navigation && (
        <CtaButton
          title={t('courseFilesTab.navigateFolders')}
          icon={faFolderOpen}
          action={() => {
            navigation.replace('DirectoryFiles', { courseId });
            updatePreference('filesScreen', 'directoryView');
          }}
        />
      )}
    </>
  );
};
