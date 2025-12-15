import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Response, User } from "@/types/api.dt";
import { cookies } from "next/headers";

const MyAccountPage = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const response = await axios.get<Response<User>>("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data.data;

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-4xl text-white font-semibold">Akun Saya</h1>
            <div className="w-full flex-col flex gap-4">
                <img className="w-[275px] aspect-square object-cover object-top rounded-xl" src={`http://localhost:5000/${user.profilePicture}`} alt={`${user.name} foto profil`} />
                <Card className="bg-white/[.05]">
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">Nama</p>
                            <p className="text-white text-lg">{user.name}</p>
                        </div>
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">Seri BMW</p>
                            <p className="text-white text-lg">
                                {user.carSeries.series_id}
                            </p>
                        </div>
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">
                                Tahun Produksi BMW
                            </p>
                            <p className="text-white text-lg">
                                {user.carYear.year}
                            </p>
                        </div>
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">Kode Mesin BMW</p>
                            <p className="text-white text-lg">
                                {user.engineCode.code}
                            </p>
                        </div>
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">Nomor Polisi</p>
                            <p className="text-white text-lg">
                                {user.plateNumber}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/[.05]">
                    <CardHeader>
                        <CardTitle>Informasi Kontak</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">Email</p>
                            <p className="text-white text-lg">{user.email}</p>
                        </div>
                        <div className="w-full max-w-xl grid grid-cols-2">
                            <p className="text-white text-lg">
                                Nomor Handphone
                            </p>
                            <p className="text-white text-lg">
                                {user.phoneNumber}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-white text-lg w-[288px]">Alamat</p>
                            <p className="text-white text-lg w-[576px]">{user.address}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MyAccountPage;
