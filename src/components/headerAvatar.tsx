"use client";
import axios from "@/lib/axios";
import { Response, User } from "@/types/api.dt";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAssetUrl } from "@/lib/utils";

interface Props {
    token: string;
}

const HeaderAvatar: React.FC<Props> = ({ token }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (token) {
            getUser();
        }
    }, [token]);

    const getUser = async () => {
        try {
            const response = await axios.get<Response<User>>("/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            {user ? (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                        <AvatarImage
                            src={getAssetUrl(user.profilePicture)}
                            alt={`${user.name} photo profile`}
                            style={{
                                objectFit: "cover",
                                objectPosition: "top",
                            }}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                            {user.name
                                .split(" ")
                                .map((s) => s[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-gray-700">
                        {user.name}
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-300 text-gray-600 text-xs font-bold">
                            U
                        </AvatarFallback>
                    </Avatar>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
            )}
        </>
    );
};

export default HeaderAvatar;
