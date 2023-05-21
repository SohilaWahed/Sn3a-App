const User=require(`${__dirname}/../models/userModel`);
const Post=require(`${__dirname}/../models/postModel`);
const {catchAsync}=require(`${__dirname}/../utils/catchAsync`);
const AppError=require(`${__dirname}/../utils/appError`);
const uploadImage=require('../utils/uploadImage');

const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
      if(allowedFields.includes(el)) newObj[el]=obj[el]
  });
  return newObj;
}
exports. DeleteUser=catchAsync(async(req,res,next)=>{
   
   const deletedUser=await User.findByIdAndDelete(req.params.id)
    res.status(202).json({
      status:"Success",
      requestTime:req.requestTime,
      data:deletedUser
    })
    if (!deletedUser) {
      return  next(new AppError('Erorr user not found',404));
    }
   
    })
  
exports.getAllUsers=catchAsync(async(req,res,next) => {
  
  // const users=await User.aggregate([
  //   {
  //     $match:{
  //       role:"customer"
  //     }
  //   }
  // ])
const users= await User.find({role:"customer"});
  res.status(200).json({
    status:true,
     data:users
  })
 
})
exports.getAllWorkers=catchAsync(async(req,res,next) => {
  if(!req.body.job){
  const users=await User.aggregate([
    {
      $match:{
        role:"worker"
      }
    }
  ])
 
  res.status(200).json({
    length:users.length,
    status:true,
   data:users
  })
 
}
if(req.body.job){
  const users=await User.aggregate([
    {
      $match:{
        role:"worker",
        job:req.body.job
      }
    }
  ])
 
  res.status(200).json({
    length:users.length,
    status:true,
   data:users
  })
}
})
  
 TODO:
  exports.UpdatedUser=catchAsync(async(req,res,next)=>{
    if(req?.files?.photo){
      const file=req.files.photo;
      
       req.body.photo=await uploadImage(file.tempFilePath);
      
        }
   const filterBody=filterObj(req.body,'name','email','photo','bio')
   
    const updatedUser= await User.findByIdAndUpdate(req.user.id,filterBody
      ,{
        new:true,
        runValidators:true
      })
    res.status(200).json({
      status:true,
      user:updatedUser
    })
   
  })


exports.deletedMe=catchAsync(async (req,res,next) => {
  
  await User.findByIdAndUpdate(req.user.id,{active:false},{
    new:true,
    runValidators:true
  })
  await Post.findOneAndUpdate({user:req.user.id},{Activity:false})
  res.status(204).json({
    status:true,
    message:"deleted successfully",
    data:null
  })

  
}
  )





  exports.GetUser=catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new AppError("user not found",404));
    }
    res.status(200).json({
      status:true,
      data:{
        user:user
      }
    })
  })
  

  exports.AddWorkerUserRate=catchAsync(async(req,res,next)=>{
    //protect handler
    const rate =req.body.rate;
    const user=await User.findByIdAndUpdate(req.body.id,{
      $push:{rating:rate}
    },{
      new:true,
      runValidators:true
    });
    if(!user){
      return next(new AppError("there's no user with that id",404));

    }
    
    user.rateAverage=user.changesRateAvg(user.rating);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status:true,
      message:"rate added success",
      data:user
    })
  })