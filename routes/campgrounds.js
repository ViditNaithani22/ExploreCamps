const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware');
const {validateCampground} = require('../middleware');
const {validateAuthor} = require('../middleware');
const campgrounds = require('../controllers/campgrounds'); 
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

router.route('/').get(catchAsync(campgrounds.index))
.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
// .post(upload.single('image'),(req, res) => {
//     // res.send(req.body);
//     res.send(req.file);
// })
// .post(upload.array('images'),(req, res) => {
//     // res.send(req.body);
//     res.send(req.files);
// })
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id').get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn, validateAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
.delete(isLoggedIn, validateAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, validateAuthor, catchAsync(campgrounds.renderEditForm));




module.exports = router;