import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useState, useRef } from "react";
import { db } from "../firebase";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import { MdEmojiEmotions } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { AiOutlinePaperClip } from "react-icons/ai";
import EmojiPicker from "emoji-picker-react";
import { BsFillSendFill } from "react-icons/bs";
import { selectConversationUser } from "../store/authReducer";
import { useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function Conversation({ onClose }) {
  const currentUser = useSelector(selectCurrentUser);
  const otherUser = useSelector(selectConversationUser);
  const [otherUserData, setOtherUserData] = useState("");
  const [conversation, setConversation] = useState();
  const conversationContainerRef = useRef(null);
  console.log(otherUser);
  /***********************************************************/
  /* scroll to the last message */

  const scrollToBottom = () => {
    if (conversationContainerRef.current) {
      const conversationContainer = conversationContainerRef.current;
      conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // load data from the otherUser
    if (otherUser) {
      const fetchDataFromOtherUser = async () => {
        const userRef = doc(db, "users", otherUser);
        const otherUserSnap = await getDoc(userRef);
        setOtherUserData(otherUserSnap.data());
      };
      fetchDataFromOtherUser();
    }
  }, [otherUser]);

  /*************************************************/
  /* Input */

  const [message, setMessage] = useState("");

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  /*************************************************/
  /* Emojis */

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    setMessage((lastState) => lastState + emoji.emoji);
  };

  /* Closing EmojiPicker when clicking outside of The div*/

  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /*************************************************/
  /* files */
  const fileInputRef = useRef(null);
  const [file, setFile] = useState("");

  const handleFileInputChange = () => {
    const selectedFile = fileInputRef.current.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const fileName = selectedFile.name;

      setMessage((lastState) => lastState + fileName);
    }
  };

  /***************************************************************/
  /* Logic for sending messages */
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const addMessageToConversation = async (
    currentUser,
    receiverUser,
    message
  ) => {
    /* disable send button if no message or no user selected */
    if (receiverUser && message) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
      return;
    }

    const currentUserRef = doc(db, "users", currentUser);
    const receiverUserRef = doc(db, "users", receiverUser);

    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data();

    const receiverUserSnap = await getDoc(receiverUserRef);
    const receiverUserData = receiverUserSnap.data();

    if (currentUserData && receiverUserData) {
      const currentUserConversations = currentUserData.conversations || {};
      const receiverUserConversations = receiverUserData.conversations || {};

      // Update conversation for the current user
      if (!currentUserConversations[receiverUser]) {
        currentUserConversations[receiverUser] = {
          messages: [],
          messageCount: 0,
        };
      }

      const updatedMessage = { ...message, timestamp: null };

      currentUserConversations[receiverUser].messages.push(updatedMessage);

      // Set the correct timestamp for the updated message
      const currentTimestamp = new Date();
      updatedMessage.timestamp = currentTimestamp.toISOString();

      await updateDoc(currentUserRef, {
        conversations: currentUserConversations,
      });

      // Update conversation for the receiver user
      if (!receiverUserConversations[currentUser]) {
        receiverUserConversations[currentUser] = {
          messages: [],
          messageCount: 0,
        };
      }
      // Increment the message count for the receiver user's conversation

      receiverUserConversations[currentUser].messages.push(updatedMessage);
      receiverUserConversations[currentUser].messageCount += 1;

      await updateDoc(receiverUserRef, {
        conversations: receiverUserConversations,
      });

      console.log("Message added to conversation successfully");
    } else {
      console.error("One or both users not found");
    }
  };

  console.log(message);

  const handleSendMessage = async () => {
    if ((!otherUser && !message) || !otherUser || !message) {
      return setButtonDisabled(true);
    }
    // Prepare the message object
    const messageObj = {
      sender: currentUser,
      content: message,
      timestamp: new Date().toISOString(), // Use ISO string for timestamp with hours, minutes, and seconds
      file: null, // Placeholder for the file object
    };

    // Check if a file is attached
    if (file) {
      try {
        // Prepare the file object
        const fileObj = {
          name: file.name,
          type: file.type,
          url: "", // Placeholder for the uploaded file URL
        };

        // Upload the file to storage and get the download URL
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `conversations/${currentUser}/${otherUser}/${file.name}`
        );
        await uploadBytes(storageRef, file);

        // Listen for upload completion
        const fileURL = await getDownloadURL(storageRef);

        // Update the file object
        fileObj.url = fileURL;
        messageObj.file = fileObj;

        // Add the message to the conversation

        await addMessageToConversation(currentUser, otherUser, messageObj);

        // Clear the file input
        setFile(null);
      } catch (error) {
        console.error("Error sending file:", error);
        return;
      }
    } else {
      // No file attached, add the message to the conversation

      await addMessageToConversation(currentUser, otherUser, messageObj);
    }

    // Clear the message input
    setMessage("");
  };

  /***********************************************************************/
  /* Load Conversation */
  useEffect(() => {
    const currentUserRef = doc(db, "users", currentUser);
    const unsubscribe = onSnapshot(currentUserRef, async (currentUserSnap) => {
      const currentUserData = currentUserSnap.data();
      const conversations = currentUserData.conversations;

      // Reset messageCount to 0 for the otherUser
      if (conversations[otherUser]) {
        conversations[otherUser].messageCount = 0;
        await updateDoc(currentUserRef, { conversations });
      }

      const filteredConversation = conversations[otherUser]?.messages;
      setConversation(filteredConversation);
    });

    return () => {
      unsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
    };
  }, [currentUser, otherUser]);

  /********************************************************************/
  /* converter time stamp  */

  function convertTimestamp(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);

    return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
  }

  console.log(conversation);
  return (
    <>
      <div className="h-[10%] border-b border-black/30">
        <div className="flex justify-between">
          <div className="flex gap-2 items-center w-full ">
            {otherUserData === "" || !otherUser ? (
              <p className="mx-auto w-full] mt-2">Start a conversation</p>
            ) : (
              <>
                <img
                  src={otherUserData?.perfil?.photo}
                  alt="/"
                  className="w-[30px] h-[30px] xl:w-[50px] xl:h-[50px]  rounded-[50%] ml-2 object-cover mt-2"
                />
                <p>
                  {`${
                    otherUserData === "" ? "" : otherUserData?.perfil?.firstName
                  } ${
                    otherUserData === "" ? "" : otherUserData?.perfil?.lastName
                  }`}
                </p>
              </>
            )}
          </div>
          <div
            className="text-[#61397F] flex items-center mr-2 md:hidden"
            onClick={onClose}
          >
            <AiOutlineCloseCircle size={20} />
          </div>
        </div>
      </div>
      <div className="h-[90%]  overflow-hidden ">
        <div
          ref={conversationContainerRef}
          id="conversationContainer"
          className="h-[85%] overflow-y-scroll scrollbar-none scroll-smooth"
        >
          {otherUser &&
            conversation &&
            conversation.map((message) => (
              <div key={message.timestamp}>
                {message.file === null ? (
                  <div
                    className={
                      message.sender === currentUser
                        ? "flex justify-end my-1 mr-1 mb-1 p-1"
                        : "flex justify-start  my-1 ml-1 mb-1 p-1"
                    }
                  >
                    <div
                      className={
                        message.sender === currentUser
                          ? " bg-[#596F7A] flex flex-col rounded-lg"
                          : "bg-[#61397F] flex flex-col rounded-lg"
                      }
                    >
                      <span
                        className={
                          message.sender === currentUser
                            ? " bg-[#596F7A] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                            : "bg-[#61397F] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                        }
                      >
                        {message.content}
                      </span>
                      <span className="text-white text-tiny p-1 text-right">
                        {convertTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={
                        message.sender === currentUser
                          ? " flex items-end mt-1 mr-1 mb-1 flex-col rounded-lg "
                          : " flex items-start mt-1 ml-1 mb-1 flex-col rounded-lg"
                      }
                    >
                      <div
                        className={
                          message.sender === currentUser
                            ? " bg-[#596F7A] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                            : "bg-[#61397F] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                        }
                      >
                        <img
                          src={message.file.url}
                          alt="/"
                          className="w-[120px] h-[120px] object-cover p-1"
                        />
                        <span
                          className={
                            message.sender === currentUser
                              ? " bg-[#596F7A] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                              : "bg-[#61397F] text-white  leading-3 text-xl mb-1 p-2 rounded-lg "
                          }
                        >
                          {message.content}
                        </span>
                        <p className="text-white text-tiny text-right mt-2">
                          {convertTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
        <div className="h-[15%] flex items-center justify-between border border-l-0 border-b-0 border-black/20">
          <div className="flex w-[100%] h-[100%] items-center">
            <div className="flex flex-col gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowEmojiPicker(true);
                }}
                className="ml-1"
              >
                <MdEmojiEmotions size={25} className="text-yellow-500 " />
              </button>
              <div className="relative">
                <AiOutlinePaperClip
                  size={25}
                  className="ml-1 cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>
            <div className="text-black relative w-[100%] h-[80%]  ">
              {showEmojiPicker && (
                <div
                  className="absolute bottom-[60px] left-[-30px] lg:bottom-[85px] lg:left-[-30px]"
                  // style={{
                  //   position: "absolute",
                  //   bottom: "85px",
                  //   left: "-30px",
                  // }}
                  ref={emojiPickerRef}
                >
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </div>
              )}
              <textarea
                value={message}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full px-1 pt-5 h-[100%] overflow-y-auto outline-none resize-none "
              />
            </div>
          </div>
          <div className="relative">
            <BsFillSendFill
              disabled={buttonDisabled}
              size={25}
              className={
                !otherUser || !message
                  ? "mr-1 pointer-evens none text-gray-500"
                  : "mr-1 cursor-pointer"
              }
              onClick={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Conversation;
