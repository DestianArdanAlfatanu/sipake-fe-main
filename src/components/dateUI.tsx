"use client";
import React from "react";
interface Props {
    date: string;
}

const DateUI: React.FC<Props> = ({ date }) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const formattedDate = new Intl.DateTimeFormat("id-ID", options).format(
        new Date(date)
    );
    return <>{formattedDate}</>;
};

export default DateUI;
