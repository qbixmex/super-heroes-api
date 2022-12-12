import path from 'path';
import fileUpload from 'express-fileupload';
import { v4 } from 'uuid';

const sanitizeImageName = (imageName: string) => {
  return imageName.replaceAll(' ', '-').toLowerCase();
};

export const uploadFile = (
  files: fileUpload.FileArray | null | undefined,
  validExtensions: string[] = ['png', 'jpg', 'jpeg', 'jpg', 'gif', 'webp'],
  folder = '',
): Promise<string> => {
  return new Promise((resolve, reject) => {
    //* Getting Image File
    const image = files?.image as fileUpload.UploadedFile;

    //* Getting File Extension
    const splittedName = image.name.split('.');
    const extension = splittedName[splittedName.length - 1];

    //* Validate Extension
    if (!validExtensions.includes(extension)) {
      return reject(`Extension ".${extension}" is not allowed!`);
    }
    const imageName = sanitizeImageName(image.name);
    const imageNamePrefixed = `${v4().substring(0, 9)}${imageName}`;
    const uploadPath = path.join(__dirname, '../uploads/', folder, imageNamePrefixed);

    image.mv(uploadPath, (error) => {
      return (error) ? reject(error) : resolve(imageNamePrefixed);
    });
  });
};
