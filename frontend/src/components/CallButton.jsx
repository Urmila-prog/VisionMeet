import {VideoIcon} from 'lucide-react';

function CallButton ({handleVideoCall}) {
    return (
        <button 
            onClick={handleVideoCall} 
            className='btn btn-circle btn-sm btn-success text-white hover:btn-success-focus'
        >
            <VideoIcon className='size-4' />
        </button>
    )
}

export default CallButton;