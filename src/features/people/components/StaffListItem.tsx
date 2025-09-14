import { ReactElement } from 'react';
import { Image, StyleSheet, TouchableHighlightProps } from 'react-native';

import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  person: any | undefined;
  subtitle?: string | ReactElement;
  navigateEnabled?: boolean;
}

export const StaffListItem = ({
  person,
  subtitle,
  navigateEnabled = true,
}: TouchableHighlightProps & Props) => {
  const { fontSizes } = useTheme();

  return (
    <ListItem
      leadingItem={
        person?.picture ? (
          <Image source={{ uri: person.picture }} style={styles.picture} />
        ) : (
          <Icon icon={faUserTie} size={fontSizes['2xl']} />
        )
      }
      title={person ? `${person.firstName} ${person.lastName}` : ''}
      accessibilityLabel={
        person
          ? `${subtitle}: ${person.firstName} ${person.lastName}`
          : undefined
      }
      linkTo={
        person?.id && navigateEnabled
          ? {
              screen: 'Person',
              params: { id: person.id },
            }
          : undefined
      }
      subtitle={subtitle}
    />
  );
};

const styles = StyleSheet.create({
  picture: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});