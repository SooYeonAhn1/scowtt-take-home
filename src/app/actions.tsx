"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateMovie(movie: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("User not authenticated.");
    }

    console.log(movie)
    await prisma.user.update({
        where: { email: session.user.email },
        data: { movie: movie },
    });
    
    revalidatePath('/'); // Revalidate the root path to show the updated movie
}
