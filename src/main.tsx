// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
     authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ExjMiZeM0",
     client_id: "3gml2q30bkbc8bkp71d4bsai0n",
     // redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
     redirect_uri: "http://localhost:5173/",
     response_type: "code",
     scope: "email openid phone",
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