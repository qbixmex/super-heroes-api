import { Response, Request, NextFunction } from 'express';
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
  next: NextFunction,
) {
  try {
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

    const updatedHero = await Hero.findOneAndUpdate(
      { _id: id },
      request.body,
      { new: true },
    );

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