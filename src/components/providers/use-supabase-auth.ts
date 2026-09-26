"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import {
  authErrorOf,
  avatarPathOf,
  normalizeArmenianPhone,
  pendingProfileOf,
  toAuthUser,
  type AuthErrorCode,
  type AuthUser,
} from "@/lib/account";
import { createApi } from "@/lib/api/client";
import { getMyProfile, putMyProfile } from "@/lib/api/me";
import type { SellerProfile } from "@/lib/api/types";
import { browserSupabase } from "@/lib/supabase/browser";

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: AuthErrorCode };

export interface SignUpInput {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface ProfilePatch {
  name?: string;
  phone?: string;
  /** A Storage path from uploadImage(…, "avatar"); null removes the avatar. */
  avatarPath?: string | null;
}

const failed = (error: AuthErrorCode): AuthResult => ({ ok: false, error });

/** Session, seller profile and every auth action. The only place that talks to Supabase Auth. */
export function useSupabaseAuth() {
  const supabase = React.useMemo(() => browserSupabase(), []);
  const [ready, setReady] = React.useState(supabase === null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<SellerProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  React.useEffect(() => {
    if (!supabase) return;
    // INITIAL_SESSION fires first, from the cookies, so `ready` flips on the first tick.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const getToken = React.useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  // Load the seller profile once per signed-in user (not on every hourly token refresh). A user
  // who signed up while email confirmation was on gets their profile created here, from the
  // name and phone kept in their metadata.
  const sessionRef = React.useRef(session);
  sessionRef.current = session;
  const userId = session?.user.id;
  React.useEffect(() => {
    const current = sessionRef.current;
    if (!userId || !current) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    const api = createApi({ token: current.access_token });
    (async () => {
      const existing = await getMyProfile(api);
      if (existing) return existing;
      const pending = pendingProfileOf(current.user.user_metadata);
      if (!pending) return null;
      return putMyProfile(api, {
        name: pending.name,
        phone: pending.phone,
        type: "private",
        hasWhatsApp: false,
        hasTelegram: false,
        hasViber: false,
      });
    })()
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) console.warn("Could not load the seller profile", error);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user: AuthUser | null = React.useMemo(() => {
    if (!session) return null;
    const metadataName = session.user.user_metadata?.name;
    return toAuthUser(
      {
        email: session.user.email,
        createdAt: session.user.created_at,
        metadataName: typeof metadataName === "string" ? metadataName : undefined,
      },
      profile,
    );
  }, [session, profile]);

  const signIn = React.useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return failed("not-configured");
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? failed(authErrorOf(error)) : { ok: true };
    },
    [supabase],
  );

  const signUp = React.useCallback(
    async (input: SignUpInput): Promise<AuthResult> => {
      if (!supabase) return failed("not-configured");
      const phone = normalizeArmenianPhone(input.phone);
      if (!phone) return failed("invalid-phone");
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { name: input.name.trim(), phone },
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) return failed(authErrorOf(error));
      // With a session the profile effect creates the seller profile right away; without one
      // (confirmation on) it happens at the first sign-in.
      return { ok: true, needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signOut = React.useCallback(async () => {
    await supabase?.auth.signOut();
    setProfile(null);
  }, [supabase]);

  const saveProfile = React.useCallback(
    async (patch: ProfilePatch): Promise<AuthResult> => {
      const token = await getToken();
      if (!token || !profile) return failed("unknown");
      const phone = patch.phone === undefined ? profile.phone : normalizeArmenianPhone(patch.phone);
      if (!phone) return failed("invalid-phone");
      const avatarPath = patch.avatarPath === undefined ? avatarPathOf(profile.avatarUrl) : patch.avatarPath ?? undefined;
      try {
        const next = await putMyProfile(createApi({ token }), {
          name: patch.name?.trim() ?? profile.name,
          type: profile.type,
          phone,
          hasWhatsApp: profile.hasWhatsApp,
          hasTelegram: profile.hasTelegram,
          hasViber: profile.hasViber,
          ...(avatarPath ? { avatarPath } : {}),
        });
        setProfile(next);
        return { ok: true };
      } catch (error) {
        console.warn("Could not save the profile", error);
        return failed("unknown");
      }
    },
    [getToken, profile],
  );

  const changeEmail = React.useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!supabase) return failed("not-configured");
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      // Supabase confirms the new address by email before switching (double_confirm_changes).
      return error ? failed(authErrorOf(error)) : { ok: true, needsConfirmation: true };
    },
    [supabase],
  );

  const setNewPassword = React.useCallback(
    async (password: string): Promise<AuthResult> => {
      if (!supabase) return failed("not-configured");
      const { error } = await supabase.auth.updateUser({ password });
      return error ? failed(authErrorOf(error)) : { ok: true };
    },
    [supabase],
  );

  const changePassword = React.useCallback(
    async (current: string, next: string): Promise<AuthResult> => {
      const email = session?.user.email;
      if (!supabase || !email) return failed("not-configured");
      // Re-authenticate first so a borrowed, unlocked device cannot change the password.
      const check = await supabase.auth.signInWithPassword({ email, password: current });
      if (check.error) return failed(authErrorOf(check.error));
      return setNewPassword(next);
    },
    [supabase, session, setNewPassword],
  );

  const requestPasswordReset = React.useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!supabase) return failed("not-configured");
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return error ? failed(authErrorOf(error)) : { ok: true };
    },
    [supabase],
  );

  return {
    ready,
    user,
    profile,
    profileLoading,
    getToken,
    signIn,
    signUp,
    signOut,
    saveProfile,
    changeEmail,
    changePassword,
    setNewPassword,
    requestPasswordReset,
  };
}
