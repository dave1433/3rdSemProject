import type {InputHTMLAttributes} from "react";


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input = ({label, ...props}: InputProps) =>{
    return (
        <div className="flex flex-col w-full">
    <label className="text-jerneNavy text-sm font-medium ">
        {label}
    </label>
            <input
                {...props}
            className="
            h-12 px-3 rounded-lg
            border border-greyBorder
            focus:outline-none focus:border-jerneRed"/>
        </div>
    )
}