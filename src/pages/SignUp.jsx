import fundoMetade from "../images/fundoMetade.jpg";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useFormik } from "formik";
import { signUpSchema } from "../schemas/schemas";
import { signUp } from "../store/authReducer";
import mobileTexting from "../images/mobileTexting.svg";

function SignUp() {
  /* password stuff */
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [confirmPasswordIsVisible, setConfirmPasswordIsVisible] =
    useState(false);

  const handlerPasswordVisible = (id) => {
    if (id === 1) {
      setPasswordIsVisible((lastState) => !lastState);
    }

    if (id === 2) {
      setConfirmPasswordIsVisible((lastState) => !lastState);
    }
  };

  /* form validation and onSubmit */

  const [sendValidationEmail, setSendValidationEmail] = useState(false);

  const onSubmit = async (values, actions) => {
    const { email, password, confirmedPassword } = formik.values;

    if (confirmedPassword === password) {
      try {
        const x = await signUp(email, password);
        console.log(x);
        actions.resetForm();
        setSendValidationEmail(true);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmedPassword: "",
    },
    validationSchema: signUpSchema,
    onSubmit,
  });

  return (
    <div className="fixed bg-white w-screen h-screen">
      <div className="max-w-screen-2xl mx-auto relative flex justify-center gap-10 items-center">
        <h1 className="absolute md:hidden top-4 mx-auto text-center text-[#596F7A] w-full font-bold text-4xl z-10">
          <span>ChatApp</span>
          <br />
          <br />
          <span className="text-lg">Instant communication at your fingers</span>
        </h1>

        <div className="flex h-screen items-center mt-20 ">
          <div className="shadow-2xl border-2 flex lg:flex-row rounded-lg relative">
            <img
              src={mobileTexting}
              alt="/"
              className="w-[150px] h-[150px] absolute md:hidden top-[-131px]"
            />
            <div className="flex flex-col justify-center z-20  md:bg-[#3a1641] bg-center p-8 rounded-l-lg">
              <div className="bg-[white]/10  w-[300px] md:min-w-[340px] mx-auto  rounded-md  min-h-[250px] ">
                <form className="m-4 p-2" onSubmit={formik.handleSubmit}>
                  <div className="pt-2 flex flex-col">
                    {/* Email */}
                    <label
                      htmlFor="email"
                      className="text-[#596F7A] font-medium"
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.errors.email && formik.touched.email
                          ? "my-1 pl-1 rounded-sm outline-none w-full border border-red-400"
                          : "my-1 pl-1 rounded-sm outline-none w-full border border-black border-opacity-30 text-black"
                      }
                    />{" "}
                    {formik.errors.email && formik.touched.email && (
                      <p className="text-xs text-red-400">
                        {formik.errors.email.charAt(0).toUpperCase() +
                          formik.errors.email.slice(1)}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex flex-col">
                    {/*Password*/}
                    <label
                      htmlFor="password"
                      className="text-[#596F7A] font-medium"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordIsVisible ? "text" : "password"}
                        id="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.errors.password && formik.touched.password
                            ? "my-1 pl-1 rounded-sm outline-none w-full border border-red-400"
                            : "my-1 pl-1 rounded-sm outline-none w-full border border-black border-opacity-30 text-black"
                        }
                      />
                      {formik.errors.password && formik.touched.password && (
                        <p className="text-xs text-red-400">
                          {formik.errors.password.charAt(0).toUpperCase() +
                            formik.errors.password.slice(1)}
                        </p>
                      )}
                      {passwordIsVisible ? (
                        <AiFillEyeInvisible
                          onClick={() => handlerPasswordVisible(1)}
                          className="absolute top-2 right-2 cursor-pointer"
                        />
                      ) : (
                        <AiFillEye
                          onClick={() => handlerPasswordVisible(1)}
                          className="absolute top-2 right-2 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                  <div className="pt-2 flex flex-col">
                    {/*Confirmed Password*/}
                    <label
                      htmlFor="confirmPassword"
                      className="text-[#596F7A] font-medium"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={confirmPasswordIsVisible ? "text" : "password"}
                        id="confirmedPassword"
                        value={formik.values.confirmedPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.errors.confirmedPassword &&
                          formik.touched.confirmedPassword
                            ? "my-1 pl-1 rounded-sm outline-none w-full border border-red-400"
                            : "my-1 pl-1 rounded-sm outline-none w-full border border-black border-opacity-30 text-black"
                        }
                      />
                      {formik.errors.confirmedPassword &&
                        formik.touched.confirmedPassword && (
                          <p className="text-xs text-red-400">
                            {formik.errors.confirmedPassword
                              .charAt(0)
                              .toUpperCase() +
                              formik.errors.confirmedPassword.slice(1)}
                          </p>
                        )}
                      {confirmPasswordIsVisible ? (
                        <AiFillEyeInvisible
                          onClick={() => handlerPasswordVisible(2)}
                          className="absolute top-2 right-2 "
                        />
                      ) : (
                        <AiFillEye
                          onClick={() => handlerPasswordVisible(2)}
                          className="absolute top-2 right-2 "
                        />
                      )}
                    </div>
                  </div>
                  <button className="bg-[#328da6] hover:bg-[#44BFE1] active:#205a6a focus:outline-none focus:ring  mt-4 border-none w-full px-2  rounded-sm font-bold text-white">
                    Sign Up
                  </button>
                  {sendValidationEmail && (
                    <>
                      <p className="text-xs text-green-300 mt-2">
                        An email with the validation link has been sent to your
                        Email!
                      </p>
                      <p className="text-xs mt-2">
                        (You might need to check your spam box if you don't find
                        your email)
                      </p>
                    </>
                  )}
                  <div className="mt-2 text-center text-[#44BFE1] font-bold ">
                    <span>Have an Account? </span>
                    <Link to="/">
                      <span className="hover:cursor-pointer underline decoration-2">
                        Sign in
                      </span>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
            <div className=" hidden md:flex md:flex-col h-[100%] ml-4 my-2">
              <h1 className="hidden md:block top-4 ml-0 mb-2 text-[#733A7E] font-semibold text-2xl text-left z-20">
                <span className="text-4xl font-bold">ChatApp</span> <br />
                Instant communication <br /> at your fingers{" "}
              </h1>
              <img src={fundoMetade} alt="/" className="w-[400px] mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
