module.exports = {
    testEnvironment: "jsdom",

    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest", {
            "jsc": {
                "transform": {
                    "react": {
                        "runtime": "automatic"
                    }
                }
            }
        }]
    },
    
    transformIgnorePatterns: [
        "/node_modules/(?!(jose|@panva/hkdf|preact-render-to-string|preact|next-auth/react)/)"
    ],
    
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

    testMatch: ["<rootDir>/src/**/*.test.(ts|tsx)"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
};
