import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import avatar from "../images/avatar.png";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Profile({ editProfile }) {
  /* load do profile  */

  const [profileData, setProfileData] = useState([]);

  const currentUser = useSelector(selectCurrentUser);
  useEffect(() => {
    onSnapshot(doc(db, "users", currentUser), (doc) => {
      setProfileData(doc.data().perfil);
    });
  }, [currentUser]);

  return (
    <>
      <h3 className="text-black font-poppins text-center text-xl mt-2">
        Profile
      </h3>
      <div>
        <img
          src={profileData.photo || avatar}
          alt="/"
          className="w-[90px] m-auto mt-2 rounded-[50%] h-[90px] object-cover"
        />
      </div>
      <div className="w-full flex justify-center mt-2">
        <motion.button
          onClick={() => editProfile()}
          className="text-black bg-[white] border-2 border-opacity-30 border-black leanding-7 px-7 font-semibold rounded-xl  hover:scale-110 "
          whileTap={{ scale: 0.99, y: 2 }}
        >
          Edit Profile
        </motion.button>
      </div>
      <div className="w-[85%] mx-auto">
        <div>
          <p className="text-black font-semibold mt-2">First Name:</p>
          <p className="text-black mt-1 ">{profileData.firstName || ""}</p>
        </div>
        <div>
          <p className="text-black font-semibold mt-2">Last Name:</p>
          <p className="text-black mt-1">{profileData.lastName || ""}</p>
        </div>
        <div>
          <p className="text-black font-semibold mt-2">Phone Number:</p>
          <p className="text-black mt-1">{profileData.phoneNumber || ""}</p>
        </div>
        <div>
          <p className="text-black font-semibold mt-2">Email:</p>
          <p className="text-black mt-1 mb-2">{profileData.userEmail || ""}</p>
        </div>
      </div>
    </>
  );
}

export default Profile;
