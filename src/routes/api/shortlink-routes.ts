import express from 'express';
import { ensureAuth } from '../../middleware/auth.js';
import {
            createOneLink,
            getAllLinks, 
            getOneLink, 
            updateLink, 
            removeLink, 
            createBulkLinks
      } from '../../controllers/shortlink-controller.js';

const router = express.Router();
router.use(ensureAuth);

router.route('/')
      .post(createOneLink)
      .get(getAllLinks);

      
router.route('/:shortID')
      .get(getOneLink)
      .patch(updateLink)
      .delete(removeLink);
      
router.post('/bulk', createBulkLinks);
// router.get('/:shortID/qrcode');


// router.post('/', createLink);
// router.get('/');
// router.post('/bulk');
// router.get('/:shortID');
// router.delete('/:shortID');
// router.patch('/:shortID');
// router.get('/:shortID/qrcode');

export default router;