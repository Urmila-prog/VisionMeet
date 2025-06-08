import { BellIcon } from "lucide-react";


function NoNotificationiconFound() {
    return (
        <div className="flex flex-col items-center py-16 text-center">
            <div className="size-18 rounded-full  flex items-center justify-center mb-4">
                <BellIcon className="size-8 text-base-content opacity-40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No notificatioin yet</h3>
            <p className=" to-base-content opacity-70 max-w-md">when you received friend request or message, they will appear here.</p>
        </div>
    );
}

export default NoNotificationiconFound;