import {describe, it, expect, beforeEach, vi} from 'vitest';
import * as duckRepository from './DuckRepository.js';

vi.mock('mongodb', () => {
  const mockToArray = vi.fn();
  const mockFind = vi.fn(() => ({toArray: mockToArray}));
  const mockCollection = vi.fn(() => ({find: mockFind}));
  const mockDb = vi.fn(() => ({collection: mockCollection}));

  global.__mocks = {
    mockToArray,
    mockFind,
    mockCollection,
    mockDb
  };

  return {
    MongoClient: {
      connect: vi.fn((url, callback) => {
        const clientMock = {
          db: mockDb
        };

        if (callback) {
          callback(null, clientMock);
        }
        return Promise.resolve(clientMock);
      })
    },
    ObjectId: vi.fn(id => ({
      toString: () => id ? id.toString() : 'mockObjectId'
    }))
  };
});

vi.mock('dotenv', () => {
  return {
    default: {
      config: vi.fn()
    },
    config: vi.fn()
  };
});

vi.mock('uuid', () => ({
  v4: vi.fn(() => uid1),
}));

const { mockCollection } = global.__mocks;

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
  it('does find three ducks', async () => {
    const ducks = [
      { uid: uid1, name: name1 },
      { uid: uid2, name: name2 },
      { uid: uid3, name: name3 }
    ];
    mockCollection.mockReturnValue({
      find: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue(ducks) })),
    });

    const result = await duckRepository.findAll();

    expect(result.length).toBe(3);
    expect(result).toEqual(ducks);
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().find).toHaveBeenCalledWith({});
  });

  it('throws error due to database failure', async () => {
    mockCollection.mockReturnValue({
      find: vi.fn(() => ({ toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      })),
    });

    await expect(duckRepository.findAll()).rejects.toThrow('Database error');
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().find).toHaveBeenCalledWith(
        {}
    );
  });
});

describe('testFindByUid', () => {
  it('does find duck by uid', async () => {
    const duck = { uid: uid1, name: name1 };
    mockCollection.mockReturnValue({
      findOne: vi.fn().mockResolvedValue(duck),
    });

    const result = await duckRepository.findByUid(uid1);

    expect(result).toEqual(duck);
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().findOne).toHaveBeenCalledWith(
        {_id: {toString: expect.any(Function)}}
    );
  });

  it('throws error due to database failure', async () => {
    mockCollection.mockReturnValue({
      findOne: vi.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(duckRepository.findByUid(uid1)).rejects.toThrow('Database error');
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().findOne).toHaveBeenCalledWith(
        {_id: {toString: expect.any(Function)}}
    );
  });
});

describe('testCreate', () => {
  it('does create duck', async () => {
    const duck = { name: name1 };
    const insertResult = { acknowledged: true, insertedId: uid1 };
    const createdDuck = { ...duck, _id: uid1 };
    mockCollection.mockReturnValue({
      insertOne: vi.fn().mockResolvedValue(insertResult),
      findOne: vi.fn().mockResolvedValue(createdDuck)
    });

    const result = await duckRepository.create(duck);

    expect(result).toEqual(createdDuck);
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().insertOne).toHaveBeenCalledWith({
      ...duck,
      _id: uid1,
    });
    expect(mockCollection().findOne).toHaveBeenCalledWith({ _id: uid1 });
  });

  it('throws error due to database failure', async () => {
    const duck = { name: name1 };
    mockCollection.mockReturnValue({
      insertOne: vi.fn().mockRejectedValue(new Error('Database error')),
      findOne: vi.fn().mockResolvedValue(null)

    });

    await expect(duckRepository.create(duck)).rejects.toThrow('Database error');
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().insertOne).toHaveBeenCalledWith({
      ...duck,
      _id: uid1,
    });
    expect(mockCollection().findOne).not.toBeCalled();
  });
});

describe('testUpdate', () => {
  it('does update duck', async () => {
    const mockUid = uid1;
    const duck = { uid: uid1, name: name1 };
    const updateResult = {
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1
    };

    mockCollection.mockReturnValue({
      updateOne: vi.fn().mockResolvedValue(updateResult)
    });

    const result = await duckRepository.update(uid1, duck);

    expect(result).toEqual(updateResult);
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().updateOne).toHaveBeenCalledWith(
        { _id: { toString: expect.any(Function) } },
        { $set: duck }
    );
  });

  it('throws due to database failure', async () => {
    const duck = { uid: uid1, name: name1 };
    mockCollection.mockReturnValue({
      updateOne: vi.fn().mockRejectedValue(new Error('Database error'))
    });

    await expect(duckRepository.update(uid1, duck)).rejects.toThrow('Database error');
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().updateOne).toHaveBeenCalledWith(
        { _id: { toString: expect.any(Function) } },
        { $set: duck }
    );
  });
});

describe('deleteByUid', () => {
  it('does delete duck', async () => {
    const deleteResult = {
      acknowledged: true,
      deletedCount: 1
    };
    mockCollection.mockReturnValue({
      deleteOne: vi.fn().mockResolvedValue(deleteResult)
    });

    const result = await duckRepository.deleteByUid(uid1);

    expect(result).toEqual(deleteResult);
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().deleteOne).toHaveBeenCalledWith(
        { _id: { toString: expect.any(Function) } }
    );
  });

  it('throws error due to database failure', async () => {
    mockCollection.mockReturnValue({
      deleteOne: vi.fn().mockRejectedValue(new Error('Database error'))
    });

    await expect(duckRepository.deleteByUid(uid1)).rejects.toThrow('Database error');
    expect(mockCollection).toHaveBeenCalledWith('duck');
    expect(mockCollection().deleteOne).toHaveBeenCalledWith(
        { _id: { toString: expect.any(Function) } }
    );
  });
});
