import type { InputHTMLAttributes } from "react";

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const PhoneInput = ({ label, ...props }: PhoneInputProps) => {
    return (
        <div className="flex flex-col w-full">
            {/* Label */}
            <div className="text-jerneNavy text-sm font-medium mb-1">
                {label}
            </div>

            {/* Input Group */}
            <div className="flex items-center rounded-lg border border-greyBorder overflow-hidden">
                {/* Fixed prefix */}
                <span className="bg-gray-100 px-3 text-sm text-black whitespace-nowrap">
          +45
        </span>

                {/* Actual number input */}
                <input
                    {...props}
                    type="tel"
                    className="
            h-12 px-3 w-full
            focus:outline-none
            focus:border-jerneRed
          "
                    placeholder="Enter phone number"
                />
            </div>
        </div>
    );
};
