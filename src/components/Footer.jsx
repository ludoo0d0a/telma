import React from 'react'
import git from "../components/icons8-github-64.png";
import linkedin from "../components/icons8-logo-linkedin-64.png";

const Footer = () => {
  return (
    <footer className='footer has-background-primary has-text-white'>
      <div className='content has-text-centered'>
        <div className='level'>
          <div className='level-item'>
            <a href="https://www.linkedin.com/in/guillaume-séré" target="_blank" rel="noreferrer" className='button is-primary is-inverted'>
              <span className='icon'>
                <img src={linkedin} alt='LinkedIn' style={{width: '24px', height: '24px'}} />
              </span>
            </a>
          </div>
          <div className='level-item'>
            <p className='has-text-white'>
              <span>&copy;</span> Guillaume SERE
            </p>
          </div>
          <div className='level-item'>
            <a href="https://github.com/GuillaumeSere" target="_blank" rel="noreferrer" className='button is-primary is-inverted'>
              <span className='icon'>
                <img src={git} alt='GitHub' style={{width: '24px', height: '24px'}} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
