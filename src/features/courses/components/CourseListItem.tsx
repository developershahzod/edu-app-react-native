import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useQueryClient } from '@tanstack/react-query';

import { IS_ANDROID } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { getCourseKey } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { getLatestCourseInfo, isCourseDetailed } from '../utils/courses';
import { CourseIndicator } from './CourseIndicator';

interface Props {
  course: CourseOverview;
  accessible?: boolean;
  accessibilityLabel?: string;
  badge?: number;
}

const Menu = ({
  course,
  children,
}: PropsWithChildren<{
  course: CourseOverview;
}>) => {
  const { t } = useTranslation();
  const preferences = usePreferencesContext();
  const { dark, colors } = useTheme();

  const isHidden =
    preferences.courses[course.uniqueShortcode]?.isHidden ?? false;

  const handleMenuAction = useCallback(() => {
    preferences.updatePreference('courses', {
      ...preferences.courses,
      [course.uniqueShortcode!]: {
        ...preferences.courses[course.uniqueShortcode],
        isHidden: !isHidden,
      },
    });
  }, [preferences, course.uniqueShortcode, isHidden]);

  return (
    <ContextMenu
      dropdownMenuMode={IS_ANDROID}
      title={`${t('common.course')} ${t('common.preferences').toLowerCase()}`}
      actions={[
        {
          title: isHidden ? t('common.follow') : t('common.stopFollowing'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          systemIcon: isHidden ? 'eye' : 'eye.slash',
          titleColor: dark ? colors.white : colors.black,
        },
      ]}
      onPress={handleMenuAction}
    >
      {children}
    </ContextMenu>
  );
};

export const CourseListItem = ({
  course,
  accessibilityLabel,
  accessible,
  badge,
}: Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();

  const hasDetails = isCourseDetailed(course);
  const courseInfo = getLatestCourseInfo(course);
  const queryClient = useQueryClient();

  const isDataMissing = useCallback(
    () =>
      !!course.uniqueShortcode &&
      queryClient.getQueryData(getCourseKey(course.uniqueShortcode)) === undefined,
    [course.uniqueShortcode, queryClient],
  );

  const isDisabled = useOfflineDisabled(isDataMissing);

  const subtitle = useMemo(() => getCourseSubtitle(course, t), [course, t]);

  // Compose trailing item elements
  const trailingElements = [];

  if (badge) {
    trailingElements.push(<UnreadBadge key="badge" text={badge} />);
  }

  if (hasDetails) {
    if (Platform.OS === 'android') {
      trailingElements.push(
        <Menu key="menu" course={course}>
          <IconButton
            style={{ padding: spacing[3] }}
            icon={faEllipsisVertical}
            color={colors.secondaryText}
            size={fontSizes.xl}
          />
        </Menu>,
      );
    } else {
      trailingElements.push(<DisclosureIndicator key="disclosure" />);
    }
  }

  const trailingItem = trailingElements.length > 0 ? (
    <>{trailingElements}</>
  ) : (
    <View style={{ width: 20 }} />
  );

  const listItem = (
    <ListItem
      accessible={accessible}
      disabled={isDisabled}
      linkTo={
        hasDetails
          ? {
              screen: 'Course',
              params: { id: courseInfo?.id },
            }
          : undefined
      }
      onPress={() => {
        if (!hasDetails) {
          Alert.alert(t('courseListItem.courseWithoutDetailsAlertTitle'));
        }
      }}
      accessibilityLabel={`${accessibilityLabel} ${course.uniqueShortcode}`}
      title={course.name}
      subtitle={subtitle}
      leadingItem={<CourseIndicator uniqueShortcode={course.uniqueShortcode} />}
      trailingItem={trailingItem}
      containerStyle={{ paddingRight: Platform.OS === 'android' ? 0 : undefined }}
    />
  );

  // On iOS, wrap the list item in a View with accessibilityRole button and Menu for context menu
  if (hasDetails && Platform.OS === 'ios') {
    return (
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} ${course.uniqueShortcode}`}
      >
        <Menu course={course}>{listItem}</Menu>
      </View>
    );
  }

  return listItem;
};

export function getCourseSubtitle(course: CourseOverview, t: (key: string) => string): string {
  const title = course.title ?? '';
  const description = course.title ?? '';
  const academicYear = course.academicYear ?? '';

  // Compose subtitle parts, filter out empty strings
  const parts = [title, description, academicYear].filter(part => part && part.trim() !== '');

  // Join parts with separator
  return parts.join(' • ');
}

