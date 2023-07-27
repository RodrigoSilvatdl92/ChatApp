import React from "react";
import { motion } from "framer-motion";

function Modal({ children, onClose, firstLogIn }) {
  return (
    <motion.div
      className="fixed w-screen top-0 left-0 h-screen bg-black bg-opacity-60 transition-opacity duration-150 flex flex-col gap-20 items-center justify-center backdrop-filter backdrop-blur-sm z-30 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={firstLogIn ? undefined : onClose}
    >
      <motion.div
        className="bg-white w-[360px] h-[300px] md:min-w-[380px] md:min-h-[420px] rounded-md overflow-auto z-35 "
        initial={{ x: "-100vw" }}
        animate={{ x: 0 }}
        exit={{ x: "100vw", transition: { duration: 0.5 } }}
        transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default Modal;
