import { handleLoginForm } from './controllers/login.controller.js';
import { managePageRoutes } from './controllers/product.controller.js';
import validateForms from './forms/forms.js';
import { handleSession } from './session/handleSession.js';

validateForms();
handleLoginForm();
handleSession();

managePageRoutes();