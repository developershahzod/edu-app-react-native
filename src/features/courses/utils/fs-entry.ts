import {
  CourseDirectory,
  CourseDirectoryContentInner,
} from '../../../lib/api-client';

export const isDirectory = (
  obj: CourseDirectoryContentInner,
): obj is { type: 'directory' } & CourseDirectory => obj.type === 'directory';
