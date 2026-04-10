import { motion } from 'framer-motion';

void motion;

const animations = {
  initial: { opacity: 0, y: 12, filter: 'blur(2px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(1px)' }
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      className="animated-page"
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
