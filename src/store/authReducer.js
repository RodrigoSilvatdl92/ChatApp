import { createSlice } from "@reduxjs/toolkit";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const initialState = {
  currentUser: "",
  error: null,
  otherUser: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.currentUser = action.payload.email;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setConversationUser(state, action) {
      state.otherUser = action.payload;
    },
  },
});

export const { setUser, setError, setConversationUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectError = (state) => state.auth.error;
export const selectConversationUser = (state) => state.auth.otherUser;
export const conversation = (state) => state.auth.conversation;

/* Sign up */

export const signUp = async (email, password) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log(user);

    await sendEmailVerification(user);
    await setDoc(doc(db, "users", email), {
      perfil: {
        perfilCompleted: false,
        firstName: "",
        lastName: "",
        photo: "",
        phoneNumber: "",
        userEmail: "",
      },
      conversations: {},
      friends: [],
      friendRequests: {
        sent: [],
        received: [],
      },
    });

    return { user: user, error: null };
  } catch (error) {
    console.log(error.message);
    return { user: null, error: error };
  }
};

/* Log in */

export const logIn = (email, password) => {
  return async (dispatch) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (user.emailVerified) {
        dispatch(setError(""));
        dispatch(setUser({ email: user.email, id: user.uid }));
      } else {
        throw new Error("Please verify your email before logging in");
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/user-not-found") {
        return dispatch(
          setError("User does not exist, please register an account ")
        );
      }
      if (error.code === "auth/wrong-password") {
        return dispatch(setError("Wrong Password"));
      }
      dispatch(setError(error.message));
    }
  };
};

/* Log Out */

export const LogOut = () => {
  return async (dispatch) => {
    try {
      await signOut(auth);
      dispatch(setUser(""));
      dispatch(setConversationUser(""));
    } catch (error) {
      console.log(error);
      dispatch(setError(error.message));
    }
  };
};

/* Recover Password */

export const recoverPassword = (email) => {
  return async (dispatch) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("recover password email sent");
      return dispatch(setError(null));
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        return dispatch(setError("We cannot find your email."));
      } else {
        return dispatch(setError("We cannot find your email."));
      }
    }
  };
};
