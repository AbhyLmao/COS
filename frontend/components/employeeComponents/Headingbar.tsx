import React from 'react';

interface HeadingbarProps {
  text: string;
}

const Headingbar: React.FC<HeadingbarProps> = ({ text }) => {
  return (
    <div className="relative w-full h-24 overflow-hidden rounded-3xl bg-black flex items-center">
      <div className="absolute left-0 top-0 w-full h-full z-10 flex items-center"
           style={{
             background: "linear-gradient(to right, #1D1B23 55%, rgba(29,27,35,0.5) 75%, transparent 80%)"
           }}
      >
        <p className="text-white text-2xl font-light tracking-[0.2em] ml-10">{text}</p> {/* Adjusted font size, weight, and letter spacing */}
      </div>
      <div className="absolute right-0 top-0 w-[45%] h-full overflow-hidden" >
        <iframe
          src="https://player.vimeo.com/video/981075773?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0"
          className="absolute top-0 right-0 w-full object-cover transform scale-250"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Headingbar;
