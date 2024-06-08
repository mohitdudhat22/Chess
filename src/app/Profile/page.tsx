import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { useMyContext } from "@/Context/MyContextProvider";
import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
// import useMyContext  from "@/Context/MyContext";

export default async function Profile(){
    const session = await getServerSession(options);
    console.log(session, "session is saved session");
    if(!session) redirect('api/auth/signin?callbackUrl=/server');
    return(
        <>
            This is over Profile
            name:- {session?.user?.name}
        </>
    )
}