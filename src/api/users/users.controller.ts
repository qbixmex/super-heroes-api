import { Response, Request, NextFunction } from 'express';
import User from './users.model';
import { encryptPassword } from '../../helpers/encryptPassword';
import cloudinary from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { IUser } from '../../interfaces/user.interface';

// Config Cloudinary
require('dotenv').config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function usersList(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { limit = 10, skip = 0, orderBy = '_id', sort = 'asc' } = request.query;
    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find()
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ [orderBy as string]: (sort === 'asc') ? 1 : (sort === 'desc') ? -1 : 1 })
        .select('-password'),
    ]);

    return response.status(200).json({
      ok: true,
      users,
      total,
    });
  } catch (error) {
    next(error);
  }
}

export async function userProfile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;
    const user = await User.findOne({ _id: id }).select('-password');

    return response.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const uploadedImage = request.files?.image as UploadedFile;
  try {
    const body = request.body;

    //* Upload new image
    const cloudinaryResponse = await cloudinary.v2
      .uploader.upload(
        uploadedImage.tempFilePath,
        { upload_preset: 'heroesusers' },
        //? For debugging
        // (error, result) => {
        //   console.log(result, error);
        // },
      );

    //* Encrypt Password
    const encryptedPassword = encryptPassword(request.body.password, 10);

    const user = await User.create({
      ...body,
      image: cloudinaryResponse.secure_url,
      password: encryptedPassword,
    });

    return response.status(201).json({
      ok: true,
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;
    const body = request.body;
    const uploadedImage = request.files?.image as UploadedFile;

    const user = await User.findOneAndUpdate(
      { _id: id },
      { ...body },
      { new: true },
    );

    if (uploadedImage) {
      //* Delete previous image
      const publicId = user?.image.split('/').pop()?.split('.').shift();
      await cloudinary.v2.uploader.destroy(`heroes/${publicId}`);

      //* Upload new image
      const cloudinaryResponse = await cloudinary.v2
        .uploader.upload(
          uploadedImage.tempFilePath,
          { upload_preset: 'heroes' },
          //? For debugging
          // (error, result) => {
          //   console.log(result, error);
          // },
        );

      //* Save image secure url to hero image database
      user!.image = cloudinaryResponse.secure_url;
    }

    //* If password should be changed
    if (body.password) {
      user!.password = encryptPassword(body.password, 10);     
    }

    //* Save to database if image or password is set
    user?.save();

    return response.status(200).json({
      ok: true,
      user: {
        _id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        image: user?.image,
        role: user?.role,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;

    const user = await User.findOneAndDelete({ _id: id });

    //* Delete previous image
    const publicId = user?.image.split('/').pop()?.split('.').shift();
    await cloudinary.v2.uploader.destroy(`heroes/${publicId}`);

    return response.status(200).json({ ok: true, msg: 'User was deleted successfully' });
  } catch (error) {
    next(error);
  }
}
