import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authReducer";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { setConversationUser } from "../store/authReducer";
import { AiOutlineCloseCircle } from "react-icons/ai";
import avatar from "../images/avatar.png";

function LastsConversations({ selectConversation }) {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  /*********************************************/
  /*  loading conversations */

  const [conversationsData, setConversationsData] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const currentUserRef = doc(db, "users", currentUser);

      const unsubscribe = onSnapshot(
        currentUserRef,
        async (currentUserSnap) => {
          const currentUserData = currentUserSnap.data();

          const conversations = currentUserData.conversations;
          const conversationsWithAdditionalData = [];

          for (const conversationId in conversations) {
            const conversationData = conversations[conversationId];
            const conversationRef = doc(db, "users", conversationId);
            const conversationSnap = await getDoc(conversationRef);
            const conversationUserData = conversationSnap.data();

            // Add additional data to the conversation object
            const conversationWithAdditionalData = {
              numberOfNewMessages: conversationData.messageCount,
              messages: Object.values(conversationData.messages),
              user: {
                photo: conversationUserData.perfil.photo,
                firstName: conversationUserData.perfil.firstName,
                lastName: conversationUserData.perfil.lastName,
                id: conversationId,
              },
            };

            conversationsWithAdditionalData.push(
              conversationWithAdditionalData
            );
          }
          // sort the last conversations by date of the last message
          const sortedArray = conversationsWithAdditionalData.sort((a, b) => {
            console.log(a);
            console.log(b);
            const x = new Date(a.messages[a.messages.length - 1].timestamp);
            const y = new Date(b.messages[b.messages.length - 1].timestamp);

            return y - x;
          });

          setConversationsData(sortedArray);
        }
      );

      return () => unsubscribe();
    };

    fetchConversations();
  }, [currentUser]);

  console.log(conversationsData);

  /********************************************************************/
  /* converter time stamp  */

  function convertTimestamp(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
  }
  console.log(conversationsData);

  /**********************************************************************/
  /* truncate string function */

  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength - 3) + "...";
    }
    return str;
  }

  /*************************************************/
  /* delete conversation from firestore */

  const deleteConversation = async (otherUserId) => {
    const currentUserRef = doc(db, "users", currentUser);
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data();
    const currentConversation = currentUserData.conversations;
    console.log(currentConversation);

    if (currentUserData.conversations[otherUserId]) {
      const updatedConversations = { ...currentConversation };
      delete updatedConversations[otherUserId];

      await updateDoc(currentUserRef, {
        conversations: updatedConversations,
      });
    }

    dispatch(setConversationUser(""));
  };

  return (
    <>
      {conversationsData.length > 0
        ? conversationsData.map((friend) => (
            <div
              key={friend.user.id}
              className="flex gap-2 justify-between border border-black/30 border-r-0 cursor-pointer"
            >
              <div
                className="flex gap-2 flex-grow"
                onClick={() => selectConversation(friend.user.id)}
              >
                <img
                  src={friend.user.photo || avatar}
                  alt="/"
                  className="w-[45px] h-[45px] rounded-[50%] object-cover py-1"
                />
                <div>
                  <span className="text-black font-bold">
                    {friend.user.firstName} {friend.user.lastName}
                  </span>
                  <p>
                    {truncateString(
                      friend.messages[friend.messages.length - 1].content,
                      20
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse justify-between">
                <p className="text-tiny mr-3">
                  {convertTimestamp(
                    friend.messages[friend.messages.length - 1].timestamp
                  )}
                </p>
                <div className="flex align-baseline mr-3 justify-end">
                  {friend.numberOfNewMessages ? (
                    <div className=" flex items-center justify-center w-[18px] h-[18px] rounded-[50%] ml-auto mr-2 mt-1 border-1 bg-[#733A7E]">
                      <p className="text-white text-tiny font-semibold">
                        {friend.numberOfNewMessages || ""}
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                  <AiOutlineCloseCircle
                    className="mt-1"
                    onClick={() => {
                      deleteConversation(friend.user.id);
                    }}
                    size={20}
                  />
                </div>
              </div>
            </div>
          ))
        : ""}
    </>
  );
}

export default LastsConversations;

/*


<div className="flex items-center ">
                
                <div className="flex flex-col-reverse justify-between">
                  <p className="text-tiny mr-3">
                    {convertTimestamp(
                      friend.messages[friend.messages.length - 1].timestamp
                    )}
                  </p>
                  <div className="flex align-baseline mr-3 justify-end">
                    {friend.numberOfNewMessages ? (
                      <div className=" flex items-center justify-center w-[18px] h-[18px] rounded-[50%] ml-auto mr-2 mt-1 border-1 bg-[#733A7E]">
                        <p className="text-white text-tiny font-semibold">
                          {friend.numberOfNewMessages || ""}
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                    <AiOutlineCloseCircle
                      className="mt-1"
                      onClick={() => {
                        deleteConversation(friend.user.id);
                      }}
                      size={20}
                    />
                  </div>
                </div>
              </div>





*/
