import React from "react";
import { motion } from "framer-motion";

function ModalFriends({ children, onClose }) {
  return (
    <motion.div
      className="fixed w-screen top-0 left-0 h-screen bg-black bg-opacity-60 transition-opacity duration-150 flex items-center justify-center backdrop-filter backdrop-blur-sm z-10 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-[360px] h-[300px] md:min-w-[480px] md:min-h-[500px] rounded-md"
        initial={{ y: "+100vw" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 80, delay: 0.0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default ModalFriends;
