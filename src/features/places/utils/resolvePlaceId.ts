import { PlaceRef } from '../../../lib/api-client';

export const resolvePlaceId = (place: PlaceRef) =>
  [place.buildingId, place.floorId, place.roomId].join('-');
