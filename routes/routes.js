const expres=require('express')
const router=expres()
const userController=require('../controller/userController')

router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)

router.post('/forget-password',userController.forgetPassword)

router.post('/reset-password',userController.resetPassword)







module.exports = router;