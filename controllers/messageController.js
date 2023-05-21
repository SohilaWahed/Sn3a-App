const Message = require('../models/messageModel')
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError')
const {catchAsync} = require('../utils/catchAsync')

exports.sendMessage = catchAsync(async(req, res, next)=>{
  const {chatId, content} = req.body;

  if(!chatId || !content){
    return next(new AppError("Invalid data passed into request"))
  }  

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    timestamps: Date.now(),
  };

  try{

    const message = await Message.create(newMessage)
    
    await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
     
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message })  
    
    res.status(200).json({
        status: true,
        message:"message sent successfully",
        data: message
    })  
    
  }catch(err){
    return next(new AppError("cannot send message", 400))
  }

})
exports.allMessages = catchAsync(async(req, res, next)=>{
 
    const messages = await Message.find({ chat: req.params.chatId} , null,{ sort :{timestamp: 1 }})                              
                          .populate("sender", "name pic email")

    if(!messages){
        return next(new AppError(`Sorry, can't found messages belongs to this chat `, 400))
    }                

    res.status(200).json({
        status: true,
        message:"All Messages sent successfully",
        data: messages
    })
})