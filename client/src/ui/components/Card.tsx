export const Card = ({children}: {children: React.ReactNode}) =>{
    return(
    <div className="bg-white rounded-2x1 shadow-lg
     flex flex-col gap-6 w-[420px]">{children}</div>
    )
}