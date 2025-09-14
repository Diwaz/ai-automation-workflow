import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1',routes)
app.get('/',(req,res)=>{
    res.json("Ok");
})

app.listen(5000,()=>{
    console.log("server started running")
})