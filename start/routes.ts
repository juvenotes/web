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
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const HomeController = () => import('#controllers/home_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const GoogleSignupController = () => import('#controllers/auth/google_signup_controller')
const ForgotPasswordController = () => import('#controllers/auth/forgot_password_controller')
const ProfileController = () => import('#controllers/settings/profile_controller')
const AccountController = () => import('#controllers/settings/account_controller')
const IndexConceptsController = () => import('#controllers/concepts/index_controller')
const ManageConceptsController = () => import('#controllers/manage/concepts/index_controller')
const IndexQuestionsController = () => import('#controllers/questions/index_controller')
// const ManageQuestionsController = () => import('#controllers/manage/questions_controller')
const IndexPapersController = () => import('#controllers/papers/index_controller')
const UserDashboardController = () => import('#controllers/dashboard/index_controller')
const PersonalizationController = () => import('#controllers/personalization/index_controller')
// const ManagePapersController = () => import('#controllers/manage/papers_controller')
const ManagementDashboardController = () => import('#controllers/manage/dashboard/index_controller')
//terns and privacy
const TermsController = () => import('#controllers/legal/terms_controller')
const PrivacyController = () => import('#controllers/legal/privacy_controller')

//* HOME
router.get('/', [HomeController, 'index']).as('home')

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
  .get('/personalization', [PersonalizationController, 'show'])
  .as('auth.personalize.show')
  .use(middleware.auth())

router
  .post('/onboarding', [PersonalizationController, 'store'])
  .as('auth.personalize.store')
  .use(middleware.auth())

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

//* QUESTIONS -> VIEW
router
  .group(() => {
    // router.get('/', [IndexQuestionsController, 'index'])
    router.get('/:conceptSlug', [IndexQuestionsController, 'show'])
  })
  .prefix('/vault')
  .use(middleware.auth())

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
    router.delete('/:slug', [ManageConceptsController, 'destroy'])
  })
  .prefix('/manage/concepts')
  .use(middleware.auth())

//* QUESTIONS -> MANAGE
// router
//   .group(() => {
//     router.get('/', [ManageQuestionsController, 'index'])
//     router.get('/:slug', [ManageQuestionsController, 'show'])
//     router.post('/', [ManageQuestionsController, 'store'])
//     router.put('/:slug', [ManageQuestionsController, 'update'])
//     router.delete('/:slug', [ManageQuestionsController, 'destroy'])
//   })
//   .prefix('/manage/questions')

// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead
  // return AutoSwagger.default.rapidoc("/swagger", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})

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
// router.get('/papers/:slug', [IndexPapersController, 'show'])

// LEGAL -> TERMS
router.get('/terms', [TermsController, 'handle']).as('legal.terms')
router.get('/privacy', [PrivacyController, 'handle']).as('legal.privacy')

//* PAST PAPERS -> MANAGE
// router
//   .group(() => {
//     router.get('/', [ManagePapersController, 'index'])
//     router.get('/:slug', [ManagePapersController, 'show'])
//     // router.post('/', [ManagePapersController, 'store'])
//     // router.put('/:slug', [ManagePapersController, 'update'])
//     // router.delete('/:slug', [ManagePapersController, 'destroy'])
//     router.get('/:slug/questions/new', [ManagePapersController, 'createQuestion'])
//     router.post('/:slug/questions', [ManagePapersController, 'addQuestion'])
//     router.get('/:slug/questions/:questionSlug/edit', [ManagePapersController, 'editQuestion'])
//     router.delete('/:slug/questions/:questionSlug', [ManagePapersController, 'removeQuestion'])
//   })
//   .prefix('/manage/papers')
