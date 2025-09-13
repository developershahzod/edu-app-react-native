import { useQuery } from '@tanstack/react-query';
import { LecturesApi, Lecture, ApiResponse } from '../../lib/api-client';

const useLecturesClient = (): LecturesApi => {
  return new LecturesApi();
};

export const useGetLectures = (params?: { courseId?: string; fromDate?: string; toDate?: string }) => {
  const lecturesClient = useLecturesClient();

  return useQuery<ApiResponse<Lecture[]>>({
    queryKey: ['lectures', params],
    queryFn: () => lecturesClient.getLectures(params),
  });
};

export const useGetLecture = (lectureId: number) => {
  const lecturesClient = useLecturesClient();

  return useQuery<ApiResponse<Lecture>>({
    queryKey: ['lecture', lectureId],
    queryFn: () => lecturesClient.getLecture({ lectureId }),
    enabled: !!lectureId,
  });
};