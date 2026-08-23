import '../styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore.js';

export default function App({ Component, pageProps }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Head>
        <title>Agentflow_AI | Agentic Operations Automation Platform</title>
        <meta
          name="description"
          content="Full-stack AI Operations Automation Platform that turns natural language into executable visual workflows with 5-agent orchestration."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
