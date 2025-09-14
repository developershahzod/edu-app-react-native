import { CourseFileOverview } from '../../lib/api-client';
import type { CourseDirectory } from '../../lib/api-client/CourseDirectory';

export type CourseFileOverviewWithLocation = CourseFileOverview & {
  location: string;
};

export type CourseDirectoryContentWithLocations =
  | ({ type: 'directory' } & CourseDirectory & {
        files: CourseDirectoryContentWithLocations[];
      })
  | ({ type: 'file' } & CourseFileOverviewWithLocation);
