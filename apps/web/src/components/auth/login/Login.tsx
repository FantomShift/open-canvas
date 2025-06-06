import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { buttonVariants } from "../../ui/button";
import { UserAuthForm } from "./user-auth-form-login";
import { login } from "./actions";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface LoginWithEmailInput {
  email: string;
  password: string;
}

export function Login() {
  const [isError, setIsError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const isLocalDev = currentOrigin.includes("localhost");
    
    // Check if we're coming back from UIP Control auth with an error
    const error = searchParams.get("error");
    if (error === "true") {
      setIsError(true);
      // Remove the error parameter from the URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("error");
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        { scroll: false }
      );
      return;
    }

    // For local development, don't redirect immediately to allow local testing
    if (isLocalDev) {
      // Show a message instead of auto-redirecting
      return;
    }

    // For production, redirect to UIP Control main site
    window.location.href = "https://uipcontrol.com";
  }, [searchParams, router]);

  const onLoginWithEmail = async (
    input: LoginWithEmailInput
  ): Promise<void> => {
    setIsError(false);
    await login(input);
  };

  const onLoginWithOauth = async (
    provider: "google" | "linkedin"
  ): Promise<void> => {
    setIsError(false);
    const client = createSupabaseClient();
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${currentOrigin}/auth/callback`,
      },
    });
  };

  return (
    <div className="container relative h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
        <div className="flex gap-2 items-center text-xl font-medium">
          <NextImage
            src="/lc_logo.jpg"
            width={40}
            height={40}
            alt="LangChain Logo"
            className="rounded-full"
          />
          Open Canvas
        </div>
        
        {isError ? (
          <div className="text-center space-y-4 w-full">
            <h1 className="text-2xl font-semibold tracking-tight text-red-600">
              Authentication Error
            </h1>
            <p className="text-sm text-muted-foreground">
              There was an error with authentication. Please try again.
            </p>
            <button
              onClick={() => {
                window.location.href = "https://uipcontrol.com";
              }}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {typeof window !== "undefined" && window.location.origin.includes("localhost") ? (
              <div className="w-full space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight text-center">
                  Login (Development)
                </h1>
                <UserAuthForm
                  onLoginWithEmail={onLoginWithEmail}
                  onLoginWithOauth={onLoginWithOauth}
                />
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-600 text-center">
                    💡 <strong>Development Mode:</strong> In production, users will be redirected to UIP Control.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 w-full">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Redirecting to UIP Control...
                </h1>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to uipcontrol.com to sign in with your UIP Control account.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-muted-foreground">
                  If you are not redirected automatically, 
                  <button
                    onClick={() => {
                      window.location.href = "https://uipcontrol.com";
                    }}
                    className="text-primary underline ml-1"
                  >
                    click here
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
