import * as yup from "yup";

const passwordRules =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,23}$/;

export const signUpSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid Email").required("Required"),
  password: yup
    .string()
    .min(7)
    .matches(passwordRules, {
      message:
        "Please create a Stronger Password between 8 to 23 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character",
    })
    .required("Required"),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password must match")
    .required("Required"),
});

export const logInSchema = yup.object().shape({
  email: yup.string().email().required("Required"),
  password: yup.string().required("Required"),
});
