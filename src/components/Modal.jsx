import React from "react";
import { motion } from "framer-motion";

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed w-screen top-0 left-0 h-screen bg-black bg-opacity-60 transition-opacity duration-150 flex items-center justify-center backdrop-filter backdrop-blur-sm z-30 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-[360px] h-[300px] md:min-w-[380px] md:min-h-[420px] rounded-md overflow-auto z-35 "
        initial={{ x: "-100vw" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default Modal;
