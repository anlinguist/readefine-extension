// @ts-nocheck
import { useContext, useEffect, useState } from 'react'
import SubscriptionOption from './SubscriptionOption'
import { RDFNContext } from '../../../RDFNContext';

function SubscriptionOptions() {
    // @ts-expect-error TS(2339): Property 'proStatus' does not exist on type 'unkno... Remove this comment to see the full error message
    const { proStatus } = useContext(RDFNContext);
    const [currentSubscriptionTitle, setCurrentSubscriptionTitle] = useState("Basic");

    useEffect(() => {
      if (proStatus) {
        setCurrentSubscriptionTitle("Pro")
      } else {
        setCurrentSubscriptionTitle("Basic")
      }
    }, [proStatus])

    const options = [
      {
        title: 'Basic',
        features: ['1,000 tokens/day', 'GPT-3.5 Turbo', 'Basic rewording styles'],
        price: 0,
        priceId: "price_1OCBShDearBQcNOICjerdgmy",
        bestValue: false
      },
      {
        title: 'Pro',
        features: ['10,000 tokens/day', 'GPT-4 Turbo', 'Custom rewording styles'],
        price: 10,
        priceId: "price_1OCBTfDearBQcNOIQMKMIyFy",
        bestValue: false
      },
    ];

  return (
    <div className="price-options">
            {options.map((option, index) => {
              return (
                <SubscriptionOption
                    key={index}
                    title={option.title}
                    features={option.features}
                    price={option.price}
                    bestValue={option.title === currentSubscriptionTitle}
                    currentSubscription={option.title === currentSubscriptionTitle}
                />
            )})}
        </div>
  )
}

export default SubscriptionOptions