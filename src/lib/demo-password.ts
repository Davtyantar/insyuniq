import { DEMO_CREDENTIALS } from "@/mock/sellers";

const PASSWORD_KEY = "syuniq:account-password";

/** The demo account's current password — DEMO_CREDENTIALS.password until it's changed from the
 * profile's settings tab, after which that override (kept in this browser only) wins. */
export function getDemoPassword(): string {
  try {
    return window.localStorage.getItem(PASSWORD_KEY) || DEMO_CREDENTIALS.password;
  } catch {
    return DEMO_CREDENTIALS.password;
  }
}

export function setDemoPassword(password: string): boolean {
  try {
    window.localStorage.setItem(PASSWORD_KEY, password);
    return true;
  } catch {
    return false;
  }
}
