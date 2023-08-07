import fundoMetade from "../images/fundoMetade.jpg";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Modal from "../components/Modal";
import { motion } from "framer-motion";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logIn } from "../store/authReducer";
import { selectError } from "../store/authReducer";
import { setError } from "../store/authReducer";
import { selectCurrentUser } from "../store/authReducer";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { logInSchema } from "../schemas/schemas";
import { useFormik } from "formik";
import { recoverPassword } from "../store/authReducer";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { MdOutlineMail } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import mobileTexting from "../images/mobileTexting.svg";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* password stuff */
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);

  const handlerPasswordVisible = () => {
    setPasswordIsVisible((lastState) => !lastState);
  };

  /* formik validate */

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: logInSchema,
    onSubmit,
  });

  const hasError = useSelector(selectError);
  const currentUser = useSelector(selectCurrentUser);

  function onSubmit(values, actions) {
    const { email, password } = formik.values;

    try {
      dispatch(logIn(email, password));
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  /* forget password modal */

  const [emailResetPassword, setEmailResetPassword] = useState("");

  const [recoverPasswordEmailSent, setRecoverPasswordEmailSent] = useState("");

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className="fixed bg-white w-screen h-screen">
      <div className="max-w-screen-2xl mx-auto relative flex justify-center gap-10 items-center">
        <h1 className="absolute md:hidden top-4 mx-auto text-center text-[#596F7A] w-full font-bold text-4xl z-10">
          <span>ChatApp</span>
          <br />
          <br />
          <span className="text-lg">Instant communication at your fingers</span>
        </h1>

        <div className="flex h-screen items-center mt-20 md:mt-0 ">
          <div className="shadow-2xl border-2 flex lg:flex-row rounded-lg relative ">
            <img
              src={mobileTexting}
              alt="/"
              className="w-[150px] h-[150px] absolute md:hidden top-[-131px]"
            />
            <div className="flex flex-col justify-center z-20  md:bg-[#3a1641] bg-center p-8 rounded-l-lg">
              <div className="bg-[white]/10 w-[300px] md:min-w-[340px] mx-auto  rounded-md  min-h-[250px] ">
                <form className="m-4 p-2" onSubmit={formik.handleSubmit}>
                  <div className="pt-2 flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-[#596F7A] font-medium"
                    >
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.errors.email && formik.touched.email
                          ? "my-1 pl-1 rounded-sm outline-none w-full border border-red-400"
                          : "my-1 pl-1 rounded-sm outline-none w-full border border-black border-opacity-30 text-black"
                      }
                    />
                    {formik.errors.email && formik.touched.email && (
                      <p className="text-xs text-red-400">
                        {formik.errors.email.charAt(0).toUpperCase() +
                          formik.errors.email.slice(1)}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex flex-col">
                    <label
                      htmlFor="password"
                      className="text-[#596F7A] font-medium"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.errors.password && formik.touched.password
                            ? "my-1 pl-1 rounded-sm outline-none w-full border border-red-400"
                            : "my-1 pl-1 rounded-sm outline-none w-full border border-black border-opacity-30 text-black"
                        }
                        type={passwordIsVisible ? "text" : "password"}
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
                          className="absolute top-2 right-2 cursor-pointer "
                        />
                      )}
                    </div>
                  </div>
                  <motion.button
                    className="bg-[#328da6] hover:bg-[#44BFE1] active:#205a6a mt-4 border-none w-full px-2  rounded-sm font-bold text-white"
                    whileTap={{ scale: 0.99, y: 2 }}
                  >
                    Log In
                  </motion.button>
                  {hasError && modalIsOpen === false && (
                    <p className="text-xs text-red-400 mt-1">{hasError}</p>
                  )}
                  <Link to="/signUp">
                    <p className="mt-2 text-center text-[#596F7A] font-bold hover:cursor-pointer hover:underline">
                      Create Account
                    </p>
                  </Link>

                  <p
                    className="mt-2 text-center text-[#596F7A] font-bold underline decoration-2 hover:cursor-pointer"
                    onClick={function () {
                      setModalIsOpen(true);
                      dispatch(setError(""));
                    }}
                  >
                    Forgot Password?
                  </p>
                </form>
              </div>
            </div>
            <div className=" hidden md:flex md:flex-col h-[100%] ml-4 my-2">
              <h1 className="hidden md:block top-4 ml-0 mb-2 text-[#733A7E] font-semibold text-2xl text-left z-20">
                <span className="text-4xl font-bold">ChatApp</span> <br />
                <span className="text-2xl font-bold">
                  Instant communication
                </span>{" "}
                <br />
                <span className="text-2xl font-bold">at your fingers</span>
              </h1>
              <img src={fundoMetade} alt="/" className="w-[400px] mx-auto" />
            </div>
          </div>
        </div>

        {modalIsOpen && (
          <Modal onClose={() => setModalIsOpen(false)}>
            <AiOutlineExclamationCircle
              size={60}
              className="mx-auto text-blue-600 my-6"
            />
            <h3 className="text-xl font-bold text-center my-6">
              Forgot Password
            </h3>
            <p className="font-semibold px-2 text-center ">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <p className="text-xs text-center my-1">
              (You might need to check your spam box if you don't find your
              email)
            </p>
            <div className="relative w-[80%] mx-auto mt-6 mb-3">
              <input
                type="text"
                onChange={function (event) {
                  setEmailResetPassword(event.target.value);
                  dispatch(setError(""));
                  setRecoverPasswordEmailSent("");
                }}
                placeholder="example@example.com"
                className="w-full pl-7 outline-none"
              />
              <MdOutlineMail className="absolute top-1 left-2" />
            </div>

            {hasError && (
              <p className="text-xs text-red-600 text-center">{hasError}</p>
            )}
            {recoverPasswordEmailSent && hasError === null && (
              <p className="text-sm text-green-600 text-center">
                Recover password email has been sent!
              </p>
            )}
            <div className="w-[80%] mx-auto my-3">
              <motion.button
                onClick={function (e) {
                  try {
                    dispatch(recoverPassword(emailResetPassword));
                    setRecoverPasswordEmailSent(true);
                  } catch (error) {
                    console.log(error.message);
                  }
                }}
                className="w-[100%]  bg-[#61397F] rounded-md text-white hover:bg-[#733A7E]"
                whileTap={{ scale: 0.99, y: 2 }}
                type="button"
              >
                Submit
              </motion.button>
            </div>
            <div className="mx-auto flex justify-center items-center">
              <IoIosArrowBack size={20} />
              <p
                onClick={function () {
                  setModalIsOpen(false);
                  dispatch(setError(""));
                }}
                className="cursor-pointer"
              >
                Back to Login
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default SignIn;
