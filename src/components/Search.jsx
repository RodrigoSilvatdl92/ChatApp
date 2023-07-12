import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { db } from "../firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import { BsPersonFillAdd } from "react-icons/bs";
import avatar from "../images/avatar.png";

function Search() {
  const currentUser = useSelector(selectCurrentUser);
  const [registredUsers, setRegisteredUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchedUser, setSearchedUser] = useState("");

  /***********************************************/
  /*Clicking Outside of search input cleans the input value */
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchInput("");
        setSearchedUser("");
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /* fetch registred users of the app */
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data().perfil,
      }));

      setRegisteredUsers(users);
    };

    fetchUsers();
  }, []);

  /***********************************************/
  /* search users registred */

  const handlerSearchProfile = () => {
    const searchValue = searchInput.toLowerCase();

    const filteredUser = registredUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue) ||
        `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`.includes(
          searchValue
        )
    );
    const finalFilteredUser = filteredUser.filter(
      (user) => user.id !== currentUser
    );

    setSearchedUser(finalFilteredUser);
  };

  /***********************************************/
  /* Send friends requests */

  const sendFriendRequest = async (senderId, recipientId) => {
    try {
      if (recipientId === senderId) {
        console.log("Cannot send friend request to oneself");
        return;
      }

      const userRef = doc(db, "users", currentUser);
      const userSnap = await getDoc(userRef);
      const recipientRef = doc(db, "users", recipientId);
      const recipientSnap = await getDoc(recipientRef);
      console.log(userSnap.data().friends);

      if (userSnap.data().friends.includes(recipientId)) {
        console.log("The recipient is already your friend");
        return;
      }
      console.log(userSnap.data().friendRequests.received);
      const receivedFriendRequests = userSnap.data().friendRequests.received;
      const existingRequest = receivedFriendRequests.find(
        (friend) => friend.sender === recipientId
      );

      if (existingRequest) {
        console.log("The recipient already sent you a friend request");
        return;
      }

      if (recipientSnap.exists()) {
        const recipientData = recipientSnap.data();
        const receivedRequests = recipientData.friendRequests.received || [];
        const friends = recipientData.friends || [];

        // Check if the recipient is already a friend
        if (friends.includes(senderId)) {
          console.log("The recipient is already your friend");
          return;
        }

        // Check if there is an existing friend request from the sender to the recipient
        const existingRequest = receivedRequests.find(
          (request) =>
            request.sender === senderId && request.status === "pending"
        );

        if (existingRequest) {
          throw new Error("Friend request already sent");
        }

        const friendRequest = {
          sender: senderId,
          status: "pending",
        };

        // Add the friend request to the recipient's friendRequests.received array
        await updateDoc(recipientRef, {
          "friendRequests.received": arrayUnion(friendRequest),
        });
        console.log("Friend request sent successfully");
      } else {
        throw new Error("Recipient not found");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <>
      <div className="relative rounded-lg w-[280px]" ref={searchContainerRef}>
        <input
          type="text"
          placeholder="Search"
          className="pl-7 w-full outline-none bg-white rounded-lg shadow-gray-400 shadow-inner "
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            handlerSearchProfile();
          }}
        />
        <AiOutlineSearch size={20} className="absolute top-1 left-1" />
        {searchedUser && (
          <div className="bg-[#efeeee] w-full border-black absolute px-2 z-20 max-h-[225px] overflow-auto ">
            {searchedUser.map((user) => (
              <div
                key={user.id}
                className="flex items center border-b border-black  border-opacity-20"
              >
                <div className=" flex items-center border-r-2 border-black border-opacity-30 pr-1 my-1 cursor-pointer">
                  <BsPersonFillAdd
                    size={20}
                    className="text-[#733A7E]"
                    onClick={() => sendFriendRequest(currentUser, user.id)}
                  />
                </div>
                <div>
                  <span className="text-black text-md font-semibold ml-1">
                    {user.firstName}{" "}
                  </span>
                  <span className="text-black text-md font-semibold">
                    {user.lastName}
                  </span>
                  <p className="text-black text-sm ml-1">{user.userEmail}</p>
                </div>
                <div className=" flex items-center ml-auto">
                  <img
                    src={user.photo || avatar}
                    alt="/"
                    className="w-[30px] h-[30px] rounded-[50%] object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Search;
