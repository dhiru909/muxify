import {  useEffect } from 'react';
import {  Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
// import User from '../../context/AuthContext';
// import './layout.scss';

function Layout() {
  const { userInfo } = useSelector((state: any) => state.authenticate);
  console.log('accessToken', userInfo);
  const navigate = useNavigate();
  useEffect(() => {
    // redirect user to login page if registration was successful
    if (userInfo) navigate('/home');

    // redirect authenticated user to profile screen
  }, [userInfo]);
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content mt-[5.25rem]">
        {/* <Footer /> */}
        <Outlet />
      </div>

      <Toaster />
    </div>
  );
}

function RequireAuth() {
  const { userInfo } = useSelector((state: any) => state.authenticate);
  console.log('accessToken', userInfo);
  const navigate = useNavigate();
  useEffect(() => {
    // redirect user to login page if registration was successful
    if (!userInfo) navigate('/login');
    // redirect authenticated user to profile screen
  }, [userInfo]);

  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}

export { Layout, RequireAuth };
