import * as dotenv from "dotenv";
import "reflect-metadata";

import app from "@/app";
import logger from "@/core/logger"
import { APP_PORT } from "@/core/config"
import { AppDataSource } from "@/orm/data-source"
import { connectRedis } from "@/core/redis"
import { ExpressAdapter } from "@bull-board/express"
import { emailBullMq, setupEmailBullMQProcessor } from "@/queues/email.queue"
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"
import { createBullBoard } from "@bull-board/api"

dotenv.config();


AppDataSource.initialize()
  .then(async () => {
    logger.info(
      `Database connection success. Connection name: '${AppDataSource.name}' Database: '${AppDataSource.options.database}'`
    );
    await connectRedis()
    await setupEmailBullMQProcessor(emailBullMq.name);

    const serverAdapter: any = new ExpressAdapter();
    serverAdapter.setBasePath('/ui');
    const queueAdapter = new BullMQAdapter(emailBullMq as any, { readOnlyMode: true });
    createBullBoard({
      queues: [queueAdapter] as any,
      serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'My Queues',
          boardLogo: {
            path: 'https://cdn-icons-png.flaticon.com/512/3161/3161009.png',
            width: '50px',
            height: "50px",
          },
          miscLinks: [{ text: 'Logout', url: '/logout' }],
          favIcon: {
            default: 'static/images/logo.svg',
            alternative: 'static/favicon-32x32.png',
          },
        },
      },
    });

    app.use('/ui', serverAdapter.getRouter());
  })
  .catch((err) => console.error(err));

app.listen(APP_PORT, () => {
  logger.info(`Server listen on port ${APP_PORT}`);
});
