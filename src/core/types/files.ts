import { CourseFileOverview } from '../../../../src/lib/api-client';
import type { CourseDirectory } from '../../../../src/lib/api-client/CourseDirectory';

export type CourseFileOverviewWithLocation = CourseFileOverview & {
  location: string;
};

export type CourseDirectoryContentWithLocations =
  | ({ type: 'directory' } & CourseDirectory & {
        files: CourseDirectoryContentWithLocations[];
      })
  | ({ type: 'file' } & CourseFileOverviewWithLocation);
