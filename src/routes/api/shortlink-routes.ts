import express from 'express';
import {createLink, getAllShortLinks, getOneShortLink, removeShortLink} from '../../controllers/shortlink-controller.js';

const router = express.Router();

router.route('/')
      .post(createLink)
      .get(getAllShortLinks);

router.post('/bulk');

router.route('/:shortID')
      .get(getOneShortLink)
      .delete(removeShortLink)
      .patch();

router.get('/:shortID/qrcode');


// router.post('/', createLink);
// router.get('/');
// router.post('/bulk');
// router.get('/:shortID');
// router.delete('/:shortID');
// router.patch('/:shortID');
// router.get('/:shortID/qrcode');

export default router;