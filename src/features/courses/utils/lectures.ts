import { VideoLecture } from '../../../../src/lib/api-client';
import { instanceOfVideoLecture } from '../../../../src/lib/api-client';

import {
  instanceOfVirtualClassroomLive,
} from '../../../../src/lib/api-client';

export const isLiveVC = (l: object): l is VirtualClassroomLive =>
  instanceOfVirtualClassroomLive(l);

export const isRecordedVC = (l: object): l is VirtualClassroom =>
  instanceOfVirtualClassroom(l);

export const isVideoLecture = (l: object): l is VideoLecture =>
  instanceOfVideoLecture(l);
