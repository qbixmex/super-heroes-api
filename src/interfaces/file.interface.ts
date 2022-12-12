import fileUpload from 'express-fileupload';

interface DataUpload {
  type: string;
  data: []
}

export interface FileUpload {
  name: string;
  data: DataUpload;
  size: number;
  encoding: string;
  tempFilePath: string;
  truncated: boolean;
  mimetype: string;
  md5: string;
}
