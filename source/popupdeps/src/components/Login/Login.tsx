// @ts-nocheck
/*global chrome*/
import React, { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Stack, Button, Title, Text } from '@mantine/core';
import { ReadefineTooltip } from "../ReadefineTooltipDemo";

function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [hoveredData, setHoveredData] = useState([
    {
      original: "Reword",
      synonyms: ["Reword", "Convert", "Simplify", "Summarize", "Rephrase"],
      target: "Reword",
      type: "main",
      interval: 3000,
    },
    {
      original: "internet",
      synonyms: ["internet", "web", "net"],
      target: "internet",
      type: "main",
      interval: 2500,
    },
    {
      original: "Add to",
      synonyms: ["Add to", "Install on", "Get for"],
      target: "Add to",
      type: "main",
      interval: 3200,
    },
    {
      original: "reword",
      synonyms: ["reword", "convert", "simplify", "summarize", "rephrase"],
      target: "reword",
      type: "main",
      interval: 3100,
    },
    {
      original: "Using",
      synonyms: ["Using", "With", "Leveraging", "Utilizing"],
      target: "Using",
      type: "main",
      interval: 2900,
    },
    {
      original: "suit your needs",
      synonyms: ["suit your needs", "work best for you", "fit your preferences"],
      target: "suit your needs",
      type: "main",
      interval: 3300,
    },
    {
      original: "get started",
      synonyms: ["get started", "begin", "start", "go"],
      target: "get started",
      type: "main",
      interval: 3400,
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoveredData((prevData) =>
        prevData.map((item) => {
          const currentIndex = item.synonyms.indexOf(item.target);
          const nextIndex = (currentIndex + 1) % item.synonyms.length;
          return {
            ...item,
            target: item.synonyms[nextIndex],
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) {
      navigate('/personal-dictionary', { replace: true});
    }
  });
  return (
    <Stack justify="space-around" p={"10px"} flex={1}>
      <Stack align="center">
        <div id="rdfn-splashscreen-logo">
          <svg class="mainlogo" width="300px" height="225px" viewBox="0 0 2000 1500" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>Readefine Logo</title>
              <g id="Base-Readefine-Logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <rect id="Rectangle" fill="#FFDE00" x="0" y="0" width="2000" height="1100" rx="85"></rect>
                  <polygon id="Triangle" fill="#FFDE00" transform="translate(1500.000000, 1198.000000) rotate(180.000000) translate(-1500.000000, -1198.000000) " points="1500 1068 1700 1328 1300 1328"></polygon>
                  <text class="rdfn-logo-letter" id="logo-r" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="261" y="695.666667">r</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-e-1" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="379.5" y="695.666667">e</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-a" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="570" y="695.666667">a</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-d" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="766" y="695.666667">d</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-e-2" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="969" y="695.666667">e</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-f" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1155" y="695.666667">f</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-i" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1274.2" y="695.666667">i</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-n" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1359" y="695.666667">n</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-e-3" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1552.65" y="695.666667">e</tspan>
                  </text>
              </g>
          </svg>
        </div>
        <Stack align="center">
          <Title order={2} fw={"bold"}><ReadefineTooltip
              hoveredData={hoveredData[0]}
              readefineMode="reading"
            /> the internet.</Title>
          <Text ta={'center'} size="lg"><ReadefineTooltip
              hoveredData={hoveredData[4]}
              readefineMode="reading"
            /> Readefine, you can <ReadefineTooltip
              hoveredData={hoveredData[3]}
              readefineMode="reading"
            /> the <ReadefineTooltip
            hoveredData={hoveredData[1]}
            readefineMode="reading"
          /> to suit your needs.</Text>
        </Stack>
      </Stack>
        <Button w={"100%"} maw={"400px"} m={"0 auto"} autoContrast color={'rdfnyellow.6'} size={"lg"} onClick={(() => {
          chrome.tabs.create({url: "https://app.readefine.ai/learn"});
        })}>
          Let's&nbsp;<ReadefineTooltip
            hoveredData={hoveredData[6]}
            readefineMode="reading"
          />
        </Button>
    </Stack>
  )
}

export default Login