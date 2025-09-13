import { VideoLecture } from '../../../../src/lib/api-client';
import { GetCourseVirtualClassrooms200ResponseDataInner } from '../../../../src/lib/api-client/GetCourseVirtualClassrooms200ResponseDataInner';

export type CourseLecture =
  | GetCourseVirtualClassrooms200ResponseDataInner
  | VideoLecture;

interface BaseLectureTypeSection {
  courseId: number;
  title: string;
  type: 'VirtualClassroom' | 'VideoLecture';
  data: CourseLecture[];
  isExpanded?: boolean;
}

interface VCSection extends BaseLectureTypeSection {
  data: GetCourseVirtualClassrooms200ResponseDataInner[];
  type: 'VirtualClassroom';
}

interface VideoLectureSection extends BaseLectureTypeSection {
  data: VideoLecture[];
  type: 'VideoLecture';
}

export type CourseLectureSection = VCSection | VideoLectureSection;
