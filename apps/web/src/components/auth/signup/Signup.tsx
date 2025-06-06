import { useEffect } from "react";
import NextImage from "next/image";

export interface SignupWithEmailInput {
  email: string;
  password: string;
}

export function Signup() {
  useEffect(() => {
    // Always redirect to UIP Control main site for signup
    window.location.href = "https://uipcontrol.com";
  }, []);

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
        
        <div className="text-center space-y-4 w-full">
          <h1 className="text-2xl font-semibold tracking-tight">
            Redirecting to UIP Control...
          </h1>
          <p className="text-sm text-muted-foreground">
            You will be redirected to uipcontrol.com to create your account.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
