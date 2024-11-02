// import { useState } from 'react'
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import ngrok from 'ngrok';

import Register from '@/pages/register/Register';
import { Layout, RequireAuth } from './pages/layout/Layout';
import Login from './pages/login/Login';
import { ThemeProvider } from './components/theme-provider';
import Profile from './pages/profile/Profile';
import ScrollToTopButton from './components/component/scrollToTopButton';
import LandingPage from './components/LandingPage';
import Home from './pages/home/Home';
// import Navbar from './components/navbar/Navbar';
// console.log(Navbar)
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true, // Index route for the default child
        element: <LandingPage />, // The landing page to be shown by default
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/profile/:id',
        element: <Profile />,
      },
    ],
  },
]);

function App() {
  // const [count, setCount] = useState(0)

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="overflow-hidden ">
        <ScrollToTopButton />
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;
