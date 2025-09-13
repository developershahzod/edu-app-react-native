import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';



import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { TicketListItem } from '../components/TicketListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketList'>;

export const TicketListScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { statuses } = route.params;
  const ticketsQuery = useGetTickets();
  const { paddingHorizontal } = useSafeAreaSpacing();

  const tickets = useMemo(
    () =>
      ticketsQuery.data
        ?.filter(ticket => statuses.includes(ticket.status))
        ?.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) ?? [],
    [ticketsQuery, statuses],
  );

  const labels = useMemo(() => {
    const closedTicket = statuses.includes(TicketStatus.Closed);
    return {
      title: closedTicket
        ? t('ticketsScreen.closed')
        : t('ticketsScreen.opened'),
      emptyState: closedTicket
        ? t('ticketsScreen.closedEmptyState')
        : t('ticketsScreen.openEmptyState'),
    };
  }, [statuses, t]);

  useScreenTitle(labels.title);

  if (!ticketsQuery.isLoading && !tickets.length) {
    return <OverviewList emptyStateText={labels.emptyState} />;
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={paddingHorizontal}
      refreshControl={<RefreshControl queries={[ticketsQuery]} manual />}
      data={tickets}
      renderItem={({ item }) => <TicketListItem ticket={item} key={item.id} />}
      ItemSeparatorComponent={Platform.select({
        ios: IndentedDivider,
      })}
      ListFooterComponent={<BottomBarSpacer />}
      ListEmptyComponent={<OverviewList emptyStateText={labels.emptyState} />}
    />
  );
};
