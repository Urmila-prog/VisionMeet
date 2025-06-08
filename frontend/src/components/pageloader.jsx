import React from 'react'
import { LoaderIcon } from 'react-hot-toast'

const pageloader = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoaderIcon className='animate-spin size-10 text-primary' />
    </div>
  )
}

export default pageloader
