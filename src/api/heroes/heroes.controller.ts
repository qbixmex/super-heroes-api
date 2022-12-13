import path from 'path';
import fs from 'fs';
import { Response, Request, NextFunction } from 'express';
import { uploadFile } from '../../helpers';
import Hero from './heroes.model';

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

export async function create(
  request: Request,
  response: Response,
  next:NextFunction,
) {
  try {
    const imageName = await uploadFile(request.files, undefined, 'heroes');

    const hero = await Hero.create({
      ...request.body,
      image: imageName,
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
  try {
    const id = request.params.id;
    const body = request.body;

    const updatedHero = await Hero.findOneAndUpdate({ _id: id }, { ...body }, { new: true });

    if (request.files?.image) {
      //* Clean previous image
      if (updatedHero?.image) {
        const imagePath = path.join(__dirname, '../../uploads/heroes', updatedHero.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      const newImageName = await uploadFile(request.files, undefined, 'heroes');
      updatedHero!.image = newImageName;
      updatedHero?.save();
    }

    return response.status(200).json({ ok: true, hero: updatedHero });

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

    //* Clean previous image
    if (hero?.image) {
      const imagePath = path.join(__dirname, '../../uploads/heroes', hero.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return response.status(200).json({
      ok: true,
      msg: 'Hero has been deleted successfully',
    });

  } catch (error) {
    next(error);
  }
}
