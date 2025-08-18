import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

// const cognitoAuthConfig = {
//      authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ExjMiZeM0",
//      client_id: "3gml2q30bkbc8bkp71d4bsai0n",
//      //redirect_uri: "https://main.d2n7wx66fj019p.amplifyapp.com/", //my amplify Domain url
//      //redirect_uri: "http://localhost:5173/",
//      response_type: "code",
//      scope: "email openid phone",
// };

// const cognitoAuthConfig = {
//      authority: "https://eu-north-1exjmizem0.auth.eu-north-1.amazoncognito.com/login",
//      client_id: "3gml2q30bkbc8bkp71d4bsai0n",
//      redirect_uri: "https://main.d2n7wx66fj019p.amplifyapp.com/",
//      response_type: "code",
//      scope: "openid email phone",
// };

const cognitoAuthConfig = {
     // Fixed: Use the correct Cognito IdP authority URL
     authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ExjMiZeM0",
     client_id: "3gml2q30bkbc8bkp71d4bsai0n",
     redirect_uri: "https://main.d2n7wx66fj019p.amplifyapp.com/",
     response_type: "code",
     scope: "openid email phone",

     // Optional: Add these for better error handling
     post_logout_redirect_uri: "https://main.d2n7wx66fj019p.amplifyapp.com/",
     automaticSilentRenew: true,
     loadUserInfo: true,
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

// wrap the application with AuthProvider
root.render(
     <React.StrictMode>
          <AuthProvider {...cognitoAuthConfig}>
               <App />
          </AuthProvider>
     </React.StrictMode>
);
