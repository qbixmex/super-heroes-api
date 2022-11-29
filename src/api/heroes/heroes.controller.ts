import { Response, Request, NextFunction } from 'express';

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
  next: NextFunction,
) {
  try {
    // Validation if user did not send any data
    if (Object.keys(request.body).length === 0) {
      return response.status(400).json({
        ok: false,
        message: 'Empty content!',
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

    const updatedHero = await Hero.findOneAndUpdate({ _id: id }, body, { new: true });

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
    await Hero.findOneAndDelete({ _id: id });
    return response.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}