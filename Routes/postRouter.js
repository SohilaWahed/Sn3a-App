const express=require('express');
const router=express.Router();
const authController=require(`${__dirname}/../controllers/authController`);
const postController=require('../controllers/postController');

router.post('/add',authController.protect,postController.addPost);
router.get('/postTimeLine',authController.protect,postController.getPosts);
router.post('/profilePage',postController.getProfilePage);
router.get('/myProfilePage',authController.protect,postController.getMyProfilePage);
router.route('/delete/:id').delete(postController.deletePost)
module.exports=router;