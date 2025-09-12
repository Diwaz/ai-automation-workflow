import express from 'express';
import workflowRoutes from './workflow';
const router = express.Router();



router.use('/workflow',workflowRoutes)


export default router;