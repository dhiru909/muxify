// @ts-nocheck
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
import {  Geocoder } from '@mapbox/search-js-react';

import { setLatLng } from '../../features/map/mapSlice';

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
  const accessToken =
    'pk.eyJ1IjoiZGhpcmFqa2hhbGkiLCJhIjoiY2x5cjV1d2F6MDRpdzJscXgwMjZocG9sOCJ9.hultT77te_oDoBrMjtA6Rw';
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

  return (
    <header className=" font-poppins ">
      <nav className="fixed bg-background z-20 top-0 h-[5.25rem] left-0 flex justify-between items-center w-full px-4 mx-auto py-4">
        <div className="flex items-center text-xl content-center text-center font-poppins cursor-pointer font-black">
          <img
            className="content-center text-center w-32 h-16"
            src="fieldscanAdjusted.png"
            alt="FieldScan"
          />
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
            <div className=" flex  text-center items-end flex-row gap-2">
              <div className=" w-44">
                <form>
                  
                  <Geocoder
                    accessToken={accessToken}
                    value={inputValue}
                    onChange={d => {
                      setInputValue(d);
                      console.log(inputValue);
                    }}
                    popoverOptions={{
                      flip: true,
                      placement: 'top-start',
                    }}
                    marker
                    onRetrieve={res => {
                      console.log(res);
                      dispatch(setLatLng(res.geometry));
                      localStorage.setItem(
                        'latlng',
                        JSON.stringify(res.geometry),
                      );
                      navigate('/home');
                    }}
                    theme={
                      {
                        // variables: {
                        //   colorPrimary: 'text-primary-foreground',
                        //   colorBackground: 'bg-primary',
                        //   colorText: 'colorPrimary',
                        //   colorPlaceholderText: 'colorBackground',
                        // },
                      }
                    }
                  />
                </form>
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

// fieldscan-redis-0001-001.fieldscan-redis.t7hlh6.aps1.cache.amazonaws.com

// Sc6SVufC5aiPPlWk34PmQIhiIesZxT0T;

// redis-18896.c301.ap-south-1-1.ec2.redns.redis-cloud.com
// import { useState } from 'react';
// // import { content } from '../Content';
// import { HiMenuAlt2 } from 'react-icons/hi';
// import { createElement } from 'react';

// // import { GrMail } from 'react-icons/gr';
// // import { MdArrowForward, MdCall } from 'react-icons/md';
// // import { BsInstagram } from 'react-icons/bs';
// import { TbSmartHome } from 'react-icons/tb';
// import { BiUser } from 'react-icons/bi';
// import { RiServiceLine, RiProjectorLine } from 'react-icons/ri';
// import { MdOutlinePermContactCalendar } from 'react-icons/md';

// const Navbar = () => {
//   // const { nav } = content;
//   const nav = [
//     {
//       link: "#home",
//       icon: TbSmartHome,
//     },
//     {
//       link: "#skills",
//       icon: BiUser,
//     },
//     {
//       link: "#services",
//       icon: RiServiceLine,
//     },
//     {
//       link: "#projects",
//       icon: RiProjectorLine,
//     },
//     {
//       link: "#contact",
//       icon: MdOutlinePermContactCalendar,
//     },
//   ]
//   const [showMenu, setShowMenu] = useState(false);
//   const [active, setActive] = useState(0);

//   return (
//     <div className="w-full flex justify-center">
//       <div
//         className="sm:cursor-pointer fixed top-10 left-10 z-[999] rounded-lg bg-white/40 p-2"
//         onClick={() => setShowMenu(!showMenu)}
//       >
//         <HiMenuAlt2 size={34} />
//       </div>
//       <nav
//         className={`fixed  z-[999] flex items-center gap-5 bg-slate-200/60 px-6 py-3 backdrop-blur-md rounded-full text-dark_primary duration-300 ${
//           showMenu ? 'bottom-10' : 'bottom-[-100%]'
//         }`}
//       >
//         {nav.map((item, i) => (
//           <a
//             href={item.link}
//             onClick={() => setActive(i)}
//             className={`text-xl p-2.5 rounded-full sm:cursor-pointer
//      ${i === active && 'bg-dark_primary text-white'} `}
//           >
//             {createElement(item.icon)}
//           </a>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Navbar;

//  var map = L.map("map").setView([latitude,longitude])
//       map.setMinZoom(3)
//       map.setZoom(7)
//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//       }).addTo(map);
//       L.marker([latitude,longitude]).addTo(map)
//       .bindPopup("You are here")
//       .openPopup();
//       L.circle([latitude,longitude], {
//         color: 'red',
//         fillColor: '#f03',
//         fillOpacity: 0.5,
//         radius: 500
//       }).addTo(map).bindPopup('You are here');
//     },
//     (error: GeolocationPositionError) => {
//       console.log('Unable to retrieve your location');
//     }

// for (const feature of geojson.features) {
//   // create a HTML element for each feature
//   const el = document.createElement('div');
//   el.className = 'marker';

//   // make a marker for each feature and add it to the map
//   new mapboxgl.Marker(el)
//     .setLngLat(feature.geometry.coordinates)
//     .setPopup(
//       new mapboxgl.Popup({ offset: 25 }) // add popups
//         .setHTML(
//           `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`,
//         ),
//     )
//     .addTo(map);
// }

/*<Card className="w-full max-w-md md:max-w-2xl lg:max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-lg">
            <Carousel>
              <CarouselContent className="">
                {item.img.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/2"
                  >
                    <div className="">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-1">
                          <img src={image} />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="grid gap-4">
            <div>
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-muted-foreground">{item.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                For Sale
              </div>
              <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                {item.type}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Listed on</p>
                <p>{item.startedAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Listed by</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src={item.userId.dp} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <p>{item.userId.name}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Created</p>
                <p>June 15, 2024</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Updated</p>
                <p>June 18, 2024</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">View Listing</Button>
            </div>
          </div>
        </div>
      </Card> */

// <Dialog>
//   <DialogTrigger asChild>
//     <Button variant="outline">Add Project</Button>
//   </DialogTrigger>
//   <DialogContent className="sm:max-w-[425px]">
//     <DialogHeader>
//       <DialogTitle>Add Project</DialogTitle>
//       <DialogDescription>
//         Make changes to your profile here. Click save when you're done.
//       </DialogDescription>
//     </DialogHeader>

//     <div className="">
//       <Form {...form}>
//         <form
//           encType="multipart/form-data"
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-6"
//         >
//           <FormField
//             control={form.control}
//             name="title"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Title</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="Title"
//                     {...field}

//                     // style={{
//                     //   border: 'none',
//                     //   outline: 'none',
//                     //   borderBottom: '2px solid black',
//                     // }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Description</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="email"
//                     placeholder="description"
//                     {...field}

//                     // style={{
//                     //   border: 'none',
//                     //   borderBottom: '2px solid black',
//                     // }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="address"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Address</FormLabel>
//                 <FormControl>
//                   {/* <Geocoder

//                               placeholder="address"
//                               accessToken={accessToken}
//                               value={inputValue}
//                               onChange={d => {
//                                 setInputValue(d);
//                               }}
//                               popoverOptions={{
//                                 flip: true,
//                                 placement: 'top-start',
//                               }}

//                               onRetrieve={res => {
//                                 console.log(res);
//                                 setGeometry(res.geometry);
//                               }}

//                             /> */}

//                   <AddressAutofill
//                     accessToken={accessToken}
//                     onRetrieve={res => {
//                       console.log(res);
//                       setGeometry(res.geometry);
//                     }}
//                   >
//                     <Input
//                       autoComplete="street-address address-line1"
//                       value={value}
//                       onChange={handleChange}
//                     />
//                   </AddressAutofill>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="type"
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="text"
//                     placeholder="Type"
//                     {...field}

//                     // style={{
//                     //   border: 'none',
//                     //   borderBottom: '2px solid black',
//                     // }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="file"
//             render={() => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     placeholder="shadcn"

//                     // value={file}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           {error && <div className="text-red-500 text-sm">{error}</div>}
//           <Button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full py-2 px-4 bg-popover-foreground text-primary-foreground rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
//           >
//             {loading ? 'Loading...' : 'Register'}
//           </Button>
//         </form>
//       </Form>
//     </div>
//     {/* <DialogFooter>
//                 <Button type="submit">Confirm</Button>
//               </DialogFooter> */}
//   </DialogContent>
// </Dialog>;
