"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";

export default function Page(): JSX.Element {
  const session = useSession();
  return (
    <div>
      <Appbar onSignin={signIn} onSignout={signOut} user={session.data?.user} />
      {!session.data?.user && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
          <button onClick={() => signIn()}>Sign in with phone</button>
        </div>
      )}
    </div>
  );
}