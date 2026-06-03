/// <reference types="chrome"/>
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BrowserReplayPlayer } from '@browser-replay/player';
import '@browser-replay/player/dist/player.css';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
} from '@chakra-ui/react';
import { getEvents, getSession } from '~/utils/storage';

export default function Player() {
  const { sessionId } = useParams();
  const [sessionName, setSessionName] = useState('');
  const [events, setEvents] = useState<any[] | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    getSession(sessionId)
      .then((session) => {
        setSessionName(session.name);
      })
      .catch((err) => {
        console.error(err);
      });

    getEvents(sessionId)
      .then((loadedEvents) => {
        setEvents(loadedEvents);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [sessionId]);

  return (
    <>
      <Breadcrumb mb={5} fontSize="md">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Sessions</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{sessionName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Center>
        {events ? (
          <BrowserReplayPlayer events={events} autoPlay />
        ) : (
          <div>Loading session...</div>
        )}
      </Center>
    </>
  );
}
