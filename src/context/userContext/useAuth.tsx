import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
} from "../../services/api";

interface AuthContextType {
  user: User | undefined;
  message: AuthMessage | undefined;
  error: any;
  loading: boolean;
  register: (user: RegisterUser) => void;
  login: (user: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User>();
  const [message, setMessage] = useState<AuthMessage>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (error) setError(null);
  }, [error, location.pathname]); // Include error and location.pathname in the dependency array

  useEffect(() => {
    getUser()
      .then((data) => {
        setUser(data.user);
      })
      .catch((_error) => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  const register = useCallback((user: RegisterUser) => {
    setLoading(true);
    setError(undefined);
    registerUser(user)
      .then((data) => {
        setUser(data.user);
        setMessage(data.message);
        setTimeout(() => {
          setMessage(undefined);
          navigate("/users/login");
        }, 2000);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const login = useCallback((user: LoginUser) => {
    setLoading(true);
    setError(undefined);
    loginUser(user)
      .then((data) => {
        setUser(data.user);
        setMessage(data.message);
        setTimeout(() => {
          setMessage(undefined);
          navigate("/users/my-account");
        }, 2000);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = useCallback(() => {
    logoutUser().then((data) => {
      setUser(undefined);
      setMessage(data.message);
      setTimeout(() => {
        setMessage(undefined);
        navigate("/");
      }, 2000);
    });
  }, [navigate]);

  const memoedValue = useMemo(
    () => ({
      user,
      message,
      error,
      loading,
      register,
      login,
      logout,
    }),
    [user, message, error, loading, register, login, logout]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
