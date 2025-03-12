// @ts-nocheck
/*global browser*/
/*global chrome*/
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useCallback, useState } from 'react'
import { useEffect } from 'react';

const OBVerify = ({
  currentStep,
  goTo,
  grantAccess
}: any) => {
  const [addtobrowserbtnvalue, setAddtobrowserbtnvalue] = useState(''),
    [addtobrowserbtnlink, setAddtobrowserbtnlink] = useState('');

  const testForReadefine = useCallback(async () => {
    grantAccess()
    goTo(2)
  }, [goTo, grantAccess])

  useEffect(() => {
    testForReadefine()
  }, [testForReadefine])

  if (currentStep !== 1) {
    return null;
  }

  useEffect(() => {
    testForReadefine()
  }, [testForReadefine])

  return (
    <div id="section1">
      <Alert color="rdfnyellow.6" m={"20px 0"}>
        <Group justify='center' gap="xs" align="center">
          <IconExclamationCircle size={24} style={{ marginRight: '10px' }} />
          <Text>To get started, you'll need to install Readefine.</Text>
        </Group>
      </Alert>
      {
        <Button m={'0 auto'} autoContrast w={"100%"} maw={"400px"} color="rdfnyellow.6" size="lg" component="a" target="_blank" href={addtobrowserbtnlink}>
          {`${addtobrowserbtnvalue}`}
        </Button>
      }
    </div>
  );
};

export default OBVerify