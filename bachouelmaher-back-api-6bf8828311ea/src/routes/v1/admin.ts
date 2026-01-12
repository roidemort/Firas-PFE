import { Router } from 'express';

import {
  login,
  addUser,
  detailsUser,
  editUser,
  getAllUsers,
  sendNotifications,
  main,
  addPartner,
  removePartner,
  updatePartner,
  addPharmacy,
  getAllPharmacies,
  getDetailsPharmacy,
  removePharmacy,
  updatePharmacy,
  sendPharmacyNotifications,
  generateNewKey,
  getAllKeys,
  updateKey,
  addCategory,
  removeCategory,
  updateCategory,
  getAllQuestions,
  addQuestion,
  updateQuestion,
  getDetailsQuestion,
  getAllQuiz,
  getDetailsQuiz,
  updateQuiz,
  getAllLesson,
  getDetailsLesson,
  updateLesson,
  addLesson,
  updateSection,
  getDetailsSection,
  addCategoryCapsule,
  updateCategoryCapsule,
  addCapsule,
  updateCapsule,
  getAllSubscriptions,
  addSubscription,
  updateSubscription,
  getDetailsSubscription,
  getAllRatings,
  updateRating,
  userCourseEnroll,
  courseEnrollProgression,
  getConversation,
  addConversation,
  countConversation, countNotification, addTrend, updateTrend
} from "@/controllers/admin"
import { checkJwt } from "@/middleware/checkJwt";
import { checkRole } from "@/middleware/checkRole";
import { validatorLogin } from "@/middleware/validation/auth"
import upload from "@/middleware/ImageConfig"
import { addImage, getAllImages, removeImage } from "@/controllers/admin/images"
import { addSEO, editSEO, getAllSeo, getSeoDetails } from "@/controllers/admin/seo"
import { addPackage, removePackage, updatePackage } from "@/controllers/admin/packages"
import { addProvider, removeProvider, updateProvider } from "@/controllers/admin/providers"
import { addTrainer, updateTrainer } from "@/controllers/admin/trainers"
import {
  addCourse, deleteFaqById, deleteIncludeById, deleteLessonById, deleteObjectiveById,
  deleteRequirementById,
  getAllCourses,
  getDetailsCourse,
  getEnrollCourse,
  updateCourse
} from "@/controllers/admin/courses"
import {
  addCertificate,
  getAllCertificates,
  getDetailsCertificate,
  updateCertificate
} from "@/controllers/admin/certificates"
import { addAdvertisement, updateAdvertisement, updateAdvertisementStatus } from "@/controllers/admin/advertisement"

const router = Router();

router.post('/login', [validatorLogin], login);

