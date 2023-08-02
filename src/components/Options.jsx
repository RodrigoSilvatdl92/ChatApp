import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaUserFriends } from "react-icons/fa";
import avatar from "../images/avatar.png";
import { BiLogOutCircle } from "react-icons/bi";
import { LogOut } from "../store/authReducer";
import { useDispatch } from "react-redux";
import Modal from "./Modal";
import EditProfile from "./EditProfile";
import Profile from "./Profile";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import ModalFriends from "./ModalFriends";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { BsPersonFillAdd } from "react-icons/bs";
import { AiOutlineSearch } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { setConversationUser } from "../store/authReducer";

function Options({ setIsConversationSelected }) {
  const currentUser = useSelector(selectCurrentUser);
  /* show/edit Profile */
  const [displayProfile, setDisplayProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [firstLogInMessage, setFirstLogInMessage] = useState(false);

  useEffect(() => {
    const isProfileCompleted = async () => {
      const userDoc = doc(db, "users", currentUser);
      const userSnap = await getDoc(userDoc);

      const data = userSnap.data();

      console.log("a seguir a isto");
      console.log(data);
      if (data.perfil.perfilCompleted) {
        return;
      } else {
        setDisplayProfile(true);
        setEditProfile(true);
        setFirstLogInMessage(true);
      }
    };
    isProfileCompleted();
  }, [currentUser]);

  /* show friends */

  const [displayFriends, setDisplayFriends] = useState(false);
  const [displayFriendsRequests, setDisplayFriendsRequests] = useState(false);

  /********************************************/
  /* LOAD Friend Requests */

  const [requestsFriends, setRequestsFriends] = useState("");

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const userRef = doc(db, "users", currentUser);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const receivedRequests = userData.friendRequests.received || [];
          const pendingRequests = receivedRequests.filter(
            (request) => request.status === "pending"
          );

          setRequestsFriends(pendingRequests);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchFriendRequests();
  }, [currentUser]);

  /********************************************/
  /* LOAD Profile data and friends data  */
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState([]); // current user profile data
  const [profileFriends, setProfileFriends] = useState(); // current user friends

  useEffect(() => {
    const docRef = doc(db, "users", currentUser);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setProfileData(doc.data().perfil);
      setProfileFriends(doc.data().friends || []);
    });

    return () => {
      unsubscribe(); // Cleanup the listener when the component unmounts
    };
  }, [currentUser]);

  /********************************************/
  /* load data profile of friend requests received  */

  const [friendRequestData, setFriendRequestData] = useState([]);

  useEffect(() => {
    const fetchDataOfFriendsRequests = async () => {
      if (requestsFriends.length === 0) {
        setDisplayFriendsRequests(false);
        return setFriendRequestData([]);
      }
      try {
        const requests = requestsFriends.map((friendRequest) =>
          getDoc(doc(db, "users", friendRequest.sender))
        );

        const snapshots = await Promise.all(requests);
        const data = snapshots
          .filter((snapshot) => snapshot.exists())
          .map((snapshot) => snapshot.data());

        setFriendRequestData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDataOfFriendsRequests();
  }, [requestsFriends]);

  /********************************************/
  /* Accept Friend Requests */

  const acceptFriendRequest = async (requestId) => {
    try {
      console.log(requestId);
      // Filter the friend request from the friendRequest array
      const filteredRequests = requestsFriends.filter(
        (request) => request.sender !== requestId
      );

      // Remove the friend request from the Firebase collection of received friend requests
      const userRef = doc(db, "users", currentUser);
      await updateDoc(userRef, { "friendRequests.received": filteredRequests });
      setRequestsFriends(filteredRequests);

      // Add the accepted friend to the Firebase's friends array
      await updateDoc(doc(db, "users", currentUser), {
        friends: arrayUnion(requestId),
      });

      // Add the accepted friend to the Firebase's friends  array of the person who sends the friend request
      await updateDoc(doc(db, "users", requestId), {
        friends: arrayUnion(currentUser),
      });

      // Add the accepted friend to the profileFriends array
      const updatedProfileFriends = [...profileFriends, requestId];
      setProfileFriends(updatedProfileFriends);
    } catch (error) {
      console.log(error);
    }
  };
  /********************************************/
  /*Reject friend requests */

  const rejectFriendRequest = async (requestId) => {
    try {
      const filteredRequests = requestsFriends.filter(
        (request) => request.sender !== requestId
      );

      // Remove the friend request from the Firebase collection of received friend requests
      const userRef = doc(db, "users", currentUser);
      await updateDoc(userRef, { "friendRequests.received": filteredRequests });
      setRequestsFriends(filteredRequests);
    } catch (error) {
      console.log(error.message);
    }
  };

  /********************************************/
  /* Load Friend Data and Search Friends */

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // data of the filtered friends by search

  useEffect(() => {
    const loadDataOfFriends = async () => {
      if (!profileFriends) {
        return;
      }
      try {
        const profileDataFriends = profileFriends.map((friend) => {
          return getDoc(doc(db, "users", friend));
        });

        const snapshots = await Promise.all(profileDataFriends);
        const data = snapshots
          .filter((snapshot) => snapshot.exists())
          .map((snapshot) => snapshot.data());

        // Filter the friends based on the search query
        const filteredFriends = data.filter((friend) =>
          friend.perfil.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

        setSearchResults(filteredFriends);
      } catch (error) {
        console.log(error);
      }
    };

    loadDataOfFriends();
  }, [profileFriends, searchQuery]);

  /********************************************/
  /* Delete Friend */

  const deleteFriend = async (userId) => {
    // Delete friend on the currentUser
    const currentUserRef = doc(db, "users", currentUser);
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data();
    const filteredFriends = currentUserData.friends.filter(
      (friend) => friend !== userId
    );
    await updateDoc(currentUserRef, { friends: filteredFriends });

    // Delete currentUser on the userIdProfile
    const userIdRef = doc(db, "users", userId);
    const userIdSnap = await getDoc(userIdRef);
    const userData = userIdSnap.data();
    const filteredFriends2 = userData.friends.filter(
      (friend) => friend !== currentUser
    );
    await updateDoc(userIdRef, { friends: filteredFriends2 });
  };

  /********************************************/
  /* Start Conversation */

  const startConversation = (otherUser) => {
    dispatch(setConversationUser(otherUser));
    setDisplayFriends(false);
  };

  /********************************************/
  /* Open Friend Requests  */

  const handlerFriendsRequests = () => {
    if (requestsFriends.length === 0) {
      return;
    } else if (displayFriendsRequests === true) {
      return setDisplayFriendsRequests(false);
    } else {
      return setDisplayFriendsRequests(true);
    }
  };

  return (
    <>
      <div className="h-[95px] max-w-[900px] lg:h-[120px] bg-[#61397F] text-white rounded-bl-2xl rounded-br-2xl flex justify-around items-center ">
        <BiLogOutCircle
          size={30}
          title="Log Out"
          className="cursor-pointer md:hover:scale-110 outline-none"
          onClick={() => {
            dispatch(LogOut());
          }}
        />
        <CgProfile
          size={30}
          title="Profile"
          className="cursor-pointer md:hover:scale-110"
          onClick={() => setDisplayProfile(true)}
        />
        <FaUserFriends
          onClick={() => setDisplayFriends(true)}
          size={30}
          title="Friends"
          className="cursor-pointer md:hover:scale-110"
        />
        <div className="hidden md:block">
          <img
            src={profileData.photo || avatar}
            alt="/"
            className="w-[90px] hidden md:block rounded-[50%] h-[90px] object-cover border-4 border-white"
          />
        </div>
        <AnimatePresence>
          {displayProfile && (
            <Modal
              onClose={() => {
                setEditProfile(false);
                setDisplayProfile(false);
              }}
              firstLogIn={firstLogInMessage}
            >
              {editProfile ? (
                <EditProfile
                  onClose={() => setEditProfile(false)}
                  firstLogIn={firstLogInMessage}
                  isNotFirstLogin={() => setFirstLogInMessage(false)}
                />
              ) : (
                <Profile editProfile={() => setEditProfile(true)} />
              )}
            </Modal>
          )}

          {displayFriends && (
            <ModalFriends onClose={() => setDisplayFriends(false)}>
              <div>
                <div className="flex items-center justify-between mt-2">
                  <div className="relative z-20">
                    <button
                      className="text-black ml-2"
                      onClick={handlerFriendsRequests}
                    >
                      <BsPersonFillAdd
                        size={30}
                        title="Friends Requests"
                        className={
                          requestsFriends.length === 0
                            ? "text-black"
                            : "text-green-700"
                        }
                      />
                    </button>
                    <span
                      className={
                        requestsFriends.length === 0
                          ? "text-black text-sm absolute"
                          : "text-green-700 text-sm absolute"
                      }
                    >
                      {requestsFriends.length}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search friend..."
                      className="pl-5 text-black outline-none mr-4"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      value={searchQuery}
                    />
                    <AiOutlineSearch
                      size={20}
                      className="absolute text-black top-1 left-0"
                    />
                  </div>
                </div>

                <div
                  className={`mt-2 w-[90%] mx-auto h-[100%] flex flex-col ${
                    displayFriendsRequests && requestsFriends.length > 0
                      ? "blur-sm"
                      : ""
                  } `}
                >
                  <div className="overflow-y-auto h-[200px] md:h-[400px] ">
                    {searchResults.length > 0 ? (
                      searchResults.map((friend) => (
                        <div
                          className="border-b-2 pb-2 border-black/50"
                          key={friend.perfil.userEmail}
                        >
                          <div className="text-black flex justify-between items-center  mt-2 ">
                            <div>
                              <p className="font-bold">
                                {friend.perfil.firstName}{" "}
                                {friend.perfil.lastName}
                              </p>
                              <p>{friend.perfil.userEmail}</p>
                            </div>
                            <div>
                              <img
                                src={friend.perfil.photo || avatar}
                                alt="/"
                                className="w-[60px] h-[60px] rounded-[50%] object-cover"
                              />
                            </div>
                          </div>
                          <div>
                            <motion.button
                              className="text-black bg-[white] text-sm border-2 border-opacity-30 border-black px-7 font-semibold rounded-xl hover:bg-[#733A7E]  hover:text-white mt-3 mr-2 "
                              whileTap={{ scale: 0.99, y: 2 }}
                              onClick={() => {
                                startConversation(friend.perfil.userEmail);
                                setIsConversationSelected();
                              }}
                            >
                              Start Conversation
                            </motion.button>
                            <motion.button
                              className="text-black bg-[white] text-sm border-2 border-opacity-30 border-black px-4 font-semibold rounded-xl hover:bg-[#733A7E]  hover:text-white mt-3 "
                              whileTap={{ scale: 0.99, y: 2 }}
                              onClick={() =>
                                deleteFriend(friend.perfil.userEmail)
                              }
                            >
                              Delete Contact
                            </motion.button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>
                        <p className="text-black">No friends added</p>
                      </div>
                    )}
                  </div>
                </div>
                {displayFriendsRequests && (
                  <motion.div
                    initial={{ width: "0px" }}
                    animate={{ width: "80%" }}
                    exit={{ width: "0px" }}
                    transition={{ type: "tween", stiffness: 70, delay: 0.0 }}
                    className="fixed top-0 left-0 overflow-y-hidden w-[80%] h-[100%] bg-white z-10 rounded-tl-md"
                  >
                    {friendRequestData.map((friendRequest) => (
                      <motion.div
                        className="ml-1"
                        key={friendRequest.perfil.userEmail}
                        initial={{ x: "-100vw" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100vw" }}
                        transition={{
                          type: "tween",
                          stiffness: 70,
                          delay: 0.2,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mt-2 w-[70%] mx-auto ">
                          <div>
                            <p className="text-black font-semibold">
                              {friendRequest.perfil.firstName}{" "}
                              {friendRequest.perfil.lastName}
                            </p>
                            <p className="text-black">
                              {friendRequest.perfil.userEmail}
                            </p>
                          </div>
                          <div>
                            <img
                              src={friendRequest.perfil.photo || avatar}
                              alt="/"
                              className="hidden md:block w-[50px] h-[50px] rounded-[50%]"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center gap-5 mt-2">
                          <button
                            className="bg-green-700 px-2 rounded-xl"
                            onClick={() =>
                              acceptFriendRequest(
                                friendRequest.perfil.userEmail
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-700 px-2 rounded-xl"
                            onClick={() =>
                              rejectFriendRequest(
                                friendRequest.perfil.userEmail
                              )
                            }
                          >
                            Decline
                          </button>
                        </div>
                        <hr className="border border-black border-opacity-60 mt-2 mx-auto w-[90%]" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </ModalFriends>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default Options;
