import { Lecture as ApiLecture } from '../../lib/api-client';

export interface Lecture extends ApiLecture {
  uniqueShortcode?: string;
}
