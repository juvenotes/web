/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import transmit from '@adonisjs/transmit/services/main'

const HomeController = () => import('#controllers/home/home_controller')
const SupportController = () => import('#controllers/home/support_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const GoogleSignupController = () => import('#controllers/auth/google_signup_controller')
const EmailVerificationsController = () => import('#controllers/auth/email_verification_controller')
const ForgotPasswordController = () => import('#controllers/auth/forgot_password_controller')
const ProfileController = () => import('#controllers/settings/profile_controller')
const AccountController = () => import('#controllers/settings/account_controller')
const IndexConceptsController = () => import('#controllers/concepts/index_concepts_controller')
const ManageConceptsController = () =>
  import('#controllers/manage/concepts/manage_concepts_controller')
const IndexPapersController = () => import('#controllers/papers/index_papers_controller')
const UserDashboardController = () => import('#controllers/dashboard/index_controller')
const PersonalizationController = () => import('#controllers/auth/personalization/index_controller')
const ManagePapersController = () =>
  import('#controllers/manage/past_papers/manage_papers_controller')
const ManagementDashboardController = () =>
  import('#controllers/manage/dashboard/manage_dashboard_controller')
const ManageUsersController = () => import('#controllers/manage/users/manage_users_controller')
const UploadImageController = () => import('#controllers/api/upload_image_controller')
const ManageInstitutionsController = () =>
  import('#controllers/manage/institutions/manage_institutions_controller')
const IndexOsceController = () => import('#controllers/osce/osce_controller')
const ManageOsceController = () => import('#controllers/manage/osce/manage_osce_controller')
const CiteController = () => import('#controllers/api/cite_controller')
const QuestionFeedbackController = () => import('#controllers/papers/question_feedback_controller')
const ManageFeedbackController = () =>
  import('#controllers/manage/feedback/manage_feedback_controller')

transmit.registerRoutes((route) => {
  // Ensure you are authenticated to register your client
  if (route.getPattern() === '__transmit/events') {
    route.middleware(middleware.auth())
    return
  }
})

// test crash route
router.get('/crash', () => {
  throw new Error('Test 500 error')
})

//* HOME
router.get('/', [HomeController, 'index']).as('home')

//* SUPPORT
router.get('/support', [SupportController, 'index']).as('support')

//* AUTH -> LOGIN, REGISTER, LOGOUT
router.get('/login', [LoginController, 'show']).as('auth.login.show').use(middleware.guest())
router.post('/login', [LoginController, 'store']).as('auth.login.store').use([middleware.guest()])
router
  .get('/register', [RegisterController, 'show'])
  .as('auth.register.show')
  .use(middleware.guest())
router
  .post('/register', [RegisterController, 'store'])
  .as('auth.register.store')
  .use([middleware.guest()])
router.post('/logout', [LogoutController, 'handle']).as('auth.logout').use(middleware.auth())

//* AUTH -> VERIFY EMAIL
router.get('/auth/verify', [EmailVerificationsController, 'pending'])
router.get('/auth/verify-email/:token', [EmailVerificationsController, 'verify'])
router
  .post('/auth/resend-email', [EmailVerificationsController, 'resend'])
  .as('verification.resend')

//* AUTH -> FORGOT PASSWORD
router
  .get('/forgot-password', [ForgotPasswordController, 'index'])
  .as('auth.password.index')
  .use([middleware.guest()])
router
  .post('/forgot-password', [ForgotPasswordController, 'send'])
  .as('auth.password.send')
  .use([middleware.guest()])
router
  .get('/forgot-password/reset/:value', [ForgotPasswordController, 'reset'])
  .as('auth.password.reset')
  .use([middleware.guest()])
router
  .post('/forgot-password/reset', [ForgotPasswordController, 'update'])
  .as('auth.password.update')
  .use([middleware.guest()])

router
  .group(() => {
    router.get('/personalize', [PersonalizationController, 'show'])
    router.post('/personalize', [PersonalizationController, 'store'])
  })
  .prefix('/auth')
  .use(middleware.auth())

//* TERMS AND PRIVACY
const TermsController = () => import('#controllers/legal/terms_controller')
const PrivacyController = () => import('#controllers/legal/privacy_controller')

//* USER DASHBOARD
router.get('learn', [UserDashboardController, 'handle']).as('learn').use(middleware.auth())

//* SETTINGS -> ACCOUNT
router
  .get('/settings/account', [AccountController, 'index'])
  .as('settings.account')
  .use(middleware.auth())
router
  .put('/settings/account/email', [AccountController, 'updateEmail'])
  .as('settings.account.email')
  .use(middleware.auth())
router
  .delete('/settings/account', [AccountController, 'destroy'])
  .as('settings.account.destroy')
  .use(middleware.auth())

//* SETTINGS -> PROFILE
router
  .get('/settings/profile', [ProfileController, 'index'])
  .as('settings.profile')
  .use(middleware.auth())
router
  .put('/settings/profile', [ProfileController, 'update'])
  .as('settings.profile.update')
  .use(middleware.auth())

//* CONCEPTS -> VIEW
router.get('/concepts', [IndexConceptsController, 'index']).use(middleware.auth())
router.get('/concepts/:slug', [IndexConceptsController, 'show']).use(middleware.auth())

//* MANAGEMENT DASHBOARD - ADMIN
router
  .group(() => {
    router.get('/', [ManagementDashboardController, 'index'])
  })
  .prefix('/manage')
  .use(middleware.auth())

// * CONCEPTS -> MANAGE
router
  .group(() => {
    router.get('/', [ManageConceptsController, 'index'])
    router.get('/:slug', [ManageConceptsController, 'show'])
    router.post('/', [ManageConceptsController, 'store'])
    router.put('/:slug', [ManageConceptsController, 'update'])
    router.put('/:slug/content', [ManageConceptsController, 'updateContent'])
    router.post('/:slug/questions/mcq', [ManageConceptsController, 'addMcq'])
    router.put('/:conceptSlug/questions/:questionSlug/mcq', [ManageConceptsController, 'updateMcq'])
    router.delete('/:conceptSlug/questions/:questionSlug', [ManageConceptsController, 'deleteMcq'])
    router.delete('/:slug', [ManageConceptsController, 'destroy'])
  })
  .prefix('/manage/concepts')
  .use(middleware.auth())

//* AUTH -> GOOGLE
router
  .group(() => {
    router.get('/redirect', [GoogleSignupController, 'redirect'])
    router.get('/callback', [GoogleSignupController, 'handleCallback'])
  })
  .prefix('/auth/google')
  .use(middleware.guest())

//* PAST PAPERS -> VIEW
router.get('/papers', [IndexPapersController, 'index']).use(middleware.auth())
router.get('/papers/:slug', [IndexPapersController, 'show']).use(middleware.auth())
router
  .get('/papers/:conceptSlug/:paperSlug', [IndexPapersController, 'view'])
  .use(middleware.auth())
router
  .post('/api/papers/record-response', [IndexPapersController, 'recordMcqResponse'])
  .use(middleware.auth())
router
  .post('/api/papers/record-saq-response', [IndexPapersController, 'recordSaqResponse'])
  .use(middleware.auth())
router
  .post('/api/papers/record-osce-response', [IndexPapersController, 'recordOsceResponse'])
  .use(middleware.auth())
router
  .get('/api/papers/:paperId/my-responses', [IndexPapersController, 'getMyResponses'])
  .use(middleware.auth())

// LEGAL -> TERMS
router.get('/terms', [TermsController, 'handle']).as('legal.terms')
router.get('/privacy', [PrivacyController, 'handle']).as('legal.privacy')

//* PAST PAPERS -> MANAGE
router
  .group(() => {
    router.get('/', [ManagePapersController, 'index'])
    router.get('/:slug', [ManagePapersController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [ManagePapersController, 'viewPaper'])
    router.post('/', [ManagePapersController, 'store'])
    router.post('/:conceptSlug/:paperSlug/questions/mcq', [
      ManagePapersController,
      'addMcqQuestion',
    ])
    router.post('/:conceptSlug/:paperSlug/questions/saq', [
      ManagePapersController,
      'addSaqQuestion',
    ])
    router.post('/:conceptSlug/:paperSlug/questions/mcq/upload', [
      ManagePapersController,
      'uploadMcqs',
    ])
    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/mcq', [
      ManagePapersController,
      'updateMcq',
    ])

    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/saq', [
      ManagePapersController,
      'updateSaq',
    ])
    router.put('/:conceptSlug/:paperSlug', [ManagePapersController, 'update'])
    router.delete('/:conceptSlug/:paperSlug/questions/:questionSlug', [
      ManagePapersController,
      'deleteQuestion',
    ])
    router.delete('/:conceptSlug/:paperSlug', [ManagePapersController, 'destroy'])
  })
  .prefix('/manage/papers')
  .use(middleware.auth())

