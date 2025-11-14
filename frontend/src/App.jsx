import React from 'react';
import { AppProvider, Page, Card, Button, TextStyle } from '@shopify/polaris';
import { Provider as AppBridgeProvider, createApp } from '@shopify/app-bridge-react';

// Minimal embedded app config; ensure VITE_SHOPIFY_API_KEY is set in environment
const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY || 'REPLACE_WITH_API_KEY';
const shopOrigin = window.location.hostname;

const appBridgeConfig = {
  apiKey,
  shopOrigin,
  forceRedirect: true
};

export default function App() {
  return (
    <AppProvider>
      <AppBridgeProvider config={appBridgeConfig} app={createApp(appBridgeConfig)}>
        <Page title="AI-COO">
          <Card sectioned>
            <TextStyle variation="strong">Welcome to AI-COO</TextStyle>
            <p style={{ marginTop: 8 }}>
              This is the initial embedded app shell using Shopify Polaris and App Bridge.
            </p>
            <Button onClick={() => alert('This is a placeholder button')}>Get started</Button>
          </Card>
        </Page>
      </AppBridgeProvider>
    </AppProvider>
  );
}
