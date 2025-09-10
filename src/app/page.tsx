import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SignOutButton from "./signoutBtn";
import Movie from "./movie";
import { hydrateRoot } from "react-dom/client";

export default async function Home() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return (
            <main>
                <a href="/api/auth/signin">
                    Please sign in to view your profile.
                </a>
            </main>
        );
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return <main>User not found in database.</main>;
    }

    return (
        <main>
            <div className="flex justify-end w-full max-w-sm">
                <SignOutButton />
            </div>
            {user.image && (
                <img
                    src={user.image}
                    alt={`${user.name}'s profile`}
                    className="w-24 h-24 rounded-full mb-4"
                />
            )}
            <h1>Hello, {user.name}, your email is: {user.email}!</h1>
            <div>
                <Movie user={user}/>
            </div>
        </main>
    );
}