router
  .group(() => {
    router.get('/users', [ManageUsersController, 'index'])
    router.put('/users/:id/role', [ManageUsersController, 'updateRole'])
  })
  .prefix('/manage')
  .use(middleware.auth())

//* CONCEPTS -> SEARCH
router.get('/api/concepts/search', [IndexConceptsController, 'search']).use(middleware.auth())
// router
//   .get('/api/concepts/recent-searches', [IndexConceptsController, 'recentSearches'])
//   .use(middleware.auth())
// router.get('/api/concepts/store-selected-concept', [
//   IndexConceptsController,
//   'storeSelectedConcept',
// ])

//* MANAGE CONCEPTS -> SEARCH
router
  .get('/api/manage/concepts/search', [ManageConceptsController, 'search'])
  .use(middleware.auth())
// router
//   .get('/api/manage/concepts/recent-searches', [ManageConceptsController, 'recentSearches'])
//   .use(middleware.auth())
// router
//   .get('/api/manage/concepts/store-selected-concept', [
//     ManageConceptsController,
//     'storeSelectedConcept',
//   ])
//   .use(middleware.auth())

//* UPLOAD IMAGE -> CLOUDINARY
router.post('/api/upload-image', [UploadImageController, 'store']).use(middleware.auth())
router
  .get('/test/upload', ({ inertia }) => {
    return inertia.render('test/upload')
  })
  .use(middleware.auth())

