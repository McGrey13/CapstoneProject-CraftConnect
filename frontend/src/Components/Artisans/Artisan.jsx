import React from 'react';
function Artisan({ artisan }) {
  return (
    <div className="artisan">
      <h2>{artisan.name}</h2>
      <p>{artisan.description}</p>
      <p>Location: {artisan.location}</p>
      <p>Rating: {artisan.rating}</p>
    </div>
  );
}

export default Artisan;