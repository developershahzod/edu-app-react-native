import { ReactElement } from 'react';
import {
  StyleProp,
  TextProps,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IS_IOS } from '../../../src/core/constants';
import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
import { GlobalStyles } from '../../../src/core/styles/GlobalStyles';
import { To } from '../../../src/utils/resolveLinkTo';
import { resolveLinkTo } from '../../../src/utils/resolveLinkTo';
import { useTheme } from '../hooks/useTheme';
import { DisclosureIndicator } from './DisclosureIndicator';
import { Text } from './Text';

export interface ListItemProps extends TouchableHighlightProps {
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  subtitleProps?: TextProps;
  leadingItem?: ReactElement;
  trailingItem?: ReactElement;
  linkTo?: To<any>;
  children?: any;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  isAction?: boolean;
  card?: boolean;
  inverted?: boolean;
  titleProps?: TextProps;
  multilineTitle?: boolean;
  unread?: boolean;
  isInVisibleRange?: boolean;
}

/**
 * A list item with support for a title, subtitle, leading and trailing
 * elements. If a linkTo is provided, a forward icon is automatically
 * displayed as a trailing element on iOS.
 */
export const ListItem = ({
  title,
  titleStyle,
  subtitle,
  subtitleStyle,
  subtitleProps,
  leadingItem,
  trailingItem,
  linkTo,
  containerStyle,
  onPress,
  isAction,
  disabled,
  style,
  card,
  children,
  inverted = false,
  multilineTitle = false,
  titleProps,
  unread = false,
  ...rest
}: ListItemProps) => {
  const { fontSizes, fontWeights, colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { accessibility } = usePreferencesContext();
  const titleElement =
    typeof title === 'string' ? (
      <Row align="center" gap={2}>
        {unread && <UnreadBadge />}
        <Text
          variant="title"
          style={[
            GlobalStyles.grow,
            {
              fontSize: fontSizes.md,
              lineHeight:
                accessibility?.fontSize && accessibility.fontSize <= 125
                  ? fontSizes.sm * 1.6
                  : fontSizes.sm * 2.2,
              color: colors.heading,
            },
            unread && {
              fontWeight: fontWeights.semibold,
            },
            titleStyle,
          ]}
          weight="medium"
          numberOfLines={
            multilineTitle
              ? undefined
              : (titleProps?.numberOfLines ?? (card ? 3 : 1))
          }
          ellipsizeMode={titleProps?.ellipsizeMode ?? 'tail'}
          {...titleProps}
        >
          {title}
        </Text>
      </Row>
    ) : (
      title
    );

  const subtitleElement = subtitle ? (
    typeof subtitle === 'string' ? (
      <Text
        variant="secondaryText"
        style={[
          {
            fontSize: fontSizes.sm,
            lineHeight:
              accessibility?.fontSize && accessibility.fontSize <= 125
                ? fontSizes.sm * 1.6
                : fontSizes.sm * 2.8,
            color: colors.secondaryText,
          },
          subtitleStyle,
        ]}
        ellipsizeMode="tail"
        {...subtitleProps}
      >
        {subtitle}
      </Text>
    ) : (
      subtitle
    )
  ) : null;

  return (
    <TouchableHighlight
      underlayColor={colors.touchableHighlight}
      onPress={
        linkTo
          ? () => {
              const resolved = resolveLinkTo(linkTo);
              navigation.navigate(resolved.name as any, resolved.params);
            }
          : onPress
      }
      style={[
        {
          opacity: disabled ? 0.5 : 1,
          backgroundColor: card ? colors.surface : 'transparent',
          borderRadius: card ? 12 : 0,
          // shadowColor: card ? colors.shadow : undefined,
          // shadowOffset: card ? { width: 0, height: 2 } : undefined,
          // shadowOpacity: card ? 0.1 : undefined,
          // shadowRadius: card ? 4 : undefined,
          // elevation: card ? 3 : undefined,
        },
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <View
        style={[
          {
            minHeight: 64,
            flexDirection: card ? 'column' : 'row',
            alignItems: 'center',
            paddingHorizontal: spacing[6],
            paddingVertical: spacing[3],
          },
          containerStyle,
        ]}
      >
        {children}
        {leadingItem && (
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: card ? undefined : -8,
              marginRight: card ? undefined : spacing[3],
            }}
          >
            {leadingItem}
          </View>
        )}
        <Col flex={1} style={inverted && { flexDirection: 'column-reverse' }}>
          {titleElement}
          {subtitleElement}
        </Col>
        {!card &&
          (!trailingItem && (linkTo || isAction) && IS_IOS ? (
            <DisclosureIndicator />
          ) : (
            trailingItem
          ))}
      </View>
    </TouchableHighlight>
  );
};
