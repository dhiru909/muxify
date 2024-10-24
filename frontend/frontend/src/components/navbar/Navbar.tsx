import React, { useEffect, useRef, useState } from 'react';
import { IoMenuSharp, IoCloseSharp } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';
import { useDispatch, useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/features/authenticate/authenticateSlice';
import Cookies from 'js-cookie';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// import './navbar.scss';

const useLogoutUser = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(logout());
    localStorage.clear();
    Cookies.remove('userData');
  };
};
const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const logoutUser = useLogoutUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const { userInfo } = useSelector((state: any) => state.authenticate);
  console.log(userInfo);

  const [inputValue, setInputValue] = useState('');
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // useEffect(() => {
  //   const handler = (e: any): void => {
  //     if (!menuRef.current!.contains(e.target as Node)) {
  //       setMenuOpen(false);
  //     }
  //     console.log(menuRef.current);
  //   };
  //   document.addEventListener('mousedown', handler);
  // });

  const navigate = useNavigate();
  const navigateToGivenPath = (path: string) => {
    navigate(path);
  };

  // const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const menuRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  // close the mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // console.log(address);

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!menuOpen || keyCode !== 27) return;
      setMenuOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });
  interface CreditsIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
  }

  const CreditsIcon: React.FC<CreditsIconProps> = ({ size = 24, ...props }) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
        <path d="M12 6v2m0 8v2" />
      </svg>
    );
  };
  return (
    <header className=" font-poppins ">
      <nav className="fixed bg-background z-20 top-0 h-[5.25rem] left-0 flex justify-between items-center w-full px-4 mx-auto py-4 bg-custom-gradient">
        <div className="flex items-center text-xl content-center text-center font-poppins cursor-pointer font-black">
          <img src="muxify.svg" className="h-12 w-16 " />
        </div>
        <div
          ref={menuRef}
          className={`nav-links z-20 duration-500 md:static absolute md:min-h-fit min-h-[100vh] top-[0%]     ${
            menuOpen
              ? 'right-[0%] dropdown-menu active   '
              : 'right[-100%] dropdown-menu inactive hidden md:block '
          } md:w-auto w-auto flex items-center md:px-0 px-5 justify-center border-2 md:border-0 border-muted-foreground rounded-md bg-background`}
        >
          <ul className="flex md:flex-row text-clamp flex-col md:items-center md:gap-[2.5vw] gap-6 w-full md:w-auto">
            <li>
              <a className="hover:text-gray-500" href="#">
                Products
              </a>
            </li>

            <li>
              <a className="hover:text-gray-500" href="#">
                Developers
              </a>
            </li>
            <li className="md:hidden">
              {userInfo ? (
                <div className=" flex flex-row">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="  md:block  hover:bg-accent hover:text-accent-foreground">
                        <AvatarImage src={userInfo.dp} alt="@shadcn" />
                        <AvatarFallback>DP</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => {
                            navigateToGivenPath(`/profile/${userInfo.id}`);
                          }}
                        >
                          Profile
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={logoutUser}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <a
                  className="hover:text-gray-500 border px-2 py-1 border-black rounded-md hover:bg-[#0f172a] hover:text-primary-foreground"
                  href="/login"
                >
                  Sign in
                </a>
              )}
            </li>
            <li className={`md:hidden ${userInfo ? 'hidden' : ''}`}>
              <a
                className="hover:text-gray-500 border px-2 py-1 border-black rounded-md hover:bg-[#0f172a] hover:text-primary-foreground"
                href="/register"
              >
                Sign up
              </a>
            </li>
            <li className="mx-1">
              <ModeToggle />
            </li>
          </ul>
        </div>
        <div className=" flex items-center gap-[1.5vw]">
          {userInfo ? (
            <div className=" flex  text-center  items-center flex-row gap-4">
              <div className={`flex text-center  items-center flex-row gap-2 `}>
                <CreditsIcon size={28} />
                <p className="text-lg text-pretty">69 Mins</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className=" hidden md:block  hover:bg-accent hover:text-accent-foreground ease-in-out animate-enterFromLeft repeat-1">
                    <AvatarImage src={userInfo.dp} alt="DP" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-20 w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={e => {
                        e.preventDefault();
                        navigateToGivenPath(`/profile/${userInfo.id}`);
                      }}
                    >
                      Profile
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logoutUser}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex flex-row gap-3">
              <Button
                className="hidden md:block  hover:bg-accent hover:text-accent-foreground "
                onClick={() => {
                  navigate('/login');
                }}
              >
                Sign in
              </Button>

              <Button
                className="hidden md:block hover:bg-accent hover:text-accent-foreground    "
                onClick={() => {
                  navigate('/register');
                }}
              >
                Sign up
              </Button>
            </div>
          )}
          {menuOpen ? (
            <IoCloseSharp
              onClick={toggleMenu}
              className="text-3xl  cursor-pointer md:hidden z-50 duration-500 animate-fadeIn"
            />
          ) : (
            <IoMenuSharp
              onClick={toggleMenu}
              className="text-3xl  cursor-pointer md:hidden z-50 animate-fadeIn duration-500"
            />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
