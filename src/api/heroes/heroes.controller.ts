import { Response, Request, NextFunction } from 'express';

export async function heroes(
  _: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    return response.status(200).json([
      {
        id: 123,
        heroName: 'Spiderman',
        realName: 'Peter Parker',
        studio: 'Marvel',
      },
      {
        id: 456,
        heroName: 'Ironman',
        realName: 'Tony Stark',
        studio: 'Marvel',
      },
      {
        id: 789,
        heroName: 'Captain America',
        realName: 'Steve Rogers',
        studio: 'Marvel',
      },
    ]);
  } catch (error) {
    next(error);
  }
}

export async function hero(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;
    return response.status(200).json({
      id: Number(id),
      heroName: 'Spiderman',
      realName: 'Peter Parker',
      studio: 'Marvel',
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
    return response.status(200).json();
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
    return response.status(200).json({
      id: Number(id),
      heroName: 'Spiderman',
      realName: 'Peter Parker',
      studio: 'Marvel',
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
    return response.status(200).json();
  } catch (error) {
    next(error);
  }
}