import path from 'path';
import fs from 'fs';
import { Response, Request, NextFunction } from 'express';
import { uploadFile } from '../../helpers';
import Hero from './heroes.model';
import cloudinary from 'cloudinary';
import { UploadedFile } from 'express-fileupload';

// Config Cloudinary
require('dotenv').config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function heroesList(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {

    const { limit = 10, skip = 0, orderBy = '_id', sort = 'asc' } = request.query;

    const [total, heroes] = await Promise.all([
      Hero.countDocuments(),
      Hero.find()
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ [orderBy as string]: (sort === 'asc') ? 1 : (sort === 'desc') ? -1 : 1 }),
    ]);

    return response.status(200).json({
      ok: true,
      heroes,
      total,
    });

  } catch (error) {
    next(error);
  }
}

export async function heroDetails(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {

    const id = request.params.id;
    const hero = await Hero.findOne({ _id: id });

    return response.status(200).json({
      ok: true,
      hero,
    });

  } catch (error) {
    next(error);
  }
}

export async function heroImage(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const hero = await Hero.findOne({ _id: request.params.id })
      .select('image -_id');

    if (hero?.image) {
      const imagePath = path.join(__dirname, '../../uploads/heroes', hero?.image);
      if (fs.existsSync(imagePath)) {
        return response.status(200).sendFile(imagePath);
      }
    }

    const imagePlaceHolder = path.join(__dirname, '../../assets/image-placeholder.jpg');
    return response.status(200).sendFile(imagePlaceHolder);
  } catch (error) {
    next(error);
  }
}

export async function create(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const uploadedImage = request.files?.image as UploadedFile;
  try {
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

    const hero = await Hero.create({
      ...request.body,
      image: cloudinaryResponse.secure_url,
    });

    return response.status(201).json({
      ok: true,
      hero,
    });

  } catch (error) {
    next(error);
  }
}

export async function update(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const id = request.params.id;
  const body = request.body;
  const uploadedImage = request.files?.image as UploadedFile;

  try {
    const updatedHero = await Hero.findOneAndUpdate({ _id: id }, { ...body }, { new: true });

    if (uploadedImage) {
      //* Delete previous image
      const publicId = updatedHero?.image.split('/').pop()?.split('.').shift();
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
      updatedHero!.image = cloudinaryResponse.secure_url;
      updatedHero?.save();
    }

    return response.status(200).json({
      ok: true,
      hero: updatedHero,
    });

  } catch (error) {
    next(error);
  }
}

export async function destroy(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;

    const hero = await Hero.findOneAndDelete({ _id: id });

    //* Delete previous image
    const publicId = hero?.image.split('/').pop()?.split('.').shift();
    await cloudinary.v2.uploader.destroy(`heroes/${publicId}`);

    return response.status(200).json({
      ok: true,
      msg: 'Hero has been deleted successfully',
    });

  } catch (error) {
    next(error);
  }
}
