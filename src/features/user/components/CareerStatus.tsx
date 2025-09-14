import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = {
  status: string;
};
export const CareerStatus = ({ status }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t, i18n } = useTranslation();

  const { dark, palettes } = useTheme();
  const [color, backgroundColor] = useMemo(() => {
    const normalized = String(status).toLowerCase();
    switch (normalized) {
      case 'active':
        return [palettes.success[dark ? 300 : 600], palettes.success[500]];
      case 'closed':
      case 'cancelled':
      case 'career_closed':
      case 'inactive':
        return [palettes.danger[dark ? 400 : 600], palettes.danger[600]];
      case 'graduated':
        return [
          palettes.primary[dark ? 300 : 600],
          palettes.primary[dark ? 400 : 500],
        ];
      default:
        return [palettes.gray[dark ? 400 : 500], palettes.gray[500]];
    }
  }, [dark, palettes, status]);

  return (
    <Row align="baseline" gap={2}>
      <View
        style={[
          styles.statusCircle,
          {
            backgroundColor,
          },
        ]}
      />
      <Text variant="secondaryText" style={{ color }}>
        {i18n.exists(`profileScreen.careerStatusEnum.${status}`)
          ? t(`profileScreen.careerStatusEnum.${status}`).toLowerCase()
          : status.toLowerCase()}
      </Text>
    </Row>
  );
};

const createStyles = () =>
  StyleSheet.create({
    statusCircle: {
      width: 8,
      height: 8,
      borderRadius: 8,
    },
  });
