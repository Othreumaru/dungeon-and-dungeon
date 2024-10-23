import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

export type ISODateString = string;
export type DefaultSession = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: ISODateString;
};

export type Session = DefaultSession;

export type SessionProviderProps = {
  children: ReactNode;
  baseUrl?: string;
  basePath?: string;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchWhenOffline?: false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UpdateSession = () => Promise<Session | null>;

export interface AuthClientConfig {
  baseUrl: string;
  basePath: string;
  /** Stores last session response */
  _session?: Session | null | undefined;
  /** Used for timestamp since last sycned (in seconds) */
  _lastSync: number;
  /**
   * Stores the `SessionProvider`'s session update method to be able to
   * trigger session updates from places like `signIn` or `signOut`
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getSession: (...args: any[]) => any;
}

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { update: UpdateSession; data: Session; status: "authenticated" }
      | { update: UpdateSession; data: null; status: "loading" }
  :
      | { update: UpdateSession; data: Session; status: "authenticated" }
      | {
          update: UpdateSession;
          data: null;
          status: "unauthenticated" | "loading";
        };

export const SessionContext = createContext?.<SessionContextValue | undefined>(
  undefined
);

const __NEXTAUTH: AuthClientConfig = {
  basePath: "./",
  _lastSync: 0,
  _session: null,
  _getSession: () => {},
  baseUrl: "",
};

function now() {
  return Math.floor(Date.now() / 1000);
}

export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export interface SignInOptions extends Record<string, unknown> {
  /**
   * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
   *
   * [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl)
   */
  callbackUrl?: string;
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option) */
  redirect?: boolean;
  baseUrl?: string;
}

export interface ClientSafeProvider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export async function getProviders() {
  return await fetchData<Record<string, ClientSafeProvider>>(
    "providers",
    __NEXTAUTH
  );
}

export async function getCsrfToken() {
  const response = await fetchData<{ csrfToken: string }>("csrf", __NEXTAUTH);
  return response?.csrfToken;
}

export async function signIn(
  provider?: string,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
): Promise<void> {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};

  __NEXTAUTH.basePath = options?.baseUrl ?? __NEXTAUTH.basePath;
  const baseUrl = __NEXTAUTH.basePath;
  const providers = await getProviders();

  if (!providers) {
    window.location.href = `${baseUrl}/error`;
    return;
  }

  if (!provider || !(provider in providers)) {
    window.location.href = `${baseUrl}/signin?${new URLSearchParams({
      callbackUrl,
    })}`;
    return;
  }

  const isCredentials = providers[provider].type === "credentials";
  const isEmail = providers[provider].type === "email";
  const isSupportingReturn = isCredentials || isEmail;

  const signInUrl = `${baseUrl}/${
    isCredentials ? "callback" : "signin"
  }/${provider}`;

  const _signInUrl = `${signInUrl}${authorizationParams ? `?${new URLSearchParams(authorizationParams)}` : ""}`;

  const res = await fetch(_signInUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      ...options,
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: "true",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  });

  const data = await res.json();

  // TODO: Do not redirect for Credentials and Email providers by default in next major
  if (redirect || !isSupportingReturn) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes("#")) window.location.reload();
    return;
  }

  const error = new URL(data.url).searchParams.get("error");

  if (res.ok) {
    await __NEXTAUTH._getSession({ event: "storage" });
  }

  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

export interface UseSessionOptions<R extends boolean> {
  required: R;
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void;
}

export function useSession<R extends boolean>(
  options?: UseSessionOptions<R>
): SessionContextValue<R> {
  if (!SessionContext) {
    throw new Error("React Context is unavailable in Server Components");
  }

  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = useContext(SessionContext);
  if (!value && process.env.NODE_ENV !== "production") {
    throw new Error(
      "[next-auth]: `useSession` must be wrapped in a <SessionProvider />"
    );
  }

  const { required, onUnauthenticated } = options ?? {};

  const requiredAndNotLoading = required && value.status === "unauthenticated";

  useEffect(() => {
    if (requiredAndNotLoading) {
      const url = `/api/auth/signin?${new URLSearchParams({
        error: "SessionRequired",
        callbackUrl: window.location.href,
      })}`;
      if (onUnauthenticated) onUnauthenticated();
      else window.location.href = url;
    }
  }, [requiredAndNotLoading, onUnauthenticated]);

  if (requiredAndNotLoading) {
    return {
      data: value.data,
      update: value.update,
      status: "loading",
    };
  }

  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchData<T = any>(
  path: string,
  __NEXTAUTH: AuthClientConfig
): Promise<T | null> {
  const url = `${__NEXTAUTH.basePath}/${path}`;
  try {
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw data;
    return Object.keys(data).length > 0 ? data : null; // Return null if data empty
  } catch (error) {
    console.error("CLIENT_FETCH_ERROR", { error: error as Error, url });
    return null;
  }
}

export type GetSessionParams = {
  event?: "storage" | "timer" | "hidden" | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
};

export async function getSession() {
  const session = await fetchData<Session>("session", __NEXTAUTH);
  return session;
}

export function SessionProvider(props: SessionProviderProps) {
  if (!SessionContext) {
    throw new Error("React Context is unavailable in Server Components");
  }

  const { children, basePath } = props;

  if (basePath) {
    __NEXTAUTH.basePath = basePath;
  }

  __NEXTAUTH._lastSync = 0;

  const [session, setSession] = useState<Session | null>(null);

  /** If session was passed, initialize as not loading */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    __NEXTAUTH._getSession = async ({ event } = {}) => {
      try {
        if (
          // If there is no time defined for when a session should be considered
          // stale, then it's okay to use the value we have until an event is
          // triggered which updates it
          !event ||
          // If the client doesn't have a session then we don't need to call
          // the server to check if it does (if they have signed in via another
          // tab or window that will come through as a "stroage" event
          // event anyway)
          __NEXTAUTH._session === null ||
          // Bail out early if the client session is not stale yet
          now() < __NEXTAUTH._lastSync
        ) {
          return;
        }

        // An event or session staleness occurred, update the client session.
        __NEXTAUTH._lastSync = now();
        __NEXTAUTH._session = await getSession();
        setSession(__NEXTAUTH._session);
      } catch (error) {
        console.error("CLIENT_SESSION_ERROR", error as Error);
      } finally {
        setLoading(false);
      }
    };

    __NEXTAUTH._getSession();

    return () => {
      __NEXTAUTH._lastSync = 0;
      __NEXTAUTH._session = undefined;
      __NEXTAUTH._getSession = () => {};
    };
  }, []);

  const value: SessionContextValue = useMemo(
    () =>
      ({
        data: session === undefined ? null : session,
        status: loading
          ? "loading"
          : session
            ? "authenticated"
            : "unauthenticated",
        update: async () => {
          if (loading || !session) {
            return null;
          }
          setLoading(true);
          const newSession = await fetchData<Session>("session", __NEXTAUTH);
          setLoading(false);
          return newSession;
        },
      }) as SessionContextValue,
    [session, loading]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
