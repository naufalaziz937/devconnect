export function useApiUrl(path, runtimeConfig = useRuntimeConfig()) {
  const { public: config } = runtimeConfig;
  const host = config.apiHost.replace(/\/+$/, "");
  const prefix = `/${config.apiPrefix.replace(/^\/+|\/+$/g, "")}`;
  return `${host}${prefix}/${path.replace(/^\/+/, "")}`;
}

export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie("devconnect_token", { sameSite: "lax" });
  const authUser = useState("auth_user", () => null);
  const cookieHeaders = import.meta.server ? useRequestHeaders(["cookie"]) : {};
  return async (path, options = {}) => {
    const { raw = false, ...fetchOptions } = options;
    const request = () =>
      $fetch(useApiUrl(path, config), {
        ...fetchOptions,
        credentials: "include",
        headers: {
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
          ...(path === "/auth/refresh" && import.meta.server ? cookieHeaders : {}),
          ...fetchOptions.headers,
        },
      });
    try {
      const response = await request();
      return raw ? response : response.data;
    } catch (error) {
      if (error?.response?.status === 401) {
        if (token.value && !path.startsWith("/auth/")) {
          try {
            const refreshed = await $fetch(useApiUrl("/auth/refresh", config), {
              method: "POST",
              credentials: "include",
              ...(import.meta.server ? { headers: cookieHeaders } : {}),
            });
            token.value = refreshed.data.accessToken;
            const response = await request();
            return raw ? response : response.data;
          } catch (refreshError) {
            if (refreshError?.response?.status !== 401) throw refreshError;
          }
        }
        token.value = null;
        authUser.value = null;
      }
      throw error;
    }
  };
}
