"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { updateMovie } from './actions';
import OpenAI from 'openai';

export default function Movie({ user }) {
    const router = useRouter();
    const [favoriteMovie, setFavoriteMovie] = useState(user.movie || '');
    const [inputMovie, setInputMovie] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [movieFact, setMovieFact] = useState('');
    const [isLoadingFact, setIsLoadingFact] = useState(false);

    useEffect(() => {
        setFavoriteMovie(user.movie || '');
        const fetchMovieFact = async () => {
            if (user.movie) {
                setIsLoadingFact(true);
                setMovieFact('');
                try {
                    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
                    if (!apiKey) {
                        setMovieFact('OpenAI API key not set. Please insert your API key to get movie facts.');
                        setIsLoadingFact(false);
                        return;
                    }

                    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

                    const completion = await openai.chat.completions.create({
                        messages: [{ 
                            role: "system", 
                            content: "You are a helpful assistant that provides concise, interesting facts about movies." 
                        }, {
                            role: "user",
                            content: `Provide one short, interesting fact about the movie "${user.movie}".`
                        }],
                        model: "gpt-3.5-turbo",
                    });

                    const text = completion.choices[0].message.content || 'No fact found.';
                    setMovieFact(text);
                } catch (error) {
                    console.error("Failed to fetch movie fact:", error);
                    setMovieFact('Could not retrieve a fact at this time.');
                } finally {
                    setIsLoadingFact(false);
                }
            }
        };

        fetchMovieFact();
    }, [user.movie]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            await updateMovie(inputMovie);
            router.refresh();
            setInputMovie('');
        } catch (error) {
            console.error("Error saving movie:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearMovie = async () => {
        try {
            await updateMovie("");
            router.refresh();
        } catch (error) {
            console.error("Error clearing movie:", error);
        }
    };

    if (!user) {
        return (
            <main>
                <p>User data is not available. Please sign in.</p>
                <a href="/api/auth/signin">
                    Sign in
                </a>
            </main>
        );
    }

    if (favoriteMovie === "") {
        return (
            <main>
                <p>Hello, {user.name}. Please submit your favorite movie.</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        id="movieTitle" 
                        name="movieTitle" 
                        placeholder="Enter your favorite movie"
                        value={inputMovie}
                        onChange={(e) => setInputMovie(e.target.value)}
                    />
                    <button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Submit'}
                    </button>
                </form>
            </main>
        );
    } else {
        return (
            <main>
                <p>Your favorite movie is: {favoriteMovie}.</p>
                <p>
                    One interesting fact about {favoriteMovie} is:
                    {isLoadingFact ? (
                        <span className="loading-spinner"> Loading...</span>
                    ) : (
                        ` ${movieFact}`
                    )}
                </p>
                <button onClick={handleClearMovie}>Change Movie</button>
            </main>
        );
    }
}