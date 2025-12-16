import React from 'react'

const Footer = () => {
  return (
    <footer className='footer has-background-primary has-text-white'>
      <div className='content has-text-centered'>
        <p className='has-text-white'>
          <span>&copy;</span> {new Date().getFullYear()} SNCF API Explorer
        </p>
        <p className='has-text-white is-size-7 mt-2'>
          Powered by Navitia API
        </p>
      </div>
    </footer>
  )
}

export default Footer
