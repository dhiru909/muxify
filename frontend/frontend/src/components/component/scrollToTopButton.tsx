import {  ArrowUpCircle } from 'lucide-react';
import  { useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  window.addEventListener('scroll', toggleVisibility);

  return (
    <button
      className={`flex gap-2 bg-muted animate-fadeIn rounded-lg fixed bottom-4 left-4  scroll-to-top ${isVisible ? 'visible' : 'hidden'}`}
      onClick={scrollToTop}
    >
      <ArrowUpCircle height={30} width={30} className="" />
      {/* <p className='muted'>Scroll to Top</p> */}
    </button>
  );
};

export default ScrollToTopButton;
