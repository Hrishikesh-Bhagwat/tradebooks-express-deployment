const express=require("express");
const app=express();
const PORT=3000||process.env.PORT;

app.get("/",(req,res)=>{
    return res.send("All up and running");
})

app.listen(PORT,(e)=>{
    if(e){
        console.log(e)
    }else{
        console.log(`App running on port ${PORT}`);
    }
})