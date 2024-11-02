import VideoUploader from '@/components/component/videoUploader';
import './home.scss';
import React from 'react';
const useTitle = (title:any) => {
  const documentDefined = typeof document !== 'undefined';
  const originalTitle = React.useRef(documentDefined ? document.title : null);

  React.useEffect(() => {
    if (!documentDefined) return;

    if (document.title !== title) document.title = title;

    return () => {
      document.title = originalTitle.current!;
    };
  }, []);
};

const Home = () => {
  useTitle("MUXIFY")
  return (
    <div className="mt-[5.25rem] flex items-center text-center h-[90svh]">
      <VideoUploader />
    </div>
  );
};

export default Home;
