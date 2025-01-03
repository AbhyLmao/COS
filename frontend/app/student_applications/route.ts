"use server"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req:Request) {
    try {
        const reqBody = await req.json();
        const {email, user_metadata} = reqBody;

        if (!email || !user_metadata) {
            return NextResponse.json({ error: 'Missing required fields', request: reqBody }, { status: 400 });
        }
        const pwd = "teamPasswordIsLong".toString();

        const supabaseAdmin =  createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const {data, error} = await supabaseAdmin.auth.admin.createUser({
            email_confirm: true,
            email:email,
            password: pwd,
            user_metadata: user_metadata
        })

        if(error){
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({data}, {status: 201});// 201 means resource created
    } catch (err) {
        console.error('Error creating user:', err);
        return NextResponse.json({ error: 'Theres an internal server error' }, { status: 500 });}
}