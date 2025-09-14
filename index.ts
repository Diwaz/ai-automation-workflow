import express from 'express';
import routes from './routes';

const app = express();

app.use(express.json());

app.use('/api/v1',routes)
app.get('/',(req,res)=>{
    res.json("Ok");
})

app.listen(5000,()=>{
    console.log("server started running")
})