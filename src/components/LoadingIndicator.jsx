import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader'; // Import the spinner

const LoadingIndicator = () => {
  return (
    <ClipLoader
      size={20} // Set the size of the spinner
      color="#007bff" // Set the spinner color
      loading={true} // Control the loading state
    />
  );
};

export default LoadingIndicator;
