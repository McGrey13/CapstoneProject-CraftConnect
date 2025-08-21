import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';

import PublicRoutes from './components/Routes/PublicRoutes';
import SellerRoutes from './components/Routes/SellerRoutes';
import AdminRoutes from './components/Routes/AdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <React.Fragment>
          {PublicRoutes()}
          {SellerRoutes()}
          {AdminRoutes()}
        </React.Fragment>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
