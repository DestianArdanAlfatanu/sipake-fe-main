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
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage
                            src={getAssetUrl(user.profilePicture)}
                            alt={`${user.name} photo profile`}
                            style={{
                                objectFit: "cover",
                                objectPosition: "top",
                            }}
                        />
                        <AvatarFallback>
                            {user.name.split(" ").map((s) => s[0])}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-white text-base font-semibold">
                        {user.name}
                    </p>
                </div>
            ) : (
                <Avatar>
                    <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                    />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            )}
        </>
    );
};

export default HeaderAvatar;
