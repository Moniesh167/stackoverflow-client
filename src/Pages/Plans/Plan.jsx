import React, { useEffect, useState } from 'react'
import { getSubscription, buySubscription, cancelSubscription } from '../../api'
import freeIcon from '../../assets/free-icon.png'



const Plan = () => {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState(null)
  const [activePlan, setActivePlan] = useState(null)

  const buyPlanFunction = (priceId) => {
    buySubscription(priceId).then(res => {
      window.location.href = res.data.url;
    }).catch(err => {
      console.log(err);
    })
  }
  const getSubscriptionFunction =()=>{
    setLoading(true)
    getSubscription()
      .then(res => {
        if (res.data.plans) {
          setPlans(res.data.plans)
        } else if (res.data.activePlan) {
          setActivePlan(res.data.activePlan)
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      })
  }
  const canclePlanFunction = () => {
    cancelSubscription()
      .then(() => {
        window.location.reload();
      })
      .catch(err => {
        console.log(err);
        alert(err.response.data.message);
      })
  }
  useEffect(() => {
  getSubscriptionFunction()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div>
      <div style={{ paddingTop: '50px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {
          (!activePlan && !loading) && <div style={{ backgroundColor: 'white', padding: '10px ', borderRadius: '6px', boxShadow: '1px 1px 5px gray', width: '200px' }}>
            <img style={{ width: '100px' }} src={freeIcon} alt="plan-icon" />
            <div >
              <h1 style={{ fontSize: '20px' }}>Free Plan</h1>
              <p>You can post only one Question per day</p>
              <p>Fee: 0/month</p>
              <button style={{ marginTop: 'auto', backgroundColor: 'green', color: 'white', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'default' }}>Current Plan</button>
            </div>
          </div>
        }
        {
          (plans && !loading) && plans.map(plan => <div style={{ backgroundColor: 'white', padding: '10px ', borderRadius: '6px', boxShadow: '1px 1px 5px gray', width: '200px' }}>
            <img style={{ width: '100px' }} src={plan.planImageUrl} alt="plan-icon" />
            <div >
              <h1 style={{ fontSize: '20px' }}>{plan.name}</h1>
              <p>{plan.description}</p>
              <p>Fee: {plan.price}/{plan.duration}</p>
              <button onClick={() => buyPlanFunction(plan.priceId)} style={{ marginTop: 'auto', backgroundColor: 'blue', color: 'white', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Buy Now</button>
            </div>
          </div>)
        }
        {
          (activePlan && !loading) && <div style={{ backgroundColor: 'white', padding: '10px ', borderRadius: '6px', boxShadow: '1px 1px 5px gray', width: '200px' }}>
            <img style={{ width: '100px' }} src={activePlan.planImageUrl} alt="plan-icon" />
            <div >
              <h1 style={{ fontSize: '20px' }}>{activePlan.name}</h1>
              <p>{activePlan.description}</p>
              <p>Fee: {activePlan.price}/month</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <button style={{ marginTop: 'auto', backgroundColor: 'green', color: 'white', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'default' }}>Current Plan</button>
                <button onClick={canclePlanFunction} style={{ marginTop: 'auto', border: '1px solid black', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>cancel</button>
              </div>
            </div>
          </div>
        }
        {
          loading && <div>Please Wait....</div>
        }
      </div>
    </div>
  )
}

export default Plan