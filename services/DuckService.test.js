import {test, expect, vi, beforeEach, describe} from "vitest";
import {findAll, findByUid, create, update, deleteByUid} from "./DuckService.js";
import * as duckRepository from "../repositories/DuckRepository.js";

vi.mock("../repositories/DuckRepository.js");

beforeEach(() => {
  vi.clearAllMocks();
});

const uid1 = '123e4567-e89b-12d3-a456-426614174000';
const name1 = 'Duey';
const uid2 = '123e4567-e89b-12d3-a456-426614174001';
const name2 = 'Huey';
const uid3 = '123e4567-e89b-12d3-a456-426614174002';
const name3 = 'Luey';

describe('testFindAll', () => {
  test('does find zero ducks', async () => {
    duckRepository.findAll.mockResolvedValue([]);

    const result = await findAll();

    expect(result).toEqual([]);
    expect(duckRepository.findAll).toBeCalled();
  });

  test('does find three ducks', async () => {
    const ducks = [
      {uid: uid1, name: name1},
      {uid: uid2, name: name2},
      {uid: uid3, name: name3},
    ];
    duckRepository.findAll.mockResolvedValue(ducks);

    const result = await findAll();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(result).toEqual(ducks);
    expect(duckRepository.findAll).toBeCalled();
  });
});

describe('testFindByUid', () => {
  test('does find duck with uid', async () => {
    const duck = {uid: uid1, name: name1};
    const req = {params: {uid: uid1}};
    duckRepository.findByUid.mockResolvedValue(duck);

    const result = await findByUid(req);

    expect(result).toEqual(duck);
    expect(duckRepository.findByUid).toBeCalledWith(uid1);
  });

  test('does not find duck with uid', async () => {
    const mockReq = {params: {uid: uid1}};

    duckRepository.findByUid.mockResolvedValue(null);

    await expect(findByUid(mockReq)).rejects.toThrow();
    expect(duckRepository.findByUid).toBeCalledWith(uid1);
  });

  test('throws error due to missing uid', async () => {
    const mockReq = {params: {}};

    await expect(findByUid(mockReq)).rejects.toThrow(JSON.stringify({status: 400, message: 'Missing uid parameter'}));
    expect(duckRepository.findByUid).not.toBeCalled();
  });
})

describe('testCreate', () => {
  test('does create duck', async () => {
    const duck = { name: name1 };
    const req = { body: duck };
    const createdDuck = { uid: uid1, name: name1 };

    duckRepository.create.mockResolvedValue(createdDuck);

    const result = await create(req);

    expect(result).toEqual(createdDuck);
    expect(duckRepository.create).toBeCalledWith(duck);
  });

  test('throws error due to missing body', async () => {
    const mockReq = { body: null };

    await expect(create(mockReq)).rejects.toThrow(JSON.stringify({ status: 400, message: 'Missing request body' }));
    expect(duckRepository.create).not.toBeCalled();
  });
});

describe('testUpdate', () => {
  test('does update duck', async () => {
    const duck = { name: name1 };
    const req = {
      params: { uid: uid1 },
      body: duck
    };
    const updatedDuck = { uid: uid1, name: name1 };

    duckRepository.update.mockResolvedValue(updatedDuck);

    const result = await update(req);

    expect(result).toEqual(updatedDuck);
    expect(duckRepository.update).toBeCalledWith(uid1, duck);
  });

  test('throws error due to missing uid', async () => {
    const req = {
      params: {},
      body: { name: name1 }
    };

    await expect(update(req)).rejects.toThrow(JSON.stringify({ status: 400, message: 'Missing uid parameter' }));
    expect(duckRepository.update).not.toBeCalled();
  });

  test('throws error due to missing body', async () => {
    const req = {
      params: { uid: uid1 },
      body: null
    };

    await expect(update(req)).rejects.toThrow(JSON.stringify({ status: 400, message: 'Missing request body' }));
    expect(duckRepository.update).not.toBeCalled();
  });
});

describe('testDeleteByUid', () => {
  test('does delete duck by uid', async () => {
    const req = { params: { uid: uid1 } };
    const deleteResult = { acknowledged: true, deletedCount: 1 };

    duckRepository.deleteByUid.mockResolvedValue(deleteResult);

    const result = await deleteByUid(req);

    expect(result).toEqual(deleteResult);
    expect(duckRepository.deleteByUid).toBeCalledWith(uid1);
  });

  test('throws error due to missing uid', async () => {
    const mockReq = { params: {} };

    await expect(deleteByUid(mockReq)).rejects.toThrow(JSON.stringify({ status: 400, message: 'Missing uid parameter' }));
    expect(duckRepository.deleteByUid).not.toBeCalled();
  });
});
