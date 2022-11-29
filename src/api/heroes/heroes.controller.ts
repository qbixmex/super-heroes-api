import { Response, Request, NextFunction } from 'express';
import mongoose from 'mongoose';

import Hero from './heroes.model';

export async function heroesList(
  _: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const heroes = await Hero.find();
    return response.status(200).json({
      ok: true,
      heroes,
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

    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      return response.status(400).json({
        ok: false,
        message: `ID: "${id}" is not a valid MongoID`,
      });
    }

    const hero = await Hero.findOne({ _id: id });

    if (!hero) {
      return response.status(404).json({
        ok: false,
        message: `Hero with "${id}" does not exist!`,
      });
    }

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
  next: NextFunction,
) {
  try {
    // Validation if user did not send any data
    if (Object.keys(request.body).length === 0) {
      return response.status(400).json({
        ok: false,
        message: 'Body cannot be empty!',
      });
    }

    const hero = await Hero.create(request.body);

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

    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      return response.status(400).json({
        ok: false,
        message: `ID: "${id}" is not a valid MongoID`,
      });
    }    

    // Validation if user did not send any data
    if (Object.keys(body).length === 0) {
      return response.status(400).json({
        ok: false,
        message: 'Body cannot be empty!',
      });
    }

    const updatedHero = await Hero.findOneAndUpdate({ _id: id }, body, { new: true });

    if (!updatedHero) {
      return response.status(404).json({
        ok: false,
        message: `Hero with "${id}" does not exist!`,
      });
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

    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      return response.status(400).json({
        ok: false,
        message: `ID: "${id}" is not a valid MongoID`,
      });
    }

    await Hero.findOneAndDelete({ _id: id });
    return response.status(200).json({ ok: true });

  } catch (error) {
    next(error);
  }
}