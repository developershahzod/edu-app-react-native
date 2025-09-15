import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetMyEvents } from '../../../core/queries/calendarHooks';
import { NewsEventListItem } from '../components/NewsEventListItem';

export const NewsScreen = () => {
  const eventsQuery = useGetMyEvents();


  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[eventsQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <OverviewList loading={eventsQuery.isLoading}>
            {eventsQuery?.data?.map((eventItem, index) => (
              <NewsEventListItem
                event={eventItem}
                key={eventItem.id}
                index={index}
                totalData={eventsQuery?.data?.length || 0}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
