import { withAuth } from "next-auth/middleware";
import { authOptions } from "./app/lib/auth";

export default withAuth({
  secret: authOptions.secret,
  cookies: authOptions.cookies,
});

export const config = {
  matcher: ["/dashboard", "/transfer", "/p2p", "/transactions"],
};