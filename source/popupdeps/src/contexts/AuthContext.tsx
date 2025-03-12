// @ts-nocheck
// AuthContext.tsx (for Chrome Extension)
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  getToken: () => Promise<string | undefined>;
  makeRdfnRequest: (
    path: string,
    method: string,
    headers: any,
    body: any,
    allowUnauthenticated?: boolean
  ) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getToken: async () => undefined,
  makeRdfnRequest: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUserStateUpdate = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'USER_STATE_UPDATED') {
        setUser(message.user);
        setLoading(message.loading);
      }
    };
    const getUser = async () => {
        try {
            const response = await chrome.runtime.sendMessage({ swaction: 'GET_USER_STATE' });
            const { user, loading } = response;
            setUser(user);
            setLoading(loading);
        } catch (error) {
            console.error('Error fetching user state:', error);
            setUser(null);
            setLoading(false);
        }
    };

    getUser();
    chrome.runtime.onMessage.addListener(handleUserStateUpdate);

    return () => {
      chrome.runtime.onMessage.removeListener(handleUserStateUpdate);
    };
  }, []);

  const getToken = async (): Promise<string | undefined> => {
    try {
      const response = await chrome.runtime.sendMessage({ swaction: 'GET_USER_TOKEN' });
      const { token } = response;
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return undefined;
    }
  };

  const makeRdfnRequest = async (
    path: string,
    method: string,
    headers: any,
    body: any,
    allowUnauthenticated?: boolean
  ): Promise<any> => {
    if (!user && !allowUnauthenticated) {
      throw new Error('UNAUTHENTICATED_USER');
    }

    const pathAndMethodRequireReReadefine = [
      {
        path: '/user/details',
        method: 'POST'
      },
      {
        path: '/dictionary/readefinitions',
        method: 'PUT'
      },
      {
        path: '/dictionary/readefinitions',
        method: 'DELETE'
      },
      {
        path: '/user/conversions',
        method: 'POST'
      },
      {
        path: '/user/ai/style',
        method: 'PUT'
      },
      {
        path: '/user/ai/style',
        method: 'DELETE'
      },
      {
        path: '/user/ai/target',
        method: 'PUT'
      },
      {
        path: '/user/ai/target',
        method: 'DELETE'
      }
    ]
    try {
      const token = await getToken();

      const url = `${import.meta.env.VITE_REACT_APP_RDFN_HOST}${path}`;

      headers['Content-Type'] = 'application/json';
      headers['Api-Version'] = '2.0';
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const reqOptions: any = {
        method: method,
        headers: headers,
      };

      if (method !== 'GET' && body) {
        reqOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, reqOptions);

      if (response.status === 401) {
        await chrome.runtime.sendMessage({ type: 'SIGN_OUT' });
        return;
      }

      if (pathAndMethodRequireReReadefine.some((item) => item.path === path && item.method === method)) {
        await chrome.runtime.sendMessage({ swaction: 'REREADEFINE_TABS' });
      }

      return response;
    } catch (error) {
      console.error('Error during fetch:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, getToken, makeRdfnRequest }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}