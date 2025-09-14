import { PropsWithChildren } from 'react';
import { Platform, ViewProps } from 'react-native';

import { Col, ColProps } from '@lib/ui/components/Col';

export const Section = ({
  style,
  children,
  mb = 5,
  bgColor,
  ...rest
}: PropsWithChildren<ViewProps & ColProps & { mb?: number; bgColor?: string }>) => {
  return (
    <Col
      mb={mb}
      style={[style, bgColor ? { backgroundColor: bgColor, borderRadius: 12, padding: 16 } : undefined]}
      accessible={Platform.select({
        android: true,
        ios: false,
      })}
      {...rest}
    >
      {children}
    </Col>
  );
};
