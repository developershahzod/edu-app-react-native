import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useDebounceValue } from '../../../core/hooks/useDebounceValue';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { PersonOverviewListItem } from '../components/PersonOverviewListItem';
import { RecentSearch } from '../components/RecentSearch';

import { useApiContext } from '../../../core/contexts/ApiContext';

export const ContactsScreen = () => {
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceSearch = useDebounceValue(search, 400);
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { peopleSearched } = usePreferencesContext();
  const { token } = useApiContext();

  const isInputDisabled = useOfflineDisabled();
  const enabled = debounceSearch.length >= 0;

  // Fetch contacts when search changes
  useEffect(() => {
    if (!enabled) return;

    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://edu-api.qalb.uz/api/v1/users/contacts?search=${debounceSearch}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setPeople(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setPeople([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [debounceSearch, enabled, token]);

  // 🔥 Sort contacts by how well they match the search text
  const sortedPeople = useMemo(() => {
    if (!debounceSearch.trim()) return people;

    const lowerSearch = debounceSearch.toLowerCase();

    return [...people].sort((a, b) => {
      const aName = `${a.name ?? ''} ${a.surname ?? ''}`.toLowerCase();
      const bName = `${b.name ?? ''} ${b.surname ?? ''}`.toLowerCase();

      const aIndex = aName.indexOf(lowerSearch);
      const bIndex = bName.indexOf(lowerSearch);

      // Names that include the search first
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      // Sort by earliest match position
      return aIndex - bIndex;
    });
  }, [debounceSearch, people]);

  return (
    <>
      <HeaderAccessory style={styles.searchBar}>
        <Row align="center" style={{ flex: 1 }}>
          <TranslucentTextField
            autoFocus
            autoCorrect={false}
            leadingIcon={faSearch}
            value={search}
            onChangeText={setSearch}
            style={[GlobalStyles.grow, styles.textField]}
            label={t('contactsScreen.search')}
            editable={!isInputDisabled}
            isClearable={!!search}
            onClear={() => setSearch('')}
            onClearLabel={t('contactsScreen.clearSearch')}
          />
        </Row>
      </HeaderAccessory>

      {!enabled && peopleSearched?.length > 0 && <RecentSearch />}

      {enabled && (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: spacing[4] }}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
            <Section>
              <OverviewList
                loading={isLoading}
                style={{ marginTop: spacing[4] }}
                emptyStateText={t('contactsScreen.emptyState')}
              >
                {sortedPeople?.map((person, index) => (
                  <PersonOverviewListItem
                    key={person.id}
                    person={person}
                    searchString={debounceSearch}
                    index={index}
                    totalData={sortedPeople?.length || 0}
                  />
                ))}
              </OverviewList>
            </Section>
          </SafeAreaView>
        </ScrollView>
      )}
    </>
  );
};

const createStyles = ({ spacing, shapes }: Theme) =>
  StyleSheet.create({
    textField: {
      paddingLeft: spacing[4],
      borderRadius: shapes.lg,
      marginLeft: spacing[3],
    },
    searchBar: {
      paddingBottom: spacing[2],
      paddingTop: spacing[2],
      backgroundColor: '#fff',
      zIndex: 1,
    },
    searchIcon: {
      position: 'absolute',
      left: spacing[6],
    },
  });
