export interface Response<Data = []> {
    statusCode: number;
    message: string;
    data: Data;
    errors: Record<string, string[]>;
}

export interface User {
    username: string;
    password: string;
    email: string;
    name: string;
    phoneNumber: string;
    address: string;
    plateNumber: string;
    profilePicture: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
    carSeries: {
        series_id: string;
    };
    carYear: {
        year: number;
    };
    engineCode: {
        code: string;
    };
}
