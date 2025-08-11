// import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';
import { withAuthenticator, Authenticator, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";
Amplify.configure(amplifyconfig);

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

// eslint-disable-next-line react-refresh/only-export-components
const App: React.FC<AppProps> = ({ signOut }) => {

  return (
    <Authenticator>
      <div>
        <Heading level={1}>Hello</Heading>
        <Button onClick={signOut}>Sign out</Button>
      </div>
    </Authenticator>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withAuthenticator(App);
