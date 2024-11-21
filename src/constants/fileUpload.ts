import { FileUploadProps } from '@cloudscape-design/components';

export const fileUploadI18n: FileUploadProps['i18nStrings'] = {
  uploadButtonText: (e) => (e ? 'Choose files' : 'Choose file'),
  dropzoneText: (e) => (e ? 'Drop files to upload' : 'Drop file to upload'),
  removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
  limitShowFewer: 'Show fewer files',
  limitShowMore: 'Show more files',
};

export const commonFileUploadProps: Pick<
  FileUploadProps,
  'i18nStrings' | 'showFileLastModified' | 'showFileSize' | 'showFileThumbnail'
> = {
  i18nStrings: fileUploadI18n,
  showFileLastModified: true,
  showFileSize: true,
  showFileThumbnail: true,
};
