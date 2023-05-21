const nodemailer=require('nodemailer');
const hbs=require('nodemailer-express-handlebars');
const path = require('path');
const sendEmail=async (options) => {
    //1)Create a transporter
    const transporter=nodemailer.createTransport({
        service:"gmail",
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        
       
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
        
    })
    //Edit template
   


    const hbsOptions={
        viewEngine:{
            extName:".hbs",
            partialsDir:path.resolve(`${__dirname}/../views/`),
            defaultLayout:false,
        },
        viewPath:path.resolve(`${__dirname}/../views/`),
        extName:".hbs"
    };
     transporter.use('compile',hbs(hbsOptions))


    //2)Define the email options
    const mailOptions={
        from:process.env.EMAIL_USERNAME,
        to:options.email,
        subject:options.subject,
        
        //html:
        template:'index',
        context:{
            name:options.name,
            otp:options.otp
        }
    };

    //3) Actullay send the email
   await transporter.sendMail(mailOptions,function(err,info){
    if(err){
        console.log(err)
    }
    else{
        console.log("email send it success");
    }
   })
  
}

module.exports=sendEmail;