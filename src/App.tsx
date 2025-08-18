// App.js
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from "./components/Home.js";
import type { JSX } from "react";

function App(): JSX.Element {
     const auth = useAuth();

     const signOutRedirect = () => {
          const clientId = "3gml2q30bkbc8bkp71d4bsai0n";
          const logoutUri = "https://www.youtube.com/";
          const cognitoDomain = "https://eu-north-1exjmizem0.auth.eu-north-1.amazoncognito.com";
          window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
     };

     if (auth.error) {
          return (
               <div>
                    <h1>Authentication Error</h1>
                    <p>Error: {auth.error.message}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
               </div>
          );
     }

     if (auth.isLoading) {
          return <div>Loading...</div>;
     }

     return (
          <Router>
               <Routes>
                    <Route path="/" element={
                         auth.isAuthenticated ? (
                              <Navigate to="/hello" replace />
                         ) : (
                              <div>
                                   <h1>Welcome to My App</h1>
                                   <button onClick={() => auth.signinRedirect()}>Sign in</button>
                                   {auth.error && (
                                        <div style={{ color: 'red', marginTop: '10px' }}>
                                             Authentication failed: {(auth.error as Error)?.message || 'Unknown error'}
                                        </div>
                                   )}
                              </div>
                         )
                    } />

                    {/* Add callback route for post-authentication redirect */}
                    <Route path="/callback" element={
                         <div>Processing authentication...</div>
                    } />

                    <Route path="/hello" element={
                         auth.isAuthenticated ? (
                              <div>
                                   <Home />
                                   <div style={{ marginTop: '20px' }}>
                                        <p>Logged in as: {auth.user?.profile.email}</p>
                                        <button onClick={signOutRedirect}>Sign out</button>
                                   </div>
                              </div>
                         ) : (
                              <Navigate to="/" replace />
                         )
                    } />
               </Routes>
          </Router>
     );
}

export default App;

// https://d84l1y8p4kdic.cloudfront.net