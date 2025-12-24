import ConsultationProcessComp from "@/components/consultationProcess";
import { cookies } from "next/headers";

const SuspensionConsultationProcessPage = () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    return (
        <ConsultationProcessComp
            token={token!}
            apiBaseUrl="/suspension-consultations"
            historyRoute="/app/suspension/consultation/history"
        />
    );
};

export default SuspensionConsultationProcessPage;
