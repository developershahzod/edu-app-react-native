/* eslint-disable @typescript-eslint/naming-convention */
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageURISource, Platform, StyleSheet, Text, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';

import { Divider } from '@lib/ui/components/Divider';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Images,
  RasterLayer,
  RasterSource,
  UserLocation,
} from '@rnmapbox/maps';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { TranslucentView } from '../../../core/components/TranslucentView';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { notNullish } from '../../../utils/predicates';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { INTERIORS_MIN_ZOOM, MAX_ZOOM, RASTER_TILE_SIZE } from '../constants';
import { PlacesContext } from '../contexts/PlacesContext';
import { usePlaceCategoriesMap } from '../hooks/usePlaceCategoriesMap';
import { BuildingScreen } from '../screens/BuildingScreen';
import { EventPlacesScreen } from '../screens/EventPlacesScreen';
import { FreeRoomsScreen } from '../screens/FreeRoomsScreen';
import { PlaceScreen } from '../screens/PlaceScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { createMapNavigator } from './MapNavigator';

export type ServiceStackParamList = {
  Places: undefined;
  MessagesModal: undefined;
};
const Stack = createNativeStackNavigator<ServiceStackParamList>();

export type PlacesStackParamList = {
  Places: {
    categoryId?: string;
    subCategoryId?: string;
    pitch?: number;
  };
  Place: {
    placeId: string;
    isCrossNavigation?: boolean;
    long?: string | null;
    lat?: string | null;
    name?: string;
  };
  EventPlaces: {
    placeIds: string[];
    eventName?: string;
    isCrossNavigation?: boolean;
  };
  Building: {
    siteId: string;
    buildingId: string;
  };
  PlaceCategories: undefined;
  MessagesModal: undefined;
  FreeRooms: undefined;
};

const Map = createMapNavigator();

const MapDefaultContent = () => {
  const theme = useTheme();
  const colorScheme = useMemo(() => (theme.dark ? 'dark' : 'light'), [theme]);
  const { floorId } = useContext(PlacesContext);
  const categories = usePlaceCategoriesMap();
  const images = useMemo<Record<string, ImageURISource>>(
    () =>
      categories
        ? Object.fromEntries(
            [
              ...new Set(
                Object.values(categories)
                  .map(c => c.markerUrl)
                  .filter(notNullish),
              ),
            ].map(uri => [uri, { uri }]),
          )
        : {},
    [categories],
  );

  return (
    <>
      <UserLocation />

      {/* Marker images */}
      <Images images={images}></Images>

      {/* Outdoor map */}
      <RasterSource
        key={`outdoorSource:${colorScheme}`}
        id="outdoorSource"
        tileUrlTemplates={[
          `https://app.didattica.polito.it/tiles/${colorScheme}/{z}/{x}/{y}.png`,
        ]}
        tileSize={RASTER_TILE_SIZE}
        maxZoomLevel={MAX_ZOOM}
      >
        <RasterLayer id="outdoor" aboveLayerID="background" style={null} />
      </RasterSource>

      {/* Indoor map */}
      <RasterSource
        key={`indoorSource:${colorScheme}:${floorId}`}
        id="indoorSource"
        tileUrlTemplates={[
          `https://app.didattica.polito.it/tiles/int-${colorScheme}-${floorId?.toLowerCase()}/{z}/{x}/{y}.png`,
        ]}
        tileSize={RASTER_TILE_SIZE}
        minZoomLevel={INTERIORS_MIN_ZOOM}
        maxZoomLevel={MAX_ZOOM}
      >
        <RasterLayer id="indoor" aboveLayerID="outdoor" style={null} />
      </RasterSource>
    </>
  );
};

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [floorId, setFloorId] = useState<string>();

  const checkAndSetFloorId = (id?: string) => {
    if (id) {
      setFloorId(id);
    }
  };
  useEffect(() => {
    const perm = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });
    if (perm) request(perm).catch(console.error);
  }, []);

  return (
   <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
    <Text style={{ textAlign: 'center' }}>Coming Soon...</Text>
  </View>
  );
};
