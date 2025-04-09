const express = require('express');
const facultyController = require('../controllers/facultyController');
const router = express.Router();
const upload = require("../config/multerconfig"); // Import Multer configuration

router.post('/save',upload.single("photograph"), facultyController.saveFaculty);
router.get('/getAutoSavedFaculty', facultyController.getAutoSavedFacultyData);
router.post('/autoSaveFaculty', facultyController.autoSaveFacultyData);
router.delete('/deleteAutoSaveFaculty/:staffid', facultyController.deleteAutoSavedFaculty);
router.get('/getAllFaculties', facultyController.getAllFaculties);

router.post('/approve/:id', facultyController.approveFaculty);

router.post("/filterFaculties", facultyController.getFilteredFaculty);
router.get('/monthly',facultyController.getFacultyEntriesByMonth);
router.get('/sessions',facultyController.getSessionsHandled);
router.get('/search/:id',facultyController.getFacultyById);
router.put('/verifyFaculty/:id', facultyController.verifyFaculty);
router.delete('/delete/:id', facultyController.deleteFaculty);
router.post("/filterFaculties", facultyController.getFilteredFaculty);
router.put('/update/:id', facultyController.updateFaculty);
router.post('/rejectFacultyVerification/:id', facultyController.rejectFacultyVerification);
router.post('/rejectFacultyApproval/:id', facultyController.rejectFacultyApproval);

router.get('/rejected-approvals', facultyController.getRejectedFacultyApprovals);
router.get('/rejected-verifications', facultyController.getRejectedFacultyVerifications);
router.post('/notify/:id', facultyController.notifyFaculty);
router.get('/notifyhoo-false', facultyController.getNotifyHooFalse);
router.put('/acknowledge-hoo/:id', facultyController.acknowledgeHoo);
router.get('/notify-si-pending', facultyController.getNotifySIPending);
router.put('/acknowledge-si/:id', facultyController.acknowledgeSI);
router.get('/notify-all-true', facultyController.getNotifyAllTrue);
module.exports = router;
