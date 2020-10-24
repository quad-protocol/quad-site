import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
export class QuadQuery {
  client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    this.client = new ApolloClient({
      uri: "https://48p1r2roz4.sse.codesandbox.io",
      cache: new InMemoryCache(),
    });
  }
}
