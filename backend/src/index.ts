import './loadEnv';
import { app } from './app';

const port = Number(process.env.PORT) || 3010;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}
