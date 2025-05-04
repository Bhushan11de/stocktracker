import axios from 'axios';

export const handleApiError = (error) => {
  if (axios.isCancel(error)) {
    console.log('Request canceled', error.message);
    return 'Request was canceled';
  }

  let errorMessage = 'An unexpected error occurred';

  if (error.response) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Bad Request: Invalid data sent';
        break;
      case 401:
        errorMessage = 'Unauthorized: Please log in again';
        break;
      case 403:
        errorMessage = 'Forbidden: You do not have permission';
        break;
      case 404:
        errorMessage = 'Not Found: The requested resource does not exist';
        break;
      case 500:
        errorMessage = 'Server Error: Please try again later';
        break;
      default:
        errorMessage = error.response.data.message || 'An error occurred';
    }
  } else if (error.request) {
    errorMessage = 'No response received from server';
  } else {
    errorMessage = error.message || 'Error in request setup';
  }

  console.error('API Error:', {
    message: errorMessage,
    fullError: error
  });

  return errorMessage;
};