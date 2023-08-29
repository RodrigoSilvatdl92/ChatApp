import React, { useState } from "react";
import Search from "../components/Search";
import LastsConversations from "../components/LastsConversations";
import Conversation from "../components/Conversation";
import Options from "../components/Options";
import { setConversationUser } from "../store/authReducer";
import { useDispatch } from "react-redux";
function Home() {
  const [isConversationSelected, setIsConversationSelected] = useState(false);

  /****************************************************/
  /* selecting user */

  const dispatch = useDispatch();

  const selectUserConversation = (id) => {
    setIsConversationSelected(true);
    dispatch(setConversationUser(id));
  };

  return (
    <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center bg-gray-500 px-2">
      <div className="w-full md:w-[800px] rounded-2xl bg-white mx-2 mb-10">
        <div className="flex flex-col md:flex-row  h-[450px] xl:h-[700px] xl:mb-0 w-full">
          <div className="flex flex-col w-full  md:w-[40%] md:h-full">
            <div className="flex items-center justify-center h-[60px] md:flex md:items-center md:justify-center outline-none">
              <Search />
            </div>
            <div
              className={
                isConversationSelected
                  ? "hidden md:flex md:flex-col md:h-[full]"
                  : "flex flex-col h-[full] md:block"
              }
            >
              <div>
                <LastsConversations
                  selectConversation={selectUserConversation}
                />
              </div>
            </div>
          </div>
          <div
            className={
              isConversationSelected
                ? "w-full flex-col md:w-[60%] h-[100%] border-l overflow-y-auto border-black/30"
                : "hidden md:flex md:flex-col md:w-[60%] h-[100%] border-l overflow-y-auto border-black/30"
            }
          >
            <Conversation
              className="h-full "
              onClose={() => setIsConversationSelected(false)}
            />
          </div>
        </div>
        <div>
          <Options
            setIsConversationSelected={() => setIsConversationSelected(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
