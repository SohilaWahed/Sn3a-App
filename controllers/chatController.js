const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError')
const {catchAsync} = require('../utils/catchAsync')

//@description     Deleta All Chats
//@route           Delete/api/v1/chats/
//@access          Protected
exports.deleteAllChats = catchAsync(async(req, res, next)=>{
  const chat = Chat.deleteMany({users:{$elemMatch:{$eq: req.user._id}}})
  
  if(!chat){
    return next(new AppError('Sorry, Cannot delete chats',404))
  }
  res.status(204).json({
    status:true,
    data: null
  })
})

//@description     Deleta Chat
//@route           Delete/api/v1/chats/
//@access          Protected
exports.deleteChat = catchAsync(async(req, res, next)=>{
  const chat = Chat.findByIdAndDelete(req.body.id)
  if(!chat){
    return next(new AppError('Sorry, No chat exist with this id ', 404))
  }
  res.status(204).json({
    status:true,
    message:"deleted successfully",
    data: null
  })
})

//@description     Create or fetch One to One Chat
//@route           POST/api/v1/chats/
//@access          Protected
exports.accesChat = catchAsync(async(req, res, next)=>{

    const user = await User.findOne({_id: req.body.id})
    
    if(!user){
      return next(new AppError('No user found with that id',404))
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and:[
            {users:{$elemMatch:{$eq: req.user._id}}}, //me 
            {users:{$elemMatch:{$eq: user.id}}} //him
        ],
    }).populate("users","-password") // to get all info for users instead of only id
      .populate("latestMessage")// to get all info for messages instead of only id

    //final data for our chat
    isChat = await User.populate(isChat,{
        path:"latestMessage.sender",
        select: "name pic email"
    })

    if(isChat.length > 0){
        res.status(200).json({
            status: true,
            message:" Access successfully",
            data: isChat, // must be return one chat but for sure
        }); 
    }else{
        var chat = {
            chatName: user.name,
            isGroupChat:false,
            users:[req.user._id, user.id]
        }
        try{
            const newChat = await Chat.create(chat);
            const fullChat = await Chat.find({_id: newChat._id}).populate("users","-password")
            res.status(200).json({
                status: true,
                message:"chat creatad successfully",
                data: fullChat, 
            }); 
        }catch(err){
            return next(new AppError(err.message, 400))
        }
    }
})

//@description     Fetch all chats for a user
//@route           GET/api/v1/chats/
//@access          Protected
exports.allChats = catchAsync(async(req, res, next)=>{
    //all chats (single/group)
    // var chats = await Chat.find({users:{$elemMatch:{$eq: req.user._id}}})
    //  .populate("users","-password")
    //  .populate("latestMessage")
    //  .sort('-createdAt')

    //all single chats 
    var chats = await Chat.find({ isGroupChat: false, 
              $and:[{users:{$elemMatch:{$eq: req.user._id}}}]})
              .populate("users","-password")
              .populate("latestMessage")
              .sort('-createdAt')

    chats = await User.populate(chats,{
        path:"latestMessage.sender",
        select: "name pic email"
    })

    if(!chats){
        return next(new AppError("Not Found Chats",404))
    }
    res.status(200).json({
        status: true,
        message:"All chat sent successfully",
        data: chats
    }); 
})
/***********************************************************/
//@description     Create New Group Chat
//@route           POST /api/v1/chat/group
//@access          Protected
exports.createGroupChat = catchAsync(async(req, res, next)=>{
    if (!req.body.users || !req.body.name) {
        return next(new AppError('Please Fill all the feilds',400))
    }
    
    var users = JSON.parse(JSON.stringify(req.body.users));
    
    if (users.length < 2) {
        return next(new AppError('More than 2 users are required to form a group chat',400))
    }
    
    users.push(req.user);
    
      try {
        const groupChat = await Chat.create({
          chatName: req.body.name,
          users: users,
          isGroupChat: true,
          groupAdmin: req.user,
        });
    
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users", "-password")
          .populate("groupAdmin", "-password");
        
          res.status(200).json({
            status: 'success',
            data: fullGroupChat
        });
      } catch (err) {
        return next(new AppError(err.message, 400))
      }
})

// @desc    Rename Group
// @route   PUT /api/v1/chat/rename
// @access  Protected
exports.renameGroup =  catchAsync(async (req, res, next) =>{
    //rename all chats
    const chat = await  Chat.findByIdAndUpdate(req.body.id,
            {chatName:req.body.chatName},
            { new:true, runValidators:true })
         .populate("users", "-password")
         .populate("groupAdmin", "-password");
              
    if(!chat){
      return next(new AppError('No chat found with that id',404))
    }

    res.status(200).json({
      status:'success',
      data: {
      data:chat
      },
    })
    // update only group chats
    //  const chat = await Chat.findById({_id: req.body.id })

    //  if(!chat){
    //    return next(new AppError('No chat found with that id',404))
    //  }else if(chat.isGroupChat === false){
    //    return next(new AppError('sorry you cannot rename single chat', 400))
    //  }  
     
    //  // updates the first document that matches filter with update (I am sure one chat with this id)
    //  //return an object which contains information about how the execution affected the database.
    //  const update = await Chat.updateOne(chat,{chatName:req.body.chatName},
    //                    { new: true,
    //                      runValidators: true })
     
    //  const updateChat = await Chat.findById({_id: req.body.id })
     
    //  res.status(200).json({
    //    status:'sucess',
    //    data: {
    //      data:updateChat
    //    },
    //  })
  })

// @desc    Add user to Group
// @route   PUT /api/v1/chat/groupadd
// @access  Protected
exports.addToGroup =  catchAsync(async (req, res, next) =>{
    const { id, usersId } = req.body;
    //var users = JSON.parse(JSON.stringify(req.body.usersId));
    const chat = await  Chat.findByIdAndUpdate(id,
            {$push: { users: usersId }},
            { new:true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
              
    if(!chat){
      return next(new AppError('No chat found with that id',404))
    }

    res.status(200).json({
      status:'success',
      data: {
      data:chat
      },
    })  
})

// @desc    Remove user from Group
// @route   PUT /api/v1/chat/groupremove
// @access  Protected
exports.removeFromGroup =  catchAsync(async (req, res, next) =>{
    var users = JSON.parse(JSON.stringify(req.body.usersId));
    const chat = await  Chat.findByIdAndUpdate(req.body.id,
            {$pull: { users: users }},
            { new:true,
              runValidators:true })
              .populate("users", "-password")
              .populate("groupAdmin", "-password");  
              
    if(!chat){
      return next(new AppError('No chat found with that id',404))
    }

    res.status(200).json({
      status:'success',
      data: {
      data:chat
      },
    })  
})