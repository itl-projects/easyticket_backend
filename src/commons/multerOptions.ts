import { diskStorage } from 'multer';

export const profileImageStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload/profile-images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '.' +
      file.originalname.split('.')[1];
    const fileName = req.user['userId'] + '.' + file.originalname.split('.')[1];
    cb(null, fileName || file.fieldname + '-' + uniqueSuffix);
  },
});
