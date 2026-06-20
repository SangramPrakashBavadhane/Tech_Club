import React from 'react';
import Login from './components/Auth/login';
import Register from './components/Auth/register';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Homepage/Navbar';
import Main from './components/Homepage/Main';
import Main2 from './components/Homepage/Main2';
import Footer from './components/Homepage/Footer';
import Team from './components/Secondary_footer/team';
import About from './components/Secondary_footer/about';
import Resources from './components/Secondary_footer/resources';
import DsaSheet from './components/Secondary/DsaSheet';


function App() {

  const location = useLocation();

  const hideNavbarFooter = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-mono flex flex-col justify-between">
      {!hideNavbarFooter && <Navbar />}


      <div className="max-w-4xl w-full mx-auto p-6 flex-grow">
        <Routes>
          <Route path="/" element={<><Main /><Main2 /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/dsa" element={<DsaSheet />} />

        </Routes>
      </div>

      {!hideNavbarFooter && <Footer />}
    </div>
  )
}

export default App;