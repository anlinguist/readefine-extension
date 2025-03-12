import React, { useState, useEffect } from 'react'
// @ts-expect-error TS(2307): Cannot find module 'reshake' or its corresponding ... Remove this comment to see the full error message
import { ShakeLittle } from 'reshake'

function random(width: any, height: any) {
    return {
      left: Math.random() * width,
      top: Math.random() * height
    }
}

function Background() {
  const [appWidth, setAppWidth] = useState(0);
  const [appHeight, setAppHeight] = useState(0);

  useEffect(() => {
    if (document.querySelectorAll(".App")[0].clientWidth !== 0) {
      setAppWidth(document.querySelectorAll(".App")[0].clientWidth);
    }
    // @ts-expect-error TS(2367): This condition will always return 'true' since the... Remove this comment to see the full error message
    if (setAppWidth(document.querySelectorAll(".App")[0].clientHeight) !== 0) {
      setAppHeight(document.querySelectorAll(".App")[0].clientHeight);
    }
    
    const handleResize = () => {
      let newappwidth = document.querySelectorAll(".App")[0].clientWidth;
      let newappheight = document.querySelectorAll(".App")[0].clientHeight;
      setAppWidth(newappwidth);
      setAppHeight(newappheight);
    }
    window.addEventListener('resize', handleResize);
  }, [])

  const bg_arr = ["arrogate", "imperious", "umbrage", "cogent", "impudent", "inure", "largess", "rescind", "eschew", "pathos", "torpid", "effrontery", "myriad", "proclivity", "prosaic", "promulgate", "alacrity", "querulous", "conflagration", "dissemble", "vicarious", "pugnacious", "iniquity", "limpid", "ephemeral", "contrite", "ebullient", "probity", "expiate", "wizened", "mendacious", "obtuse", "mawkish", "invective", "venerate", "inchoate", "diffident", "brusque", "obdurate", "truculent", "proscribe", "maudlin", "precocious", "latent", "reprove", "ostensible", "pariah", "propensity", "transient"];
  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  const bg_words = bg_arr.map((word) => <ShakeLittle key={word} ><p className="noselect" style={random(appWidth, appHeight)}>{word}</p></ShakeLittle>);

  return (
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className="bg_words">
        {bg_words}
      </div>
  );
}

export default Background