import * as duckRepository from "../repositories/DuckRepository.js";

async function findAll() {
  const result = await duckRepository.findAll();
  console.log(result);
  return result
}

async function findByUid(req) {
  const uid = getUid(req);

  const result = await duckRepository.findByUid(uid);

  if (!result) {
    throw new Error(JSON.stringify({ status: 404, message: 'Entity not found' }));
  }

  return result;
}

async function create(req) {
  const duck = getBody(req);

  return await duckRepository.create(duck);
}

async function update(req) {
  const uid = getUid(req);
  const duck = getBody(req)

  return await duckRepository.update(uid, duck);
}

async function deleteByUid(req) {
  const uid = getUid(req)

  return await duckRepository.deleteByUid(uid);
}

function getUid(req) {
  const { uid } = req.params;

  if (!uid) {
    throw new Error(JSON.stringify({ status: 400, message: 'Missing uid parameter' }));
  }

  return uid;
}

function getBody(req) {
  const duck = req.body;

  if (!duck) {
    throw new Error(JSON.stringify({ status: 400, message: 'Missing request body' }));
  }

  return duck;
}

module.exports = { findAll, findByUid, create, update, deleteByUid };
