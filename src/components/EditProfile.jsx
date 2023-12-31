import React, { useRef, useState, useEffect } from "react";
import avatar from "../images/avatar.png";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function EditProfile({ onClose, firstLogIn, isNotFirstLogin }) {
  const [data, setData] = useState(null);
  const [picture, setPicture] = useState("");
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const currentUser = useSelector(selectCurrentUser);

  /* Loading profile data from firebase */

  useEffect(() => {
    onSnapshot(doc(db, "users", currentUser), (doc) => {
      setData(doc.data().perfil);
    });
  }, [currentUser]);

  useEffect(() => {
    if (data) {
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhoneNumber(data.phoneNumber);
      setUserEmail(data.userEmail);
      setPhoto(data.photo || "");
    }
  }, [data]);

  const [errorProfile, setErrorProfile] = useState("");

  const handleFileInputChange = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      setPicture(file);
      setPhoto(() => URL.createObjectURL(file));
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    if (firstLogIn && (!firstName || !lastName || !userEmail)) {
      setErrorProfile(
        "You need to fill the First Name, Last Name and Email before you proceed"
      );
      return;
    }

    const dbPath = doc(db, "users", currentUser);

    const storage = getStorage();
    const storageRef = ref(storage, `users/${currentUser}/profilePicture`);

    if (picture) {
      // Upload new profile picture if available
      await uploadBytes(storageRef, picture);
    }

    const pictureUrl = picture ? await getDownloadURL(storageRef) : photo;

    const perfil = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      photo: pictureUrl,
      userEmail: userEmail,
      perfilCompleted: true,
    };

    await updateDoc(dbPath, {
      perfil,
    });
    isNotFirstLogin();
    onClose();
  };

  return (
    <>
      <div>
        {firstLogIn && (
          <div>
            <p className="text-[#733A7E] text-sm ml-2 ">
              <span className="font-bold">Welcome to our ChatApp.</span>
              <br /> Please complete your profile before using our app
            </p>
          </div>
        )}
        <h3 className="text-black text-center text-xl mt-2">Edit Profile</h3>
        <div>
          <img
            src={photo || avatar}
            alt="/"
            className="w-[80px] m-auto mt-2 cursor-pointer rounded-[50%] h-[80px] object-cover"
            onClick={() => fileInputRef.current.click()}
          />
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
        <form className="w-[85%] mx-auto">
          <div>
            <p className="text-black  font-semibold mt-2">First Name:</p>
            <input
              type="text"
              className="border-b border-black border-opacity-30 w-full  text-black mt-1 outline-none "
              onChange={(event) => {
                setFirstName(event.target.value);
                setErrorProfile("");
              }}
              value={firstName}
            />
          </div>
          <div>
            <p className="text-black  font-semibold mt-2">Last Name:</p>
            <input
              type="text"
              className="border-b border-black border-opacity-30 w-full  text-black mt-1 outline-none "
              onChange={(event) => {
                setLastName(event.target.value);
                setErrorProfile("");
              }}
              value={lastName}
            />
          </div>
          <div>
            <p className="text-black  font-semibold mt-2">Phone Number:</p>
            <input
              type="text"
              className="border-b border-black border-opacity-30 w-full  text-black mt-1 outline-none "
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setErrorProfile("");
              }}
              value={phoneNumber}
            />
          </div>
          <div>
            <p className="text-black font-semibold mt-2">Email:</p>
            <input
              type="text"
              className="border-b border-black border-opacity-30 w-full  text-black mt-1 outline-none "
              onChange={(event) => {
                setUserEmail(event.target.value);
                setErrorProfile("");
              }}
              value={userEmail}
            />
          </div>
          {errorProfile && (
            <p className="text-sm text-red-800 my-2 text-center">
              {errorProfile}
            </p>
          )}
          <div className="flex justify-around ">
            <motion.button
              className="text-black bg-[white] border-2 border-opacity-30 border-black px-7 font-semibold rounded-xl hover:bg-[#733A7E]  hover:text-white mt-3 mb-2 "
              whileTap={{ scale: 0.99, y: 2 }}
              onClick={updateProfile}
            >
              Update
            </motion.button>
            {firstLogIn ? (
              ""
            ) : (
              <motion.button
                className="text-black bg-[white] border-2 border-opacity-30 border-black px-7 font-semibold rounded-xl hover:bg-[#733A7E]  hover:text-white mt-3 mb-2 "
                whileTap={{ scale: 0.99, y: 2 }}
                onClick={() => onClose()}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

export default EditProfile;
