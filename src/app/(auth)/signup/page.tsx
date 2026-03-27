"use client";

import { signUp } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await signUp(formData);
    },
    undefined
  );

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-primary-500">
            TaskTracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create your karate school account
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <Input
            id="fullName"
            name="fullName"
            type="text"
            label="Full Name"
            placeholder="John Smith"
            required
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@yourschool.com"
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoComplete="new-password"
          />

          <Input
            id="schoolName"
            name="schoolName"
            type="text"
            label="School Name"
            placeholder="Rising Sun Karate"
            required
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-500 hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
