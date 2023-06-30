import React, { useState, useEffect } from 'react'
import { ShakeLittle } from 'reshake'

function random(width, height) {
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
  const bg_words = bg_arr.map((word) => <ShakeLittle key={word} ><p className="noselect" style={random(appWidth, appHeight)}>{word}</p></ShakeLittle>);

  return (
      <div className="bg_words">
        {bg_words}
      </div>
  );
}

export default Background