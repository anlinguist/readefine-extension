// @ts-nocheck
/*global browser*/
import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Button } from '@mantine/core';

const SubscriptionOption = ({
    title,
    features,
    price,
    bestValue,
    currentSubscription
}: any) => {
    const [loading, setLoading] = useState(false);

    const handleManageSubscription = async (e) => {
        e.preventDefault();
        setLoading(true);
        const browserIsSafari = isSafari();
        if (browserIsSafari) {
            // @ts-expect-error TS(2304): Cannot find name 'browser'.
            let response = await browser.runtime.sendMessage("com.getreadefine.readefine.Extension (QK39SRR4H5)", { openInAppPurchases: true, target: title })
            // send message to safari extension to prompt the in app purchase logic
            // if it's the current extension, open current subscription.
            // if it's a new subscription, open the checkout page.
        } else {
            let subscriptionLink: string;
            if (chrome.runtime.id === "com.getreadefine.readefine.Extension (QK39SRR4H5)") {
                subscriptionLink = 'rdfnapp://app.readefine.ai/switchToPro';
            } else {
                subscriptionLink = 'https://app.readefine.ai/subscription';
            }
            if (currentSubscription) {
                subscriptionLink = 'https://billing.stripe.com/p/login/14k8A1cm2aOt1Ec4gg';
            }

            chrome.tabs.create({ url: subscriptionLink });
        }
    }

    const isSafari = () => {
        // Check for Safari using user agent string
        const userAgent = window.navigator.userAgent;
        const isSafariUA = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

        // Additional CSS check (useful for distinguishing Safari from other browsers)
        const cssCheck = () => {
            const el = document.createElement('div');
            el.style.cssText = 'position: sticky; -webkit-backdrop-filter: blur(10px);';
            return el.style.position === 'sticky' && !!(el.style as any).webkitBackdropFilter;
        };

        return isSafariUA && cssCheck();
    };


    useEffect(() => {
        console.log("currentSubscription: ", currentSubscription)
    }, [currentSubscription])

    return (
        <div className="price-option">
            {
                bestValue &&
                <div className="best-value-badge">
                    Current Plan
                </div>
            }
            <div className="subscription-option-top">
                <h2 className='subscription-option-name'>{title}</h2>
                <div className="subscription-option-price">
                    {
                        price || price === 0 ?
                            (
                                price !== 0 ?
                                    <>
                                        <span className="subscription-option-price-value">{`$${price}`}</span>
                                        <span className='subscription-option-price-per'>/month</span>
                                    </> : <span className="subscription-option-price-value">Free</span>
                            )
                            :
                            <div className="loader" />
                    }
                </div>
            </div>
            <div className='subscription-option-bottom'>
                <div className="features">
                    {features.map((feature: any, index: any) => (
                        <div key={index} className="subscription-option-feature">
                            <FaCheckCircle className='subscription-option-feature-icon' />
                            <p>{feature}</p>
                        </div>
                    ))}
                </div>
                {
                    (title !== 'Basic') &&
                    <Button onClick={handleManageSubscription} autoContrast loading={loading} variant="outline" type='submit' color='rdfnyellow.6' size="md" radius="md" m={"10px 0 0 0"}>{currentSubscription ? 'Manage' : 'Subscribe'}</Button>
                }
            </div>
        </div>
    );
}

export default SubscriptionOption;