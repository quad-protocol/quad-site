import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  useQuery,
} from "@apollo/client";
import gql from "graphql-tag";

const ETH_PRICE_QUERY = gql`
  query ethPrice {
    bundle(id: "1") {
      ethPrice
    }
  }
`;

const TOKEN_PRICE_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
    }
  }
`;

export const client = new ApolloClient({
  //@ts-ignore
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  }),
  cache: new InMemoryCache(),
});

export const ETHPrice = () => {
  return useQuery(ETH_PRICE_QUERY);
};

export const TokenPrice = (tokenAddress: string) => {
  return useQuery(TOKEN_PRICE_QUERY, {
    variables: {
      tokenAddress: tokenAddress,
    },
  });
};
