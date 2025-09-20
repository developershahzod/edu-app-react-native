import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View, Image } from 'react-native';
import {
  faAngleDown,
  faSignOut,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { MenuAction, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { filterUnread, hasUnreadMessages } from '../../../../src/utils/messages';
import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { CardSwiper } from '../../../core/components/CardSwiper';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useLogout } from '../../../core/queries/authHooks';
import {
  MESSAGES_QUERY_KEY,
  useGetMessages,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { CareerStatus } from '../components/CareerStatus';
import { UserStackParamList } from '../components/UserNavigator';
import { Student } from '../../../lib/api-client';

type Props = NativeStackScreenProps<UserStackParamList, 'Profile'>;

type UserDetailsProps = { student?: Student };

const UserDetails = ({ student }: UserDetailsProps) => {
  const { t } = useTranslation();
  const { spacing, fontSizes, palettes } = useTheme();

  const profileImage = student?.profilePicture || student?.smartCardPicture;

  return (
    <Section accessible={false} style={{ marginTop: spacing[3] }}>
      {/* User Profile Image */}
      <View
        style={{
          alignItems: 'center',
          marginBottom: spacing[4],
          paddingVertical: spacing[3],
        }}
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: palettes.gray[200],
            }}
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('profileScreen.profilePicture')}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: palettes.gray[200],
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('profileScreen.defaultProfilePicture')}
          >
            <Icon
              icon={faUser}
              size={fontSizes['2xl']}
              color={palettes.gray[500]}
            />
          </View>
        )}
      </View>
    </Section>
  );
};

const HeaderRightDropdown = ({
  student,
  isOffline,
}: {
  student?: Student;
  isOffline: boolean;
}) => {
  const { t } = useTranslation();
  const { palettes, spacing } = useTheme();

  const username = student?.login || '';
  const canSwitchCareer = (student?.study_programs_as_student?.length || 0) > 1 && !isOffline;

  const actions = useMemo<MenuAction[]>(() => {
    if (!canSwitchCareer) return [];
    return student?.study_programs_as_student?.map((program) => ({
      id: program.id,
      title: program.title,
      state: undefined,
    })) || [];
  }, [canSwitchCareer, student]);

  const onPressAction = useCallback(
    ({ nativeEvent: { event } }: NativeActionEvent) => {
      // Future: trigger program switch mutation
    },
    []
  );

  return (
    <View
      style={{ padding: spacing[2] }}
      accessible
      accessibilityRole={canSwitchCareer ? 'button' : 'text'}
      accessibilityLabel={`${t('common.username')} ${username} ${
        canSwitchCareer ? t('common.switchCareerLabel') : ''
      }`}
    >
      <StatefulMenuView actions={actions} onPressAction={onPressAction}>
        <Row>
          <Text variant="link" style={{ marginRight: 5 }}>
            {username}
          </Text>
          {canSwitchCareer && (
            <Icon icon={faAngleDown} color={palettes.primary[500]} />
          )}
        </Row>
      </StatefulMenuView>
    </View>
  );
};

export const ProfileScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { firstRequest } = route.params;
  const { fontSizes } = useTheme();
  const { mutate: handleLogout } = useLogout();

  const studentQuery = useGetStudent();
  const student = studentQuery.data;

  const queryClient = useQueryClient();
  const messages = useGetMessages();

  const primaryProgram = useMemo(() => {
    return student?.study_programs_as_student?.[0] || null;
  }, [student]);

  const areMessagesMissing = useCallback(
    () => queryClient.getQueryData(MESSAGES_QUERY_KEY) === undefined,
    [queryClient]
  );

  const areMessagesDisabled = useOfflineDisabled(areMessagesMissing);
  const isOffline = useOfflineDisabled();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRightDropdown student={student} isOffline={isOffline} />
      ),
    });
  }, [isOffline, navigation, student]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl manual queries={[studentQuery]} />}
    >
      <SafeAreaView>
        {/* Smart Card / User Details */}
        <View
          accessible
          accessibilityLabel={`${t('profileScreen.smartCard')}. ${t(
            'common.username'
          )} ${student?.login || ''}, ${student?.name || ''} ${student?.surname || ''}`}
        >
          {student &&
          (student.smartCardPicture ||
            student.europeanStudentCard?.canBeRequested) ? (
            <CardSwiper student={student} firstRequest={firstRequest} />
          ) : (
            <UserDetails student={student} />
          )}
        </View>

        {/* Career Section */}
        <Section accessible={false}>
          <SectionHeader
            title={t('common.career')}
            trailingItem={
              student?.status ? <CareerStatus status={student.status} /> : null
            }
          />
          <OverviewList>
            <ListItem
                title={`${student?.surname ?? ''} ${student?.name ?? ''}`}
                subtitle={primaryProgram ? `${primaryProgram.title} (${primaryProgram.program_type})` : ''}
                leadingItem={<Icon icon={faUser} size={fontSizes.xl} />}
                linkTo={{
                  screen: 'Degree', // or 'ProgramDetails' if that's what your navigator uses
                  params: {
                    id: primaryProgram?.id,
                    title: primaryProgram?.title,
                    type: primaryProgram?.program_type,
                    description: primaryProgram?.description,
                  },
                }}
                accessible
                accessibilityLabel={primaryProgram?.title || ''}
              />

          </OverviewList>

          {/* Logout Button */}
          <CtaButton
            absolute={false}
            disabled={isOffline}
            title={t('common.logout')}
            action={handleLogout}
            icon={faSignOut}
          />
        </Section>

        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
