import {Input} from "./Input.tsx";
import {Button} from "./Button.tsx";

export const PlayerForm = () => {
    return(
        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Create New Player</h2>

            <form className="flex flex-col gap-4">
                <Input label="Name" placeholder="Enter player name"/>
                <Input label="Email" placeholder="Enter player email"/>
                <Input label="Password" placeholder="Enter player password"/>

                <Button type="submit">Add New Player</Button>
            </form>
        </div>
    );
};