import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  faEnvelope,
  faLink,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { useApiContext } from '../../../core/contexts/ApiContext';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Person'>;

const profileImageSize = 120;

export const PersonScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { token } = useApiContext();
  const { accessibilityListLabel } = useAccessibility();
  const openInAppLink = useOpenInAppLink();

  // ✅ Always initialize as an empty array
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isOffline = useOfflineDisabled();

  // 🔥 Fetch all contacts from API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://edu-api.qalb.uz/api/v1/users/contacts', {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []); // ✅ ensure array
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]); // ✅ fallback empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  // ✅ Find person safely (returns undefined if not found)
  const person = useMemo(() => contacts.find(c => c.id === id), [contacts, id]);

  const fullName = person ? `${person.name ?? ''} ${person.surname ?? ''}`.trim() : '';
  const courses = person?.courses ?? []; // ✅ default to array
  const phoneNumbers = person?.phoneNumbers ?? []; // ✅ default to array

  // Show loading spinner before data is ready
  if (loading && contacts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Show empty state if person not found
  if (!loading && !person) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('contactsScreen.emptyState')}</Text>
      </SafeAreaView>
    );
  }

  const header = (
    <Col ph={5} gap={6} mb={6}>
      <Text weight="bold" variant="title" style={styles.title}>
        {fullName}
      </Text>
      {(person?.picture || person?.role_type || person?.profileUrl) && (
        <Row gap={6}>
          <View accessible accessibilityLabel={t('common.profilePic')}>
            {person?.picture ? (
              <Image
                source={{ uri: person.picture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon
                  icon={faUser}
                  size={fontSizes['3xl']}
                  color={colors.title}
                />
              </View>
            )}
          </View>
          <Col style={styles.info}>
            {person?.role_type && (
              <Metric
                title={t('personScreen.role')}
                value={person.role_type}
                style={styles.spaceBottom}
                accessible
              />
            )}
            {person?.profileUrl && (
              <TouchableOpacity
                onPress={() => openInAppLink(person.profileUrl)}
                accessible
                accessibilityRole="link"
              >
                <Row align="center">
                  <Icon
                    icon={faLink}
                    size={20}
                    color={colors.link}
                    style={styles.linkIcon}
                  />
                  <Text variant="link">{t('personScreen.moreInfo')}</Text>
                </Row>
              </TouchableOpacity>
            )}
          </Col>
        </Row>
      )}
    </Col>
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
    >
      <SafeAreaView>
        <Col pv={5}>
          {header}
          <Section>
            <SectionHeader
              title={t('personScreen.contacts')}
              accessibilityLabel={`${t('personScreen.contacts')}. ${
                phoneNumbers.length > 0 && t('common.phoneContacts')
              }. ${t('personScreen.sentEmail')}`}
            />
            <OverviewList indented loading={loading}>
              {person?.phone_number && (
                <ListItem
                  isAction
                  leadingItem={<Icon icon={faPhone} size={fontSizes.xl} />}
                  title={t('common.phone')}
                  subtitle={person.phone_number}
                  onPress={() => Linking.openURL(`tel:${person.phone_number}`)}
                />
              )}
              {person?.email && (
                <ListItem
                  isAction
                  leadingItem={<Icon icon={faEnvelope} size={fontSizes.xl} />}
                  title={t('common.email')}
                  subtitle={person.email}
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                />
              )}
            </OverviewList>
          </Section>
          {courses.length > 0 && (
            <Section>
              <SectionHeader
                title={t('common.course_plural')}
                accessible
                accessibilityLabel={`${t('personScreen.coursesLabel')}. ${t(
                  'personScreen.totalCourses',
                  { total: courses.length },
                )}`}
              />
              <OverviewList>
                {courses.map((course: any, index: number) => (
                  <ListItem
                    key={course.id}
                    title={course.name}
                    subtitle={`${course.year}`}
                    disabled={isOffline}
                    accessibilityLabel={`${accessibilityListLabel(index, courses.length)}. ${course.name}, ${course.year}`}
                  />
                ))}
              </OverviewList>
            </Section>
          )}
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) => {
  const profileImage = {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize,
  };
  return StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
    info: {
      flex: 1,
      justifyContent: 'center',
      flexDirection: 'column',
    },
    profileImage,
    profileImagePlaceholder: {
      ...profileImage,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    linkIcon: {
      marginRight: spacing[2],
    },
  });
};
