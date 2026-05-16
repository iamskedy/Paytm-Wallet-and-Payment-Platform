export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/transfer", "/p2p", "/transactions", "/profile"]
};