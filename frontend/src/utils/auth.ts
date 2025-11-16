import { jwtDecode } from "jwt-decode";

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}
export function getToken(): string | null {
  return localStorage.getItem("token");
}
export function logout(): void {
  localStorage.removeItem("token");
}
export function getUserFromToken(): any | null {
  const t = getToken();
  if (!t) return null;
  try {
    return jwtDecode(t);
  } catch (err) {
    return null;
  }
}
