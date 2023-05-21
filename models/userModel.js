//email username passorwd passowrd confirm
const mongoose=require('mongoose');
const validator=require('validator');
const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const otpGenerator = require('otp-generator');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Must has a username'],
       // maxlength:[25,'username maxiumm is 25 letters'],
      //  minlength:[10,'username atleast has 10 letters']
    },
    password:{
        type:String,
        required:[true,'Must has a Password'],
        trim:true,
        minlength:[8,' Password At least has 8 charachters'],
        select:false // make it invisible when get all users 
        },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function(el) {
              return el === this.password;
            },
            message: 'Passwords are not the same!'
          },
  
    },
    phone:{
        type:String,
        unique:true
    },
    nationalFormat:{type:String},
    internationalFormat:{type:String},
    countryCode:{type:String},
    email:{
        type:String,
        required:[true,'user must has a email Addresse'],
        unique:true,
        lowercase:true,
        //trim:true,
        validate:[validator.isEmail,'please provide correct email']
    },
    photo:{
        type:String,
        default:`https://img.freepik.com/free-icon/user_318-159711.jpg?size=626&ext=jpg&ga=GA1.1.327408408.1684502086&semt=ais`
    },
    role:{
        type:String,
        enum:['customer','worker','admin'],
        default:'customer'
    },
    // createdAt:{
    //     type:Date,
    //     default:Date.now(),
    //     select:false// mby5li4 3l this ya4ta8l
    // },
    passwordChangedAt:{
        type:Date
       
    },
    // passwordResetToken:String,
    // passwordResetExpires:Date,
    passwordOtp:String,
    passwordOtpExpires:Date,
    birthdate:{
        type:String,
      //  required:[true,'user must has a birth date']
    },
    city:{
        type:String
    },
    national_id:{
        type:String,
        required:[true,'user must have national_id'],
        unique:true
    },
    active:{
        type:Boolean,
        default:true
    },
    
    rating:[Number],

    rateAverage:{
        type:Number,
        min:[0.0,'rate  must at least 1.0'], //for number and dates
        max:[5.0,'rate  not more than 5.0'],
        default:0
    },
    job:{
        type:String,
        //enum:[]
    },
    photo_id:{
        type:String,
        //required:true
    },
    isPaid:{
        type:Boolean 
    },
    address:{
        type:String
    },
    bio:{
        type:String
    }
   // token:String 

},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// DOCUMENT MIDDLEWARE 

userSchema.pre('save',async function(next){
    //only run if password modified
    if(!this.isModified('password')){
        return next();
    }
    //hash password
    this.password= await bcrypt.hash(this.password,12); 
    this.passwordConfirm=undefined;
    
    next();
})
userSchema.pre('save',function(next){
    if(!this.isModified('password')|| this.isNew){
        return next();
    }
    this.passwordChangedAt=Date.now()-1000; // => 1000 is 1 sec
    next();
})
userSchema.plugin(mongooseIntlPhoneNumber, {
    hook: 'validate',
    phoneNumberField: 'phone',
    nationalFormatField: 'nationalFormat',
    internationalFormat: 'internationalFormat',
    countryCodeField: 'countryCode',
});
// userSchema.pre('save',function(){
//     this.phone=this.nationalFormat;
// })
//Query Middle Wares
userSchema.pre(/^find/,  function(next){
     this.find({active:{$ne:false}}).select('-createdAt');
    next();
})





//instance method
userSchema.methods.correctPassword= async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)// compare bt3mal hash le candidate we btcompare b3deha
}



userSchema.methods.changesPasswordAfter=function(JWTTimestamps){
   
    if(this.passwordChangedAt){
        const changedTimestamps=parseInt(this.passwordChangedAt.getTime()/1000,10); //=> 10 min
        //console.log(changedTimestamps,JWTTimestamps);
        return JWTTimestamps < changedTimestamps;
    }
    return false;
}

userSchema.methods.changesRateAvg=function(rate){  //return rate
   let sum = 0;
   for(let i=0; i<rate.length; i++){
    sum+=rate[i];
   }
   return sum/rate.length;
    
}

// userSchema.methods.createPasswordRestToken = function() {
//     const resetToken = crypto.randomBytes(32).toString('hex');
  
//     this.passwordResetToken = crypto
//       .createHash('sha256')
//       .update(resetToken)
//       .digest('hex');
  
//    // console.log({ resetToken }, this.passwordResetToken);
  
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //=> vallid for 10 minutes
  
//     return resetToken;
//   };

userSchema.methods.generateOtp=async function(){
    const OTP=otpGenerator.generate(process.env.OTP_LENGTH,{
        upperCaseAlphabets: true,
        specialChars: false
    })
    this.passwordOtp=crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');
   this.passwordOtpExpires=Date.now() + 10 * 60 * 1000;
    return OTP;

}


const User=mongoose.model('User',userSchema);
module.exports=User;