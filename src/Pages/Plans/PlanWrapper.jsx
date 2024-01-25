import React from 'react'
import './Plan.css'
import Plan from './Plan'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
const PlanWrapper = ({ isMobile,handleisMobile }) => {
  return (
    <div className='home-container-1'>
      <LeftSidebar isMobile={isMobile} handleisMobile={handleisMobile}/>
      <div className='home-container-2'>
        <Plan/>
      </div>
    </div>
  )
}

export default PlanWrapper