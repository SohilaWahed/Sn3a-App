const express = require('express');
const { getAllUsers,
        GetUser,
        UpdatedUser,
        DeleteUser,
        deletedMe,
        getAllWorkers,
        AddWorkerUserRate} = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);
const router = express.Router();


router.post('/signUp',authController.SignUp);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgotPassword);
router.post('/CheckEmailOrPhone',authController.CheckEmailOrPhone);
router.post('/verifyEmailOtp',authController.verifyEmailOtp);
router.post('/verifyPhoneOtp',authController.verifyPhoneOtp);
router.post('/logout',authController.protect,authController.logOut);
router.patch('/resetpassword',authController.protect,authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);
router.patch('/updateUser',authController.protect,UpdatedUser);
router.delete('/DeleteMe',authController.protect,deletedMe);
router.post('/rate',AddWorkerUserRate);

router.route('/workers').get(getAllWorkers);
router.route('/').get(getAllUsers);
 
 
  router.route('/:id')
  .get(GetUser)
  .patch(UpdatedUser)
  .delete(DeleteUser);
  module.exports=router;