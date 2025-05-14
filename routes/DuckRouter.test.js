import { describe, test, expect, vi, beforeEach } from 'vitest';
import { router, getError } from './DuckRouter.js';
import duckService from '../services/DuckService.js';

vi.mock('../services/DuckService.js');

let req, res;

beforeEach(() => {
  req = {
    params: { uid: uid1 }
  };
  res = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis()
  };
  vi.clearAllMocks();
});

const uid1 = '123e4567-e89b-12d3-a456-426614174000';
const name1 = 'Duey';
const uid2 = '123e4567-e89b-12d3-a456-426614174001';
const name2 = 'Huey';
const uid3 = '123e4567-e89b-12d3-a456-426614174002';
const name3 = 'Luey';

describe('testFindAll', () => {
  test('does find three ducks', async () => {
    const ducks = [
      { uid: uid1, name: name1 },
      { uid: uid2, name: name2 },
      { uid: uid3, name: name3 }
    ];
    duckService.findAll.mockResolvedValue(ducks);

    await router.stack.find(layer => layer.route?.path === '/').route.stack[0].handle(req, res);

    expect(duckService.findAll).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(ducks);
    expect(res.status).not.toBeCalled();
  });

  test('throws exception due to service error', async () => {
    const errorStatus = 500;
    const errorMessage = 'Database error';
    const error = new Error(JSON.stringify({ status: errorStatus, message: errorMessage }));
    duckService.findAll.mockRejectedValue(error);

    await router.stack.find(layer => layer.route?.path === '/').route.stack[0].handle(req, res);

    expect(duckService.findAll).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(errorStatus);
    expect(res.json).toBeCalledWith(errorMessage);
  });
});

describe('testFindByUid', () => {
  test('does find duck by uid', async () => {
    const duck = { uid: uid1, name: name1 };
    duckService.findByUid.mockResolvedValue(duck);

    await router.stack.find(layer => layer.route?.path === '/:uid').route.stack[0].handle(req, res);

    expect(duckService.findByUid).toBeCalledTimes(1);
    expect(duckService.findByUid).toBeCalledWith(req);
    expect(res.json).toBeCalledWith(duck);
    expect(res.status).not.toBeCalled();
  });

  test('throws exception when duck not found', async () => {
    const errorStatus = 404;
    const errorMessage = 'Duck not found';
    const error = new Error(JSON.stringify({ status: errorStatus, message: errorMessage }));
    duckService.findByUid.mockRejectedValue(error);

    await router.stack.find(layer => layer.route?.path === '/:uid').route.stack[0].handle(req, res);

    expect(duckService.findByUid).toBeCalledTimes(1);
    expect(duckService.findByUid).toBeCalledWith(req);
    expect(res.status).toBeCalledWith(errorStatus);
    expect(res.json).toBeCalledWith(errorMessage);
  });
});

describe('testGetError()', () => {
  test('gets error code and error message', () => {
    const status = 500;
    const message = 'Internal server error';
    const input = new Error(JSON.stringify({status: status, message: message}));

    const result = getError(input);

    expect(result.status).toBe(status);
    expect(result.message).toBe(message);
  })

  test('does not throw exception with correct input', () => {
    const status = 500;
    const message = 'Internal server error';
    const input = new Error(JSON.stringify({status: status, message: message}));

    const resultFunction = () => {
      getError(input);
    }

    expect(resultFunction).not.toThrow();
  })

  test('does throw exception with incorrect input', () => {
    const input = new Error('{ invalid json }');

    const resultFunction = () => {
      getError(input);
    }

    expect(resultFunction).toThrow();
  })
});
