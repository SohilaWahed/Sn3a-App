const cloudinary=require('./cloudaniry');
uploadImage=(async(imagePath)=>{
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    try{
    const result=await cloudinary.uploader.upload(imagePath,options);
    return result.url;
    }
    catch(err){
      console.log(err);
    }
    })

module.exports=uploadImage;