//* MANAGE INSTITUTIONS
router
  .group(() => {
    router.get('/', [ManageInstitutionsController, 'index'])
    router.get('/:id', [ManageInstitutionsController, 'show'])
    router.post('/', [ManageInstitutionsController, 'store'])
    router.put('/:id', [ManageInstitutionsController, 'update'])
    router.put('/:id/courses', [ManageInstitutionsController, 'updateCourses'])
    router.delete('/:id', [ManageInstitutionsController, 'destroy'])
  })
  .prefix('/manage/institutions')
  .use(middleware.auth())

//* OSCE: VIEW
router
  .group(() => {
    router.get('/', [IndexOsceController, 'index'])
    router.get('/:slug', [IndexOsceController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [IndexOsceController, 'viewPaper'])
  })
  .prefix('/osce')
  .use(middleware.auth())

//* OSCE: MANAGE
router
  .group(() => {
    router.get('/', [ManageOsceController, 'index'])
    router.get('/:slug', [ManageOsceController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [ManageOsceController, 'viewOscePaper'])
    router.post('/', [ManageOsceController, 'store'])
    router.post('/:conceptSlug/:paperSlug/questions', [ManageOsceController, 'addQuestion'])
    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/osce', [
      ManageOsceController,
      'updateQuestion',
    ])
    router.delete('/:conceptSlug/:paperSlug/questions/:questionSlug', [
      ManageOsceController,
      'deleteQuestion',
    ])
    router.patch('/:paperSlug', [ManageOsceController, 'update'])
    router.delete('/:conceptSlug/:paperSlug', [ManageOsceController, 'destroy'])
  })
  .prefix('/manage/osce')
  .use(middleware.auth())

//* CITE -> CITATION_JS
router.post('/api/cite', [CiteController, 'store']).use(middleware.auth())
router
  .get('/test/cite', ({ inertia }) => {
    return inertia.render('test/cite')
  })
  .use(middleware.auth())

// Question Feedback Routes
router.post('/questions/:id/feedback', [QuestionFeedbackController, 'store']).use(middleware.auth())

router.get('/manage/feedback', [ManageFeedbackController, 'index']).use(middleware.auth())
router
  .post('/manage/feedback/:id/resolve', [ManageFeedbackController, 'markAsResolved'])
  .use(middleware.auth())
router
  .post('/api/feedback/:id/resolve', [ManageFeedbackController, 'markAsResolved'])
  .use(middleware.auth())
