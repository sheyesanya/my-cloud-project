// src/components/ProtectedRoute.jsx

import {
  Navigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

import {
  Spinner
} from './UI';

export default function ProtectedRoute({
  children
}) {

  const {

    user,

    loading

  } = useAuth();

  // Loading State

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <Spinner size={18}/>

          <p
            style={{
              fontWeight:600
            }}
          >
            Authenticating...
          </p>

        </div>

      </div>
    );
  }

  // Not Logged In

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged In

  return children;
}