import * as React from "react";

interface ErrorProps {
    className?: string
    text: string
}

export const Error = (props: ErrorProps) => {
    return <div className={`error text-danger ${props.className}`}>
        {props.text}
    </div>
};
