import { apiGet, apiPost } from "./httpClient";

export type AuthUser = {
  id: number | string;
  email: string;
  full_name?: string | null;
  fullName?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  role?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
};

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await apiPost<AuthSession | { data: AuthSession }>(
    "/auth/login",
    credentials,
  );
  // Backend wrap trong { data: ... }, apiPost unwrap một lần → nếu backend
  // trả { data: { token, user } } thì apiPost.data = { token, user }. Nếu
  // backend trả trực tiếp { token, user } thì giữ nguyên.
  const payload = response.data as AuthSession;
  const session = (payload as { data?: AuthSession }).data ?? payload;
  if (!session || typeof session !== "object" || !("token" in session)) {
    throw new Error("Phản hồi đăng nhập không hợp lệ.");
  }
  return session;
}

export async function registerRequest(
  input: RegisterInput,
): Promise<AuthSession> {
  // Backend hiện đọc `fullName`/`phone` (camelCase). Mobile cũ gửi
  // `full_name`/`phone_number` (snake_case) — gửi kèm cả hai để tương
  // thích. Khi backend chuẩn hoá, có thể bỏ các alias.
  const payload = {
    fullName: input.full_name,
    full_name: input.full_name,
    phone: input.phone,
    phone_number: input.phone,
    email: input.email,
    password: input.password,
  };
  const response = await apiPost<AuthSession | { data: AuthSession }>(
    "/auth/register",
    payload,
  );
  const responseData = response.data as AuthSession;
  const session = (responseData as { data?: AuthSession }).data ?? responseData;
  if (!session || typeof session !== "object" || !("token" in session)) {
    throw new Error("Phản hồi đăng ký không hợp lệ.");
  }
  return session;
}

export async function getCurrentUser(): Promise<AuthUser> {
  // Thử /auth/me trước; nếu backend chỉ expose /me thì fallback.
  let response;
  try {
    response = await apiGet<AuthUser | { data: AuthUser }>("/auth/me");
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 405) {
      response = await apiGet<AuthUser | { data: AuthUser }>("/me");
    } else {
      throw error;
    }
  }
  const payload = response.data as AuthUser;
  return (payload as { data?: AuthUser }).data ?? payload;
}

export default { loginRequest, registerRequest, getCurrentUser };
