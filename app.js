const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // security
const helmet = require('helmet'); // security
const mongoSanitize = require('express-mongo-sanitize'); // security
const xss = require('xss-clean'); // security
const hpp = require('hpp'); // security
const fileUpload = require('express-fileupload');
const AppError = require('./utils/appError');
const userRouter = require('./Routes/userRouter');
const postRouter = require('./Routes/postRouter');
const chatRouter = require('./routes/chatRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const messageRouter = require('./routes/messageRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// Global MiddleWares

//set security http headers 
app.use(helmet()) // set el htttp headers property 
  
//development logging
if(process.env.NODE_ENV === 'development'){
app.use(morgan('dev'));
}

//Limit requests from same API
// hna bn3ml limitng l3dd el mrat elly log in 34an  el brute force attacks
const limiter =rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'too many requests please try again later'
})

app.use(fileUpload({ //for upload files
  useTempFiles:true,
  tempFileDir: "/tmp"
}))

app.use('/api',limiter) // (/api)=> all routes start with /api

//Body parser,reading data from body into req.body
app.use(express.json()); //middle ware for req,res json files 3and req.body

//Data sanitization against no SQL injection
app.use(mongoSanitize());

//Data sanitization against cross site scripting attacks (XSS)
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist:[
    'duration',
    'maxGroupSize',
    'difficulty',
    'ratingsAverage',
    'ratingsQuantity',
    'price',
] // loo fe al apifeatures 7t 2 value fe el query yasr4 3la kolo
}));

//serving static files
app.use(express.static(`${__dirname}/public`));

//app.use(express.json({limit:'10kb'})); => limit of data in body not more than 10 KB
// asdsfasdfsa
//request time of API
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/payments', paymentRouter);

app.all('*', (req, res, next)=>{
  next(new AppError(`Can't find the url ${req.originalUrl} on this server`, 404));  
});

app.use(globalErrorHandler);
  
module.exports = app;