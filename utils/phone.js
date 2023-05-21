const AppError = require('./appError');

const client=require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN,{
    lazyLoading:true
});
const sendMessage=async (req,res,next)=>{
    const {internationalFormat}=req.body;
    try{
        const otpResponse =await client
        .verify
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
            to:internationalFormat,
            channel:"sms"
        });
        res.status(200).json({
            message:"OTP send successfully",
            otp:otpResponse
        });
    }
    catch(err){
        return new AppError(err,400);
    }
}
  

module.exports=sendMessage;
