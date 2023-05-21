const fs =require('fs');
const mongoose=require('mongoose');
const User=require('./models/userModel');
const Post=require('./models/postModel');
const dotenv=require('dotenv')
dotenv.config({path:'./config.env'});
const DB=`mongodb://mohamedahhmed195:MC6utDm7viY5Eplc@ac-rolz7z8-shard-00-00.0f21qam.mongodb.net:27017,ac-rolz7z8-shard-00-01.0f21qam.mongodb.net:27017,ac-rolz7z8-shard-00-02.0f21qam.mongodb.net:27017/sana?replicaSet=atlas-qmx6et-shard-0&ssl=true&authSource=admin`;
 
mongoose.connect(DB,{
    useNewUrlParser:true,
   
  }).then(con=>{
    // console.log(con);
     console.log("DB connection Successfully");
  });

  //const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

  const addPosts= async() => {
    try{
      await  Post.create()
        console.log("data loaded successfully");
        process.exit();

    }
    catch(err){
        console.log(err);
    }
  }

  const deletedPosts=async () => {
    try{
        await Post.deleteMany();
        console.log("Posts has been deleted successfully");
        process.exit();

    }
    catch(err){
        console.log(err);
    }
  }
 // console.log(process.argv);
 if(process.argv[2]==="--import"){
  addPosts();

 };
 if(process.argv[2]==="--delete"){
  deletedPosts();
 }