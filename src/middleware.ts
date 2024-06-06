export {default} from "next-auth/middleware";

//apply authentication to routes
export const config = { matcher:["/game","/landing"]}