import express from 'express';
import {createLink, getAllLinks, getOneLink, updateLink, removeLink} from '../../controllers/shortlink-controller.js';

const router = express.Router();

router.route('/')
      .post(createLink)
      .get(getAllLinks);

router.post('/bulk');

router.route('/:shortID')
      .get(getOneLink)
      .patch(updateLink)
      .delete(removeLink);

router.get('/:shortID/qrcode');


// router.post('/', createLink);
// router.get('/');
// router.post('/bulk');
// router.get('/:shortID');
// router.delete('/:shortID');
// router.patch('/:shortID');
// router.get('/:shortID/qrcode');

export default router;