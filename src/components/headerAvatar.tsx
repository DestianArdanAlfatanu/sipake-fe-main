"use client";
import axios from "@/lib/axios";
import { Response, User } from "@/types/api.dt";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// 1. Definisikan URL di sini (ambil dari .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

interface Props {
    token: string;
}

const HeaderAvatar: React.FC<Props> = ({ token }) => {
    // ... (kode bagian ini tidak berubah, biarkan saja) ...
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        if (token) { getUser(); }
    }, [token]);

    const getUser = async () => {
        // ... (kode fetch user biarkan saja) ...
        try {
            const response = await axios.get<Response<User>>("/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.data);
        } catch (error) { console.error(error); }
    };

    return (
        <>
            {user ? (
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage
                            // 2. GANTI BAGIAN INI: Gabungkan API_URL dengan nama file gambar
                            src={`${API_URL}/${user.profilePicture}`}
                            
                            alt={`${user.name} photo profile`}
                            style={{ objectFit: "cover", objectPosition: "top" }}
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
                // ... (kode avatar fallback biarkan saja) ...
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            )}
        </>
    );
};

export default HeaderAvatar;