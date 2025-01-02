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

router.on('/').renderInertia('home')
router.on('/learn').renderInertia('dashboard')

const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const GoogleSignupController = () => import('#controllers/auth/google_signup_controller')
const ForgotPasswordController = () => import('#controllers/auth/forgot_password_controller')
const ProfileController = () => import('#controllers/settings/profile_controller')
const AccountController = () => import('#controllers/settings/account_controller')
const IndexConceptsController = () => import('#controllers/concepts/index_controller')
const ManageConceptsController = () => import('#controllers/manage/concepts_controller')
const IndexQuestionsController = () => import('#controllers/questions/index_controller')
const ManageQuestionsController = () => import('#controllers/manage/questions_controller')

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
router.get('/concepts', [IndexConceptsController, 'index'])
router.get('/concepts/:slug', [IndexConceptsController, 'show'])

//* QUESTIONS -> VIEW
router
  .group(() => {
    // router.get('/', [IndexQuestionsController, 'index'])
    router.get('/:conceptSlug', [IndexQuestionsController, 'show'])
  })
  .prefix('/vault')

//* CONCEPTS -> MANAGE
router
  .group(() => {
    router.get('/', [ManageConceptsController, 'index'])
    router.post('/', [ManageConceptsController, 'store'])
    router.get('/:slug', [ManageConceptsController, 'show'])
    router.put('/:slug', [ManageConceptsController, 'update'])
    router.put('/:slug/content', [ManageConceptsController, 'updateContent'])
    router.delete('/:slug', [ManageConceptsController, 'destroy'])
  })
  .prefix('/manage/concepts')

//* QUESTIONS -> MANAGE
router
  .group(() => {
    router.get('/', [ManageQuestionsController, 'index'])
    router.post('/', [ManageQuestionsController, 'store'])
    router.put('/:slug', [ManageQuestionsController, 'update'])
    router.delete('/:slug', [ManageQuestionsController, 'destroy'])
  })
  .prefix('/manage/questions')

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
  .prefix('/google')
  .use(middleware.guest())
