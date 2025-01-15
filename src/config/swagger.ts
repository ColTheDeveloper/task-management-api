import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Express } from 'express';




const swaggerDocument = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../swagger.json'), 'utf-8')
);


const swaggerSetup = (app: Express): void => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default swaggerSetup;
