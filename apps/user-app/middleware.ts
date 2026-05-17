export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard", "/transfer", "/p2p", "/transactions"],
};
