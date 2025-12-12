import express, { Express } from "express";

import bodyParser from "body-parser";
import cors from "cors";
import helmet from 'helmet';

// import { ImagesController } from "@http/controllers/ImagesController";
import { morganErrorHandler, morganSuccessHandler } from './core/morgan';
import { APP_PREFIX_PATH, FRONT_URL, IS_TEST } from "@/core/config"
import logger from "@/core/logger"
import routes from "@/routes"
import { errorHandler } from "@/middleware/errorHandler"

const app: Express = express();
import './utils/response/customSuccess';
app.use('/upload', express.static('upload'))
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.all('*', async function (req, res, next) {
  res.header('Access-Control-Allow-Origin', FRONT_URL);
  res.header('cache-control', "no-cache");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  /*if (!req.xhr) {
    res.json({
      success: false,
      code: 401,
      error: 'UNAUTHORIZED_ACTION'
    });
  } else {
    next();
  }*/
 next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(APP_PREFIX_PATH, routes);

try {
  if (!IS_TEST) {
    app.use(morganSuccessHandler);
    app.use(morganErrorHandler);
  }
} catch (err) {
  logger.error(err);
}

app.use(errorHandler);

export default app;
