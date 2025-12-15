import ConsultationProcessComp from "@/components/consultationProcess";
import { cookies } from "next/headers";
const ConsultationProcessPage = () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    return <ConsultationProcessComp token={token!} />;
};

export default ConsultationProcessPage;
