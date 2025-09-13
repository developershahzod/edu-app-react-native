import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import {
  faAngleDown,
  faBell,
  faCog,
  faMessage,
  faSignOut,
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
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';

const UserDetails = () => {
  const { spacing, fontSizes } = useTheme();

  // Static placeholder user data
  const student = {
    lastName: 'Doe',
    firstName: 'John',
    username: 's1234567',
  };

  return (
    <Section accessible={false} style={{ marginTop: spacing[3] }}>
      <SectionHeader
        title={student.lastName + ' ' + student.firstName}
        subtitle={'Username: ' + student.username}
        titleStyle={{ fontSize: fontSizes.xl }}
        subtitleStyle={{ fontSize: fontSizes.lg }}
      />
    </Section>
  );
};

const HeaderRightDropdown = () => {
  const { palettes, spacing } = useTheme();

  // Static placeholder data
  const username = 's1234567';
  const canSwitchCareer = false;

  return (
    <View
      style={{ padding: spacing[2] }}
      accessible={true}
      accessibilityRole={canSwitchCareer ? 'button' : 'text'}
      accessibilityLabel={`Username ${username} ${
        canSwitchCareer ? 'Switch career available' : ''
      }`}
    >
      <StatefulMenuView actions={[]} onPressAction={() => {}}>
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

export const ProfileScreenUI = () => {
  const { t } = { t: (key: string) => key }; // Dummy translation function
  const { fontSizes } = useTheme();

  // Static placeholder student data
  const student = {
    username: 's1234567',
    firstName: 'John',
    lastName: 'Doe',
    degreeName: 'Computer Science',
    degreeLevel: 'Bachelor',
    firstEnrollmentYear: 2020,
    status: 'Active',
  };

  const enrollmentYear = `${student.firstEnrollmentYear - 1}/${student.firstEnrollmentYear}`;

  // Static placeholders for messages and unread count
  const hasUnreadMessages = true;
  const unreadCount = 3;

  const isOffline = false;
  const areMessagesDisabled = false;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <View
          accessible={true}
          accessibilityLabel={`Smart Card. Username ${student.username.substring(
            1,
          )}, ${student.firstName} ${student.lastName}`}
        >
          <UserDetails />
        </View>
        <Section accessible={false}>
          <SectionHeader
            title={t('common.career')}
            trailingItem={<Text>{student.status}</Text>}
          />
          <OverviewList>
            <ListItem
              title={student.degreeName}
              subtitle={student.degreeLevel + ' - ' + enrollmentYear}
              linkTo={undefined}
            />
          </OverviewList>
          <OverviewList indented>
            <ListItem
              title={t('notificationsScreen.title')}
              leadingItem={<Icon icon={faBell} size={fontSizes.xl} />}
              linkTo={undefined}
            />
            <ListItem
              title={t('profileScreen.settings')}
              leadingItem={<Icon icon={faCog} size={fontSizes.xl} />}
              linkTo={undefined}
            />
            <ListItem
              title={t('messagesScreen.title')}
              leadingItem={<Icon icon={faMessage} size={fontSizes.xl} />}
              linkTo={undefined}
              disabled={areMessagesDisabled}
              trailingItem={
                hasUnreadMessages ? <UnreadBadge text={unreadCount} /> : undefined
              }
            />
          </OverviewList>
          <CtaButton
            absolute={false}
            disabled={isOffline}
            title={t('common.logout')}
            action={() => {}}
            icon={faSignOut}
          />
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};