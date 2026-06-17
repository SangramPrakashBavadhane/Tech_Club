import React from 'react';
import Navbar from './components/Navbar';
import Main from './components/Main';
import Main2 from './components/Main2';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-mono flex flex-col justify-between">
      <Navbar />
      <div className="max-w-4xl w-full mx-auto p-6 flex-grow">
        <Main />
        <Main2 />
      </div>
      <Footer />
    </div>
  )
}

export default App;