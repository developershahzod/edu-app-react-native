import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  Modal 
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { List } from '@lib/ui/components/List';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { CourseAssignmentListItem } from '../components/CourseAssignmentListItem';
import { useCourseContext } from '../contexts/CourseContext';
import { CourseTabsParamList } from '../navigation/CourseNavigator';
import { useApiContext } from '~/core/contexts/ApiContext';

type Props = MaterialTopTabScreenProps<
  CourseTabsParamList,
  'CourseAssignmentsScreen'
>;

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface SubmissionData {
  content: string;
  files: SelectedFile[];
}

interface AssignmentSubmission {
  content: string;
  file_url: string;
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  student: {
    login: string;
    email: string;
    phone_number: string;
    role_type: string;
    name: string;
    surname: string;
    id: string;
    is_active: boolean;
  };
}

export const CourseAssignmentsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const courseId = useCourseContext();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const { accessibilityListLabel } = useAccessibility();
  const isDisabled = useOfflineDisabled();
  const isCacheMissing = useOfflineDisabled(
    () => assignmentsQuery.data === undefined,
  );
  const queryClient = useQueryClient();
  const { token } = useApiContext();

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isPickingFiles, setIsPickingFiles] = useState(false);

  // Query to check existing submission
  const submissionQuery = useQuery({
    queryKey: ['assignmentSubmission', selectedAssignmentId],
    queryFn: async (): Promise<AssignmentSubmission | null> => {
      if (!selectedAssignmentId) return null;
      
      const response = await fetch(
        `https://edu-api.qalb.uz/api/v1/assignments/${selectedAssignmentId}/my-submission`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        return null; // No submission found
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!selectedAssignmentId && showUploadModal,
    staleTime: 0, // Always refetch to get latest data
  });

  // Delete submission mutation
  const deleteSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await fetch(
        `https://edu-api.qalb.uz/api/v1/submissions/${submissionId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments', courseId] });
      queryClient.invalidateQueries({ queryKey: ['assignmentSubmission', selectedAssignmentId] });
      
      Alert.alert(
        'Success',
        'Submission deleted successfully!',
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      console.error('Delete error:', error);
      Alert.alert(
        'Error',
        `Failed to delete submission: ${error.message}`,
        [{ text: 'OK' }]
      );
    },
  });

  // API submission mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async (data: SubmissionData & { assignmentId: string }) => {
      const formData = new FormData();
      
      formData.append('content', data.content);
      
      data.files.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await fetch(
        `https://edu-api.qalb.uz/api/v1/assignments/${data.assignmentId}/submissions/with-files`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments', courseId] });
      queryClient.invalidateQueries({ queryKey: ['assignmentSubmission', selectedAssignmentId] });
      
      Alert.alert(
        'Success',
        'Assignment submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowUploadModal(false);
              resetUploadForm();
            },
          },
        ]
      );
    },
    onError: (error) => {
      console.error('Submission error:', error);
      Alert.alert(
        'Error',
        `Failed to submit assignment: ${error.message}`,
        [{ text: 'OK' }]
      );
    },
  });

  const resetUploadForm = () => {
    setContent('');
    setSelectedFiles([]);
    setSelectedAssignmentId(null);
  };

  const openUploadModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    resetUploadForm();
  };

  const pickFiles = async () => {
    try {
      setIsPickingFiles(true);
      const results = await pick({
        type: [
          types.pdf,
          types.images,
          types.video,
          types.zip,
          types.doc,
          types.docx,
          types.xlsx,
          types.xls,
        ],
        allowMultiSelection: false,
      });

      const result = results[0];
      if (!result.name || !result.size || !result.type) return;
      
      // Check file size (32MB limit)
      if (result.size > 32 * 1000000) {
        Alert.alert(
          'File Size Error',
          'File size exceeds 32MB limit. Please select a smaller file.'
        );
        return;
      }

      const newFile = {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
      };

      setSelectedFiles(prev => [...prev, newFile]);
    } catch (error: any) {
      console.error('File picker error:', error);
      Alert.alert(
        'File Selection Error',
        `Could not select files: ${error.message}`
      );
    } finally {
      setIsPickingFiles(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedAssignmentId) {
      Alert.alert('Error', 'Assignment ID is missing. Please try again.');
      return;
    }

    if (!content.trim() && selectedFiles.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please provide either content or attach files.'
      );
      return;
    }

    // Check if this is a resubmission
    const existingSubmission = submissionQuery.data;
    if (existingSubmission) {
      Alert.alert(
        'Resubmission Confirmation',
        'You have already submitted this assignment. Do you want to resubmit?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resubmit',
            style: 'destructive',
            onPress: () => {
              submitAssignmentMutation.mutate({
                assignmentId: selectedAssignmentId,
                content: content.trim(),
                files: selectedFiles,
              });
            },
          },
        ]
      );
    } else {
      submitAssignmentMutation.mutate({
        assignmentId: selectedAssignmentId,
        content: content.trim(),
        files: selectedFiles,
      });
    }
  };

  const handleDeleteSubmission = () => {
    const existingSubmission = submissionQuery.data;
    if (!existingSubmission) return;

    Alert.alert(
      'Delete Submission',
      'Are you sure you want to delete this submission? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSubmissionMutation.mutate(existingSubmission.id);
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  const isSubmitting = submitAssignmentMutation.isPending || submitAssignmentMutation.isLoading;
  const isDeleting = deleteSubmissionMutation.isPending || deleteSubmissionMutation.isLoading;
  const isLoadingSubmission = submissionQuery.isLoading;
  const existingSubmission = submissionQuery.data;

  const currentAssignment = assignmentsQuery.data?.find(
    assignment => assignment.id === selectedAssignmentId
  );

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl manual queries={[assignmentsQuery]} />}
      >
        <SafeAreaView>
          {!assignmentsQuery.isLoading &&
            assignmentsQuery.data &&
            (assignmentsQuery.data.length > 0 ? (
              <List indented>
                {assignmentsQuery.data.map((assignment, index) => (
                  <CourseAssignmentListItem
                    key={assignment.id}
                    item={assignment}
                    accessibilityListLabel={accessibilityListLabel(
                      index,
                      assignmentsQuery.data.length,
                    )}
                    disabled={isDisabled}
                    onPress={() => openUploadModal(assignment.id)}
                  />
                ))}
              </List>
            ) : (
              <OverviewList
                emptyStateText={t('courseAssignmentsTab.emptyState')}
              />
            ))}
          {isCacheMissing && (
            <OverviewList emptyStateText={t('common.cacheMiss')} />
          )}
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeUploadModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeUploadModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Assignment
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Loading state */}
            {isLoadingSubmission && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                  Loading assignment details...
                </Text>
              </View>
            )}

            {!isLoadingSubmission && (
              <>
                {/* Assignment Details Section */}
                <View style={styles.detailsSection}>
                  <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeaderTitle}>ASSIGNMENT DETAILS</Text>
                  </View>
                  
                  <View style={styles.assignmentDetailsContainer}>
                    <Text style={styles.assignmentTitle}>
                      {currentAssignment?.title || 'Assignment'}
                    </Text>
                    <Text style={styles.assignmentDescription}>
                      {currentAssignment?.description || 'No description available'}
                    </Text>
                    
                    {currentAssignment?.due_date && (
                      <View style={styles.dueDateContainer}>
                        <Text style={styles.dueDateText}>
                          Due: {formatDate(currentAssignment.due_date)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Existing Submission Section */}
                {existingSubmission ? (
                  <View style={styles.submissionSection}>
                    <View style={styles.sectionHeaderContainer}>
                      <Text style={styles.sectionHeaderTitle}>YOUR SUBMISSION</Text>
                    </View>

                    {/* Attached Files */}
                    {existingSubmission.file_url && (
                      <View style={styles.attachedFilesContainer}>
                        <Text style={styles.attachedFilesTitle}>Attached Files:</Text>
                        <View style={styles.fileItemSubmitted}>
                          <View style={styles.fileInfoSubmitted}>
                            <Text style={styles.fileNameSubmitted}>
                              {getFileNameFromUrl(existingSubmission.file_url)}
                            </Text>
                            <Text style={styles.fileUploadDate}>
                              Uploaded: {formatDate(existingSubmission.submitted_at)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Submission Table */}
                    <View style={styles.submissionTable}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>DESCRIPTION</Text>
                        <Text style={[styles.tableHeaderText, styles.dateColumn]}>DATE</Text>
                        <Text style={[styles.tableHeaderText, styles.statusColumn]}>STATUS</Text>
                        <Text style={[styles.tableHeaderText, styles.actionsColumn]}>ACTIONS</Text>
                      </View>
                      
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCellText, styles.descriptionColumn]}>
                          {existingSubmission.content || 'No description'}
                        </Text>
                        <Text style={[styles.tableCellText, styles.dateColumn]}>
                          {formatDate(existingSubmission.submitted_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* Upload Form - Only show when no existing submission */
                  <>
                    {/* Content Input Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Assignment Content
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        multiline
                        numberOfLines={6}
                        placeholder="Enter your assignment text here..."
                        value={content}
                        onChangeText={setContent}
                        editable={!isSubmitting}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* File Upload Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Attachments
                      </Text>
                      
                      <TouchableOpacity
                        style={[
                          styles.filePickerButton, 
                          isPickingFiles && styles.filePickerButtonDisabled
                        ]}
                        onPress={pickFiles}
                        disabled={isPickingFiles || isSubmitting}
                      >
                        {isPickingFiles ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <Text style={styles.filePickerButtonText}>
                            Select Files
                          </Text>
                        )}
                      </TouchableOpacity>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <View style={styles.filesList}>
                          {selectedFiles.map((file, index) => (
                            <View key={index} style={styles.fileItem}>
                              <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                  {file.name}
                                </Text>
                                <Text style={styles.fileSize}>
                                  {formatFileSize(file.size)}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeFile(index)}
                                disabled={isSubmitting}
                              >
                                <Text style={styles.removeButtonText}>×</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Submission Status */}
                    {isSubmitting && (
                      <View style={styles.statusContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.statusText}>Submitting...</Text>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>

          {/* Submit Button - Only show when no existing submission */}
          {!isLoadingSubmission && !existingSubmission && (
            <View style={styles.modalFooter}>
              <CtaButton
                title="Submit Assignment"
                action={handleSubmit}
                disabled={
                  isDisabled || 
                  isSubmitting || 
                  (!content.trim() && selectedFiles.length === 0)
                }
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

// Fallback auth token function
const getAuthToken = (): string => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTgxMTM3NTAsInN1YiI6ImY2MjJmOGFiLTc1YWEtNGNmOS1hZmFlLWQzYjUzZjEzNWE3YSIsInR5cGUiOiJhY2Nlc3MifQ.gtf1DDU6Weceer8AxEcjGTtp9YQk_omhXWlYMCRsCJw';
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  detailsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#856404',
  },
  assignmentDetailsContainer: {
    padding: 16,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666666',
  },
  submissionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  attachedFilesContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attachedFilesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  fileItemSubmitted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileInfoSubmitted: {
    flex: 1,
  },
  fileNameSubmitted: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  fileUploadDate: {
    fontSize: 14,
    color: '#666666',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadIcon: {
    color: '#ffffff',
    fontSize: 16,
  },
  submissionTable: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    marginBottom: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  descriptionColumn: {
    flex: 2,
    marginRight: 12,
  },
  dateColumn: {
    flex: 1.5,
    marginRight: 12,
  },
  statusColumn: {
    flex: 1,
    marginRight: 12,
  },
  actionsColumn: {
    width: 40,
    alignItems: 'center',
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeTextSmall: {
    fontSize: 11,
    fontWeight: '500',
    color: '#856404',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#ffffff',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 120,
  },
  filePickerButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  filePickerButtonDisabled: {
    opacity: 0.6,
  },
  filePickerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  filesList: {
    marginTop: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 14,
    color: '#666666',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginTop: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976d2',
  },
});