import { Router } from 'express';
import logger from "../../core/logger";

const router = Router();

router.get('/', (req, res, next) => {
  res
    .status(200)
    .header('Content-Type', 'text/html')
    .send(`<h4>💊 RESTful API boilerplate</h4>`);
    logger.info("Yeah it running")
});

export default router;
