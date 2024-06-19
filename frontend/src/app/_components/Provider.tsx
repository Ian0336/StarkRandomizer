// @ts-nocheck
'use client';
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
} from "@starknet-react/core";
 
export function Providers({ children }) {
const chains = [sepolia];
  const provider = publicProvider();
  return (
    <StarknetConfig chains={chains} provider={provider}>
      {children}
    </StarknetConfig>
  );
}