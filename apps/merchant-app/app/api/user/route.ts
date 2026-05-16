import { NextResponse } from "next/server"
import db from "@repo/db/client";

export const GET = async () => {
    return NextResponse.json({
        message: "hi there"
    })
}