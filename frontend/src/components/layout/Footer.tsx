// Create a new file named NewFooter.tsx in the same directory
import React from 'react';

const NewFooter = () => {
  return (
    <footer className="bg-gray-100 py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} OpenBudget</p>
      </div>
    </footer>
  );
};

export default NewFooter;