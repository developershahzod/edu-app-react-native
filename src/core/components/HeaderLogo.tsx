import Svg, { Path } from 'react-native-svg';

import { Row, RowProps } from '@lib/ui/components/Row';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { IS_ANDROID } from '../constants';
import { Image } from 'react-native';

export const HeaderLogo = (props: RowProps) => {
  const { palettes, dark } = useTheme();

  return (
    <Row mr={IS_ANDROID ? 1 : undefined} {...props}>
        {/* <Image source={require('../../../assets/logo.png')} style={{width: 45, height: 45, resizeMode: 'contain'}} /> */}
    </Row>
  );
};
