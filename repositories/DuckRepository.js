import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const mongoClient = MongoClient;
const mongoUrl = "mongodb://localhost:27017";

let db;

async function initializeDb() {
  try {
    const client = await mongoClient.connect(mongoUrl);
    db = client.db('pikecape');
    console.log('Connected to MongoDB for DuckRepository');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw new Error('Database initialization failed');
  }
}

initializeDb();

async function findAll() {
  try {
    return await db.collection('duck').find({}).toArray();
  } catch (err) {
    throw new Error(JSON.stringify({ status: 500, message: `Failed to fetch entities; ${err}` }));
  }
}

async function findByUid(uid) {
  try {
    const objectId = new ObjectId(uid);
    return await db.collection('duck').findOne({ _id: objectId });
  } catch (err) {
    throw new Error(JSON.stringify({ status: 500, message: `Failed to fetch entity; ${err}` }));
  }
}

async function create(duck) {
  try {
    const newDuck = { ...duck, _id: uuidv4() };
    const result = await db.collection('duck').insertOne(newDuck);
    if (result.acknowledged) {
      return await db.collection('duck').findOne({ _id: newDuck._id });
    } else {
      throw new Error(JSON.stringify({ status: 500, message: 'Failed to create entity; operation not acknowledged' }));
    }
  } catch (err) {
    throw new Error(JSON.stringify({ status: 500, message: `Failed to create entity; ${err}` }));
  }
}

async function update(uid, duckData) {
  try {
    const objectId = new ObjectId(uid);
    const result = await db.collection('duck').updateOne(
        { _id: objectId },
        { $set: duckData }
    );
    return result;
  } catch (err) {
    throw new Error(JSON.stringify({ status: 500, message: `Failed to update entity; ${err}` }));
  }
}

async function deleteByUid(uid) {
  try {
    const objectId = new ObjectId(uid);
    const result = await db.collection('duck').deleteOne({ _id: objectId });
    return result;
  } catch (err) {
    throw new Error(JSON.stringify({ status: 500, message: `Failed to delete entity; ${err}` }));
  }
}

// Export the repository functions
module.exports = { findAll, findByUid, create, update, deleteByUid };
