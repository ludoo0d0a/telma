import React from 'react'
import packageJson from '../../package.json'

const Footer: React.FC = () => {
  return (
    <footer className='footer has-background-primary has-text-white'>
      <div className='content has-text-centered'>
        <p className='has-text-white'>
          <span>&copy;</span> {new Date().getFullYear()} SNCF API Explorer
        </p>
        <p className='has-text-white is-size-7 mt-2'>
          Powered by Navitia API
        </p>
        <p className='has-text-white is-size-7 mt-2'>
          Version {packageJson.version}
        </p>
      </div>
    </footer>
  )
}

export default Footer

