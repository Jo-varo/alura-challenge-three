import { getErrorMessage } from './errors.js';
import { validInputs } from './validInputs.js';

export const validate = (input, form) => {
  let isValid = input.validity.valid;

  let TAValidators = { errorTextareaPattern: false, isValid, pattern: {} };

  if (input.type === 'textarea') {
    TAValidators = validateTextPattern(input, TAValidators);
    isValid = TAValidators.isValid;
  }

  if (isValid) {
    validInputs[form][input.name] = true;
    input.parentElement.classList.remove('invalid-input-group');
    input.parentElement.querySelector('.invalid-input-message').innerHTML = '';
  } else {
    validInputs[form][input.name] = false;
    input.parentElement.classList.add('invalid-input-group');
    input.parentElement.querySelector('.invalid-input-message').innerHTML =
      getErrorMessage(input, {
        errorTextareaPattern: TAValidators.errorTextareaPattern,
        pattern: TAValidators.pattern,
      });
  }

  handleSubmitButton(form);
};

//Function that validate that the textarea value satisfy the pattern
const validateTextPattern = (input, validators) => {
  const { value, validity, maxLength, minLength } = input;
  const pattern = { minN: minLength, maxN: maxLength };
  const textareaPattern = new RegExp(`^[\\s\\S]{${minLength},${maxLength}}$`);

  if (!validity['valueMissing']) {
    // executes only when there are text in the input
    if (textareaPattern.test(value)) {
      validators = { errorTextareaPattern: false, isValid: true, pattern };
    } else {
      validators = { errorTextareaPattern: true, isValid: false, pattern };
    }
  }
  return validators;
};

const handleSubmitButton = (form) => {
  const isValidForm = checkValidForm(form);
  const submitButton = document.querySelector(`.${form}-form .form-button`);
  submitButton.disabled = isValidForm ? false : true;
};

//Function that verifies that every input is valid
export const checkValidForm = (form) => {
  return Object.keys(validInputs[form]).reduce(
    (accumulator, value) => accumulator && validInputs[form][value],
    true
  );
};
