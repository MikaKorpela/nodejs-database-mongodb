import express from 'express';
import duckService from '../services/DuckService';

const router = express.Router();

// router.get('/', async(req, res) => {
//   duckService.findAll()
//   .then(result => res.json(result))
//   .catch(err => {
//     const error = getError(err)
//     res.status(error.status).json(error.message);
//   });
// });

router.get('/', async (req, res) => {
  try {
    const result = await duckService.findAll();
    res.json(result);
  } catch (err) {
    const error = getError(err);
    res.status(error.status).json(error.message);
  }
});

router.get('/:uid', async(req, res) => {
  try {
    const result = await duckService.findByUid(req);
    res.json(result);
  } catch (err) {
    const error = getError(err);
    res.status(error.status).json(error.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await duckService.create(req, res);
    res.status(201).json(result);
  } catch (err) {
    const error = getError(err);
    res.status(error.status).json(error.message);
  }
})

router.put('/:uid', async (req, res) => {
  try {
    const result = await duckService.update(req, res);
    res.json(result);
  } catch (err) {
    const error = getError(err);
    res.status(error.status).json(error.message);
  }
})

router.delete('/:uid', async (req, res) => {
  try {
    const result = await duckService.deleteByUid(req, res);
    res.status(204).json(result);
  } catch (err) {
    const error = getError(err);
    res.status(error.status).json(error.message);
  }
})

function getError(err) {
  try {
    if (err?.message) {
      return JSON.parse(err.message);
    }
  } catch (parseError) {
    console.error('Failed to parse error message:', parseError);
    throw new Error(JSON.stringify({ status: 500, message: 'Error parsing error message' }));
  }

  return {status: 500, message: 'Internal server error'};
}

module.exports = {
  router,
  getError
};
