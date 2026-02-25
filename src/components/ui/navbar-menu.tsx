import React, { useRef, useEffect } from "react";
import { animate, remove } from "animejs";

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active === item && dropdownRef.current) {
      remove(dropdownRef.current);
      animate(dropdownRef.current, {
        opacity: [0, 1],
        scale: [0.85, 1],
        translateY: [10, 0],
        duration: 300,
        easing: "easeOutExpo",
      });
    }
  }, [active, item]);

  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <p className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white transition-opacity duration-300">
        {item}
      </p>
      {active !== null && (
        <div className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
          {active === item && (
            <div
              ref={dropdownRef}
              className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl origin-top"
            >
              <div
                ref={contentRef}
                className="w-max h-full p-4"
              >
                {children}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};