router.get('/users', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllUsers);
router.post('/users/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addUser);
router.put('/users/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN']), upload.single('upload')], editUser);
router.get('/users/details/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], detailsUser);
router.post('/users/sendNotifications', [checkJwt, checkRole(['SUPER_ADMIN'])], sendNotifications);
router.get('/users/courseEnroll/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], userCourseEnroll);
router.post('/users/courseEnrollProgression', [checkJwt, checkRole(['SUPER_ADMIN'])], courseEnrollProgression);
router.post('/users/conversation', [checkJwt, checkRole(['SUPER_ADMIN'])], getConversation);
router.post('/users/add/conversation', [checkJwt, checkRole(['SUPER_ADMIN'])], addConversation);
router.post('/users/count/conversation', [checkJwt, checkRole(['SUPER_ADMIN'])], countConversation);
router.get('/users/count/notifications', [checkJwt, checkRole(['SUPER_ADMIN'])], countNotification);

router.get('/pharmacies', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllPharmacies);
router.post('/pharmacies/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addPharmacy);
router.get('/pharmacies/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsPharmacy);
router.delete('/pharmacies/remove/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], removePharmacy);
router.put('/pharmacies/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updatePharmacy);
router.post('/pharmacies/sendNotifications', [checkJwt, checkRole(['SUPER_ADMIN'])], sendPharmacyNotifications);

router.post('/pharmacies-users/generateNewKey', [checkJwt, checkRole(['SUPER_ADMIN'])], generateNewKey);
router.get('/pharmacies-users/getAllKeys', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllKeys);
router.post('/pharmacies-users/updateKey', [checkJwt, checkRole(['SUPER_ADMIN'])], updateKey);

router.post('/partners/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addPartner);
router.delete('/partners/remove/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], removePartner);
router.put('/partners/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updatePartner);

router.post('/categories/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addCategory);
router.delete('/categories/remove/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], removeCategory);
router.put('/categories/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateCategory);

router.post('/categories-capsules/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addCategoryCapsule);
router.put('/categories-capsules/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateCategoryCapsule);

router.post('/advertisements/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addAdvertisement);
router.put('/advertisements/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateAdvertisement);
router.put('/advertisements/editStatus/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateAdvertisementStatus);

router.post('/capsules/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addCapsule);
router.put('/capsules/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateCapsule);

router.get('/images', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllImages);
router.post('/images/add', [checkJwt, checkRole(['SUPER_ADMIN']), upload.array('upload')], addImage);
router.post('/images/remove', [checkJwt, checkRole(['SUPER_ADMIN'])], removeImage);

router.get('/seo', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllSeo);
router.post('/seo/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addSEO);
router.put('/seo/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], editSEO);
router.get('/seo/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getSeoDetails);

router.get('/subscriptions', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllSubscriptions);
router.post('/subscriptions/add', [checkJwt, checkRole(['SUPER_ADMIN']), upload.single('upload')], addSubscription);
router.put('/subscriptions/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN']), upload.single('upload')], updateSubscription);
router.get('/subscriptions/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsSubscription);

router.post('/packages/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addPackage);
router.delete('/packages/remove/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], removePackage);
router.put('/packages/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updatePackage);

router.post('/providers/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addProvider);
router.delete('/providers/remove/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], removeProvider);
router.put('/providers/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateProvider);

router.post('/trainers/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addTrainer);
router.put('/trainers/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateTrainer);

router.post('/trends/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addTrend);
router.put('/trends/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateTrend);

router.get('/questions', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllQuestions);
router.post('/questions/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addQuestion);
router.put('/questions/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateQuestion);
router.get('/questions/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsQuestion);

router.get('/lessons', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllLesson);
router.post('/lessons/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addLesson);
router.put('/lessons/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateLesson);
router.get('/lessons/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsLesson);

router.put('/sections/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateSection);
router.get('/sections/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsSection);

router.get('/courses', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllCourses);
router.post('/courses/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addCourse);
router.put('/courses/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateCourse);
router.get('/courses/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsCourse);

router.get('/certificates', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllCertificates);
router.post('/certificates/add', [checkJwt, checkRole(['SUPER_ADMIN'])], addCertificate);
router.put('/certificates/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateCertificate);
router.get('/certificates/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsCertificate);

router.delete('/courses/deleteRequirement/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], deleteRequirementById);
router.delete('/courses/deleteFaq/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], deleteFaqById);
router.delete('/courses/deleteInclude/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], deleteIncludeById);
router.delete('/courses/deleteObjective/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], deleteObjectiveById);
router.delete('/courses/deleteLesson/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], deleteLessonById);
router.get('/courses/getEnrollCourse/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getEnrollCourse);

router.get('/quiz', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllQuiz);
router.put('/quiz/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateQuiz);
router.get('/quiz/getDetails/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getDetailsQuiz);

router.get('/ratings/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], getAllRatings);
router.put('/ratings/edit/:id', [checkJwt, checkRole(['SUPER_ADMIN'])], updateRating);

router.get('/dashboard', [checkJwt, checkRole(['SUPER_ADMIN'])], main);

export default router;