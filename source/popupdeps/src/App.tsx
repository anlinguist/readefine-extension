// @ts-nocheck
import './App.css';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { RDFNContextProvider } from './RDFNContext';
import ReadefineRoutes from './ReadefineRoutes';
import { HashRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import '@mantine/core/styles.css';
import { Button, ColorSchemeScript, MantineColorsTuple, MantineProvider, createTheme, Menu, Modal, Text, TextInput, Textarea, Tooltip, rem  } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

const rdfnyellow: MantineColorsTuple = [
  "#fffde1",
  "#fff9cb",
  "#fff29a",
  "#ffeb64",
  "#ffe538",
  "#ffe11d",
  "#ffde00",
  "#e3c600",
  "#caaf00",
  "#ae9700"
];

const theme = createTheme({
  cursorType: 'pointer',
  fontFamily: 'Roboto-Light, Roboto',
  fontSizes: {
    xxs: '8px',
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '28px',
  },
  colors: {
    rdfnyellow,
    dark: [
      '#999',
      '#888',
      '#777',
      '#666',
      '#555',
      '#444',
      '#333',
      '#222',
      '#111',
      '#000000'
    ],
  },
  components: {
    Button: Button.extend({
      styles: {
        root: { margin: '15px 0' },
        inner: { fontWeight: 300, 
          fontSize: 'var(--mantine-font-size-md)' },
        label: {
          fontSize: 'var(--mantine-font-size-md)'
        }
      },
    }),
    Menu: Menu.extend({
      styles: {
        itemLabel: {
          fontSize: 'var(--mantine-font-size-md)'
        },
        itemSection: {
          width: rem(20),
          height: rem(20)
        }
      },
      defaultProps: {
        arrowSize: 10
      }
    }),
    Modal: Modal.extend({
      styles: {
        title: {
          flex: 1,
          fontSize: 'var(--mantine-font-size-lg)',
          textAlign: 'center'
        }
      }
    }),
    Text: Text.extend({
      styles: {
        root: {
          fontSize: 'var(--mantine-font-size-md)'
        }
      }
    }),
    Textarea: Textarea.extend({
      styles: {
        input: {
          fontSize: 'var(--mantine-font-size-md)'
        },
        label: {
          fontSize: 'var(--mantine-font-size-md)'
        }
      }
    }),
    TextInput: TextInput.extend({
      styles: {
        label: {
          fontSize: 'var(--mantine-font-size-md)'
        },
        input: {
          fontSize: 'var(--mantine-font-size-md)'
        }
      }
    }),
    Tooltip: Tooltip.extend({
      styles: {
        tooltip: {
          fontSize: 'var(--mantine-font-size-md)'
        }
      },
      defaultProps: {
        arrowSize: 10
      }
    })
  },
});

function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider defaultColorScheme='auto' theme={theme}>
        <AuthProvider>
          <AuthedApp />
        </AuthProvider>
        <Notifications autoClose={false} />
      </MantineProvider>
    </>
  );
}

export default App;


function AuthedApp() {
  const { user } = useAuth();

  return (
    <div className={`App${user ? " loggedIn" : ""}`}>
      <HelmetProvider>
        <Helmet>
          <title>Readefine</title>
          <meta
            http-equiv="Content-Security-Policy"
            content={`default-src 'self'; frame-src 'self' https://auth.getreadefine.com/ https://js.stripe.com/; script-src 'self' chrome-extension://odfcpcabgcopkkpicbnebpefigppfglm https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.gstatic.com https://lh3.googleusercontent.com https://blog.getreadefine.com; connect-src 'self' https://rs.fullstory.com https://edge.fullstory.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://apis.google.com https://firestore.googleapis.com ${import.meta.env.VITE_REACT_APP_RDFN_HOST} ${import.meta.env.VITE_REACT_APP_RDFN_HOST_OLD_SERVER};`}
          />
          <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'></link>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        </Helmet>
        <RDFNContextProvider>
          <Router>
            <ReadefineRoutes />
          </Router>
        </RDFNContextProvider>
      </HelmetProvider>
    </div>
  )
}