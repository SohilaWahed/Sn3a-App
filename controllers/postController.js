const Post=require('./../models/postModel');
const User=require('./../models/userModel');
const {catchAsync}=require(`${__dirname}/../utils/catchAsync`);
const AppError=require(`../utils/appError`);
const uploadImage=require('../utils/uploadImage');
const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
      if(allowedFields.includes(el)) newObj[el]=obj[el]
  });
  return newObj;
}
exports.addPost=catchAsync(async (req,res,next) => {
  //protect handler
  const user= req.user._id;
  if(!user){
    return next(new AppError("there's no user with this id",404) );
  }
  
  if(req?.files?.image){
    const file=req.files.image;
    
     req.body.image=await uploadImage(file.tempFilePath);
    
      }
      if(!req?.files?.image){
        req.body.image=null;
      }
      req.body.user=user;
  const newPost= await Post.create(req.body);
  res.status(200).json({
    status:true,
    message:"Post Created Sucessfully",
    data:newPost
  })
})

exports.getPosts=catchAsync(async (req,res,next) => {
  //protect handler
  const data=req.user;
  
   const allPosts=  await Post.find({user:{$ne:data._id}});
 
   
    if(!allPosts){
        return next(new AppError("there's no posts to Get ",404))
    }
    res.status(200).json({
      length:allPosts.length,
        status:true,
        data:allPosts
    })
  
})

exports.deletePost=catchAsync(async(req,res,next)=>{
    const deletePost=await Post.findByIdAndDelete(req.params.id);
    console.log(req.params.id);
    if (!deletePost) {
        return next(new AppError('No post found with that ID', 404));
      }
    res.status(204).json({
        status:true,
        message:"Deleted sucessfully",
        data:null
    })
})

exports.updatePost=catchAsync(async(req,res,next)=>{
  if(req?.files?.image){
    const file=req.files.image;
    
     req.body.image=await uploadImage(file.tempFilePath);
    
      }
  const filterBody=filterObj(req.body,'image','description')
  const post= await Post.findByIdAndUpdate(req.body.id,filterBody,{runValidators:true,new:true}) //post id 
  if(!post){
    return next(new AppError("there's no post with that id ",404));
  }
  res.status(200).json({
    status:true,
    message:"post updated Successfully",
    data:post
  })
})

exports.getProfilePage=catchAsync(async(req,res,next)=>{
  // post id from client
  let userData=await User.findById(req.body.usId);
  if(userData.role==='user'){
    userData.birthdate=null;
  }
  const posts = await Post.find({user:userData.id});
  res.status(200).json({
    status:true,
    data:{
      userData,
      posts
    }
  })
})


exports.getMyProfilePage=catchAsync(async(req,res,next)=>{
  // protectHandler
  const userData=req.user;
  if(userData.role==='user'){
    userData.birthdate=null;
  }
  const posts = await Post.find({user:userData.id});
  res.status(200).json({
    status:true,
    data:{
      userData,
      posts
    }
  })
})